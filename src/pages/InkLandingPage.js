import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InkNav from '../UI/ink/InkNav';
import { ChartScene } from '../UI/shared/chartScene';
import {
  fetchCelebrities,
  fetchRelationshipAnalysis,
  getCelebrityRelationships,
} from '../Utilities/api';
import {
  toChartSceneAspects,
  toChartScenePlacements,
} from '../Utilities/chartSceneAdapter';
import { getRelationshipCardSummary } from '../Utilities/relationshipSummary';
import '../styles/ink.css';
import './InkLandingPage.css';

const SAMPLE_PLANETS = [
  { name: 'Sun', full_degree: 135.4, is_retro: 'false' },
  { name: 'Moon', full_degree: 213.2, is_retro: 'false' },
  { name: 'Mercury', full_degree: 152.8, is_retro: 'false' },
  { name: 'Venus', full_degree: 118.1, is_retro: 'false' },
  { name: 'Mars', full_degree: 9.5, is_retro: 'false' },
  { name: 'Jupiter', full_degree: 261.7, is_retro: 'false' },
  { name: 'Saturn', full_degree: 287.3, is_retro: 'true' },
  { name: 'Uranus', full_degree: 304.9, is_retro: 'false' },
  { name: 'Neptune', full_degree: 296.2, is_retro: 'true' },
  { name: 'Pluto', full_degree: 239.6, is_retro: 'false' },
  { name: 'Ascendant', full_degree: 192, is_retro: 'false' },
  { name: 'Midheaven', full_degree: 104, is_retro: 'false' },
];

const SAMPLE_ASPECTS = [
  { aspectingPlanet: 'Sun', aspectedPlanet: 'Mars', aspectType: 'trine', orb: 5.9 },
  { aspectingPlanet: 'Sun', aspectedPlanet: 'Jupiter', aspectType: 'trine', orb: 6.3 },
  { aspectingPlanet: 'Moon', aspectedPlanet: 'Venus', aspectType: 'square', orb: 4.9 },
  { aspectingPlanet: 'Moon', aspectedPlanet: 'Uranus', aspectType: 'square', orb: 1.7 },
  { aspectingPlanet: 'Mercury', aspectedPlanet: 'Saturn', aspectType: 'trine', orb: 1.5 },
  { aspectingPlanet: 'Venus', aspectedPlanet: 'Pluto', aspectType: 'trine', orb: 1.5 },
  { aspectingPlanet: 'Jupiter', aspectedPlanet: 'Pluto', aspectType: 'sextile', orb: 2.1 },
  { aspectingPlanet: 'Mars', aspectedPlanet: 'Neptune', aspectType: 'square', orb: 3.3 },
];

const SAMPLE_NATAL = toChartScenePlacements(SAMPLE_PLANETS);
const SAMPLE_NATAL_ASPECTS = toChartSceneAspects(SAMPLE_ASPECTS);

const FALLBACK_CELEBRITIES = [
  {
    _id: 'fallback-margaret-qualley',
    firstName: 'Margaret',
    lastName: 'Qualley',
    profilePhotoUrl: '/assets/ink/celeb-1.png',
    sunSign: 'Scorpio',
    moonSign: 'Gemini',
  },
  {
    _id: 'fallback-post-malone',
    firstName: 'Post',
    lastName: 'Malone',
    profilePhotoUrl: '/assets/ink/celeb-2.png',
    sunSign: 'Cancer',
    moonSign: 'Virgo',
  },
  {
    _id: 'fallback-oprah-winfrey',
    firstName: 'Oprah',
    lastName: 'Winfrey',
    profilePhotoUrl: '/assets/ink/celeb-3.png',
    sunSign: 'Aquarius',
    moonSign: 'Sagittarius',
  },
  {
    _id: 'fallback-paul-mescal',
    firstName: 'Paul',
    lastName: 'Mescal',
    profilePhotoUrl: '/assets/ink/celeb-4.png',
    sunSign: 'Aquarius',
    moonSign: 'Cancer',
  },
];

