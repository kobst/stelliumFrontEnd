import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchAnalysis, fetchUser } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import GravityChatPanel from '../UI/gravityChat/GravityChatPanel';
import GravityChatCta from '../UI/dashboard/chartTabs/GravityChatCta';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import ChartTab from '../UI/dashboard/chartTabs/ChartTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import InkNav from '../UI/ink/InkNav';
import InkPublicFooter from '../UI/publicInk/InkPublicFooter';
import Ephemeris from '../UI/shared/Ephemeris';
import '../styles/ink.css';
import './InkBirthChartPage.css';
import './PublicCelebrityDashboard.css';

const TABS = [
  { id: 'overview', roman: 'i.', label: 'Overview' },
  { id: 'chart', roman: 'ii.', label: 'The Chart' },
  { id: 'dominance', roman: 'iii.', label: 'Patterns' },
  { id: 'planets', roman: 'iv.', label: 'Planets' },
  { id: 'analysis', roman: 'v.', label: '360 Analysis' },
];
const MARKETING_LINKS = [
  { label: 'Celebrity charts', href: '/celebrities' },
  { label: 'Relationships', href: '/celebrity-relationships' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
];

function getPlanetSign(birthChart, name) {
  return birthChart?.planets?.find((planet) => planet?.name === name)?.sign || null;
}

function formatBirthDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatBirthTime(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hour = Number(match[1]);
  if (!Number.isFinite(hour)) return raw;
  const suffix = raw.match(/\b(AM|PM)\b/i)?.[1]?.toUpperCase() || (hour >= 12 ? 'PM' : 'AM');
  return `${hour % 12 || 12}:${match[2]} ${suffix}`;
}

function formatLocation(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.formattedAddress
    || value.placeName
    || value.name
    || [value.city, value.state, value.country].filter(Boolean).join(', ')
    || null;
}

function buildAskExample(firstName, birthChart) {
  const moonSign = getPlanetSign(birthChart, 'Moon');
  if (moonSign) return `How does ${firstName}'s ${moonSign} Moon shape their public presence?`;
  return `What stands out most in ${firstName}'s chart?`;
}

function PageState({ error, children }) {
  return (
    <div className="ink-page public-celebrity-dashboard">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />
      <main className={`pcb-state${error ? ' pcb-state--error' : ''}`} role={error ? 'alert' : 'status'}>
        <span aria-hidden="true">✳</span>
        <p>{children}</p>
        {error && <Link className="ink-btn ink-btn--ghost" to="/celebrities">Back to celebrity charts</Link>}
      </main>
      <InkPublicFooter />
    </div>
  );
}

function ConversionCta({ firstName, onActivate }) {
  return (
    <aside className="pcb-conversion">
      <div>
        <div className="ink-eyebrow">Your turn</div>
        <h2>Want a reading this deep on <span className="ink-italic">your own chart?</span></h2>
        <p>Add your birth details and explore the same patterns you just read about {firstName}.</p>
      </div>
      <button type="button" className="ink-btn ink-btn--navy" onClick={onActivate}>Get started ✳</button>
    </aside>
  );
}

function PublicCelebrityDashboard() {
  const { celebrityId } = useParams();
  const navigate = useNavigate();
  const { isFullyAuthenticated } = useAuth();
  const [celebrity, setCelebrity] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadCelebrityData = async () => {
      try {
        setLoading(true);
        const data = await fetchUser(celebrityId);
        if (cancelled) return;
        setCelebrity(data);
        try {
          const analysis = await fetchAnalysis(celebrityId);
          if (!cancelled && analysis) setAnalysisData(analysis);
        } catch (analysisError) {
          console.log('No analysis data available for celebrity');
        }
      } catch (fetchError) {
        console.error('Error loading celebrity:', fetchError);
        if (!cancelled) setError('Celebrity not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (celebrityId) loadCelebrityData();
    else {
      setError('Celebrity not found.');
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [celebrityId]);

  const birthChart = celebrity?.birthChart || {};
  const planets = useMemo(() => birthChart?.planets || [], [birthChart?.planets]);
  const aspects = useMemo(() => birthChart?.aspects || [], [birthChart?.aspects]);
  const wheelHouses = useMemo(() => {
    const houses = (birthChart?.houses || []).filter((h) => Number.isFinite(h?.degree));
    return houses.length === 12 ? houses : [];
  }, [birthChart?.houses]);

  if (loading) return <PageState>Drawing the celebrity chart…</PageState>;
  if (error || !celebrity) return <PageState error>{error || 'Celebrity not found.'}</PageState>;

  const basicAnalysis = analysisData?.interpretation?.basicAnalysis;
  const broadCategoryAnalyses = analysisData?.interpretation?.broadCategoryAnalyses;
  const elements = analysisData?.elements || birthChart.elements;
  const modalities = analysisData?.modalities || birthChart.modalities;
  const quadrants = analysisData?.quadrants || birthChart.quadrants;
  const planetaryDominance = analysisData?.planetaryDominance || birthChart.planetaryDominance;
  const celebrityName = `${celebrity.firstName || 'Celebrity'} ${celebrity.lastName || ''}`.trim();
  const firstName = celebrity.firstName || celebrityName.split(' ')[0] || 'this chart';
  const birthMeta = [
    formatBirthDate(celebrity.dateOfBirth || celebrity.birthDate),
    formatBirthTime(celebrity.timeOfBirth || celebrity.birthTime),
    formatLocation(celebrity.placeOfBirth || celebrity.birthPlace),
  ].filter(Boolean).join(' · ');
  const sun = getPlanetSign(birthChart, 'Sun');
  const moon = getPlanetSign(birthChart, 'Moon');
  const chartAnnotation = [sun && `Sun in ${sun}`, moon && `Moon in ${moon}`].filter(Boolean).join(' · ')
    || 'drawn from the real sky';

  const handleAsk = () => {
    if (!isFullyAuthenticated) {
      navigate('/signUp');
      return;
    }
    setAskOpen((open) => !open);
  };

  const tabContent = {
    overview: <OverviewTab basicAnalysis={basicAnalysis} birthChart={birthChart} isCelebrity />,
    chart: <ChartTab birthChart={birthChart} isCelebrity theme="ink" />,
    dominance: (
      <DominancePatternsTab
        birthChart={birthChart}
        basicAnalysis={basicAnalysis}
        elements={elements}
        modalities={modalities}
        quadrants={quadrants}
        planetaryDominance={planetaryDominance}
        hasAnalysis
        isCelebrity
      />
    ),
    planets: <PlanetsTab birthChart={birthChart} basicAnalysis={basicAnalysis} hasAnalysis isCelebrity />,
    analysis: (
      <AnalysisTab
        broadCategoryAnalyses={broadCategoryAnalyses}
        analysisStatus={{ status: 'complete' }}
        onStartAnalysis={() => {}}
        analysisLoading={false}
        isCelebrity
      />
    ),
  };

  return (
    <div className="ink-page ink-birth-chart public-celebrity-dashboard">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />

      <header className="ibc-chart-head pcb-head">
        <Link className="pcb-back" to="/celebrities">← Celebrity charts</Link>
        <h1><span aria-hidden="true">✳</span>{celebrityName}</h1>
        {birthMeta && <p>{birthMeta}</p>}
      </header>

      <nav className="ink-tabs ibc-tabs pcb-tabs" aria-label="Celebrity birth chart sections" role="tablist">
        {TABS.map((tab) => (
          <button
            type="button"
            className={`ink-tab${activeSection === tab.id ? ' on' : ''}`}
            role="tab"
            aria-selected={activeSection === tab.id}
            aria-controls={`pcb-panel-${tab.id}`}
            id={`pcb-tab-${tab.id}`}
            onClick={() => setActiveSection(tab.id)}
            key={tab.id}
          >
            <span className="ink-tab-roman">{tab.roman}</span>
            <span className="ink-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main>
        {TABS.map((tab) => (
          <section
            className="ibc-panel pcb-panel"
            id={`pcb-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`pcb-tab-${tab.id}`}
            hidden={activeSection !== tab.id}
            key={tab.id}
          >
            {tab.id === 'overview' ? (
              <div className="ink-wrap ibc-overview-grid pcb-overview-grid">
                <article className="pcb-overview-copy">
                  <div className="ink-eyebrow">Public birth chart</div>
                  <h2>{firstName}, brought <span className="ink-italic">into focus.</span></h2>
                  {tabContent.overview}
                </article>
                <div className="ibc-overview-visual">
                  <div className="ibc-medallion-frame">
                    {planets.length > 0 ? (
                      <div className="ibc-medallion ibc-medallion--overview pcb-medallion" aria-label={`${celebrityName}'s natal chart`}>
                        <Ephemeris
                          planets={planets}
                          houses={wheelHouses}
                          aspects={aspects}
                          transits={[]}
                          theme="ink"
                          instanceId="pcb-wheel"
                        />
                      </div>
                    ) : (
                      <div className="ibc-medallion ibc-medallion--empty">Chart wheel data is unavailable.</div>
                    )}
                    <span className="ibc-annotation">{chartAnnotation} ↓</span>
                  </div>
                  <p className="ibc-chart-note"><span aria-hidden="true" /> Real ephemeris · public chart</p>
                </div>
              </div>
            ) : (
              <div className="ink-wrap pcb-tab-content">{tabContent[tab.id]}</div>
            )}

            <div className="ink-wrap">
              {!isFullyAuthenticated && (tab.id === 'overview' || tab.id === 'analysis') && (
                <ConversionCta firstName={firstName} onActivate={() => navigate('/signUp')} />
              )}
              {isFullyAuthenticated && (
                <div className="pcb-ask-inline">
                  <GravityChatCta hasFullAccess onActivate={handleAsk} />
                </div>
              )}
            </div>
          </section>
        ))}
      </main>

      <section className="pcb-bottom-cta">
        <div className="ink-wrap pcb-bottom-cta__inner">
          <p>Ready to draw your own chart?</p>
          <Link className="ink-btn ink-btn--navy" to="/signUp">Get started ✳</Link>
        </div>
      </section>

      <InkPublicFooter />

      {isFullyAuthenticated && (
        <GravityChatPanel
          isOpen={askOpen}
          onClose={() => setAskOpen(false)}
          contentType="birthchart"
          contentId={celebrityId}
          birthChart={birthChart}
          contextLabel={celebrityName}
          placeholderText="Ask about this celebrity birth chart..."
          suggestedQuestions={[
            buildAskExample(firstName, birthChart),
            'How does this chart describe their public image?',
            'Which placements shape their creative style?',
          ]}
        />
      )}
    </div>
  );
}

export default PublicCelebrityDashboard;
