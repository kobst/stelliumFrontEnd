import React from 'react';
import {
  LIFE_DOMAINS,
  decodeAstroCode,
  renderAspectPhrase,
  formatAspectDetail,
  formatSubtopicName,
} from '../dashboard/chartTabs/AnalysisTab';
import './AnalysisFlow.css';

// ── the 360 analysis: the reading walks, the sky answers ─────────────
// Each life-domain chapter and each theme within it is its own scroll
// step. Every step carries a `focus` — the placements its text actually
// discusses (keystone aspect codes + planet mentions in the prose) —
// and the journey lights exactly those bodies on the big wheel as the
// step centers. No tabs, no accordion: scroll is the navigation, the
// sky is the illustration.

/** planet/point names that appear in a passage of prose, in order */
export function mentionsIn(text, knownNames) {
  if (!text) return [];
  const found = [];
  knownNames.forEach((name) => {
    if (new RegExp(`\\b${name}\\b`).test(text)) found.push(name);
  });
  return found;
}

const keystonePlanets = (data) =>
  (data?.tensionFlow?.keystoneAspects || []).flatMap((code) => {
    const d = decodeAstroCode(code);
    if (d?.type === 'aspect') return [d.p1?.planet, d.p2?.planet];
    if (d?.type === 'placement') return [d.planet];
    return [];
  }).filter(Boolean);

/**
 * Flatten the analysis into journey steps:
 * [{ id, kind: 'intro'|'theme'|'synthesis', domain, focus, ... }]
 * Domains come from the data's own keys (AnalysisTab's live path);
 * LIFE_DOMAINS supplies labels when a key matches.
 */
export function flattenAnalysis(broadCategoryAnalyses, knownNames = []) {
  const categories = broadCategoryAnalyses || {};
  const steps = [];
  Object.keys(categories).forEach((key) => {
    const data = categories[key];
    if (!data || !(data.overview || data.subtopics || data.editedSubtopics)) return;
    const domain =
      LIFE_DOMAINS.find((d) => d.id === key) || { id: key, label: formatSubtopicName(key) };

    steps.push({
      id: `dom-${key}-intro`,
      kind: 'intro',
      domain,
      data,
      focus: [...new Set([...keystonePlanets(data), ...mentionsIn(data.overview, knownNames)])],
    });

    const edited = data.editedSubtopics || {};
    const original = data.subtopics || {};
    const keys = Object.keys(edited).length > 0 ? Object.keys(edited) : Object.keys(original);
    keys.forEach((k) => {
      const raw = typeof edited[k] === 'string' ? edited[k] : original[k];
      const text = typeof raw === 'string' ? raw : raw?.analysis || '';
      if (!text) return;
      steps.push({
        id: `dom-${key}-t-${k}`,
        kind: 'theme',
        domain,
        title: formatSubtopicName(k),
        text,
        focus: mentionsIn(text, knownNames),
      });
    });

    if (data.synthesis) {
      steps.push({
        id: `dom-${key}-syn`,
        kind: 'synthesis',
        domain,
        text: data.synthesis,
        focus: mentionsIn(data.synthesis, knownNames),
      });
    }
  });
  return steps;
}

const paragraphs = (text) =>
  (text || '')
    .split(/\n\s*\n|\n/)
    .map((t) => t.trim())
    .filter(Boolean);

/** one flattened step's content; hover on pills sharpens the sky */
export function AnalysisStepBody({ step, onHoverBodies, onPinBodies, pinnedBodies }) {
  const isPinned = (names) =>
    pinnedBodies?.length === names.length &&
    pinnedBodies.every((name, index) => name === names[index]);
  if (step.kind === 'intro') {
    return (
      <>
        <div className="aflow-head aflow-head--pills-only">
          {step.data.tensionFlow?.keystoneAspects?.length > 0 && (
            <div className="aflow-pills">
              {step.data.tensionFlow.keystoneAspects.slice(0, 3).map((code, idx) => {
                const decoded = decodeAstroCode(code);
                const names =
                  decoded?.type === 'aspect'
                    ? [decoded.p1?.planet, decoded.p2?.planet].filter(Boolean)
                    : decoded?.type === 'placement'
                      ? [decoded.planet]
                      : [];
                return (
                  <button
                    type="button"
                    key={idx}
                    className="aflow-pill"
                    title={formatAspectDetail(decoded)}
                    aria-pressed={isPinned(names)}
                    onMouseEnter={() => onHoverBodies?.(names.length ? names : null)}
                    onMouseLeave={() => onHoverBodies?.(null)}
                    onFocus={() => onHoverBodies?.(names.length ? names : null)}
                    onBlur={() => onHoverBodies?.(null)}
                    onClick={() => onPinBodies?.(names)}
                  >
                    {renderAspectPhrase(decoded)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {step.data.overview && <p className="aflow-overview">{step.data.overview}</p>}
      </>
    );
  }
  if (step.kind === 'theme') {
    return (
      <div className="aflow-theme">
        <h3>{step.title}</h3>
        {step.focus.length > 0 && (
          <div className="aflow-cast">
            {step.focus.map((n, i) => (
              <button
                type="button"
                key={i}
                aria-pressed={isPinned([n])}
                onMouseEnter={() => onHoverBodies?.([n])}
                onMouseLeave={() => onHoverBodies?.(null)}
                onFocus={() => onHoverBodies?.([n])}
                onBlur={() => onHoverBodies?.(null)}
                onClick={() => onPinBodies?.([n])}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        {paragraphs(step.text).map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
    );
  }
  return (
    <div className="aflow-synthesis">
      <div className="aflow-synthesis-rule" />
      {paragraphs(step.text).map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </div>
  );
}
