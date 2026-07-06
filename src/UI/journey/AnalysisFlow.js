import React from 'react';
import {
  LIFE_DOMAINS,
  decodeAstroCode,
  renderAspectPhrase,
  formatAspectDetail,
  formatSubtopicName,
} from '../dashboard/chartTabs/AnalysisTab';
import './AnalysisFlow.css';

// ── the 360 analysis as flowing chapters ──────────────────────────────
// No domain tabs, no expand/collapse: each life area is its own scroll
// step and every subsection is laid out open. The scroll is the
// navigation; nothing hides behind a click.

/**
 * ordered [{ domain, data }] built from the data's OWN keys (matching
 * AnalysisTab's live path) — LIFE_DOMAINS supplies labels when a key
 * matches, otherwise the key itself is formatted into one
 */
export function domainReadings(broadCategoryAnalyses) {
  const categories = broadCategoryAnalyses || {};
  return Object.keys(categories)
    .map((key) => ({
      domain:
        LIFE_DOMAINS.find((d) => d.id === key) || { id: key, label: formatSubtopicName(key) },
      data: categories[key],
    }))
    .filter((d) => d.data && (d.data.overview || d.data.subtopics || d.data.editedSubtopics));
}

export function DomainReading({ domain, data }) {
  const edited = data.editedSubtopics || {};
  const original = data.subtopics || {};
  const keys = Object.keys(edited).length > 0 ? Object.keys(edited) : Object.keys(original);
  const textOf = (k) => {
    const t = typeof edited[k] === 'string' ? edited[k] : original[k];
    return typeof t === 'string' ? t : t?.analysis || '';
  };

  return (
    <>
      <div className="aflow-head">
        <div className="journey-subchapter">{domain.label}</div>
        {data.tensionFlow?.keystoneAspects?.length > 0 && (
          <div className="aflow-pills">
            {data.tensionFlow.keystoneAspects.slice(0, 3).map((code, idx) => {
              const decoded = decodeAstroCode(code);
              return (
                <span key={idx} className="aflow-pill" title={formatAspectDetail(decoded)}>
                  {renderAspectPhrase(decoded)}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {data.overview && <p className="aflow-overview">{data.overview}</p>}

      {keys.map((k) => {
        const text = textOf(k);
        if (!text) return null;
        return (
          <div className="aflow-theme" key={k}>
            <h3>{formatSubtopicName(k)}</h3>
            {text
              .split(/\n\s*\n|\n/)
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t, i) => (
                <p key={i}>{t}</p>
              ))}
          </div>
        );
      })}

      {data.synthesis && (
        <div className="aflow-synthesis">
          <div className="aflow-synthesis-rule" />
          <p>{data.synthesis}</p>
        </div>
      )}
    </>
  );
}