const FALLBACK_RELATIONSHIPS = [
  {
    _id: 'fallback-rocky-rihanna',
    userA_name: 'A$AP Rocky',
    userB_name: 'Rihanna',
    imageUrl: '/assets/ink/couple-1.png',
    archetypeLabel: 'Quiet Connection',
  },
  {
    _id: 'fallback-zendaya-holland',
    userA_name: 'Zendaya',
    userB_name: 'Tom Holland',
    imageUrl: '/assets/ink/couple-2.png',
    archetypeLabel: 'Developing Connection',
  },
  {
    _id: 'fallback-beckhams',
    userA_name: 'David Beckham',
    userB_name: 'Victoria Beckham',
    imageUrl: '/assets/ink/couple-3.png',
    archetypeLabel: 'Iron & Honey',
  },
];

const WAYS = [
  {
    image: '/assets/ink/ill-wheel.png',
    alt: 'A hand-drawn zodiac wheel with sign glyphs',
    title: 'Your chart, in full',
    copy: 'Every placement and pattern, read in plain language.',
  },
  {
    image: '/assets/ink/ill-venn.png',
    alt: 'Two overlapping ink circles with a star where they meet',
    title: 'You + them',
    copy: 'How two charts move together.',
  },
  {
    image: '/assets/ink/ill-road.png',
    alt: 'An ink road winding through hills beneath a crescent moon',
    title: 'What’s ahead',
    copy: 'Guidance timed to your actual sky.',
  },
];

const ASSURANCES = [
  { icon: '☀', title: 'Made for real life', copy: 'Practical guidance you can actually use.' },
  { icon: '◍', title: 'Your data is yours', copy: 'Private, secure, never shared.' },
  { icon: '⊘', title: 'Cancel anytime', copy: 'She won’t take it personally.' },
  {
    icon: '♡',
    title: 'Created with care',
    copy: 'By astrologers, designers, and engineers who get it.',
  },
];

function getFullName(person) {
  return `${person?.firstName || ''} ${person?.lastName || ''}`.trim()
    || person?.name
    || 'Untitled chart';
}

function getInitials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

function getPhoto(person) {
  return person?.profilePhotoUrl || person?.photoUrl || null;
}

function normalizeSignLabel(sign) {
  if (!sign) return null;
  const value = String(sign).trim();
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : null;
}

function getPlanetSign(person, bodyName) {
  const planets = person?.birthChart?.planets || person?.planets;
  if (!Array.isArray(planets)) return null;
  const planet = planets.find(
    (item) => String(item?.name || '').toLowerCase() === bodyName.toLowerCase()
  );
  return normalizeSignLabel(planet?.sign);
}

function getCelebritySignature(person) {
  const sun = normalizeSignLabel(person?.sunSign) || getPlanetSign(person, 'Sun');
  const moon = normalizeSignLabel(person?.moonSign) || getPlanetSign(person, 'Moon');
  if (sun && moon) return `${sun} Sun · ${moon} Moon`;
  if (sun) return `${sun} Sun`;
  if (moon) return `${moon} Moon`;
  return 'Birth chart details coming soon';
}

function getRelationshipName(relationship, prefix) {
  const first = relationship?.[`${prefix}_firstName`];
  const last = relationship?.[`${prefix}_lastName`];
  if (first || last) return `${first || ''} ${last || ''}`.trim();
  return relationship?.[`${prefix}_name`] || 'Unknown';
}

function getRelationshipPhoto(relationship, prefix) {
  return relationship?.[`${prefix}_profilePhotoUrl`]
    || relationship?.[`${prefix}_photoUrl`]
    || null;
}

function getRelationshipArchetype(relationship) {
  if (relationship?.archetypeLabel) return relationship.archetypeLabel;
  if (typeof relationship?.archetype === 'string') return relationship.archetype;

  const overall = relationship?.relationshipAnalysisStatus?.clusterScoring?.overall
    || relationship?.clusterScoring?.overall
    || relationship?.clusterAnalysis?.overall
    || null;
  const summary = getRelationshipCardSummary(overall);
  return summary.cardHeadline || 'Cosmic Connection';
}

