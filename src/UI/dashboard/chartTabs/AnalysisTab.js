import React, { useState } from 'react';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './ChartTabs.css';

// ============ MAPPING TABLES ============

const planetMap = {
  Su: 'Sun', Mo: 'Moon', Me: 'Mercury', Ve: 'Venus', Ma: 'Mars',
  Ju: 'Jupiter', Sa: 'Saturn', Ur: 'Uranus', Ne: 'Neptune', Pl: 'Pluto',
  No: 'Node', As: 'Ascendant', Mi: 'Midheaven', Ds: 'Descendant', Ic: 'IC'
};

const signMap = {
  Ar: 'Aries', Ta: 'Taurus', Ge: 'Gemini', Ca: 'Cancer', Le: 'Leo', Vi: 'Virgo',
  Li: 'Libra', Sc: 'Scorpio', Sa: 'Sagittarius', Cp: 'Capricorn', Aq: 'Aquarius', Pi: 'Pisces'
};

const aspectTypeMap = {
  Co: 'conjunction', Sq: 'square', Tr: 'trine',
  Se: 'sextile', Op: 'opposition', Qu: 'quincunx'
};

const orbTierMap = {
  Ea: 'exact',   // 0-1°
  Ca: 'close',   // 1-3°
  Ga: 'wide'     // 3-8°
};

const aspectGlossary = {
  conjunction: 'Conjunction: planets aligned, energies merge and intensify.',
  opposition: 'Opposition: polarizing tension that seeks balance and awareness.',
  trine: 'Trine: supportive flow, natural ease and harmony.',
  square: 'Square: friction that pushes growth and action.',
  sextile: 'Sextile: cooperative opportunity that needs initiative.',
  quincunx: 'Quincunx: awkward mismatch requiring adjustment and integration.'
};

// ============ REGEX PATTERNS ============

// Placement: Pp-<Planet>s<Sign><House>
// Example: Pp-SusSc12 -> Sun in Scorpio, 12th house
const placementRe = /^Pp-([A-Za-z]{2})s([A-Za-z]{2})(\d{2})$/;

// Natal Aspect: A-<Pl1>s<Si1><H1><Orb><Type><Pl2>s<Si2><H2>
// Example: A-MesSa01CaSqJusVi10 -> Mercury in Sag (1st) close square Jupiter in Virgo (10th)
const aspectRe = /^A-([A-Za-z]{2})s([A-Za-z]{2})(\d{2})(Ea|Ca|Ga)(Co|Sq|Tr|Se|Op|Qu)([A-Za-z]{2})s([A-Za-z]{2})(\d{2})$/;

// Synastry Aspect: SynA-P1(<Pl>s<Si><H>)-<Orb><Type>-P2(<Pl>s<Si><H>)
const synastryRe = /^SynA-P1\(([A-Za-z]{2})s([A-Za-z]{2})(\d{2})\)-(Ea|Ca|Ga)(Co|Sq|Tr|Se|Op|Qu)-P2\(([A-Za-z]{2})s([A-Za-z]{2})(\d{2})\)$/;

// Transit: Tr-<TransitPl>s<TransitSi>-<Orb><Type>-Na<NatalPl>s<NatalSi>
const transitRe = /^Tr-([A-Za-z]{2})s([A-Za-z]{2})-(Ea|Ca|Ga)(Co|Sq|Tr|Se|Op|Qu)-Na([A-Za-z]{2})s([A-Za-z]{2})$/;

// Composite Placement: CompP-<PlanetName>-H<HH>
const compositePlacementRe = /^CompP-([A-Za-z]+)-H(\d{2})$/;

// Composite Aspect: CompA-<Pl1><H1><Orb><Type><Pl2><H2>
const compositeAspectRe = /^CompA-([A-Za-z]{2})(\d{2})(Ea|Ca|Ga)(Co|Sq|Tr|Se|Op|Qu)([A-Za-z]{2})(\d{2})$/;

// ============ HELPER FUNCTIONS ============

const houseLabel = (h) => {
  return h === 1 ? '1st' : h === 2 ? '2nd' : h === 3 ? '3rd' : `${h}th`;
};

