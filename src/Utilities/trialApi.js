/**
 * Anonymous trial funnel API (see backend docs/TRIAL_FUNNEL.md).
 *
 * A trial session is { subjectId, trialToken } minted by the create call.
 * It is persisted in localStorage so a returning visitor keeps their reading,
 * and so the signup flow can claim the chart into the new account.
 */
import { HTTP_POST, CONTENT_TYPE_HEADER, APPLICATION_JSON } from './constants';
import { authenticatedFetch } from './api';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const TRIAL_SESSION_KEY = 'stellium_trial_session';

export const loadTrialSession = () => {
  try {
    const raw = window.localStorage.getItem(TRIAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.subjectId || !parsed?.trialToken) return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

export const saveTrialSession = (session) => {
  try {
    window.localStorage.setItem(TRIAL_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    // Private browsing or storage full — trial still works within the page session
  }
};

export const clearTrialSession = () => {
  try {
    window.localStorage.removeItem(TRIAL_SESSION_KEY);
  } catch (error) {
    // ignore
  }
};

const postJson = async (path, body) => {
  const response = await fetch(`${SERVER_URL}${path}`, {
    method: HTTP_POST,
    headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
};

/**
 * Create a trial reading from birth data.
 * On success, persists the trial session and returns the payload
 * (subjectId, trialToken, birthChart, overview, trial gate state).
 */
export const createTrialReading = async (birthData) => {
  const { ok, status, data } = await postJson('/public/trial/create', birthData);
  if (!ok) {
    throw Object.assign(new Error(data?.error || `Trial create failed (${status})`), { code: data?.code, status });
  }
  saveTrialSession({
    subjectId: data.subjectId,
    trialToken: data.trialToken,
    overview: data.overview,
    firstName: birthData.firstName,
    createdAt: Date.now(),
  });
  return data;
};

/** Pull Sun / Moon / Rising out of a birth chart for the reading page. */
export const extractBigThree = (birthChart) => {
  const byName = {};
  (birthChart?.planets || []).forEach((p) => { byName[p.name] = p; });
  const pick = (name) => byName[name]
    ? { sign: byName[name].sign || null, house: byName[name].house || null }
    : null;
  return { sun: pick('Sun'), moon: pick('Moon'), rising: pick('Ascendant') };
};

// In-flight trial creation, so the landing page can navigate to /free-reading
// immediately and the reading page can await the result there. Module-scoped:
// survives SPA navigation, not a hard reload (reload with no session → home).
let pendingTrialReading = null;

/**
 * Start the full creation pipeline (timezone lookup → create → enrich session)
 * WITHOUT awaiting it. Returns immediately; the reading page consumes the
 * pending handle. Safe under StrictMode double-effects: getPendingTrialReading
 * does not clear the handle — it is replaced on the next begin, and cleared
 * when the promise settles into a saved session.
 */
export const beginTrialReading = (form, { fetchTimeZone }) => {
  const preview = {
    firstName: form.firstName,
    vitals: {
      date: form.dateOfBirth,
      time: form.birthTimeUnknown ? null : form.time,
      place: form.placeOfBirth,
    },
  };

  const promise = (async () => {
    const timeForTimezone = form.birthTimeUnknown ? '12:00' : form.time;
    const epochTimeSeconds = Math.floor(new Date(`${form.dateOfBirth}T${timeForTimezone}:00`).getTime() / 1000);
    const tzone = await fetchTimeZone(form.lat, form.lon, epochTimeSeconds);

    const data = await createTrialReading({
      firstName: form.firstName,
      lastName: form.lastName || '',
      dateOfBirth: form.dateOfBirth,
      placeOfBirth: form.placeOfBirth,
      ...(form.birthTimeUnknown ? { birthTimeUnknown: true } : { time: form.time }),
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      tzone: parseFloat(tzone),
    });

    saveTrialSession({
      ...loadTrialSession(),
      vitals: preview.vitals,
      bigThree: extractBigThree(data.birthChart),
      trial: data.trial,
    });
    return loadTrialSession();
  })();

  // Keep the handle until settled so late subscribers (or StrictMode's second
  // effect run) can still attach; never let a rejection go unhandled here.
  pendingTrialReading = { promise, preview };
  promise.catch(() => {}).finally(() => {
    if (pendingTrialReading?.promise === promise) {
      // Leave errored handles in place so the reading page can render the
      // failure; successful runs are represented by the saved session.
      loadTrialSession() && (pendingTrialReading = null);
    }
  });

  return pendingTrialReading;
};

export const getPendingTrialReading = () => pendingTrialReading;

export const clearPendingTrialReading = () => { pendingTrialReading = null; };

/**
 * Ask a trial question. Returns { answer, trial } on success.
 * Gate outcomes are returned (not thrown) so the UI can render them:
 * { gated: 'email' | 'limit' | 'claimed', trial }.
 */
export const askTrialQuestion = async (session, query) => {
  const { ok, status, data } = await postJson(`/public/trial/${session.subjectId}/chat`, {
    query,
    trialToken: session.trialToken,
  });
  if (ok) return { answer: data.answer, trial: data.trial };
  if (data?.code === 'TRIAL_EMAIL_REQUIRED') return { gated: 'email', trial: data.trial };
  if (data?.code === 'TRIAL_QUESTION_LIMIT') return { gated: 'limit', trial: data.trial };
  if (data?.code === 'TRIAL_CLAIMED') return { gated: 'claimed' };
  throw Object.assign(new Error(data?.error || `Trial chat failed (${status})`), { code: data?.code, status });
};

/**
 * Attach an email to the trial session. sendReading=true also emails the
 * overview to the visitor (the ungated "email me this reading" capture).
 */
export const attachTrialEmail = async (session, email, sendReading = false) => {
  const { ok, status, data } = await postJson(`/public/trial/${session.subjectId}/email`, {
    email,
    sendReading,
    trialToken: session.trialToken,
  });
  if (!ok) {
    throw Object.assign(new Error(data?.error || `Email attach failed (${status})`), { code: data?.code, status });
  }
  return data;
};

/**
 * Claim the trial reading into the signed-in account (requires Firebase token).
 * Clears the stored session on success.
 */
export const claimTrialReading = async (session, token, email = undefined) => {
  const response = await authenticatedFetch(
    `${SERVER_URL}/trial/claim`,
    {
      method: HTTP_POST,
      body: JSON.stringify({
        subjectId: session.subjectId,
        trialToken: session.trialToken,
        ...(email ? { email } : {}),
      }),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data?.error || `Trial claim failed (${response.status})`), { code: data?.code, status: response.status });
  }
  clearTrialSession();
  return data;
};
