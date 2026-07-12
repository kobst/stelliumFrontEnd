import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChapterHeader from './ChapterHeader';
import './DetailNavigator.css';

const isEditableTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
  );
};

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

const domId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-');

export default function DetailNavigator({
  items,
  activeId,
  onActiveChange,
  groupLabel,
  chapterLabel,
  chapterHelper,
  renderItem,
  renderLabel,
  wrap = false,
  className = '',
}) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const previousIndexRef = useRef(-1);
  const [dragX, setDragX] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.id === activeId)),
    [activeId, items]
  );
  const activeItem = items[activeIndex] || null;
  const previousItem = activeIndex > 0 ? items[activeIndex - 1] : wrap ? items[items.length - 1] : null;
  const nextItem = activeIndex < items.length - 1 ? items[activeIndex + 1] : wrap ? items[0] : null;

  const moveTo = useCallback(
    (nextIndex, { focusHeading = false, resetScroll = true } = {}) => {
      if (!items.length) return;
      let resolvedIndex = nextIndex;
      if (wrap) resolvedIndex = (nextIndex + items.length) % items.length;
      if (!wrap && (resolvedIndex < 0 || resolvedIndex >= items.length)) return;
      const next = items[resolvedIndex];
      if (!next || next.id === activeId) return;
      onActiveChange(next.id, next);
      if (resetScroll) {
        window.requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
        });
      }
      if (focusHeading) {
        window.setTimeout(() => {
          panelRef.current?.querySelector('[data-detail-heading]')?.focus();
        }, prefersReducedMotion() ? 0 : 280);
      }
    },
    [activeId, items, onActiveChange, wrap]
  );

  useEffect(() => {
    if (!activeItem) return;
    setAnnouncement(`${activeItem.title}. ${activeIndex + 1} of ${items.length}.`);
    rootRef.current
      ?.querySelector('.detail-navigator__tabs button[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    const previousIndex = previousIndexRef.current;
    previousIndexRef.current = activeIndex;
    if (previousIndex < 0 || previousIndex === activeIndex || !panelRef.current) return;
    const direction = activeIndex > previousIndex ? 1 : -1;
    const reduced = prefersReducedMotion();
    panelRef.current.animate?.(
      reduced
        ? [{ opacity: 0.72 }, { opacity: 1 }]
        : [
            { opacity: 0.55, transform: `translateX(${direction * 24}px)` },
            { opacity: 1, transform: 'translateX(0)' },
          ],
      { duration: reduced ? 120 : 270, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  }, [activeIndex, activeItem, items.length]);

  const handleKeyDown = (event) => {
    if (isEditableTarget(event.target)) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveTo(activeIndex - 1, { focusHeading: true });
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveTo(activeIndex + 1, { focusHeading: true });
    }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' || isEditableTarget(event.target)) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      axis: null,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      drag.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
      if (drag.axis === 'x') event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.axis !== 'x') return;
    const atBoundary = (dx > 0 && !previousItem) || (dx < 0 && !nextItem);
    drag.displayX = atBoundary ? dx * 0.22 : dx;
    setDragX(drag.displayX);
  };

  const finishPointer = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const finalX = drag.displayX || 0;
    const velocity = finalX / elapsed;
    const threshold = Math.min((panelRef.current?.clientWidth || 480) * 0.25, 120);
    if (drag.axis === 'x' && (Math.abs(finalX) >= threshold || Math.abs(velocity) > 0.55)) {
      moveTo(activeIndex + (finalX < 0 ? 1 : -1), { focusHeading: false });
    }
    dragRef.current = null;
    setDragX(0);
  };

  if (!activeItem) return null;

  return (
    <section
      ref={rootRef}
      className={`detail-navigator ${className}`.trim()}
      role="group"
      aria-roledescription="carousel"
      aria-label={groupLabel}
      onKeyDown={handleKeyDown}
    >
      <ChapterHeader
        label={chapterLabel || groupLabel}
        helper={chapterHelper}
        rightSlot={<span aria-hidden="true">{activeIndex + 1} of {items.length}</span>}
      />

      <div className="detail-navigator__tabs" role="tablist" aria-label={groupLabel}>
        {items.map((item) => {
          const selected = item.id === activeItem.id;
          const itemDomId = domId(item.id);
          return (
            <button
              type="button"
              key={item.id}
              id={`detail-tab-${itemDomId}`}
              className={selected ? 'on' : ''}
              role="tab"
              aria-selected={selected}
              aria-controls={`detail-panel-${itemDomId}`}
              tabIndex={selected ? 0 : -1}
              title={item.title}
              onClick={() => moveTo(items.indexOf(item), { focusHeading: true })}
            >
              {renderLabel ? renderLabel(item, selected) : item.title}
            </button>
          );
        })}
      </div>

      <div
        ref={panelRef}
        id={`detail-panel-${domId(activeItem.id)}`}
        className="detail-navigator__panel"
        role="tabpanel"
        aria-labelledby={`detail-tab-${domId(activeItem.id)}`}
        style={{ '--detail-drag-x': `${dragX}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        {renderItem(activeItem)}
      </div>

      <div className="detail-navigator__controls">
        <button
          type="button"
          disabled={!previousItem}
          aria-label={previousItem ? `Previous: ${previousItem.title}` : 'No previous item'}
          onClick={() => moveTo(activeIndex - 1, { focusHeading: true })}
        >
          <span aria-hidden="true">‹</span>
          <small>Previous</small>
          <strong>{previousItem?.title || 'Start'}</strong>
        </button>
        <div className="detail-navigator__dots" aria-hidden="true">
          {items.map((item) => (
            <i key={item.id} className={item.id === activeItem.id ? 'on' : ''} />
          ))}
        </div>
        <button
          type="button"
          disabled={!nextItem}
          aria-label={nextItem ? `Next: ${nextItem.title}` : 'No next item'}
          onClick={() => moveTo(activeIndex + 1, { focusHeading: true })}
        >
          <small>Next</small>
          <strong>{nextItem?.title || 'End'}</strong>
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <div className="detail-navigator__live" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </section>
  );
}
