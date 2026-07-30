import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  askTrialQuestion,
  attachTrialEmail,
  fetchTrialHistory,
  loadTrialSession,
  getPendingTrialReading,
  clearPendingTrialReading,
} from '../Utilities/trialApi';
import './FreeReadingPage.css';

const ASSET = (name) => `${process.env.PUBLIC_URL || ''}/assets/ink/${name}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SIGN_GLYPHS = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const SIGN_ELEMENTS = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const SUN_LINES = {
  Aries: 'You lead with ignition. Waiting is the one thing your chart never learned to do.',
  Taurus: 'You build slowly and keep what you build. Rushing you has never once worked.',
  Gemini: 'You think in questions. A day without something new to turn over is a wasted day.',
  Cancer: 'You protect what you love before you even decide to. Home is a verb for you.',
  Leo: 'You warm whatever room you’re in — and you know it, which is part of the charm.',
  Virgo: 'You show love by noticing. Nothing gets past you, especially the fixable things.',
  Libra: 'You weigh everything twice. Fairness isn’t a preference for you — it’s a reflex.',
  Scorpio: 'You don’t do surfaces. Meaning has to be earned, and you’d rather know the difficult truth.',
  Sagittarius: 'You need a horizon. Any life that’s only logistics starts to itch quickly.',
  Capricorn: 'You play the long game on instinct. Effort is your native love language.',
  Aquarius: 'You see the pattern before the crowd does — and you’re fine standing apart from it.',
  Pisces: 'You feel the room before you enter it. Boundaries are your life’s homework.',
};

const MOON_LINES = {
  Aries: 'Feelings arrive fast and honest. You’d rather flare than simmer.',
  Taurus: 'You steady yourself through the senses — comfort is how you come back to earth.',
  Gemini: 'You process by talking it through. Silence is where your worries breed.',
  Cancer: 'You feel in tides. The people you let close get the fiercest loyalty there is.',
  Leo: 'Your heart wants witnesses. Being celebrated isn’t vanity — it’s fuel.',
  Virgo: 'You manage feelings by being useful. Sometimes the task is a hiding place.',
  Libra: 'You settle when things are even. Conflict sits in your body until it’s repaired.',
  Scorpio: 'You feel everything at full depth and show almost none of it. Trust changes that.',
  Sagittarius: 'You metabolize feelings by moving. Stuck emotions are just unwalked miles.',
  Capricorn: 'You feel deeply but privately, and you’d rather be relied on than looked after.',
  Aquarius: 'You feel deeply but step back to process. Distance is how you keep your footing.',
  Pisces: 'You absorb what others feel like weather. Solitude is how you wring yourself out.',
};

const RISING_LINES = {
  Aries: 'You arrive like a decision. People sense the momentum before you say a word.',
  Taurus: 'You read as calm and unhurried — the person who won’t be rushed or rattled.',
  Gemini: 'You arrive curious, quick, already mid-conversation with the world.',
  Cancer: 'You come across gentler than your spine actually is. It disarms people.',
  Leo: 'You’re noticed before you try to be. Presence is your first language.',
  Virgo: 'You arrive observant, precise, taking quiet inventory of everything.',
  Libra: 'You put rooms at ease. People assume you agree more than you do.',
  Scorpio: 'You arrive contained. People find you magnetic first and unreadable second.',
  Sagittarius: 'You show up open and a little unfiltered — people trust it instantly.',
  Capricorn: 'You read as capable before you say anything. People hand you the plan.',
  Aquarius: 'You come across friendly and slightly elsewhere — one step outside the frame.',
  Pisces: 'People find you softer than you are. You arrive gentle, then prove unmovable.',
};

const ordinal = (n) => {
  if (!n) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const buildMastNote = (bigThree) => {
  const sunEl = SIGN_ELEMENTS[bigThree?.sun?.sign];
  const moonEl = SIGN_ELEMENTS[bigThree?.moon?.sign];
  if (sunEl && moonEl && sunEl === moonEl) {
    return `Both luminaries in ${sunEl}. It explains more than you'd think.`;
  }
  if (sunEl && moonEl) {
    return `Luminaries in ${sunEl} & ${moonEl}. No wonder you feel everything twice.`;
  }
  return 'The sky kept the receipts. Here they are.';
};

