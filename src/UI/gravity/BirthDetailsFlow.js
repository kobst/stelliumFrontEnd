import React, { useEffect, useRef, useState } from 'react';
import { BIRTH_DETAIL_FIELDS, birthDetailAnswer, birthDetailError, birthDetailPrompt, todayKey } from './birthDetailsIntake';

// Controlled draft, independent of trial gating, storage, chart APIs and payment.
// This prototype uses typed birthplace text; a resolved-place control can be
// supplied when the account creation API is connected.
export default function BirthDetailsFlow({ value, onChange, onConfirm, onCancel, confirmLabel, notice, confirmationContext, error: submissionError, busy = false, renderPlace, reviewExtra, validateDetail }) {
  const [mode, setMode] = useState('chat');
  const [step, setStep] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const [error, setError] = useState('');
  const root = useRef(null);
  const field = BIRTH_DETAIL_FIELDS[step];
  const detailError = (key, draft) => birthDetailError(key, draft) || validateDetail?.(key, draft) || '';
  const firstInvalid = draft => BIRTH_DETAIL_FIELDS.findIndex(item => detailError(item.key, draft));
  useEffect(() => {
    const target = root.current?.querySelector(reviewing ? '[data-intake-review]' : 'input:not(:disabled)');
    target?.focus({ preventScroll: true });
    target?.scrollIntoView?.({ block: 'nearest' });
  }, [step, mode, reviewing]);
  const change = (key, next) => { onChange({ ...value, [key]: next }); setError(''); };
  const edit = index => { setReturnToReview(reviewing || firstInvalid(value) < 0); setStep(index); setMode('chat'); setReviewing(false); setError(''); };
  const advance = draft => {
    const issue = detailError(field.key, draft);
    if (issue) { setError(issue); return; }
    onChange(draft); setError('');
    if (returnToReview || step === BIRTH_DETAIL_FIELDS.length - 1) {
      const invalid = firstInvalid(draft);
      if (invalid >= 0) { setStep(invalid); return; }
      setReviewing(true); setReturnToReview(false);
    } else setStep(step + 1);
  };
  const submit = event => {
    event.preventDefault();
    if (busy) return;
    if (reviewing) { onConfirm(); return; }
    if (mode === 'chat') { advance(field.key === 'birthTime' ? { ...value, unknownTime: false } : value); return; }
    const invalid = firstInvalid(value);
    if (invalid >= 0) { setError(detailError(BIRTH_DETAIL_FIELDS[invalid].key, value)); root.current?.querySelector(`#intake-${BIRTH_DETAIL_FIELDS[invalid].key}`)?.focus(); return; }
    setError(''); setReviewing(true);
  };
  const switchMode = () => {
    setError('');
    if (mode === 'chat') { setMode('form'); return; }
    const invalid = firstInvalid(value);
    setMode('chat'); setReturnToReview(false);
    if (invalid < 0) setReviewing(true); else setStep(invalid);
  };
  const input = item => item.key === 'place' && renderPlace ? <React.Fragment key={item.key}>{renderPlace({ value, onChange, busy })}</React.Fragment> : <React.Fragment key={item.key}>
    <label htmlFor={`intake-${item.key}`}>{item.label}</label>
    <input id={`intake-${item.key}`} type={item.type} autoComplete="off" value={value[item.key]} max={item.type === 'date' ? todayKey() : undefined}
      maxLength={item.key === 'name' ? 100 : item.key === 'place' ? 200 : undefined}
      disabled={mode === 'form' && item.key === 'birthTime' && value.unknownTime}
      placeholder={item.key === 'place' ? 'City, region, country' : undefined}
      aria-describedby={item.key === 'place' ? 'intake-place-help' : undefined}
      onChange={event => change(item.key, event.target.value)} />
    {item.key === 'place' && <small id="intake-place-help">Text only in this prototype. Location and timezone lookup are not connected.</small>}
  </React.Fragment>;
  return <section ref={root} className="cp-birth-intake" aria-label="Birth details setup">
    {!reviewing && <button type="button" disabled={busy} className="cp-text-button cp-intake-mode" onClick={switchMode}>{mode === 'chat' ? 'Enter all details at once' : 'Ask me one question at a time'}</button>}
    <form onSubmit={submit} noValidate>
      <fieldset disabled={busy} className="cp-intake-controls">
      {reviewing ? <>
        <h2 tabIndex={-1} data-intake-review>Check birth details</h2>
        {confirmationContext && <p>{confirmationContext}</p>}
        <dl className="cp-intake-review">{BIRTH_DETAIL_FIELDS.map((item, index) => <div key={item.key}><dt>{item.label}</dt><dd>{birthDetailAnswer(item.key, value)}</dd><button type="button" className="cp-text-button" aria-label={`Edit ${item.label.toLowerCase()}`} onClick={() => edit(index)}>Edit</button></div>)}</dl>
        {notice && <p className="cp-caption">{notice}</p>}
        {reviewExtra}
        <button type="button" className="cp-text-button" onClick={() => { setMode('form'); setReviewing(false); setError(''); }}>Edit all details</button>
      </> : mode === 'chat' ? <>
        {step > 0 && <ol className="cp-intake-history" aria-label="Birth details collected">{BIRTH_DETAIL_FIELDS.slice(0, step).filter(item => !birthDetailError(item.key, value)).map(item => <li key={item.key}>
          <p className="cp-intake-question">✳ {birthDetailPrompt(item.key, value)}</p><div className="cp-intake-answer"><span>{birthDetailAnswer(item.key, value)}</span><button type="button" className="cp-text-button" aria-label={`Edit ${item.label.toLowerCase()}`} onClick={() => edit(BIRTH_DETAIL_FIELDS.indexOf(item))}>Edit</button></div>
        </li>)}</ol>}
        <p className="cp-intake-progress">Birth details · {step + 1} of {BIRTH_DETAIL_FIELDS.length}</p>
        <p className="cp-intake-question" aria-live="polite">✳ {birthDetailPrompt(field.key, value)}</p>
        {input(field)}
        {field.key === 'birthTime' && <button type="button" className="ink-btn ink-btn--ghost cp-intake-unknown" onClick={() => advance({ ...value, unknownTime: true })}>I don’t know their birth time</button>}
      </> : <fieldset><legend>Birth details</legend>{BIRTH_DETAIL_FIELDS.map(input)}<label className="cp-create-checkbox"><input type="checkbox" checked={value.unknownTime} onChange={event => change('unknownTime', event.target.checked)} /> Birth time unknown</label></fieldset>}
      {(error || submissionError) && <p role="alert" className="cp-create-error">{error || submissionError}</p>}
      <footer><button type="button" className="ink-btn ink-btn--ghost" onClick={onCancel}>Cancel</button><button type="submit" className="ink-btn ink-btn--navy">{busy ? 'Saving…' : reviewing ? confirmLabel : mode === 'form' ? 'Review details' : 'Continue'}</button></footer>
      </fieldset>
    </form>
  </section>;
}
