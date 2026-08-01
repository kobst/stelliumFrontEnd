import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GooglePlaceAutocomplete from '../shared/GooglePlaceAutocomplete';
import { fetchTimeZone } from '../../Utilities/api';
import {
  beginTrialReading,
  askTrialQuestion,
  attachTrialEmail,
  extractBigThree,
} from '../../Utilities/trialApi';
import { SIGN_GLYPHS, SUN_LINES, MOON_LINES, RISING_LINES, ordinal } from '../../Utilities/signCopy';
import './GravityIntakeChat.css';

/**
 * Conversational trial intake: asks for birth details one question at a time,
 * casts the chart, and drops the (shortened) reading straight into the chat
 * feed — no second page. The same input then becomes Gravity Chat for the
 * visitor's free questions; the email gate and signup wall render as bubbles.
 */

const STEP = {
  NAME: 'name',
  DATE: 'date',
  PLACE: 'place',
  TIME: 'time',
  CASTING: 'casting',
  QUESTIONS: 'questions',
  GATED: 'gated',
  DONE: 'done',
};

const CASTING_LINES = [
  'Casting your chart for the exact minute you arrived…',
  'Placing your planets in their houses…',
  'Tracing the aspects between them…',
  'Writing it up in plain language…',
];

/**
 * Split the real overview into a short visible head (~first five lines) and
 * the genuine continuation to blur. Never returns filler text — what the blur
 * hides is the actual next passage of this person's reading.
 */
export const splitOverviewForTeaser = (overview) => {
  const blocks = String(overview || '')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    // Drop short heading-like lines ("Your Core Identity") for the chat teaser
    .filter((b) => !(b.length < 60 && !/[.!?]$/.test(b)));
  const prose = blocks.join(' ');
  if (!prose) return { head: '', tail: '' };

  const sentences = prose.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [prose];
  let head = '';
  for (const sentence of sentences) {
    if (head.length >= 300) break;
    head += sentence;
  }
  head = head.trim();
  const tail = prose.slice(head.length).trim().slice(0, 420);
  return { head, tail };
};

