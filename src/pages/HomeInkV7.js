import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GravityIntakeChat from '../UI/gravity/GravityIntakeChat';
import InkWheel from '../UI/gravity/InkWheel';
import { loadTrialSession } from '../Utilities/trialApi';
import { buildMastNote } from '../Utilities/signCopy';
import { fetchCelebrities, getCelebrityRelationships } from '../Utilities/api';
import './HomeInkV7.css';

const ASSET = (name) => `${process.env.PUBLIC_URL || ''}/assets/ink/${name}`;

// Real charts from the celebrity directory, featured by name when available
const FEATURED_CELEB_NAMES = ['Taylor Swift', 'Timothée Chalamet', 'Zendaya Coleman', 'Bad Bunny'];

const celebFullName = (c) => `${c?.firstName || ''} ${c?.lastName || ''}`.trim();
const celebPhoto = (c) => c?.profilePhotoUrl || c?.photoUrl || null;
const celebSign = (c, planet) =>
  (c?.birthChart?.planets || []).find((p) => p?.name === planet)?.sign || null;

const pickFeaturedCelebs = (list) => {
  const withPhotos = list.filter(celebPhoto);
  const preferred = FEATURED_CELEB_NAMES
    .map((name) => withPhotos.find((c) => celebFullName(c) === name))
    .filter(Boolean);
  const rest = withPhotos.filter((c) => !preferred.includes(c));
  return [...preferred, ...rest].slice(0, 4);
};

// Real celebrity relationships, featured by couple when available
const FEATURED_COUPLE_NAMES = [
  'Zendaya Coleman & Tom Holland',
  'David Beckham & Victoria Beckham',
  'Jay Z & Beyoncé Knowles',
];

const coupleUserName = (rel, prefix) =>
  `${rel?.[`${prefix}_firstName`] || ''} ${rel?.[`${prefix}_lastName`] || ''}`.trim();
const coupleTitle = (rel) => `${coupleUserName(rel, 'userA')} & ${coupleUserName(rel, 'userB')}`;

const pickFeaturedCouples = (relationships, celebrities) => {
  const photoById = {};
  celebrities.forEach((c) => {
    if (c?._id && celebPhoto(c)) photoById[c._id] = celebPhoto(c);
  });
  const withPhotos = relationships
    .map((rel) => ({
      ...rel,
      userA_profilePhotoUrl: rel.userA_profilePhotoUrl || photoById[rel.userA_id] || null,
      userB_profilePhotoUrl: rel.userB_profilePhotoUrl || photoById[rel.userB_id] || null,
    }))
    .filter((rel) => rel.userA_profilePhotoUrl && rel.userB_profilePhotoUrl);
  const preferred = FEATURED_COUPLE_NAMES
    .map((title) => withPhotos.find((rel) => coupleTitle(rel) === title))
    .filter(Boolean);
  const rest = withPhotos.filter((rel) => !preferred.includes(rel));
  return [...preferred, ...rest].slice(0, 3);
};