const formatAspectDetail = (decoded) => {
  if (!decoded?.p1 || !decoded?.p2 || !decoded?.aspect) return decoded?.pretty || '';
  const p1 = `${decoded.p1.planet} in ${decoded.p1.sign} (${houseLabel(decoded.p1.house)})`;
  const p2 = `${decoded.p2.planet} in ${decoded.p2.sign} (${houseLabel(decoded.p2.house)})`;
  return `${p1} ${decoded.aspect} ${p2}`;
};

const renderAspectPhrase = (decoded) => {
  if (!decoded?.p1 || !decoded?.p2 || !decoded?.aspect) {
    return decoded?.pretty || '';
  }
  const aspect = decoded.aspect;
  const tooltip = aspectGlossary[aspect] || '';
  return (
    <>
      {decoded.p1.planet}{' '}
      <span title={tooltip}>{aspect}</span>{' '}
      {decoded.p2.planet}
    </>
  );
};

// ============ MAIN DECODER FUNCTION ============

// Returns structured data for rendering
const decodeAstroCode = (code) => {
  if (!code || typeof code !== 'string') return { type: 'unknown', raw: code, pretty: code };

  try {
    // Try placement pattern
    const pMatch = placementRe.exec(code);
    if (pMatch) {
      const [, pTok, sTok, hStr] = pMatch;
      const planet = planetMap[pTok] || pTok;
      const sign = signMap[sTok] || sTok;
      const house = parseInt(hStr, 10);
      return {
        type: 'placement',
        planet,
        sign,
        house,
        pretty: `${planet} in ${sign}, ${houseLabel(house)} house`
      };
    }

    // Try natal aspect pattern
    const aMatch = aspectRe.exec(code);
    if (aMatch) {
      const [, p1Tok, s1Tok, h1Str, orbTok, aspTok, p2Tok, s2Tok, h2Str] = aMatch;
      const p1 = {
        planet: planetMap[p1Tok] || p1Tok,
        sign: signMap[s1Tok] || s1Tok,
        house: parseInt(h1Str, 10)
      };
      const p2 = {
        planet: planetMap[p2Tok] || p2Tok,
        sign: signMap[s2Tok] || s2Tok,
        house: parseInt(h2Str, 10)
      };
      const aspect = aspectTypeMap[aspTok] || aspTok;
      const orbTier = orbTierMap[orbTok] || orbTok;

      return {
        type: 'aspect',
        p1,
        p2,
        aspect,
        orbTier,
        pretty: `${p1.planet} ${aspect} ${p2.planet}`
      };
    }

    // Try synastry aspect pattern
    const synMatch = synastryRe.exec(code);
    if (synMatch) {
      const [, p1Tok, s1Tok, h1Str, orbTok, aspTok, p2Tok, s2Tok, h2Str] = synMatch;
      return {
        type: 'synastry',
        p1: { planet: planetMap[p1Tok] || p1Tok, sign: signMap[s1Tok] || s1Tok, house: parseInt(h1Str, 10) },
        p2: { planet: planetMap[p2Tok] || p2Tok, sign: signMap[s2Tok] || s2Tok, house: parseInt(h2Str, 10) },
        aspect: aspectTypeMap[aspTok] || aspTok,
        orbTier: orbTierMap[orbTok] || orbTok,
        pretty: `Person 1's ${planetMap[p1Tok]} ${aspectTypeMap[aspTok]} Person 2's ${planetMap[p2Tok]}`
      };
    }

    // Try transit pattern
    const trMatch = transitRe.exec(code);
    if (trMatch) {
      const [, trPlTok, trSiTok, orbTok, aspTok, naPlTok, naSiTok] = trMatch;
      return {
        type: 'transit',
        transitPlanet: planetMap[trPlTok] || trPlTok,
        transitSign: signMap[trSiTok] || trSiTok,
        natalPlanet: planetMap[naPlTok] || naPlTok,
        natalSign: signMap[naSiTok] || naSiTok,
        aspect: aspectTypeMap[aspTok] || aspTok,
        orbTier: orbTierMap[orbTok] || orbTok,
        pretty: `Transit ${planetMap[trPlTok]} ${aspectTypeMap[aspTok]} natal ${planetMap[naPlTok]}`
      };
    }

    // Try composite placement pattern
    const compPlMatch = compositePlacementRe.exec(code);
    if (compPlMatch) {
      const [, planetName, hStr] = compPlMatch;
      const house = parseInt(hStr, 10);
      return {
        type: 'compositePlacement',
        planet: planetName,
        house,
        pretty: `Composite ${planetName} in ${houseLabel(house)} house`
      };
    }

    // Try composite aspect pattern
    const compAspMatch = compositeAspectRe.exec(code);
    if (compAspMatch) {
      const [, p1Tok, h1Str, orbTok, aspTok, p2Tok, h2Str] = compAspMatch;
      return {
        type: 'compositeAspect',
        p1: { planet: planetMap[p1Tok] || p1Tok, house: parseInt(h1Str, 10) },
        p2: { planet: planetMap[p2Tok] || p2Tok, house: parseInt(h2Str, 10) },
        aspect: aspectTypeMap[aspTok] || aspTok,
        orbTier: orbTierMap[orbTok] || orbTok,
        pretty: `Composite ${planetMap[p1Tok]} ${aspectTypeMap[aspTok]} ${planetMap[p2Tok]}`
      };
    }

    // Return raw code if no pattern matches
    return { type: 'unknown', raw: code, pretty: code };
  } catch (err) {
    console.warn('Failed to decode astro code:', code, err);
    return { type: 'unknown', raw: code, pretty: code };
  }
};

