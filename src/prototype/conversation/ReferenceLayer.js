import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ENTITY_LIMIT, anchorMatches, passageSegments, referenceExchanges, referenceKey, textVersion } from './references';
import './ReferenceLayer.css';

const ReferenceContext = createContext(null);
export const useReferences = () => useContext(ReferenceContext);

export function ReferenceProvider({ serviceId, references, messages, onSelect, onOpenExchange, returnRequest, children }) {
  const registry = useRef(new Map());
  const [selection, setSelection] = useState(null);
  const [notice, setNotice] = useState('');
  const context = useMemo(() => ({ registry, references, messages, onSelect, onOpenExchange }), [references, messages, onSelect, onOpenExchange]);
  useEffect(() => { setSelection(null); setNotice(''); }, [serviceId]);
  useEffect(() => {
    const inspect = event => {
      if (event?.key === 'Escape') { setSelection(null); return; }
      const selected = window.getSelection();
      if (!selected?.rangeCount || selected.isCollapsed) { setSelection(null); return; }
      const range = selected.getRangeAt(0);
      const element = node => node.nodeType === 1 ? node : node.parentElement;
      const start = element(range.startContainer)?.closest('[data-reference-source]');
      const end = element(range.endContainer)?.closest('[data-reference-source]');
      if (!start || start !== end) { setSelection(null); return; }
      const entry = registry.current.get(start.dataset.referenceSource)?.get(start);
      if (!entry || entry.reference.serviceId !== serviceId) { setSelection(null); return; }
      const rect = range.getBoundingClientRect?.() || start.getBoundingClientRect();
      let reference = entry.reference;
      if (reference.kind === 'passage') {
        const prefix = range.cloneRange(); prefix.selectNodeContents(start); prefix.setEnd(range.startContainer, range.startOffset);
        const offset = prefix.toString().length;
        const excerpt = range.toString();
        if (!excerpt.trim() || excerpt.length > 2000) { setSelection(null); return; }
        reference = { ...reference, excerpt, anchor: { start: offset, end: offset + excerpt.length } };
      }
      // A selection wholly inside an entity keeps its structured payload.
      setSelection({ reference, element: start, left: Math.max(8, Math.min(window.innerWidth - 170, rect.left)), top: Math.max(8, rect.top - 42) });
    };
    const dismiss = () => setSelection(null);
    const escape = event => { if (event.key === 'Escape') dismiss(); };
    document.addEventListener('selectionchange', inspect);
    document.addEventListener('mouseup', inspect);
    document.addEventListener('keyup', inspect);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', dismiss, { passive: true });
    return () => {
      document.removeEventListener('selectionchange', inspect); document.removeEventListener('mouseup', inspect);
      document.removeEventListener('keyup', inspect); document.removeEventListener('keydown', escape); window.removeEventListener('scroll', dismiss);
    };
  }, [serviceId]);
  useEffect(() => {
    if (!returnRequest) return;
    const { reference } = returnRequest;
    let frame, attempt = 0;
    const restore = () => {
      const entries = [...(registry.current.get(reference.sourceId)?.values() || [])];
      const entry = entries.find(item => item.element.closest('dialog')?.open) || entries[0];
      // A narrow-screen source can mount in a sheet in response to this request.
      // Give that commit (and native dialog autofocus) time to finish.
      if (!entry && attempt++ < 8) { frame = requestAnimationFrame(restore); return; }
      const valid = entry && (reference.kind !== 'passage' || anchorMatches(reference, entry.text, entry.reference.sourceVersion));
      const target = valid ? entry.element : document.querySelector('.cp-reading-prose, .cp-product-overview, .cp-horo-forecast');
      // Source rows stay registered inside closed, uncontrolled disclosures.
      for (let ancestor = target?.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.tagName === 'DETAILS') ancestor.open = true;
      }
      setNotice(valid ? '' : 'The original source has changed or is unavailable. Showing its reading; the saved reference is unchanged.');
      frame = requestAnimationFrame(() => {
        target?.scrollIntoView?.({ block: 'center', behavior: 'instant' });
        target?.focus({ preventScroll: true });
        if (valid) {
          target.classList.remove('cp-reference-return');
          void target.offsetWidth;
          target.classList.add('cp-reference-return');
        }
      });
    };
    frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, [returnRequest]);
  return <ReferenceContext.Provider value={context}>{children}
    {notice && <div className="cp-reference-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss source notice">×</button></div>}
    {selection && <div className="cp-selection-toolbar" role="toolbar" aria-label="Selected text actions" style={{ left: selection.left, top: selection.top }} onMouseDown={event => event.preventDefault()}>
      <button type="button" onClick={() => {
        const entry = registry.current.get(selection.reference.sourceId)?.get(selection.element);
        if (entry && selection.element.isConnected && entry.reference.sourceVersion === selection.reference.sourceVersion) onSelect(selection.reference);
        window.getSelection()?.removeAllRanges();
        setSelection(null);
      }}>Ask about selection</button>
    </div>}
  </ReferenceContext.Provider>;
}