const HomeInkV7 = () => {
  const [askDraft, setAskDraft] = useState('');
  const [savedReading] = useState(() => loadTrialSession());
  const [castReading, setCastReading] = useState(null);
  const [featuredCelebs, setFeaturedCelebs] = useState([]);
  const [featuredCouples, setFeaturedCouples] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([fetchCelebrities(), getCelebrityRelationships(20)])
      .then(([celebResult, coupleResult]) => {
        if (!active) return;
        const celebData = celebResult.status === 'fulfilled' ? celebResult.value : [];
        const celebs = Array.isArray(celebData) ? celebData : celebData?.data || [];
        if (celebs.length) setFeaturedCelebs(pickFeaturedCelebs(celebs));
        const coupleData = coupleResult.status === 'fulfilled' ? coupleResult.value : [];
        const couples = Array.isArray(coupleData) ? coupleData : coupleData?.relationships || coupleData?.data || [];
        if (couples.length) setFeaturedCouples(pickFeaturedCouples(couples, celebs));
      });
    return () => { active = false; };
  }, []);
  const { stelliumUser } = useAuth();

  // the wheel replaces the hero art once a chart exists (fresh cast or
  // saved) — but a stale anonymous-trial chart never renders for a
  // signed-in account
  const wheelReading = stelliumUser?._id
    ? null
    : castReading || (savedReading?.bigThree ? savedReading : null);

  // The marketing ask-bar has no chart yet: stash the question and take them to the form
  const handleMarketingAsk = (event) => {
    event.preventDefault();
    if (askDraft.trim()) {
      try { window.localStorage.setItem('stellium_trial_pending_question', askDraft.trim()); } catch (e) { /* ignore */ }
    }
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
          {stelliumUser?._id ? (
            <Link className="hv7-btn hv7-btn--navy hv7-nav-btn" to={`/dashboard/${stelliumUser._id}`}>
              Open dashboard ✳
            </Link>
          ) : (
            <Link className="hv7-btn hv7-btn--navy hv7-nav-btn" to="/signUp">Get started</Link>
          )}
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

            {/* A signed-in user's reading is their dashboard — never pitch
                the anonymous trial (or a stale trial session) at them */}
            {stelliumUser?._id ? (
              <div className="hv7-saved-reading">
                <span>
                  Welcome back{stelliumUser.firstName ? `, ${stelliumUser.firstName}` : ''} — your chart is ready.
                </span>
                <Link className="hv7-btn hv7-btn--navy hv7-saved-reading__btn" to={`/dashboard/${stelliumUser._id}`}>
                  Open dashboard ✳
                </Link>
              </div>
            ) : savedReading?.overview ? (
              <div className="hv7-saved-reading">
                <span>
                  Welcome back{savedReading.firstName ? `, ${savedReading.firstName}` : ''} — your reading is saved.
                </span>
                <Link className="hv7-btn hv7-btn--navy hv7-saved-reading__btn" to="/free-reading">
                  Continue reading ✳
                </Link>
              </div>
            ) : (
              <GravityIntakeChat onReadingReady={setCastReading} />
            )}
            {!stelliumUser?._id && (
              <p className="hv7-micro">Free overview &nbsp;·&nbsp; <b>3 Gravity Chat questions</b> &nbsp;·&nbsp; no card, no account</p>
            )}
          </div>
          <div className="hv7-hero-art">
            {wheelReading ? (
              <>
                <InkWheel chart={wheelReading.chart} instanceId="hero-wheel" />
                <div className="hv7-note hv7-note-hero">{buildMastNote(wheelReading.bigThree)}</div>
              </>
            ) : (
              <>
                <img src={ASSET('hero-moon-mountain.png')} alt="An ink-etched crescent moon over a hatched mountain range, scattered with stars" />
                <div className="hv7-note hv7-note-hero">
                  You are not too much. The stars knew exactly what they were doing.
                  <span className="hv7-heart">♡</span>
                </div>
              </>
            )}
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
            <img src={ASSET('ill-wheel-etched.jpg')} alt="A hand-etched zodiac wheel with the twelve sign glyphs in astronomical order" />
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
            <Link className="hv7-browse-link" to="/celebrities">Browse the rest of the celebrities ↗</Link>
          </div>
          <div className="hv7-celebs">
            {featuredCelebs.length > 0
              ? featuredCelebs.map((celeb) => {
                  const name = celebFullName(celeb);
                  const sun = celebSign(celeb, 'Sun');
                  const moon = celebSign(celeb, 'Moon');
                  const signLine = [sun && `${sun} Sun`, moon && `${moon} Moon`].filter(Boolean).join(' · ');
                  return (
                    <Link className="hv7-celeb" key={celeb._id} to={`/celebrities/${celeb._id}`}>
                      <img src={celebPhoto(celeb)} alt={`Portrait of ${name}`} loading="lazy" decoding="async" />
                      <span className="hv7-cinfo">
                        <span className="hv7-nm">{name} <span className="hv7-spk">✳</span></span>
                        {signLine && <span className="hv7-sig">{signLine}</span>}
                      </span>
                    </Link>
                  );
                })
              : [0, 1, 2, 3].map((i) => (
                  <div className="hv7-celeb hv7-celeb--ghost" key={i} aria-hidden="true">
                    <span className="hv7-celeb-ghost-img" />
                    <span className="hv7-cinfo">
                      <span className="hv7-nm">&nbsp;</span>
                      <span className="hv7-sig">&nbsp;</span>
                    </span>
                  </div>
                ))}
          </div>

          <div className="hv7-sect-head hv7-sect-head--couples">
            <span className="hv7-eyebrow"><span className="hv7-hl">Cosmic</span> chemistry between famous couples</span>
            <h2>Some connections <span className="hv7-it">just make sense.</span></h2>
            <Link className="hv7-browse-link" to="/celebrity-relationships">Browse the rest of the couples ↗</Link>
          </div>
          <div className="hv7-couples">
            {featuredCouples.length > 0
              ? featuredCouples.map((rel) => {
                  const nameA = coupleUserName(rel, 'userA');
                  const nameB = coupleUserName(rel, 'userB');
                  return (
                    <Link className="hv7-couple" key={rel._id} to={`/celebrity-relationships/${rel._id}`}>
                      <span className="hv7-couple-duo">
                        <img src={rel.userA_profilePhotoUrl} alt={`Portrait of ${nameA}`} loading="lazy" decoding="async" />
                        <img src={rel.userB_profilePhotoUrl} alt={`Portrait of ${nameB}`} loading="lazy" decoding="async" />
                      </span>
                      <span className="hv7-cinfo">
                        <span className="hv7-nm">{nameA} &amp; {nameB}</span>
                        {rel.archetypeLabel && <span className="hv7-tag">{rel.archetypeLabel}</span>}
                      </span>
                    </Link>
                  );
                })
              : [0, 1, 2].map((i) => (
                  <div className="hv7-couple hv7-couple--ghost" key={i} aria-hidden="true">
                    <span className="hv7-couple-ghost-img" />
                    <span className="hv7-cinfo">
                      <span className="hv7-nm">&nbsp;</span>
                      <span className="hv7-tag">&nbsp;</span>
                    </span>
                  </div>
                ))}
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