// Extract keyAspects from subtopic (handles both array and object formats)
const extractKeyAspects = (subtopic) => {
  if (!subtopic?.keyAspects) return [];

  if (Array.isArray(subtopic.keyAspects)) {
    return subtopic.keyAspects;
  }

  if (typeof subtopic.keyAspects === 'object') {
    return Object.values(subtopic.keyAspects).filter(
      (value) => typeof value === 'string' && value.length > 0
    );
  }

  return [];
};

// Render a single key element card
const renderKeyElement = (decoded, idx) => {
  if (decoded.type === 'placement') {
    return (
      <div key={idx} className="key-element-card">
        <div className="element-planet">{decoded.planet}</div>
        <div className="element-detail">{decoded.sign} in House {decoded.house}</div>
      </div>
    );
  }

  if (decoded.type === 'aspect') {
    return (
      <div key={idx} className="key-element-card aspect-card">
        <div className="element-title">{renderAspectPhrase(decoded)}</div>
        <div className="element-detail">
          {decoded.p1.planet} in {decoded.p1.sign} ({houseLabel(decoded.p1.house)})
        </div>
        <div className="element-detail">
          {decoded.p2.planet} in {decoded.p2.sign} ({houseLabel(decoded.p2.house)})
        </div>
        <span className="aspect-type-tag">{decoded.aspect}</span>
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div key={idx} className="key-element-card">
      <div className="element-detail">{decoded.pretty}</div>
    </div>
  );
};

// Format subtopic name from key
const formatSubtopicName = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
};

// ============ DOMAIN CONFIGURATION ============

const LIFE_DOMAINS = [
  { id: 'UNCONSCIOUS_SPIRITUALITY', label: 'Spiritual' },
  { id: 'EMOTIONAL_FOUNDATIONS_HOME', label: 'Emotional Foundation' },
  { id: 'COMMUNICATION_BELIEFS', label: 'Communication' },
  { id: 'CAREER_PURPOSE_PUBLIC_IMAGE', label: 'Career & Ambition' },
  { id: 'RELATIONSHIPS_SOCIAL', label: 'Partnerships' },
  { id: 'PERSONALITY_IDENTITY', label: 'Identity' },
];

// ============ INLINE COMPONENTS ============

function DomainTabs({ domains, activeDomain, onDomainChange }) {
  return (
    <nav className="analysis-domain-tabs">
      {domains.map(domain => (
        <button
          key={domain.id}
          className={`analysis-domain-tab ${activeDomain === domain.id ? 'analysis-domain-tab--active' : ''}`}
          onClick={() => onDomainChange(domain.id)}
        >
          {domain.label}
        </button>
      ))}
    </nav>
  );
}

