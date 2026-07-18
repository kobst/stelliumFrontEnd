import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  askCelebrityHoroscope,
  generateCelebrityHoroscope,
  getCelebrityHoroscope,
} from '../../Utilities/adminApi';
import './CelebrityHoroscopeModal.css';

const HOROSCOPE_TYPES = ['daily', 'weekly', 'monthly'];

function getTodayForDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHoroscopeRecord(response) {
  return response?.horoscope || response?.data?.horoscope || response?.data || response || null;
}

function getInterpretation(record) {
  const interpretation = record?.interpretation ?? record?.narrative ?? record?.text;

  if (typeof interpretation === 'string') return interpretation;
  if (typeof interpretation?.text === 'string') return interpretation.text;
  if (typeof interpretation?.content === 'string') return interpretation.content;
  return '';
}

function getDegradedFeatures(record, response) {
  const features = record?.degradedFeatures
    ?? record?.metadata?.degradedFeatures
    ?? response?.degradedFeatures
    ?? response?.metadata?.degradedFeatures;
  return Array.isArray(features) ? features : [];
}

function getBirthTimeMode(record, response) {
  return record?.birthTimeMode
    ?? record?.metadata?.birthTimeMode
    ?? response?.birthTimeMode
    ?? response?.metadata?.birthTimeMode;
}

function isFullAnalysisRequiredError(error) {
  const errorDetails = `${error?.message || ''} ${JSON.stringify(error?.data || {})}`;
  return /full[\s_-]*analysis|birth[\s_-]*chart[\s_-]*analysis|rag vectors?|analysis.{0,30}(complete|required)|(?:complete|required).{0,30}analysis/i.test(errorDetails);
}

function formatGenerationError(error) {
  if (isFullAnalysisRequiredError(error)) {
    return 'Generate full analysis first. This celebrity must have a completed full analysis before a horoscope can be generated.';
  }

  return error?.message || 'Failed to generate the horoscope.';
}

function formatAskError(error) {
  if (isFullAnalysisRequiredError(error)) {
    return 'Generate full analysis first. This celebrity must have a completed full analysis before horoscope questions can be answered.';
  }

  return error?.message || 'Failed to answer the horoscope question.';
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);

  return copied ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
}

