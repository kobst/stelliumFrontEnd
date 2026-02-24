import React, { useState, useEffect } from 'react';
import { getTransitWindows } from '../../Utilities/api';
import AskStelliumTab from './AskStelliumTab';
import LockedContent from '../shared/LockedContent';

import './AskStelliumSection.css';

function AskStelliumSection({ userId, entitlements }) {
  const [transitWindows, setTransitWindows] = useState([]);
  const [transitLoading, setTransitLoading] = useState(true);
  const [transitError, setTransitError] = useState(null);

  // Fetch transit windows on mount
  useEffect(() => {
    const fetchTransits = async () => {
      if (!userId) return;

      try {
        setTransitLoading(true);
        setTransitError(null);

        const now = new Date();
        const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

        const response = await getTransitWindows(
          userId,
          fromDate.toISOString(),
          toDate.toISOString()
        );

        if (response && (response.transitEvents || response.transitToTransitEvents)) {
          const allTransitEvents = [
            ...(response.transitEvents || []),
            ...(response.transitToTransitEvents || [])
          ];
          setTransitWindows(allTransitEvents);
        } else if (Array.isArray(response)) {
          setTransitWindows(response);
        }
      } catch (err) {
        console.error('Error fetching transit windows:', err);
        setTransitError('Failed to load transit data');
      } finally {
        setTransitLoading(false);
      }
    };

    fetchTransits();
  }, [userId]);

  // Locked content for Ask Stellium
  if (!entitlements?.isPremiumOrHigher && !entitlements?.isPlus) {
    return (
      <div className="ask-stellium-section">
        <LockedContent
          title="Ask Stellium"
          description="Get personalized answers about your transits and horoscope from our AI astrologer."
          features={[
            'Ask unlimited questions',
            'Personalized transit insights',
            'Custom horoscope readings'
          ]}
          ctaText="Available with Plus"
        />
      </div>
    );
  }

  return (
    <div className="ask-stellium-section">
      {transitLoading && (
        <div className="ask-stellium-section__loading">
          <div className="ask-stellium-section__spinner" />
          <p>Loading transit data...</p>
        </div>
      )}

      {transitError && (
        <div className="ask-stellium-section__error">
          {transitError}
        </div>
      )}

      {!transitLoading && !transitError && (
        <AskStelliumTab
          userId={userId}
          transitWindows={transitWindows}
        />
      )}
    </div>
  );
}

export default AskStelliumSection;