function ThemeCard({ subtopicKey, subtopic, editedContent, isExpanded, onToggle }) {
  // Get content: prefer edited text, fall back to original analysis
  const analysis = typeof editedContent === 'string'
    ? editedContent
    : typeof subtopic === 'string'
      ? subtopic
      : subtopic?.analysis || subtopic?.text || '';

  // Create summary from first 2-3 sentences (truncated)
  const sentences = analysis.split(/(?<=[.!?])\s+/);
  const summary = sentences.slice(0, 2).join(' ');

  // Extract and decode key aspects
  const keyAspects = extractKeyAspects(subtopic);
  const decodedAspects = keyAspects.map(code => decodeAstroCode(code));

  return (
    <div className={`analysis-theme-item ${isExpanded ? 'analysis-theme-item--expanded' : ''}`}>
      <div className="analysis-theme-item__header" onClick={onToggle}>
        <div className="analysis-theme-item__text">
          <h4 className="analysis-theme-item__title">{formatSubtopicName(subtopicKey)}</h4>
          {/* Only show summary when collapsed */}
          {!isExpanded && (
            <p className="analysis-theme-item__summary">{summary}</p>
          )}
        </div>
        <span className="analysis-theme-item__icon" aria-hidden="true">
          {isExpanded ? '▾' : '▸'}
        </span>
      </div>

      {isExpanded && (
        <div className="analysis-theme-item__content">
          {analysis && analysis.split('\n').map((paragraph, idx) => (
            paragraph.trim() && <p key={idx}>{paragraph}</p>
          ))}

          {/* Key Aspects List */}
          <div className="analysis-theme-item__aspects">
            <span className="analysis-theme-item__aspects-label">Related Aspects:</span>
            {decodedAspects.length > 0 ? (
              <ul className="analysis-theme-item__aspects-list">
                {decodedAspects.map((decoded, idx) => (
                  <li key={idx} title={formatAspectDetail(decoded)}>
                    {renderAspectPhrase(decoded)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="analysis-theme-item__aspects-empty">No related aspects available for this section yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DomainContent({ domain, data, expandedCard, onCardToggle }) {
  const editedSubtopics = data.editedSubtopics || {};
  const originalSubtopics = data.subtopics || {};

  // Get subtopic keys
  const subtopicKeys = Object.keys(editedSubtopics).length > 0
    ? Object.keys(editedSubtopics)
    : Object.keys(originalSubtopics);

  return (
    <div className="analysis-domain-content">
      {/* Domain Header Row */}
      <div className="analysis-domain-header">
        <h3 className="analysis-domain-title">{domain.label}</h3>

        {/* Key Aspect Pills */}
        {data.tensionFlow?.keystoneAspects?.length > 0 && (
          <div className="analysis-aspect-pills">
            {data.tensionFlow.keystoneAspects.slice(0, 3).map((code, idx) => {
              const decoded = decodeAstroCode(code);
              return (
                <span
                  key={idx}
                  className="analysis-aspect-pill"
                  title={formatAspectDetail(decoded)}
                >
                  {renderAspectPhrase(decoded)}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Overview Text */}
      {data.overview && (
        <p className="analysis-domain-overview">{data.overview}</p>
      )}

      {/* Theme Items List (Vertical) */}
      <div className="analysis-theme-list">
        {subtopicKeys.map((subtopicKey) => (
          <ThemeCard
            key={subtopicKey}
            subtopicKey={subtopicKey}
            subtopic={originalSubtopics[subtopicKey]}
            editedContent={editedSubtopics[subtopicKey]}
            isExpanded={expandedCard === subtopicKey}
            onToggle={() => onCardToggle(subtopicKey)}
          />
        ))}
      </div>

      {/* Synthesis Block */}
      {data.synthesis && (
        <>
          <div className="analysis-synthesis-separator"></div>
          <p className="analysis-synthesis">{data.synthesis}</p>
        </>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============

function AnalysisTab({ broadCategoryAnalyses, analysisStatus, onStartAnalysis, chartId, birthChart }) {
  const [activeDomain, setActiveDomain] = useState(LIFE_DOMAINS[0].id);
  const [expandedCard, setExpandedCard] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const isAnalysisComplete = analysisStatus?.completed ||
    (broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0);

  const isAnalysisInProgress = analysisStatus?.status === 'in_progress';
  const completedTasks = analysisStatus?.failures?.completedTasks || 0;
  const totalTasks = analysisStatus?.failures?.totalTasks || 86;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle domain change - reset expanded card
  const handleDomainChange = (domainId) => {
    setActiveDomain(domainId);
    setExpandedCard(null);
  };

  // Handle card toggle
  const handleCardToggle = (cardKey) => {
    setExpandedCard(expandedCard === cardKey ? null : cardKey);
  };

  // Render the start analysis prompt
  if (!isAnalysisComplete && !isAnalysisInProgress) {
    return (
      <div className="chart-tab-content analysis-tab">
        <div className="analysis-prompt">
          <div className="prompt-icon">◎</div>
          <h3>360° Analysis</h3>
          <p>Generate a comprehensive AI-powered analysis of your birth chart across 6 life categories.</p>
          <p className="prompt-note">This analysis includes ~86 detailed interpretations and may take a few minutes.</p>
          <button className="start-analysis-button" onClick={onStartAnalysis}>
            Start 360° Analysis
          </button>
        </div>
      </div>
    );
  }

  // Render progress if analysis is in progress
  if (isAnalysisInProgress && !isAnalysisComplete) {
    return (
      <div className="chart-tab-content analysis-tab">
        <div className="analysis-progress">
          <div className="progress-spinner"></div>
          <h3>Generating Analysis...</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="progress-text">{completedTasks} of {totalTasks} tasks completed ({progressPercent}%)</p>
          <p className="progress-note">This may take a few minutes. Please don't close this page.</p>
        </div>
      </div>
    );
  }

  // Get available domains from the actual data keys
  const categories = broadCategoryAnalyses || {};
  const categoryKeys = Object.keys(categories);

  if (categoryKeys.length === 0) {
    return (
      <div className="chart-tab-empty">
        <h3>360° Analysis</h3>
        <p>No analysis data available yet.</p>
      </div>
    );
  }

  // Build available domains - use LIFE_DOMAINS metadata if available, otherwise create fallback
  const availableDomains = categoryKeys.map(key => {
    const domainMeta = LIFE_DOMAINS.find(d => d.id === key);
    if (domainMeta) return domainMeta;
    // Fallback for unknown keys
    return {
      id: key,
      label: formatSubtopicName(key),
      icon: '📊'
    };
  });

  // Ensure active domain is valid
  const validActiveDomain = availableDomains.find(d => d.id === activeDomain)
    ? activeDomain
    : availableDomains[0].id;

  const activeDomainData = categories[validActiveDomain];
  const activeDomainMeta = availableDomains.find(d => d.id === validActiveDomain);

  return (
    <div className="chart-tab-content analysis-tab analysis-tab--redesigned">
      {/* Header Section */}
      <div className="analysis-header">
        <h3 className="analysis-header__title">360 Analysis</h3>
        <div
          className="analysis-gradient-icon analysis-gradient-icon--clickable"
          onClick={() => setChatOpen(true)}
          title="Ask Stellium"
        ></div>
      </div>

      {/* Domain Tabs */}
      <DomainTabs
        domains={availableDomains}
        activeDomain={validActiveDomain}
        onDomainChange={handleDomainChange}
      />

      {/* Domain Content */}
      {activeDomainData && activeDomainMeta && (
        <DomainContent
          domain={activeDomainMeta}
          data={activeDomainData}
          expandedCard={expandedCard}
          onCardToggle={handleCardToggle}
        />
      )}

      <AskStelliumPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contentType="analysis"
        contentId={chartId}
        birthChart={birthChart}
        contextLabel="About your 360 analysis"
        placeholderText="Ask about your analysis..."
        suggestedQuestions={[
          "What does my career analysis reveal?",
          "How do my emotional patterns show up?",
          "What are my relationship tendencies?"
        ]}
      />
    </div>
  );
}

export default AnalysisTab;