function CelebrityHoroscopeModal({ celebrity, onClose }) {
  const [type, setType] = useState('daily');
  const [date, setDate] = useState(getTodayForDateInput);
  const [result, setResult] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [generatingAction, setGeneratingAction] = useState(null);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [question, setQuestion] = useState('');
  const [askResult, setAskResult] = useState(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const [askCopyStatus, setAskCopyStatus] = useState('');
  const requestIdRef = useRef(0);

  const celebrityName = useMemo(() => {
    const splitName = [celebrity?.firstName, celebrity?.lastName].filter(Boolean).join(' ');
    return splitName || celebrity?.name || 'Celebrity';
  }, [celebrity]);

  const record = useMemo(() => getHoroscopeRecord(result), [result]);
  const interpretation = useMemo(() => getInterpretation(record), [record]);
  const degradedFeatures = useMemo(
    () => getDegradedFeatures(record, result),
    [record, result]
  );
  const birthTimeMode = getBirthTimeMode(record, result);
  const hasReducedPrecision = String(birthTimeMode || '').toLowerCase().includes('unknown')
    || degradedFeatures.length > 0;
  const askRecord = useMemo(() => getHoroscopeRecord(askResult), [askResult]);
  const askInterpretation = useMemo(() => getInterpretation(askRecord), [askRecord]);
  const askDegradedFeatures = useMemo(
    () => getDegradedFeatures(askRecord, askResult),
    [askRecord, askResult]
  );
  const askBirthTimeMode = getBirthTimeMode(askRecord, askResult);
  const askHasReducedPrecision = String(askBirthTimeMode || '').toLowerCase().includes('unknown')
    || askDegradedFeatures.length > 0;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!celebrity?._id || !date) {
      setResult(null);
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    async function loadCurrentHoroscope() {
      setLoadingCurrent(true);
      setResult(null);
      setError('');
      setCopyStatus('');

      try {
        const response = await getCelebrityHoroscope(celebrity._id, type, date);
        if (!cancelled && requestId === requestIdRef.current) {
          setResult(response);
        }
      } catch (loadError) {
        if (!cancelled && requestId === requestIdRef.current && loadError.status !== 404) {
          setError(formatGenerationError(loadError));
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoadingCurrent(false);
        }
      }
    }

    loadCurrentHoroscope();

    return () => {
      cancelled = true;
    };
  }, [celebrity?._id, type, date]);

  const handleGenerate = async (force) => {
    if (!celebrity?._id || !date) return;

    const requestId = ++requestIdRef.current;
    const action = force ? 'regenerate' : 'generate';
    setGeneratingAction(action);
    setLoadingCurrent(false);
    setError('');
    setCopyStatus('');

    try {
      const response = await generateCelebrityHoroscope(celebrity._id, type, { date, force });
      if (requestId === requestIdRef.current) {
        setResult(response);
      }
    } catch (generationError) {
      if (requestId === requestIdRef.current) {
        setError(formatGenerationError(generationError));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setGeneratingAction(null);
      }
    }
  };

  const handleCopy = async () => {
    if (!interpretation) return;

    try {
      await copyText(interpretation);
      setCopyStatus('Copied to clipboard');
    } catch (copyError) {
      setCopyStatus('Copy failed. Select and copy the text manually.');
    }
  };

  const handleAsk = async (event) => {
    event.preventDefault();

    const query = question.trim();
    if (!celebrity?._id || !query || asking) return;

    setAsking(true);
    setAskResult(null);
    setAskError('');
    setAskCopyStatus('');

    try {
      const response = await askCelebrityHoroscope(celebrity._id, {
        query,
        period: type,
        date,
      });
      setAskResult(response);
    } catch (requestError) {
      setAskError(formatAskError(requestError));
    } finally {
      setAsking(false);
    }
  };

  const handleAskCopy = async () => {
    if (!askInterpretation) return;

    try {
      await copyText(askInterpretation);
      setAskCopyStatus('Copied to clipboard');
    } catch (copyError) {
      setAskCopyStatus('Copy failed. Select and copy the text manually.');
    }
  };

  const isBusy = Boolean(generatingAction);

  return (
    <div className="celebrity-horoscope-modal-overlay" onMouseDown={onClose}>
      <div
        className="celebrity-horoscope-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebrity-horoscope-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="chm-header">
          <div>
            <div className="chm-eyebrow">Celebrity horoscope</div>
            <h2 id="celebrity-horoscope-title">{celebrityName}</h2>
          </div>
          <button type="button" className="chm-close" onClick={onClose} aria-label="Close horoscope modal">
            &times;
          </button>
        </div>

        <div className="chm-controls">
          <div className="chm-period-toggle" aria-label="Horoscope period">
            {HOROSCOPE_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                className={`chm-period-button ${type === option ? 'active' : ''}`}
                aria-pressed={type === option}
                onClick={() => setType(option)}
                disabled={isBusy}
              >
                {option}
              </button>
            ))}
          </div>

          <label className="chm-date-field">
            <span>Date in current period</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={isBusy}
            />
          </label>
        </div>

        <div className="chm-actions">
          <button
            type="button"
            className="chm-button chm-button-primary"
            onClick={() => handleGenerate(false)}
            disabled={isBusy || !date}
          >
            {generatingAction === 'generate' ? 'Generating...' : 'Generate'}
          </button>
          <button
            type="button"
            className="chm-button"
            onClick={() => handleGenerate(true)}
            disabled={isBusy || !date}
          >
            {generatingAction === 'regenerate' ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>

        {error && <div className="chm-error" role="alert">{error}</div>}

        {loadingCurrent && !isBusy && (
          <div className="chm-empty">Checking for a horoscope in the selected period...</div>
        )}

        {!loadingCurrent && !isBusy && !error && !interpretation && (
          <div className="chm-empty">No horoscope has been generated for this period yet.</div>
        )}

        {interpretation && (
          <div className="chm-result">
            <div className="chm-result-header">
              <h3>{type[0].toUpperCase() + type.slice(1)} horoscope</h3>
              <button type="button" className="chm-button chm-button-copy" onClick={handleCopy}>
                Copy for social
              </button>
            </div>

            {hasReducedPrecision && (
              <div
                className="chm-precision-note"
                title={degradedFeatures.length > 0 ? `Degraded features: ${degradedFeatures.join(', ')}` : undefined}
              >
                Reduced precision (birth time unknown)
              </div>
            )}

            <div className="chm-interpretation">{interpretation}</div>

            <div className="chm-result-footer">
              <div className="chm-meta">
                {record?.startDate && <span>Period starts: {record.startDate}</span>}
                {record?.endDate && <span>Period ends: {record.endDate}</span>}
                {record?.generatedAt && <span>Generated: {new Date(record.generatedAt).toLocaleString()}</span>}
              </div>
              {copyStatus && <div className="chm-copy-status" aria-live="polite">{copyStatus}</div>}
            </div>
          </div>
        )}

        <section className="chm-result" aria-labelledby="celebrity-horoscope-question-title">
          <div className="chm-result-header">
            <h3 id="celebrity-horoscope-question-title">Ask about this horoscope</h3>
          </div>

          <form onSubmit={handleAsk}>
            <label className="chm-date-field">
              <span>Question</span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                disabled={asking}
                placeholder={`Ask a question about ${celebrityName}'s ${type} horoscope...`}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  color: 'white',
                  font: 'inherit',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
            </label>

            <div className="chm-actions">
              <button
                type="submit"
                className="chm-button chm-button-primary"
                disabled={asking || !question.trim()}
              >
                {asking ? 'Asking...' : 'Ask'}
              </button>
            </div>
          </form>

          {askError && <div className="chm-error" role="alert">{askError}</div>}

          {askInterpretation && (
            <div>
              <div className="chm-result-header">
                <h3>Answer</h3>
                <button type="button" className="chm-button chm-button-copy" onClick={handleAskCopy}>
                  Copy answer
                </button>
              </div>

              {askHasReducedPrecision && (
                <div
                  className="chm-precision-note"
                  title={askDegradedFeatures.length > 0 ? `Degraded features: ${askDegradedFeatures.join(', ')}` : undefined}
                >
                  Reduced precision (birth time unknown)
                </div>
              )}

              <div className="chm-interpretation">{askInterpretation}</div>

              <div className="chm-result-footer">
                <div className="chm-meta">
                  {askRecord?.period && <span>Period: {askRecord.period}</span>}
                  {askRecord?.date && <span>Date: {askRecord.date}</span>}
                </div>
                {askCopyStatus && <div className="chm-copy-status" aria-live="polite">{askCopyStatus}</div>}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CelebrityHoroscopeModal;