function chooseFeaturedCelebrities(records) {
  const valid = Array.isArray(records) ? records.filter(Boolean) : [];
  const flagged = valid.filter((record) => record.featured || record.isFeatured);
  return (flagged.length >= 4 ? flagged : valid).slice(0, 4);
}

function PersonPortrait({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        className={className}
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`ink-landing__initials ${className}`.trim()} aria-label={name}>
      {getInitials(name)}
    </span>
  );
}

function CelebrityCard({ celebrity }) {
  const name = getFullName(celebrity);
  return (
    <Link className="ink-card ink-landing__celeb" to="/celebrities">
      <div className="ink-landing__celeb-portrait">
        <PersonPortrait src={getPhoto(celebrity)} name={name} />
      </div>
      <span className="ink-landing__card-info">
        <span className="ink-landing__card-name">
          {name} <span aria-hidden="true">✳</span>
        </span>
        <span className="ink-landing__signature">{getCelebritySignature(celebrity)}</span>
      </span>
    </Link>
  );
}

function RelationshipPortrait({ relationship }) {
  const combinedImage = relationship?.imageUrl || relationship?.relationshipPhotoUrl;
  const nameA = getRelationshipName(relationship, 'userA');
  const nameB = getRelationshipName(relationship, 'userB');

  if (combinedImage) {
    return (
      <div className="ink-landing__couple-portrait ink-landing__couple-portrait--single">
        <PersonPortrait src={combinedImage} name={`${nameA} and ${nameB}`} />
      </div>
    );
  }

  return (
    <div className="ink-landing__couple-portrait">
      <PersonPortrait src={getRelationshipPhoto(relationship, 'userA')} name={nameA} />
      <PersonPortrait src={getRelationshipPhoto(relationship, 'userB')} name={nameB} />
    </div>
  );
}

function RelationshipCard({ relationship }) {
  const nameA = getRelationshipName(relationship, 'userA');
  const nameB = getRelationshipName(relationship, 'userB');
  return (
    <Link className="ink-card ink-landing__couple" to="/celebrity-relationships">
      <RelationshipPortrait relationship={relationship} />
      <span className="ink-landing__card-info">
        <span className="ink-landing__card-name">{nameA} &amp; {nameB}</span>
        <span className="ink-landing__archetype">{getRelationshipArchetype(relationship)}</span>
      </span>
    </Link>
  );
}

function LoadingCards({ count, relationship = false }) {
  return Array.from({ length: count }, (_, index) => (
    <div
      className={`ink-card ink-landing__skeleton${relationship ? ' ink-landing__skeleton--couple' : ''}`}
      aria-hidden="true"
      key={index}
    >
      <span className="ink-landing__skeleton-image" />
      <span className="ink-landing__skeleton-copy">
        <span />
        <span />
      </span>
    </div>
  ));
}

