import React from 'react';
import { getServiceReading, makeReport } from './fixtures';
import { subjectFor } from './model';

// Product access lives in the reading region, not in an assistant message.
export default function ReportAccess({ message, access, onGenerate, onOpen, onOverview }) {
  if (!message) return <p role="status">Choose Detailed reading to view its availability.</p>;
  const person = subjectFor(message.subjectId);
  return <section className="ink-card cp-report-card" aria-label="Detailed reading access">
    <div className="cp-meta"><span className="ink-eyebrow">Your detailed reading</span><span>{getServiceReading(person.id)?.report.chapters.length} chapters · sample report</span></div>
    <h2>{person.label}<span className="ink-italic">, between the lines.</span></h2>
    <p>{getServiceReading(person.id)?.report.chapters.map(chapter => chapter.title).join(' · ')}</p>
    <p className="cp-context-note">{makeReport(person.id)?.note}</p>
    {message.status === 'access' && <div className="cp-access">
      <h3>{access === 'included' ? 'Included in this test scenario' : 'This sample report is locked'}</h3>
      <p>Access and preparation are simulated. No payment will be taken.</p>
      <button type="button" className="ink-btn ink-btn--navy" onClick={() => onGenerate(message)}>{access === 'included' ? 'Use sample included report' : 'Simulate purchase · $7.99'}</button>
      <button type="button" className="cp-text-button" onClick={onOverview}>Return to overview</button>
    </div>}
    {message.status === 'generating' && <div className="cp-generation" role="status"><span className="cp-pulse" aria-hidden="true">✳</span><div>Preparing your sample reading…<p>You can leave this service and return when it’s ready.</p></div></div>}
    {message.status === 'failed' && <div role="alert" className="cp-access"><h3>The simulated generation failed.</h3><p>Retry without repeating the access step.</p><button type="button" className="ink-btn ink-btn--ghost" onClick={() => onGenerate(message, true)}>Retry sample generation</button></div>}
    {message.status === 'ready' && <div className="cp-actions"><button type="button" className="ink-btn ink-btn--navy" onClick={() => onOpen(person.id)}>Open the reading ↗</button><span className="cp-caption">Saved · return to any chapter</span></div>}
  </section>;
}
