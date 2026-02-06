import React, { useState } from 'react';
import TimeSelector from './TimeSelector';
import HoroscopeCard from './HoroscopeCard';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './HoroscopeContent.css';

function HoroscopeContent({
  timePeriod,
  onTimePeriodChange,
  horoscope,
  loading,
  error,
  onRetry,
  onLoad,
  onRefresh,
  userId,
  lockedContent,
  transitWindows = []
}) {
  const [chatOpen, setChatOpen] = useState(false);
  // Extract key transits from horoscope data
  const getKeyInfluences = () => {
    if (!horoscope) return [];

    // For daily horoscopes, use keyTransits
    if (timePeriod === 'today' && horoscope.keyTransits) {
      return horoscope.keyTransits;
    }

    // For weekly/monthly, use analysis.keyThemes if available
    if (horoscope.analysis?.keyThemes) {
      return horoscope.analysis.keyThemes;
    }

    return [];
  };

  // Format today's date
  const formatDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    // Add ordinal suffix
    const ordinal = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${ordinal(day)} ${month} ${year}`;
  };

  // Format influence date
  const formatInfluenceDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const influences = getKeyInfluences();
  const horoscopeText = horoscope?.text || horoscope?.interpretation || '';

  // Show locked content inline (keeps tabs visible)
  if (lockedContent) {
    return (
      <div className="horoscope-content horoscope-content--unified">
        <div className="horoscope-content__card">
          <div className="horoscope-content__card-header">
            <div className="horoscope-content__title-section">
              <h1 className="horoscope-content__title">How my Day? Stellium</h1>
              <span className="horoscope-content__date">{formatDate()}</span>
            </div>
          </div>

          <TimeSelector
            currentPeriod={timePeriod}
            onSelect={onTimePeriodChange}
            disabled={false}
          />

          {lockedContent}
        </div>
      </div>
    );
  }

  // Show HoroscopeCard for loading/error/empty states
  if (loading || error || !horoscope) {
    return (
      <div className="horoscope-content horoscope-content--unified">
        <div className="horoscope-content__card">
          <div className="horoscope-content__card-header">
            <div className="horoscope-content__title-section">
              <h1 className="horoscope-content__title">How my Day? Stellium</h1>
              <span className="horoscope-content__date">{formatDate()}</span>
            </div>
            <div
              className="horoscope-content__moon-icon horoscope-content__moon-icon--clickable"
              onClick={() => setChatOpen(true)}
              title="Ask Stellium"
            />
          </div>

          <TimeSelector
            currentPeriod={timePeriod}
            onSelect={onTimePeriodChange}
            disabled={loading}
          />

          <HoroscopeCard
            type={timePeriod}
            horoscope={horoscope}
            loading={loading}
            error={error}
            onRetry={onRetry}
            onLoad={onLoad}
          />
        </div>

        <AskStelliumPanel
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          contentType="horoscope"
          contentId={userId}
          transitWindows={transitWindows}
          horoscopePeriod={timePeriod}
          contextLabel="About your horoscope"
          placeholderText="Ask about your horoscope..."
          suggestedQuestions={[
            "What should I focus on today?",
            "How will this transit affect me?",
            "What energy should I watch for this week?"
          ]}
        />
      </div>
    );
  }

  // Normal state - unified card with all content
  return (
    <div className="horoscope-content horoscope-content--unified">
      <div className="horoscope-content__card">
        <div className="horoscope-content__card-header">
          <div className="horoscope-content__title-section">
            <h1 className="horoscope-content__title">How my Day? Stellium</h1>
            <span className="horoscope-content__date">{formatDate()}</span>
          </div>
          <div
            className="horoscope-content__moon-icon horoscope-content__moon-icon--clickable"
            onClick={() => setChatOpen(true)}
            title="Ask Stellium"
          />
        </div>

        <TimeSelector
          currentPeriod={timePeriod}
          onSelect={onTimePeriodChange}
          disabled={loading}
        />

        <div className="horoscope-content__text">
          {horoscopeText.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>

        {influences.length > 0 && (
          <>
            <div className="horoscope-content__divider" />

            <div className="horoscope-content__influences">
              <h3 className="horoscope-content__influences-title">Key Planetary Influences</h3>
              <div className="horoscope-content__influence-pills">
                {influences.map((influence, index) => (
                  <div key={index} className="influence-pill">
                    <span className="influence-pill__text">
                      {influence.transitingPlanet} {influence.aspect} {influence.targetPlanet}
                    </span>
                    {influence.exactDate && (
                      <>
                        <span className="influence-pill__separator">-</span>
                        <span className="influence-pill__date">
                          {formatInfluenceDate(influence.exactDate)}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <AskStelliumPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contentType="horoscope"
        contentId={userId}
        transitWindows={transitWindows}
        horoscopePeriod={timePeriod}
        contextLabel="About your horoscope"
        placeholderText="Ask about your horoscope..."
        suggestedQuestions={[
          "What should I focus on today?",
          "How will this transit affect me?",
          "What energy should I watch for this week?"
        ]}
      />
    </div>
  );
}

export default HoroscopeContent;