const formatVitalsDate = (iso) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const formatVitalsTime = (t) => {
  if (!t) return 'Time unknown';
  let [h, mi] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(mi).padStart(2, '0')} ${ap}`;
};

const SUGGESTIONS = [
  'Why do I keep pulling away right when it gets good?',
  'What am I actually here to do?',
  'Is this year meant to be this heavy?',
];

const LOADING_LINES = [
  'Casting your chart for the exact minute you arrived…',
  'Placing your planets in their houses…',
  'Tracing the aspects between them…',
  'Astral Gravity is reading. No skimming, promise…',
  'Writing it up in plain language…',
];

const FreeReadingPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(undefined); // undefined = loading, null = none
  const [pendingPreview, setPendingPreview] = useState(null); // set while creation is in flight
  const [createError, setCreateError] = useState('');
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);

  const [thread, setThread] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const askInputRef = useRef(null);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [trialState, setTrialState] = useState(null);

  const [emailGateOpen, setEmailGateOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const adoptSession = (existing) => {
      if (cancelled) return;
      setSession(existing);
      setTrialState(existing.trial || null);
      setPendingPreview(null);
      try {
        const pending = window.localStorage.getItem('stellium_trial_pending_question');
        if (pending) {
          setInput(pending);
          window.localStorage.removeItem('stellium_trial_pending_question');
        }
      } catch (e) { /* ignore */ }

      // Rehydrate the conversation for returning visitors: pair the stored
      // user/assistant messages back into Q&A bubbles and refresh gate state.
      fetchTrialHistory(existing).then(({ messages, trial }) => {
        if (cancelled) return;
        const pairs = [];
        messages.forEach((message) => {
          if (message.role === 'user') {
            pairs.push({ q: message.content, a: null });
          } else if (message.role === 'assistant' && pairs.length > 0 && pairs[pairs.length - 1].a === null) {
            pairs[pairs.length - 1].a = message.content;
          }
        });
        if (pairs.length > 0) setThread(pairs.filter((qa) => qa.a !== null));
        if (trial) setTrialState((prev) => ({ ...prev, ...trial }));
      });
    };

    const existing = loadTrialSession();
    if (existing?.overview) {
      adoptSession(existing);
      return undefined;
    }

    // No session yet: a creation kicked off on the landing page may be in
    // flight — own the wait here with a real loading experience.
    const pending = getPendingTrialReading();
    if (pending) {
      setPendingPreview(pending.preview);
      pending.promise
        .then((created) => adoptSession(created))
        .catch((error) => {
          if (cancelled) return;
          clearPendingTrialReading();
          setCreateError(
            error?.status === 429
              ? 'Too many readings from this connection today — try again tomorrow.'
              : (error?.message || 'Something went wrong reading your chart.')
          );
        });
      return () => { cancelled = true; };
    }

    navigate('/', { replace: true });
    return () => { cancelled = true; };
  }, [navigate]);

  // Rotate the loading copy while creation is in flight
  useEffect(() => {
    if (!pendingPreview || createError) return undefined;
    const timer = setInterval(
      () => setLoadingLineIndex((i) => (i + 1) % LOADING_LINES.length),
      3400
    );
    return () => clearInterval(timer);
  }, [pendingPreview, createError]);

  // Auto-grow the ask textarea so long questions wrap instead of scrolling
  useEffect(() => {
    const el = askInputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  if (!session && (pendingPreview || createError)) {
    const previewName = pendingPreview?.firstName || 'friend';
    const previewVitals = pendingPreview?.vitals || {};
    return (
      <div className="fr">
        <nav className="fr-nav">
          <div className="fr-nav-inner">
            <Link className="fr-wordmark" to="/">Astral Gravity <span className="fr-mark">✳</span></Link>
          </div>
        </nav>
        <header className="fr-mast fr-wrap">
          <div className="fr-mast-grid">
            <div>
              <span className="fr-eyebrow">{createError ? 'Something went wrong' : 'Your free reading'}</span>
              {createError ? (
                <>
                  <h1>We couldn’t finish <span className="fr-it">your chart.</span></h1>
                  <p className="fr-load-error">{createError}</p>
                  <Link className="fr-btn fr-btn--navy" to="/">Try again ✳</Link>
                </>
              ) : (
                <>
                  <h1>One moment, <span className="fr-it">{previewName}</span>.<br />Astral Gravity is reading your chart.</h1>
                  <div className="fr-vitals">
                    {previewVitals.date && <span><b>{formatVitalsDate(previewVitals.date)}</b></span>}
                    <span>{formatVitalsTime(previewVitals.time)}</span>
                    {previewVitals.place && <span>{previewVitals.place}</span>}
                  </div>
                  <p className="fr-load-line" aria-live="polite">{LOADING_LINES[loadingLineIndex]}</p>
                </>
              )}
            </div>
            <div className="fr-mast-art">
              <img
                className={createError ? '' : 'fr-wheel-spin'}
                src={ASSET('ill-wheel.png')}
                alt="A hand-drawn zodiac wheel with sign glyphs, inked on paper"
              />
              {!createError && <div className="fr-note">Good things take about half a minute.</div>}
            </div>
          </div>
        </header>
      </div>
    );
  }

  if (!session) return null;

  const firstName = session.firstName || 'friend';
  const bigThree = session.bigThree || {};
  const vitals = session.vitals || {};
  const questionsLeft = trialState ? Math.max(0, (trialState.questionCap ?? 3) - (trialState.questionsUsed ?? 0)) : 3;
  const questionCap = trialState?.questionCap ?? 3;
  const outOfQuestions = questionsLeft === 0;

  const ask = async (text) => {
    const q = String(text || '').trim();
    if (!q || busy || outOfQuestions) return false;
    setChatError('');
    setBusy(true);
    setThread((prev) => [...prev, { q, a: null }]);
    try {
      const result = await askTrialQuestion(session, q);
      if (result.gated === 'email') {
        setThread((prev) => prev.slice(0, -1));
        if (result.trial) setTrialState((prev) => ({ ...prev, ...result.trial }));
        setEmailGateOpen(true);
        setInput(q); // keep their question ready for after the gate
        return false;
      }
      if (result.gated === 'limit') {
        setThread((prev) => prev.slice(0, -1));
        setTrialState((prev) => ({ ...prev, ...(result.trial || {}), questionsRemaining: 0 }));
        return false;
      }
      if (result.gated === 'claimed') {
        setThread((prev) => prev.slice(0, -1));
        setChatError('This reading now lives in an account — sign in to keep the conversation going.');
        return false;
      }
      setThread((prev) => prev.map((qa, i) => (i === prev.length - 1 ? { ...qa, a: result.answer } : qa)));
      setTrialState(result.trial);
      setInput('');
      return true;
    } catch (error) {
      setThread((prev) => prev.slice(0, -1));
      setChatError(error.message || 'Something went wrong. Ask again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const askFromSuggestion = async (text) => {
    const ok = await ask(text);
    if (ok) setSuggestions((prev) => prev.filter((s) => s !== text));
  };

  const submitEmailGate = async (event) => {
    event.preventDefault();
    const email = emailInput.trim();
    if (!email) return setEmailError('Enter your email.');
    setEmailError('');
    setEmailBusy(true);
    try {
      const data = await attachTrialEmail(session, email, false);
      if (data?.trial) setTrialState((prev) => ({ ...prev, ...data.trial }));
      setEmailGateOpen(false);
    } catch (error) {
      setEmailError(error.message || 'Could not save that email.');
    } finally {
      setEmailBusy(false);
    }
  };

  const b3 = [
    { role: 'Sun', data: bigThree.sun, lines: SUN_LINES },
    { role: 'Moon', data: bigThree.moon, lines: MOON_LINES },
    { role: 'Rising', data: bigThree.rising, lines: RISING_LINES },
  ].filter((item) => item.data?.sign);

  // Overviews mix short section headings ("Your Core Identity") with prose;
  // render headings as headings and drop-cap only the first prose paragraph.
  const overviewBlocks = String(session.overview || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ text, isHeading: text.length < 60 && !/[.!?]$/.test(text) }));
  let dropCapUsed = false;

  return (
    <div className="fr">
      <nav className="fr-nav">
        <div className="fr-nav-inner">
          <Link className="fr-wordmark" to="/">Astral Gravity <span className="fr-mark">✳</span></Link>
          <span className="fr-credits"><b>{questionsLeft}</b> free question{questionsLeft === 1 ? '' : 's'} left</span>
          <Link className="fr-btn fr-btn--navy fr-nav-btn" to="/signUp">Create free account</Link>
        </div>
      </nav>

      <header className="fr-mast fr-wrap">
        <div className="fr-mast-grid">
          <div>
            <span className="fr-eyebrow">Your free reading</span>
            <h1>Hello, <span className="fr-it">{firstName}</span>.<br />Here’s the shape of you.</h1>
            <div className="fr-vitals">
              <span><b>{formatVitalsDate(vitals.date)}</b></span>
              <span>{formatVitalsTime(vitals.time)}</span>
              {vitals.place && <span>{vitals.place}</span>}
            </div>
          </div>
          <div className="fr-mast-art">
            <img src={ASSET('ill-wheel.png')} alt="A hand-drawn zodiac wheel with sign glyphs, inked on paper" />
            <div className="fr-note">{buildMastNote(bigThree)}</div>
          </div>
        </div>
      </header>

      {b3.length > 0 && (
        <section className="fr-three">
          <div className="fr-wrap">
            <div className="fr-sect-head">
              <span className="fr-eyebrow">The three that set the tone</span>
              <h2>Sun, Moon, <span className="fr-it">Rising.</span></h2>
            </div>
            <div className="fr-three-grid">
              {b3.map(({ role, data, lines }) => (
                <div className="fr-b3" key={role}>
                  <span className="fr-role">{role}</span>
                  <span className="fr-pl">
                    <span className="fr-gl">{SIGN_GLYPHS[data.sign] || '✳'}</span>
                    {data.sign}{data.house ? `, ${ordinal(data.house)}` : ''}
                  </span>
                  <p>{lines[data.sign]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="fr-ovw fr-wrap">
        <div className="fr-sect-head">
          <span className="fr-eyebrow">Overview</span>
          <h2>What your chart <span className="fr-it">keeps saying.</span></h2>
        </div>
        <div className="fr-ovw-body">
          {overviewBlocks.map((block, i) => {
            if (block.isHeading) {
              return <h3 className="fr-ovw-h" key={i}>{block.text}</h3>;
            }
            if (!dropCapUsed) {
              dropCapUsed = true;
              return <p key={i}><span className="fr-lead">{block.text.charAt(0)}</span>{block.text.slice(1)}</p>;
            }
            return <p key={i}>{block.text}</p>;
          })}
        </div>
        <div className="fr-locked">
          <p className="fr-veil">
            Saturn’s position by house begins the longer story of commitment and reputation, and the way your Venus is
            configured sets the terms for how intimacy is negotiated across every chapter of the reading — including the
            aspects to your natal points and the progressed picture over the next two years.
          </p>
          <div className="fr-over">
            <p>Your full reading continues — patterns, every placement, and the 360° analysis.</p>
            <Link className="fr-btn fr-btn--navy" to="/signUp">Unlock the full reading ✳</Link>
          </div>
        </div>
      </section>

      <section className="fr-ask">
        <div className="fr-wrap">
          <div className="fr-sect-head">
            <span className="fr-eyebrow">Three questions, on the house</span>
            <h2>Your chart’s been read. <span className="fr-it">Ask away.</span></h2>
          </div>
          <div className="fr-ask-shell">
            <div className="fr-tally">
              {Array.from({ length: questionCap }).map((_, i) => (
                <span key={i} className={`fr-pip ${i < questionCap - questionsLeft ? 'fr-pip--spent' : ''}`} />
              ))}
              <span>{outOfQuestions ? 'no questions left' : questionsLeft === 1 ? '1 question left' : `${questionsLeft} questions left`}</span>
            </div>

            <div className="fr-thread">
              {thread.map((qa, i) => (
                <div className="fr-qa" key={i}>
                  <div className="fr-q">{qa.q}</div>
                  <div className="fr-a">
                    {qa.a === null
                      ? <span className="fr-typing">Astral Gravity is reading your chart…</span>
                      : <>{qa.a}<span className="fr-a-sig">— Astral Gravity ✳</span></>}
                  </div>
                </div>
              ))}
            </div>

            {!outOfQuestions && suggestions.length > 0 && !emailGateOpen && (
              <div className="fr-sugg">
                {suggestions.map((s) => (
                  <button key={s} type="button" disabled={busy} onClick={() => askFromSuggestion(s)}>{s}</button>
                ))}
              </div>
            )}

            {emailGateOpen && !outOfQuestions && (
              <form className="fr-gate" onSubmit={submitEmailGate}>
                <span className="fr-eyebrow">One small thing</span>
                <h3>That first one was on the house.</h3>
                <p>Leave your email and Astral Gravity will answer your next {questionsLeft === 1 ? 'question' : `${questionsLeft} questions`} — and send you this reading to keep.</p>
                <div className="fr-gate-row">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <button className="fr-btn fr-btn--navy" type="submit" disabled={emailBusy}>
                    {emailBusy ? 'One sec…' : 'Keep asking ✳'}
                  </button>
                </div>
                {emailError && <p className="fr-error">{emailError}</p>}
                <p className="fr-fine">No spam, no account required yet.</p>
              </form>
            )}

            {!emailGateOpen && (
              <div className="fr-ask-bar">
                <div className="fr-ask-bar-inner">
                  <textarea
                    ref={askInputRef}
                    rows={1}
                    placeholder={outOfQuestions ? 'Create an account to keep asking' : 'Ask about your chart...'}
                    aria-label="Ask about your chart"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); } }}
                    disabled={busy || outOfQuestions}
                  />
                  <button className="fr-btn fr-btn--navy" type="button" disabled={busy || outOfQuestions} onClick={() => ask(input)}>
                    Gravity Chat ✳
                  </button>
                </div>
              </div>
            )}

            {chatError && <p className="fr-error" role="alert">{chatError}</p>}

            {outOfQuestions && (
              <div className="fr-wall">
                <span className="fr-eyebrow">That’s your three</span>
                <h3>Keep going with <span className="fr-it">25 free credits.</span></h3>
                <p>Create an account and Astral Gravity keeps this chart, remembers the conversation, and opens the full reading — patterns, every placement, and your 360° analysis.</p>
                <Link className="fr-btn fr-btn--navy" to="/signUp">Create free account ✳</Link>
                <p className="fr-fine">No card required. Your reading is saved to this chart.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="fr-closing fr-wrap">
        <span className="fr-eyebrow">Ready when you are</span>
        <h2>There’s a lot <span className="fr-it">more in here.</span></h2>
        <p>Your chart has 40-odd placements. We covered three.</p>
        <Link className="fr-btn fr-btn--navy" to="/signUp">Unlock my full chart ✳</Link>
      </section>

      <footer className="fr-colophon">
        <div className="fr-wrap fr-colo-inner">
          <span className="fr-wm">Astral Gravity ✳</span>
          <Link to="/">Home</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
          <span>© 2026 Astral Gravity</span>
        </div>
      </footer>
    </div>
  );
};

export default FreeReadingPage;