function useSource(reference, text, element) {
  const context = useReferences();
  useEffect(() => {
    if (!context) return undefined;
    const entry = { reference, text, element: element.current };
    const entries = context.registry.current.get(reference.sourceId) || new Map();
    entries.set(element.current, entry);
    context.registry.current.set(reference.sourceId, entries);
    return () => { entries.delete(entry.element); if (!entries.size) context.registry.current.delete(reference.sourceId); };
  }, [context, reference, text, element]);
  return context;
}

function Notes({ reference, onClose }) {
  const context = useReferences();
  return <aside className="cp-inline-notes" aria-label={`Discussion about ${reference.label}`}>
    <button type="button" className="cp-text-button" onClick={onClose} aria-label="Close inline note">Close ×</button>
    {referenceExchanges(context.messages, reference).map(({ message, reply }) => <div key={message.id}>
      <p><strong>You:</strong> {message.text}</p><p className="cp-note-reply">{reply?.text || 'Reply not available yet.'}</p>
      <button type="button" className="cp-text-button" onClick={() => { onClose(); context.onOpenExchange(message.id); }}>Open in discussion ↗</button>
    </div>)}
  </aside>;
}

function EntityNotes({ reference, anchor, onClose }) {
  const dialog = useRef(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    const mobile = window.innerWidth <= 760;
    const rect = anchor.current?.getBoundingClientRect();
    if (!mobile && rect) {
      const width = Math.min(360, window.innerWidth - 24);
      element.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
      element.style.top = `${Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 300))}px`;
    }
    if (mobile && element.showModal) element.showModal();
    else if (element.show) element.show();
    else element.setAttribute('open', '');
    element.querySelector('button')?.focus({ preventScroll: true });
    const dismiss = event => { if (!element.contains(event.target) && !anchor.current?.contains(event.target)) onClose(); };
    const escape = event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    if (!mobile) window.addEventListener('scroll', onClose, { passive: true });
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); if (!mobile) window.removeEventListener('scroll', onClose); };
  }, [anchor, onClose]);
  return createPortal(<dialog ref={dialog} className="cp-entity-note-dialog" aria-label={`Discussion about ${reference.label}`} onCancel={event => { event.preventDefault(); onClose(); }}><Notes reference={reference} onClose={onClose} /></dialog>, document.body);
}

export function ReferenceText({ text, source, className = '' }) {
  const element = useRef(null);
  const [notes, setNotes] = useState(false);
  const reference = useMemo(() => ({ ...source, kind: 'passage', sourceVersion: source.sourceVersion || textVersion(text) }), [source, text]);
  useEffect(() => setNotes(false), [reference.sourceId]);
  const context = useSource(reference, text, element);
  if (!context) return <p className={className}>{text}</p>;
  const segments = passageSegments(text, reference.sourceVersion, reference, context.messages);
  const exchanges = referenceExchanges(context.messages, reference);
  return <><p ref={element} className={`cp-reference-text ${className}`} tabIndex={0} data-reference-source={reference.sourceId}>
    {segments.map(segment => segment.marked ? <button type="button" className="cp-passage-mark" key={segment.start} aria-label={`Open notes about ${reference.label}`} onClick={() => setNotes(!notes)}>{text.slice(segment.start, segment.end)}</button> : <React.Fragment key={segment.start}>{text.slice(segment.start, segment.end)}</React.Fragment>)}
  </p>{exchanges.length > 0 && !segments.some(segment => segment.marked) && <button className="cp-text-button" type="button" onClick={() => setNotes(!notes)}>Earlier discussion · source changed</button>}
    {notes && <Notes reference={reference} onClose={() => setNotes(false)} />}</>;
}

export function ReferenceEntity({ reference, children, className = '', onInspect }) {
  const element = useRef(null);
  const noteTrigger = useRef(null);
  const context = useSource(reference, null, element);
  const [notes, setNotes] = useState(false);
  const closeNotes = useCallback(() => { setNotes(false); noteTrigger.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => setNotes(false), [reference.sourceId]);
  if (!context) return children;
  const selected = context.references.some(ref => referenceKey(ref) === referenceKey(reference));
  const atLimit = !selected && context.references.filter(ref => ref.kind !== 'passage').length >= ENTITY_LIMIT;
  const count = referenceExchanges(context.messages, reference).length;
  return <div className={`cp-reference-entity ${className}`}>
    <button ref={element} type="button" className="cp-entity-select" data-reference-source={reference.sourceId} aria-pressed={selected} aria-disabled={atLimit} title={atLimit ? 'Remove a selected chart element to add another (3 maximum).' : `Add ${reference.label} to your question`} aria-label={`Include ${reference.label} in question`}
      onClick={() => {
        const selection = window.getSelection();
        const selectingRow = selection?.toString() && element.current?.contains(selection.anchorNode) && element.current?.contains(selection.focusNode);
        if (!selectingRow && !atLimit) { context.onSelect(reference, true, false); onInspect?.(); }
      }}>
      <span aria-hidden="true" className="cp-entity-check">{selected ? '✓' : '+'}</span>{children || <span>{reference.label}</span>}
    </button>
    {count > 0 && <button ref={noteTrigger} type="button" className="cp-entity-count" aria-label={`${count} questions about ${reference.label}`} onClick={() => setNotes(!notes)}>● {count}</button>}
    {notes && <EntityNotes reference={reference} anchor={noteTrigger} onClose={closeNotes} />}
  </div>;
}
