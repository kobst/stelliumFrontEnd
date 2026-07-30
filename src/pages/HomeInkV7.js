import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GooglePlaceAutocomplete from '../UI/shared/GooglePlaceAutocomplete';
import { fetchTimeZone } from '../Utilities/api';
import { beginTrialReading, loadTrialSession } from '../Utilities/trialApi';
import './HomeInkV7.css';

const ASSET = (name) => `${process.env.PUBLIC_URL || ''}/assets/ink/${name}`;

const HomeInkV7 = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [formError, setFormError] = useState('');
  const [askDraft, setAskDraft] = useState('');
  const [savedReading] = useState(() => loadTrialSession());

  const handlePlaceSelected = ({ formattedAddress, lat: placeLat, lon: placeLon }) => {
    if (placeLat == null || placeLon == null) return;
    setPlaceOfBirth(formattedAddress);
    setLat(placeLat);
    setLon(placeLon);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    if (!name.trim()) return setFormError('Your name, please — it makes the reading yours.');
    if (!date) return setFormError('Your birth date is required.');
    if (!unknownTime && !time) return setFormError('Add your birth time, or switch to “Unknown”.');
    if (lat == null || lon == null) return setFormError('Pick your birth place from the suggestions.');

    // Kick off the whole pipeline without awaiting and hand the wait to the
    // reading page, which owns the loading experience.
    beginTrialReading(
      {
        firstName: name.trim().split(/\s+/)[0],
        lastName: name.trim().split(/\s+/).slice(1).join(' '),
        dateOfBirth: date,
        time,
        birthTimeUnknown: unknownTime,
        placeOfBirth,
        lat,
        lon,
      },
      { fetchTimeZone }
    );
    navigate('/free-reading');
  };

  // The marketing ask-bar has no chart yet: stash the question and take them to the form
  const handleMarketingAsk = (event) => {
    event.preventDefault();
    if (askDraft.trim()) {
      try { window.localStorage.setItem('stellium_trial_pending_question', askDraft.trim()); } catch (e) { /* ignore */ }
    }
    document.getElementById('bfName')?.focus();
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hv7">
      <nav className="hv7-nav">
        <div className="hv7-nav-inner">
          <Link className="hv7-wordmark" to="/">Astral Gravity <span className="hv7-mark">✳</span></Link>
          <a className="hv7-navlink" href="#how">How it works</a>
          <a className="hv7-navlink" href="#ways">Features</a>
          <a className="hv7-navlink" href="#examples">Examples</a>
          <a className="hv7-navlink" href="#pricing">Pricing</a>
          <Link className="hv7-btn hv7-btn--navy hv7-nav-btn" to="/signUp">Get started</Link>
        </div>
      </nav>

      <header className="hv7-hero hv7-wrap" id="how">
        <div className="hv7-hero-grid">
          <div>
            <span className="hv7-eyebrow">AI astrology, made personal</span>
            <h1>The stars,<br />read <span className="hv7-it">just for you.</span></h1>
            <p className="hv7-lede">
              Astral Gravity reads your actual birth chart — not your sun sign — for guidance that genuinely knows you.
            </p>

            {savedReading?.overview && (
              <div className="hv7-saved-reading">
                <span>
                  Welcome back{savedReading.firstName ? `, ${savedReading.firstName}` : ''} — your reading is saved.
                </span>
                <Link className="hv7-btn hv7-btn--navy hv7-saved-reading__btn" to="/free-reading">
                  Continue reading ✳
                </Link>
              </div>
            )}

            <form className="hv7-bform" onSubmit={handleSubmit}>
              <div className="hv7-bf-row hv7-bf-row--one">
                <div className="hv7-fld">
                  <label htmlFor="bfName">Your name</label>
                  <input
                    id="bfName"
                    type="text"
                    placeholder="Eva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
              </div>
              <div className="hv7-bf-row hv7-bf-row--one">
                <div className="hv7-fld">
                  <label htmlFor="bfDate">Date of birth</label>
                  <input id="bfDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div className="hv7-bf-row hv7-bf-row--one">
                <div className="hv7-fld">
                  <label htmlFor="bfTimeMode">At this time</label>
                  <div className="hv7-time-cell">
                    <select
                      id="bfTimeMode"
                      value={unknownTime ? 'unknown' : 'known'}
                      onChange={(e) => {
                        if (e.target.value === 'unknown') {
                          setUnknownTime(true);
                          setTime('');
                        } else {
                          setUnknownTime(false);
                        }
                      }}
                    >
                      <option value="known">Known Time</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    {!unknownTime && (
                      <input
                        id="bfTime"
                        type="time"
                        aria-label="Time of birth"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="hv7-bf-row hv7-bf-row--one">
                <div className="hv7-fld">
                  <label htmlFor="bfPlace">Place of birth</label>
                  <GooglePlaceAutocomplete onPlaceSelected={handlePlaceSelected} placeholder="Lisbon, Portugal" />
                </div>
              </div>
              {formError && <p className="hv7-form-error" role="alert">{formError}</p>}
              <button className="hv7-btn hv7-btn--navy" type="submit">
                Read my chart free ✳
              </button>
            </form>
            <p className="hv7-micro">Free overview &nbsp;·&nbsp; <b>3 Gravity Chat questions</b> &nbsp;·&nbsp; no card, no account</p>
          </div>
          <div className="hv7-hero-art">
            <img src={ASSET('hero-moon-mountain.png')} alt="An ink-etched crescent moon over a hatched mountain range, scattered with stars" />
            <div className="hv7-note hv7-note-hero">
              You are not too much. The stars knew exactly what they were doing.
              <span className="hv7-heart">♡</span>
            </div>
          </div>
        </div>
      </header>

      <section className="hv7-ask">
        <div className="hv7-wrap">
          <div className="hv7-ask-grid">
            <div>
              <span className="hv7-eyebrow">Ask it anything</span>
              <h2>Your chart’s been read.<br />Now <span className="hv7-it">ask away.</span></h2>
            </div>
            <div>
              <div className="hv7-note hv7-note-q">Why do I keep dating the same person in different fonts?</div>
              <p className="hv7-ask-answer">
                Your Venus in Scorpio conjunct your South Node. You’re not choosing them — you’re remembering them.
              </p>
              <p className="hv7-ask-sig">— Astral Gravity ✳</p>
            </div>
          </div>
          <form className="hv7-ask-bar" onSubmit={handleMarketingAsk}>
            <div className="hv7-ask-bar-inner">
              <input
                type="text"
                placeholder="Ask about your chart..."
                aria-label="Ask about your chart"
                value={askDraft}
                onChange={(e) => setAskDraft(e.target.value)}
              />
              <button className="hv7-btn hv7-btn--navy" type="submit">Gravity Chat ✳</button>
            </div>
          </form>
        </div>
      </section>

      <section className="hv7-ways hv7-wrap" id="ways">
        <span className="hv7-eyebrow hv7-eyebrow--center">One sky, three ways to read it</span>
        <div className="hv7-ways-grid">
          <div className="hv7-way">
            <img src={ASSET('ill-wheel.png')} alt="A hand-drawn zodiac wheel with sign glyphs" />
            <h3>Your chart, in full</h3>
            <p>Every placement and pattern, read in plain language.</p>
          </div>
          <div className="hv7-way">
            <img src={ASSET('ill-venn.png')} alt="Two overlapping ink circles with a star where they meet" />
            <h3>You + them</h3>
            <p>How two charts move together.</p>
          </div>
          <div className="hv7-way">
            <img src={ASSET('ill-road.png')} alt="An ink road winding through hills beneath a crescent moon" />
            <h3>What’s ahead</h3>
            <p>Guidance timed to your actual sky.</p>
          </div>
        </div>
      </section>

      <section className="hv7-famous" id="examples">
        <div className="hv7-wrap">
          <div className="hv7-sect-head">
            <span className="hv7-eyebrow">She reads famous people too</span>
            <h2>Their charts explain a lot, <span className="hv7-it">honestly.</span></h2>
          </div>
          <div className="hv7-celebs">
            <Link className="hv7-celeb" to="/celebrities">
              <img src={ASSET('celeb-1.png')} alt="Ink portrait of Margaret Qualley" />
              <span className="hv7-cinfo"><span className="hv7-nm">Margaret Qualley <span className="hv7-spk">✳</span></span><span className="hv7-sig">Scorpio Sun · Gemini Moon</span></span>
            </Link>
            <Link className="hv7-celeb" to="/celebrities">
              <img src={ASSET('celeb-2.png')} alt="Ink portrait of Post Malone" />
              <span className="hv7-cinfo"><span className="hv7-nm">Post Malone <span className="hv7-spk">✳</span></span><span className="hv7-sig">Cancer Sun · Virgo Moon</span></span>
            </Link>
            <Link className="hv7-celeb" to="/celebrities">
              <img src={ASSET('celeb-3.png')} alt="Ink portrait of Oprah Winfrey" />
              <span className="hv7-cinfo"><span className="hv7-nm">Oprah Winfrey <span className="hv7-spk">✳</span></span><span className="hv7-sig">Aquarius Sun · Sagittarius Moon</span></span>
            </Link>
            <Link className="hv7-celeb" to="/celebrities">
              <img src={ASSET('celeb-4.png')} alt="Ink portrait of Paul Mescal" />
              <span className="hv7-cinfo"><span className="hv7-nm">Paul Mescal <span className="hv7-spk">✳</span></span><span className="hv7-sig">Aquarius Sun · Cancer Moon</span></span>
            </Link>
          </div>

          <div className="hv7-sect-head hv7-sect-head--couples">
            <span className="hv7-eyebrow"><span className="hv7-hl">Cosmic</span> chemistry between famous couples</span>
            <h2>Some connections <span className="hv7-it">just make sense.</span></h2>
          </div>
          <div className="hv7-couples">
            <Link className="hv7-couple" to="/celebrity-relationships">
              <img src={ASSET('couple-1.png')} alt="Ink portrait of A$AP Rocky and Rihanna" />
              <span className="hv7-cinfo"><span className="hv7-nm">A$AP Rocky &amp; Rihanna</span><span className="hv7-tag">Quiet Connection</span></span>
            </Link>
            <Link className="hv7-couple" to="/celebrity-relationships">
              <img src={ASSET('couple-2.png')} alt="Ink portrait of Zendaya and Tom Holland" />
              <span className="hv7-cinfo"><span className="hv7-nm">Zendaya &amp; Tom Holland</span><span className="hv7-tag">Developing Connection</span></span>
            </Link>
            <Link className="hv7-couple" to="/celebrity-relationships">
              <img src={ASSET('couple-3.png')} alt="Ink portrait of David and Victoria Beckham" />
              <span className="hv7-cinfo"><span className="hv7-nm">David Beckham &amp; Victoria Beckham</span><span className="hv7-tag">Iron &amp; Honey</span></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="hv7-pricing hv7-wrap" id="pricing">
        <div className="hv7-sect-head">
          <span className="hv7-eyebrow">Choose your plan</span>
          <h2>Choose how deep you want to <span className="hv7-it">go.</span></h2>
          <p className="hv7-plans-lede">
            Plus includes everyday guidance and three full reports each billing period. Credit packs cover extra reports and never expire.
          </p>
        </div>
        <div className="hv7-plans">
          <div className="hv7-plan">
            <h3>Free</h3>
            <p className="hv7-pd">Explore your chart and sample features.</p>
            <div className="hv7-price">$0 <span className="hv7-per">/ forever</span></div>
            <ul>
              <li><span>Weekly &amp; monthly horoscopes included</span></li>
              <li><span>Daily horoscopes available for 1 credit</span></li>
              <li><span>Unlimited chart &amp; relationship creation</span></li>
              <li><span><span className="hv7-gold">25 welcome credits</span> on signup</span></li>
              <li><span>Buy more credits anytime</span></li>
            </ul>
            <Link className="hv7-btn hv7-btn--ghost" to="/signUp">Get started free</Link>
          </div>
          <div className="hv7-plan hv7-plan--pop">
            <span className="hv7-flag">Most popular</span>
            <h3>Plus</h3>
            <p className="hv7-pd">Everyday guidance plus three full reports per billing period.</p>
            <div className="hv7-price">$20 <span className="hv7-per">/ month</span></div>
            <ul>
              <li><span><b>Everything in Free, plus —</b></span></li>
              <li><span><span className="hv7-gold">3 full reports</span> per billing period (natal or relationship)</span></li>
              <li><span>Gravity Chat included — up to 50 / day</span></li>
              <li><span>Daily horoscopes tuned to your chart</span></li>
              <li><span>Extra reports with credits after your quota</span></li>
            </ul>
            <div>
              <Link className="hv7-btn hv7-btn--navy" to="/signUp">Start Plus ✳</Link>
              <p className="hv7-fine">Cancel anytime.</p>
            </div>
          </div>
          <div className="hv7-plan">
            <h3>Credit Pack</h3>
            <p className="hv7-pd">One-time credits. No subscription.</p>
            <div className="hv7-packs">
              <div className="hv7-pack"><span className="hv7-pp">$10</span><span className="hv7-pc">100 credits</span></div>
              <div className="hv7-pack hv7-pack--best"><span className="hv7-pp">$20</span><span className="hv7-pc">250 credits</span><span className="hv7-bv">Best value</span></div>
            </div>
            <ul>
              <li><span>Credits <span className="hv7-gold">never expire</span></span></li>
              <li><span>Buy extra reports or any credit action</span></li>
              <li><span>Stack with Free or Plus</span></li>
            </ul>
            <Link className="hv7-btn hv7-btn--ghost" to="/signUp">Buy credits</Link>
          </div>
        </div>
        <div className="hv7-compare">
          <h3>What’s <span className="hv7-it">in</span> each plan</h3>
          <table>
            <thead><tr><th>&nbsp;</th><th>Free</th><th className="hv7-th-plus">Plus</th><th>Credit cost</th></tr></thead>
            <tbody>
              <tr><td>Daily horoscope</td><td>1 credit / day</td><td><span className="hv7-yes">✓</span></td><td><span className="hv7-cr">1</span></td></tr>
              <tr><td>Weekly horoscope</td><td><span className="hv7-yes">✓</span></td><td><span className="hv7-yes">✓</span></td><td>—</td></tr>
              <tr><td>Monthly horoscope</td><td><span className="hv7-yes">✓</span></td><td><span className="hv7-yes">✓</span></td><td>—</td></tr>
              <tr><td>Guest chart + short overview</td><td>Uses credits</td><td>Included</td><td><span className="hv7-cr">1</span></td></tr>
              <tr><td>Relationship overview + pattern</td><td>Uses credits</td><td>Included</td><td><span className="hv7-cr">5</span></td></tr>
              <tr><td>Gravity Chat</td><td>1 credit each</td><td>50 / day</td><td><span className="hv7-cr">1</span></td></tr>
              <tr><td>Natal report</td><td>Uses credits</td><td>Uses 3-report pool</td><td><span className="hv7-cr">75</span></td></tr>
              <tr><td>Relationship report</td><td>Uses credits</td><td>Uses same pool</td><td><span className="hv7-cr">60</span></td></tr>
              <tr><td>Welcome credits</td><td><span className="hv7-cr">25</span></td><td>—</td><td>—</td></tr>
            </tbody>
          </table>
          <p className="hv7-fine hv7-fine--center">
            Plus reports are one pooled quota across natal and relationship. Unused reports don’t carry over — purchased credits do.
          </p>
        </div>
      </section>

      <section className="hv7-closing">
        <div className="hv7-wrap">
          <span className="hv7-eyebrow hv7-eyebrow--faint">Ready when you are</span>
          <h2>Your first reading <span className="hv7-it">is waiting.</span></h2>
          <p>60 seconds of birth data. A lifetime of context for everything that follows.</p>
          <a className="hv7-btn hv7-btn--navy" href="#how">Get started ✳</a>
        </div>
      </section>

      <section className="hv7-foot-band hv7-wrap">
        <div className="hv7-foot-grid">
          <div className="hv7-fitem"><span className="hv7-ic">☀</span><span><b>Made for real life</b><span>Practical guidance you can actually use.</span></span></div>
          <div className="hv7-fitem"><span className="hv7-ic">◍</span><span><b>Your data is yours</b><span>Private, secure, never shared.</span></span></div>
          <div className="hv7-fitem"><span className="hv7-ic">⊘</span><span><b>Cancel anytime</b><span>She won’t take it personally.</span></span></div>
          <div className="hv7-fitem"><span className="hv7-ic">♡</span><span><b>Created with care</b><span>By astrologers, designers, and engineers who get it.</span></span></div>
        </div>
      </section>

      <footer className="hv7-colophon">
        <div className="hv7-wrap hv7-colo-inner">
          <span className="hv7-wm">Astral Gravity ✳</span>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeInkV7;