function InkLandingPage() {
  const navigate = useNavigate();
  const [celebrities, setCelebrities] = useState(null);
  const [relationships, setRelationships] = useState(null);

  const natal = useMemo(() => SAMPLE_NATAL, []);
  const natalAspects = useMemo(() => SAMPLE_NATAL_ASPECTS, []);

  useEffect(() => {
    let cancelled = false;

    async function loadExamples() {
      const [celebrityResult, relationshipResult] = await Promise.allSettled([
        fetchCelebrities(),
        getCelebrityRelationships(3),
      ]);
      if (cancelled) return;

      const celebrityRecords = celebrityResult.status === 'fulfilled'
        ? chooseFeaturedCelebrities(celebrityResult.value)
        : [];
      setCelebrities(celebrityRecords);

      if (relationshipResult.status !== 'fulfilled' || !relationshipResult.value?.length) {
        setRelationships([]);
        return;
      }

      const photoMap = new Map();
      const sourceCelebrities = celebrityResult.status === 'fulfilled'
        && Array.isArray(celebrityResult.value)
        ? celebrityResult.value
        : [];
      sourceCelebrities.forEach((celebrity) => {
        if (celebrity?._id && getPhoto(celebrity)) {
          photoMap.set(celebrity._id, getPhoto(celebrity));
        }
      });

      const baseRelationships = relationshipResult.value.slice(0, 3).map((relationship) => ({
        ...relationship,
        userA_profilePhotoUrl: getRelationshipPhoto(relationship, 'userA')
          || photoMap.get(relationship.userA_id)
          || null,
        userB_profilePhotoUrl: getRelationshipPhoto(relationship, 'userB')
          || photoMap.get(relationship.userB_id)
          || null,
      }));
      setRelationships(baseRelationships);

      const analysisResults = await Promise.all(
        baseRelationships.map((relationship) => (
          fetchRelationshipAnalysis(relationship._id).catch(() => null)
        ))
      );
      if (cancelled) return;

      setRelationships(baseRelationships.map((relationship, index) => ({
        ...relationship,
        ...(analysisResults[index] || {}),
      })));
    }

    loadExamples();
    return () => { cancelled = true; };
  }, []);

  const displayedCelebrities = celebrities === null
    ? []
    : [...celebrities, ...FALLBACK_CELEBRITIES].slice(0, 4);
  const displayedRelationships = relationships === null
    ? []
    : [...relationships, ...FALLBACK_RELATIONSHIPS].slice(0, 3);

  const handleAskSubmit = (event) => {
    event.preventDefault();
    navigate('/signUp');
  };

  // mock hero illustration when the PNG exists; chart medallion otherwise
  const [heroArtOk, setHeroArtOk] = useState(true);

  return (
    <div className="ink-page ink-landing">
      <InkNav variant="marketing" />

      <main>
        <header className="ink-wrap ink-landing__hero" id="how">
          <div className="ink-landing__hero-grid">
            <div className="ink-landing__hero-copy">
              <span className="ink-eyebrow">AI astrology, made personal</span>
              <h1>
                The stars,<br />read <span className="ink-italic">just for you.</span>
              </h1>
              <p className="ink-landing__lede">
                Astral Gravity reads your actual birth chart — not your sun sign — for guidance that
                genuinely knows you.
              </p>
              <div className="ink-landing__hero-ctas">
                <Link className="ink-btn ink-btn--navy" to="/try">Read my chart free ✳</Link>
                <a className="ink-btn ink-btn--ghost" href="#ways">See how it works</a>
              </div>
              <p className="ink-landing__micro">
                No credit card <span aria-hidden="true">·</span> <b>free chart + 5 questions</b>
              </p>
            </div>

            <div className="ink-landing__hero-art" aria-label="Ink drawing of a crescent moon over mountains">
              {heroArtOk ? (
                <img
                  className="ink-landing__hero-image"
                  src="/assets/ink/hero-moon-mountain.png"
                  alt="Ink drawing of a crescent moon over mountains, stars scattered around"
                  onError={() => setHeroArtOk(false)}
                />
              ) : (
                <div className="ink-landing__medallion">
                  <ChartScene
                    background="#f5eee5"
                    natal={natal}
                    natalAspects={natalAspects}
                    paused={false}
                    topDown
                    disableZoom
                  />
                </div>
              )}
              <div className="ink-note ink-landing__hero-note">
                You are not too much. The stars knew exactly what they were doing.
                <span className="ink-landing__heart" aria-hidden="true">♡</span>
              </div>
            </div>
          </div>
        </header>

        <section className="ink-landing__ask" id="ask">
          <div className="ink-wrap">
            <div className="ink-landing__ask-grid">
              <div>
                <span className="ink-eyebrow">Ask her anything</span>
                <h2>
                  She’s read your chart.<br />Now <span className="ink-italic">ask her</span> about it.
                </h2>
              </div>
              <div>
                <div className="ink-note ink-landing__question-note">
                  Why do I keep dating the same person in different fonts?
                </div>
                <p className="ink-landing__answer">
                  Your Venus in Scorpio conjunct your South Node. You’re not choosing them —
                  you’re remembering them.
                </p>
                <p className="ink-landing__signature-answer">— Astral Gravity ✳</p>
              </div>
            </div>

            <form className="ink-landing__ask-bar" onSubmit={handleAskSubmit}>
              <div className="ink-landing__ask-bar-inner">
                <input
                  type="text"
                  placeholder="Ask about your chart..."
                  aria-label="Ask about your chart"
                />
                <button className="ink-btn ink-btn--navy" type="submit">Gravity Chat ✳</button>
              </div>
            </form>
          </div>
        </section>

        <section className="ink-wrap ink-landing__ways" id="ways">
          <span className="ink-eyebrow">One sky, three ways to read it</span>
          <div className="ink-landing__ways-grid">
            {WAYS.map((way) => (
              <article className="ink-card ink-landing__way" key={way.title}>
                <img src={way.image} alt={way.alt} />
                <h3>{way.title}</h3>
                <p>{way.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ink-landing__famous" id="examples">
          <div className="ink-wrap">
            <div className="ink-sect-head">
              <span className="ink-eyebrow">She reads famous people too</span>
              <h2>Their charts explain a lot, <span className="ink-italic">honestly.</span></h2>
            </div>

            <div className="ink-landing__celebs" aria-live="polite">
              {celebrities === null ? (
                <LoadingCards count={4} />
              ) : (
                displayedCelebrities.map((celebrity) => (
                  <CelebrityCard celebrity={celebrity} key={celebrity._id || getFullName(celebrity)} />
                ))
              )}
            </div>

            <div className="ink-sect-head ink-landing__couples-head">
              <span className="ink-eyebrow">
                <span className="ink-landing__highlight">Cosmic</span> chemistry between famous couples
              </span>
              <h2>Some connections <span className="ink-italic">just make sense.</span></h2>
            </div>
            <div className="ink-landing__couples" aria-live="polite">
              {relationships === null ? (
                <LoadingCards count={3} relationship />
              ) : (
                displayedRelationships.map((relationship) => (
                  <RelationshipCard
                    relationship={relationship}
                    key={relationship._id || `${getRelationshipName(relationship, 'userA')}-${getRelationshipName(relationship, 'userB')}`}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <section className="ink-wrap ink-landing__pricing" id="pricing">
          <div className="ink-sect-head">
            <span className="ink-eyebrow">Choose your plan</span>
            <h2>Start free. Go deeper <span className="ink-italic">when you&rsquo;re ready.</span></h2>
            <p className="ink-landing__pricing-lede">
              Even Free reads your actual birth chart — not your sun sign.
              No card, no account required to start.
            </p>
          </div>

          <div className="ink-landing__plans">
            <div className="ink-landing__plan">
              <h3>Free</h3>
              <p className="pd">Your real chart, read back to you.</p>
              <div className="price">$0 <span className="per">/ forever</span></div>
              <ul>
                <li><span><span className="gold">Full birth chart overview</span> on signup</span></li>
                <li><span>Weekly &amp; monthly horoscopes — unlimited</span></li>
                <li><span>Unlimited charts — friends, family, partners</span></li>
                <li><span>Relationship overviews for any two charts</span></li>
                <li><span>5 Gravity Chat questions to start</span></li>
              </ul>
              <Link className="ink-btn ink-btn--ghost" to="/signUp">Get started free</Link>
            </div>

            <div className="ink-landing__plan ink-landing__plan--pop">
              <span className="flag">Most popular</span>
              <h3>Plus</h3>
              <p className="pd">Live with your chart daily.</p>
              <div className="price">$14.99 <span className="per">/ month</span></div>
              <ul>
                <li><span><b>Everything in Free, plus —</b></span></li>
                <li><span>Daily horoscopes tuned to your transits</span></li>
                <li><span>Custom transit horoscopes — any date range</span></li>
                <li><span>Gravity Chat — <span className="gold">50 questions / day</span></span></li>
                <li><span><span className="gold">3 full reports</span> a month — natal or relationship, any mix</span></li>
              </ul>
              <div>
                <Link className="ink-btn ink-btn--navy" to="/signUp">Start Plus ✳</Link>
                <p className="fine">Cancel anytime.</p>
              </div>
            </div>

            <div className="ink-landing__plan">
              <h3>Single reports</h3>
              <p className="pd">Not ready to subscribe? Buy one deep-dive. No subscription needed.</p>
              <div className="packs">
                <div className="pack"><span className="pp">$9.99</span><span className="pc">Full Natal Report</span></div>
                <div className="pack"><span className="pp">$7.99</span><span className="pc">Full Relationship Report</span></div>
              </div>
              <ul>
                <li><span>Unlocks <span className="gold">permanently</span> — buy once, revisit forever</span></li>
                <li><span>Includes 5 bonus Gravity Chat questions to discuss it</span></li>
              </ul>
              <Link className="ink-btn ink-btn--ghost" to="/signUp">Buy a report</Link>
            </div>
          </div>

          <div className="ink-landing__compare">
            <h3>What&rsquo;s <span className="ink-italic">in</span> each plan</h3>
            <table>
              <thead>
                <tr><th>&nbsp;</th><th>Free</th><th className="pl">Plus</th></tr>
              </thead>
              <tbody>
                <tr><td>Birth chart overview</td><td><span className="yes">✓</span></td><td><span className="yes">✓</span></td></tr>
                <tr><td>Create charts — self, friends, partners</td><td><span className="yes">✓</span></td><td><span className="yes">✓</span></td></tr>
                <tr><td>Relationship compatibility overviews</td><td><span className="yes">✓</span></td><td><span className="yes">✓</span></td></tr>
                <tr><td>Weekly &amp; monthly horoscopes</td><td><span className="yes">✓</span></td><td><span className="yes">✓</span></td></tr>
                <tr><td>Gravity Chat</td><td>5 questions</td><td>50 / day</td></tr>
                <tr><td>Daily horoscopes</td><td>—</td><td><span className="yes">✓</span></td></tr>
                <tr><td>Custom transit horoscopes</td><td>—</td><td><span className="yes">✓</span></td></tr>
                <tr><td>Full reports — natal or relationship</td><td>$9.99 / $7.99 each</td><td>3 a month, then à la carte</td></tr>
              </tbody>
            </table>
            <p className="fine">
              Plus reports are one pooled allowance across natal and relationship, resetting on
              your billing date. Purchased reports unlock permanently.
            </p>
          </div>
        </section>

        <section className="ink-landing__closing">
          <div className="ink-wrap">
            <span className="ink-eyebrow ink-landing__closing-eyebrow">Ready when you are</span>
            <h2>Your first reading <span className="ink-italic">is waiting.</span></h2>
            <p>60 seconds of birth data. A lifetime of context for everything that follows.</p>
            <Link className="ink-btn ink-btn--navy" to="/signUp">Get started ✳</Link>
          </div>
        </section>

        <section className="ink-wrap ink-landing__assurances" id="about">
          <div className="ink-landing__assurance-grid">
            {ASSURANCES.map((item) => (
              <div className="ink-landing__assurance" key={item.title}>
                <span className="ink-landing__assurance-icon" aria-hidden="true">{item.icon}</span>
                <span>
                  <b>{item.title}</b>
                  <span>{item.copy}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="ink-landing__footer">
        <div className="ink-wrap ink-landing__colophon">
          <span className="ink-landing__wordmark">Astral Gravity ✳</span>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
          <span>© 2026 Stellium Labs LLC</span>
        </div>
      </footer>
    </div>
  );
}

export default InkLandingPage;