const formatDateAnswer = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const formatTimeAnswer = (t) => {
  let [h, mi] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(mi).padStart(2, '0')} ${ap}`;
};

let bubbleKey = 0;
const nextKey = () => `b${bubbleKey += 1}`;

const GravityIntakeChat = ({ onReadingReady }) => {
  const [feed, setFeed] = useState([]);
  const [step, setStep] = useState(STEP.NAME);
  const [textValue, setTextValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [castingLine, setCastingLine] = useState(0);
  const [trialState, setTrialState] = useState(null);
  const [session, setSession] = useState(null);

  const formRef = useRef({});
  const feedRef = useRef(null);
  const startedRef = useRef(false);

  const push = (item) => setFeed((prev) => [...prev, { key: nextKey(), ...item }]);

  const pushBot = (text, delay = 0) => new Promise((resolve) => {
    setTimeout(() => {
      push({ kind: 'bot', text });
      resolve();
    }, delay);
  });

  // Opening bubbles (guard against StrictMode double-mount)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      await pushBot('Curious about your stars? ✳');
      await pushBot('I can cast your birth chart and read it for you — free. Start by telling me your name.', 700);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll the feed
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed, busy]);

  // Rotate casting copy while the chart is being generated
  useEffect(() => {
    if (step !== STEP.CASTING) return undefined;
    const timer = setInterval(() => setCastingLine((i) => (i + 1) % CASTING_LINES.length), 3000);
    return () => clearInterval(timer);
  }, [step]);

  const runCasting = async (form) => {
    setStep(STEP.CASTING);
    try {
      const { promise } = beginTrialReading(form, { fetchTimeZone });
      const created = await promise;
      setSession(created);
      setTrialState(created.trial || null);
      if (typeof onReadingReady === 'function') onReadingReady(created);

      const { head, tail } = splitOverviewForTeaser(created.overview);
      push({
        kind: 'result',
        bigThree: created.bigThree || extractBigThree(null),
        head,
        tail,
      });
      await pushBot(
        `That’s the core of it, ${form.firstName}. Ask me anything about your chart — your first question’s on the house.`,
        900
      );
      setStep(STEP.QUESTIONS);
    } catch (error) {
      push({
        kind: 'bot',
        text: error?.status === 429
          ? 'Too many readings from this connection today — come back tomorrow and I’ll cast it fresh.'
          : 'Something went wrong casting your chart. Give it another try in a moment.',
      });
      setStep(STEP.TIME);
    }
  };

  const submitAnswer = async (raw) => {
    if (busy) return;
    const value = String(raw ?? textValue).trim();

    if (step === STEP.NAME) {
      if (!value) return;
      const firstName = value.split(/\s+/)[0];
      formRef.current.firstName = firstName;
      formRef.current.lastName = value.split(/\s+/).slice(1).join(' ');
      push({ kind: 'user', text: value });
      setTextValue('');
      setBusy(true);
      await pushBot(`Lovely to meet you, ${firstName}. What’s your birth date?`, 650);
      setBusy(false);
      setStep(STEP.DATE);
      return;
    }

    if (step === STEP.DATE) {
      if (!dateValue) return;
      formRef.current.dateOfBirth = dateValue;
      push({ kind: 'user', text: formatDateAnswer(dateValue) });
      setBusy(true);
      await pushBot('And where were you born? City and country is perfect.', 650);
      setBusy(false);
      setStep(STEP.PLACE);
      return;
    }

    if (step === STEP.TIME) {
      if (!timeValue) return;
      formRef.current.time = timeValue;
      formRef.current.birthTimeUnknown = false;
      push({ kind: 'user', text: formatTimeAnswer(timeValue) });
      setBusy(true);
      await pushBot('Perfect. Casting your chart now…', 500);
      setBusy(false);
      runCasting({ ...formRef.current });
      return;
    }

    if (step === STEP.QUESTIONS) {
      if (!value || !session) return;
      push({ kind: 'user', text: value });
      setTextValue('');
      setBusy(true);
      try {
        const result = await askTrialQuestion(session, value);
        if (result.gated === 'email') {
          if (result.trial) setTrialState((prev) => ({ ...prev, ...result.trial }));
          push({ kind: 'gate', question: value });
          setStep(STEP.GATED);
        } else if (result.gated === 'limit') {
          setTrialState((prev) => ({ ...prev, ...(result.trial || {}), questionsRemaining: 0 }));
          push({ kind: 'wall' });
          setStep(STEP.DONE);
        } else if (result.gated === 'claimed') {
          push({ kind: 'bot', text: 'This reading now lives in an account — sign in to keep the conversation going.' });
          setStep(STEP.DONE);
        } else {
          push({ kind: 'answer', text: result.answer });
          setTrialState(result.trial);
          if ((result.trial?.questionsRemaining ?? 1) <= 0) {
            push({ kind: 'wall' });
            setStep(STEP.DONE);
          }
        }
      } catch (error) {
        push({ kind: 'bot', text: 'Something went wrong there — ask me again.' });
      } finally {
        setBusy(false);
      }
    }
  };

  const handlePlaceSelected = async ({ formattedAddress, lat, lon }) => {
    if (lat == null || lon == null || step !== STEP.PLACE) return;
    formRef.current.placeOfBirth = formattedAddress;
    formRef.current.lat = lat;
    formRef.current.lon = lon;
    push({ kind: 'user', text: formattedAddress });
    setBusy(true);
    await pushBot('Last one — what time were you born? If you don’t know, that’s completely fine.', 650);
    setBusy(false);
    setStep(STEP.TIME);
  };

  const handleUnknownTime = async () => {
    formRef.current.time = '';
    formRef.current.birthTimeUnknown = true;
    push({ kind: 'user', text: 'I don’t know my birth time' });
    setBusy(true);
    await pushBot('No problem — I’ll read the sky for noon that day. Casting your chart now…', 500);
    setBusy(false);
    runCasting({ ...formRef.current });
  };

  const submitGateEmail = async () => {
    const email = emailValue.trim();
    if (!email || busy) return;
    setBusy(true);
    try {
      const data = await attachTrialEmail(session, email, false);
      if (data?.trial) setTrialState((prev) => ({ ...prev, ...data.trial }));
      setFeed((prev) => prev.filter((item) => item.kind !== 'gate'));
      await pushBot('Saved — go ahead, ask away.', 300);
      setStep(STEP.QUESTIONS);
    } catch (error) {
      push({ kind: 'bot', text: error?.message || 'That email didn’t take — try again.' });
    } finally {
      setBusy(false);
    }
  };

  const questionsLeft = trialState
    ? Math.max(0, (trialState.questionCap ?? 3) - (trialState.questionsUsed ?? 0))
    : null;

  const renderInput = () => {
    if (step === STEP.CASTING) {
      return <div className="gic-casting" aria-live="polite">{CASTING_LINES[castingLine]}</div>;
    }
    if (step === STEP.GATED) {
      return null; // the gate bubble carries its own input
    }
    if (step === STEP.DONE) {
      return (
        <div className="gic-done-bar">
          <Link className="gic-btn" to="/signUp">Create free account ✳</Link>
        </div>
      );
    }
    if (step === STEP.DATE) {
      return (
        <div className="gic-bar">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            aria-label="Your birth date"
          />
          <button className="gic-btn" type="button" disabled={!dateValue || busy} onClick={() => submitAnswer()}>
            Send ✳
          </button>
        </div>
      );
    }
    if (step === STEP.PLACE) {
      return (
        <div className="gic-bar gic-bar--place">
          <GooglePlaceAutocomplete onPlaceSelected={handlePlaceSelected} placeholder="City, country" />
        </div>
      );
    }
    if (step === STEP.TIME) {
      return (
        <div className="gic-time">
          <div className="gic-bar">
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              aria-label="Your birth time"
            />
            <button className="gic-btn" type="button" disabled={!timeValue || busy} onClick={() => submitAnswer()}>
              Send ✳
            </button>
          </div>
          <button className="gic-chip" type="button" disabled={busy} onClick={handleUnknownTime}>
            I don’t know my birth time
          </button>
        </div>
      );
    }
    // NAME + QUESTIONS: free text
    return (
      <div className="gic-bar">
        <input
          type="text"
          value={textValue}
          placeholder={step === STEP.NAME ? 'Your name…' : 'Tell Gravity…'}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); } }}
          disabled={busy}
          aria-label={step === STEP.NAME ? 'Your name' : 'Ask about your chart'}
        />
        <button className="gic-btn" type="button" disabled={busy || !textValue.trim()} onClick={() => submitAnswer()}>
          Send ✳
        </button>
      </div>
    );
  };

  return (
    <div className="gic" aria-label="Gravity Chat">
      <div className="gic-head">
        <span className="gic-title">Gravity Chat ✳</span>
        {questionsLeft !== null && step !== STEP.CASTING && (
          <span className="gic-quota">
            {questionsLeft === 0 ? 'no free questions left' : `${questionsLeft} free question${questionsLeft === 1 ? '' : 's'} left`}
          </span>
        )}
      </div>

      <div className="gic-feed" ref={feedRef}>
        {feed.map((item) => {
          if (item.kind === 'bot') return <div className="gic-bubble gic-bubble--bot" key={item.key}>{item.text}</div>;
          if (item.kind === 'user') return <div className="gic-bubble gic-bubble--user" key={item.key}>{item.text}</div>;
          if (item.kind === 'answer') {
            return (
              <div className="gic-bubble gic-bubble--bot gic-bubble--answer" key={item.key}>
                {item.text}
                <span className="gic-sig">— Astral Gravity ✳</span>
              </div>
            );
          }
          if (item.kind === 'result') {
            const b3 = [
              { role: 'Sun', d: item.bigThree?.sun, lines: SUN_LINES },
              { role: 'Moon', d: item.bigThree?.moon, lines: MOON_LINES },
              { role: 'Rising', d: item.bigThree?.rising, lines: RISING_LINES },
            ].filter((x) => x.d?.sign);
            return (
              <div className="gic-result" key={item.key}>
                {b3.length > 0 && (
                  <div className="gic-b3">
                    {b3.map(({ role, d, lines }) => (
                      <div className="gic-b3-card" key={role}>
                        <span className="gic-b3-role">{role}</span>
                        <span className="gic-b3-pl">
                          <span className="gic-b3-gl">{SIGN_GLYPHS[d.sign] || '✳'}</span>
                          {d.sign}{d.house ? `, ${ordinal(d.house)}` : ''}
                        </span>
                        {lines[d.sign] && <p className="gic-b3-line">{lines[d.sign]}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="gic-reading">{item.head}</p>
                {item.tail && (
                  <div className="gic-locked">
                    <p className="gic-locked-text" aria-hidden="true">{item.tail}</p>
                    <div className="gic-locked-over">
                      <Link className="gic-btn" to="/signUp">Unlock the full reading ✳</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          if (item.kind === 'gate') {
            return (
              <div className="gic-bubble gic-bubble--bot gic-gate" key={item.key}>
                <p>That first one was on the house. Leave your email and I’ll answer the rest — and send you this reading to keep.</p>
                <div className="gic-gate-row">
                  <input
                    type="email"
                    value={emailValue}
                    placeholder="you@example.com"
                    onChange={(e) => setEmailValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitGateEmail(); } }}
                    aria-label="Your email"
                  />
                  <button className="gic-btn" type="button" disabled={busy} onClick={submitGateEmail}>
                    Keep asking ✳
                  </button>
                </div>
              </div>
            );
          }
          if (item.kind === 'wall') {
            return (
              <div className="gic-bubble gic-bubble--bot gic-wall" key={item.key}>
                <p><strong>That’s your three.</strong> Create a free account and Astral Gravity keeps this chart, remembers the conversation, and opens the full reading.</p>
                <Link className="gic-btn" to="/signUp">Create free account ✳</Link>
              </div>
            );
          }
          return null;
        })}
        {busy && step === STEP.QUESTIONS && (
          <div className="gic-bubble gic-bubble--bot gic-typing">Reading your chart…</div>
        )}
      </div>

      {renderInput()}
    </div>
  );
};

export default GravityIntakeChat;
