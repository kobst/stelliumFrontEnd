import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, fetchAnalysis } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import ChartDetailLayout from '../UI/dashboard/chartDetail/ChartDetailLayout';
import AskStelliumCta from '../UI/dashboard/chartTabs/AskStelliumCta';
import ChartTab from '../UI/dashboard/chartTabs/ChartTab';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import PublicChartNav from '../UI/publicChart/PublicChartNav';
import FreePreviewChip from '../UI/publicChart/FreePreviewChip';
import CompareWithYourChartCard from '../UI/publicChart/CompareWithYourChartCard';
import InlineSignUpCta from '../UI/publicChart/InlineSignUpCta';
import AskStelliumFab from '../UI/publicChart/AskStelliumFab';
import SignUpInterceptModal from '../UI/publicChart/SignUpInterceptModal';
import '../UI/publicChart/PublicChartCta.css';
import './PublicCelebrityDashboard.css';

const SIGN_UP_ROUTE = '/login';
const SIGN_IN_ROUTE = '/login';

function getPlanetSign(birthChart, name) {
  return birthChart?.planets?.find((p) => p?.name === name)?.sign || null;
}

function buildAskExample(firstName, birthChart) {
  const moonSign = getPlanetSign(birthChart, 'Moon');
  if (moonSign) {
    return {
      question: `What makes ${firstName}'s ${moonSign} Moon so magnetic?`,
      answer: `Their Moon in ${moonSign} colors how they feel things — privately, vividly, and with `
        + `more intensity than they let on. It's the quiet engine behind the work: every emotion `
        + `gets metabolized into something expressive, and that instinct for what sits just beneath `
        + `the surface is exactly what makes their presence so hard to look away from…`
    };
  }
  return {
    question: `What stands out most in ${firstName}'s chart?`,
    answer: `The chart keeps returning to one tension — the public-facing self and the private, `
      + `feeling self pulling in different directions. That's where the magnetism comes from: a `
      + `person who performs from a deep, well-guarded inner world, and turns that contrast into `
      + `the thing everyone remembers about them…`
  };
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
  const [interceptOpen, setInterceptOpen] = useState(false);

  useEffect(() => {
    const loadCelebrityData = async () => {
      try {
        setLoading(true);

        // Fetch celebrity profile
        const data = await fetchUser(celebrityId);
        setCelebrity(data);

        // Fetch analysis data (for overview)
        try {
          const analysis = await fetchAnalysis(celebrityId);
          if (analysis) {
            setAnalysisData(analysis);
          }
        } catch (analysisErr) {
          // Analysis may not exist, that's okay
          console.log('No analysis data available for celebrity');
        }
      } catch (err) {
        console.error('Error loading celebrity:', err);
        setError('Celebrity not found');
      } finally {
        setLoading(false);
      }
    };

    if (celebrityId) {
      loadCelebrityData();
    }
  }, [celebrityId]);

  const handleBack = () => {
    navigate('/celebrities');
  };

  const goToSignUp = () => navigate(SIGN_UP_ROUTE);
  const goToSignIn = () => navigate(SIGN_IN_ROUTE, { state: { from: `/celebrities/${celebrityId}`, mode: 'signin' } });
  const openIntercept = () => setInterceptOpen(true);

  const handleAskStelliumClick = () => {
    if (!isFullyAuthenticated) {
      // No hard redirect — capture the curiosity in context.
      openIntercept();
      return;
    }
    setAskOpen(prev => !prev);
  };

  if (loading) {
    return (
      <div className="public-celebrity-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading celebrity chart...</p>
        </div>
      </div>
    );
  }

  if (error || !celebrity) {
    return (
      <div className="public-celebrity-dashboard">
        <div className="dashboard-error">
          <p>{error || 'Celebrity not found'}</p>
          <button className="back-btn" onClick={handleBack}>← Back to Celebrities</button>
        </div>
      </div>
    );
  }

  const isLoggedOut = !isFullyAuthenticated;

  // Extract analysis components (same structure as ChartDetailPage)
  const birthChart = celebrity?.birthChart || {};
  const basicAnalysis = analysisData?.interpretation?.basicAnalysis;
  const broadCategoryAnalyses = analysisData?.interpretation?.broadCategoryAnalyses;
  const elements = analysisData?.elements || birthChart.elements;
  const modalities = analysisData?.modalities || birthChart.modalities;
  const quadrants = analysisData?.quadrants || birthChart.quadrants;
  const planetaryDominance = analysisData?.planetaryDominance || birthChart.planetaryDominance;

  const celebrityName = `${celebrity.firstName || 'Celebrity'} ${celebrity.lastName || ''}`.trim();
  const firstName = celebrity.firstName || celebrityName.split(' ')[0] || 'this chart';
  const askExample = buildAskExample(firstName, birthChart);

  // Tab content — identical for everyone; celebrities always have full access.
  const tabContent = {
    overview: <OverviewTab basicAnalysis={basicAnalysis} birthChart={birthChart} isCelebrity={true} />,
    chart: <ChartTab birthChart={birthChart} isCelebrity={true} />,
    dominance: (
      <DominancePatternsTab
        birthChart={birthChart}
        basicAnalysis={basicAnalysis}
        elements={elements}
        modalities={modalities}
        quadrants={quadrants}
        planetaryDominance={planetaryDominance}
        hasAnalysis={true}
        isCelebrity={true}
      />
    ),
    planets: (
      <PlanetsTab
        birthChart={birthChart}
        basicAnalysis={basicAnalysis}
        hasAnalysis={true}
        isCelebrity={true}
      />
    ),
    analysis: (
      <AnalysisTab
        broadCategoryAnalyses={broadCategoryAnalyses}
        analysisStatus={{ status: 'complete' }}
        onStartAnalysis={() => {}}
        analysisLoading={false}
        isCelebrity={true}
      />
    )
  };

  // Logged-in viewers keep the inline Ask Stellium trigger after every section.
  const withAskStellium = (content) => (
    <>
      {content}
      <div className="public-celebrity-dashboard__ask-inline">
        <AskStelliumCta hasFullAccess onActivate={handleAskStelliumClick} />
      </div>
    </>
  );

  // Logged-out viewers get contextual sign-up CTAs woven into the long content.
  const withInlineCta = (content, cta) => (
    <>
      {content}
      <div className="public-celebrity-dashboard__inline-cta">{cta}</div>
    </>
  );

  const overviewCta = (
    <InlineSignUpCta
      eyebrow="Your turn"
      heading={<>Want a reading <span className="italic">this deep on your own chart?</span></>}
      body="Sign up free and get 25 credits — spend them on your own birth-chart reading, your weekly horoscope, or questions about anyone here."
      buttonLabel="Create your free account →"
      onActivate={goToSignUp}
    />
  );

  const analysisCta = (
    <InlineSignUpCta
      eyebrow="See your own 360"
      heading={<>Six lenses on <span className="italic">your</span> chart, too.</>}
      body={`Add your birth details and Stellium reads your identity, love, career, and more — the same depth you just read about ${firstName}. Free to start, 25 credits on the house.`}
      buttonLabel="Read my chart free →"
      onActivate={goToSignUp}
    />
  );

  const sections = isLoggedOut
    ? [
        { id: 'overview', content: withInlineCta(tabContent.overview, overviewCta) },
        { id: 'chart', content: tabContent.chart },
        { id: 'dominance', content: tabContent.dominance },
        { id: 'planets', content: tabContent.planets },
        { id: 'analysis', content: withInlineCta(tabContent.analysis, analysisCta) }
      ]
    : [
        { id: 'overview', content: withAskStellium(tabContent.overview) },
        { id: 'chart', content: withAskStellium(tabContent.chart) },
        { id: 'dominance', content: withAskStellium(tabContent.dominance) },
        { id: 'planets', content: withAskStellium(tabContent.planets) },
        { id: 'analysis', content: withAskStellium(tabContent.analysis) }
      ];

  return (
    <>
      {isLoggedOut && <PublicChartNav onSignIn={goToSignIn} onSignUp={goToSignUp} />}

      <div className="public-celebrity-dashboard">
        <ChartDetailLayout
          chart={celebrity}
          onBackClick={handleBack}
          backLabel="Back to Charts"
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          hasAnalysis={true}
          topBarRight={isLoggedOut ? <FreePreviewChip onClick={openIntercept} /> : null}
          sidebarExtra={
            isLoggedOut ? (
              <CompareWithYourChartCard celebrityName={celebrityName} onCompare={goToSignUp} />
            ) : null
          }
        />

        {isLoggedOut ? (
          <>
            <AskStelliumFab onClick={openIntercept} />
            <SignUpInterceptModal
              open={interceptOpen}
              onClose={() => setInterceptOpen(false)}
              celebrityName={celebrityName}
              exampleQuestion={askExample.question}
              exampleAnswer={askExample.answer}
              onCreateAccount={goToSignUp}
              onSignIn={goToSignIn}
            />
          </>
        ) : (
          <AskStelliumPanel
            isOpen={askOpen}
            onClose={() => setAskOpen(false)}
            contentType="birthchart"
            contentId={celebrityId}
            birthChart={birthChart}
            contextLabel={celebrityName}
            placeholderText="Ask about this celebrity birth chart..."
            suggestedQuestions={[
              'What stands out most in this chart?',
              'How does this chart describe their public image?',
              'Which placements shape their creative style?'
            ]}
          />
        )}
      </div>
    </>
  );
}

export default PublicCelebrityDashboard;
