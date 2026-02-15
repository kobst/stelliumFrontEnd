import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getUserCompositeCharts, fetchRelationshipAnalysis, fetchUser } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import { useCheckout } from '../hooks/useCheckout';
import DashboardLayout from '../UI/layout/DashboardLayout';
import RelationshipDetailLayout from '../UI/dashboard/relationshipDetail/RelationshipDetailLayout';
import ScoresTab from '../UI/dashboard/relationshipTabs/ScoresTab';
import OverviewTab from '../UI/dashboard/relationshipTabs/OverviewTab';
import ChartsTab from '../UI/dashboard/relationshipTabs/ChartsTab';
import AnalysisTab from '../UI/dashboard/relationshipTabs/AnalysisTab';
import LockedContent from '../UI/shared/LockedContent';
import './RelationshipAnalysisPage.css';

function RelationshipAnalysisPage() {
  const { userId, compositeId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const entitlements = useEntitlements(stelliumUser);

  // Checkout hook for handling purchases
  const checkout = useCheckout(stelliumUser, () => {
    // Refresh entitlements after successful purchase
    entitlements.refreshEntitlements();
  });

  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRelationship = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading relationship data for compositeId:', compositeId);
      const composites = await getUserCompositeCharts(userId);
      const found = composites?.find(c => c._id === compositeId);
      if (found) {
        // Fetch analysis data and individual birth charts in parallel
        let analysisData = null;
        let userABirthChart = null;
        let userBBirthChart = null;

        try {
          const promises = [fetchRelationshipAnalysis(compositeId)];

          // Fetch individual birth charts if we have user IDs
          if (found.userA_id && found.userB_id) {
            promises.push(
              fetchUser(found.userA_id).then(u => u?.birthChart).catch(() => null),
              fetchUser(found.userB_id).then(u => u?.birthChart).catch(() => null)
            );
          }

          const [analysis, chartA, chartB] = await Promise.all(promises);
          analysisData = analysis;
          userABirthChart = chartA || null;
          userBBirthChart = chartB || null;

          console.log('Fetched analysis data:', {
            hasCompleteAnalysis: !!analysisData?.completeAnalysis,
            completeAnalysisKeys: analysisData?.completeAnalysis ? Object.keys(analysisData.completeAnalysis) : [],
            hasClusterScoring: !!analysisData?.clusterScoring
          });
        } catch (analysisErr) {
          console.warn('Could not fetch analysis data:', analysisErr);
        }

        const merged = {
          ...found,
          ...(analysisData || {}),
          ...(userABirthChart && { userA_birthChart: userABirthChart }),
          ...(userBBirthChart && { userB_birthChart: userBBirthChart })
        };
        setRelationship(merged);
      } else {
        setError('Relationship not found');
      }
    } catch (err) {
      console.error('Error loading relationship:', err);
      setError('Failed to load relationship data');
    } finally {
      setLoading(false);
    }
  }, [userId, compositeId]);

  useEffect(() => {
    if (userId && compositeId) {
      loadRelationship();
    }
  }, [userId, compositeId, loadRelationship]);

  // Callback for when analysis completes - reload the data
  const handleAnalysisComplete = useCallback(() => {
    console.log('Analysis complete callback triggered - reloading relationship data');
    loadRelationship();
  }, [loadRelationship]);

  // Check if full analysis is complete
  const isAnalysisComplete = relationship?.completeAnalysis &&
    Object.keys(relationship.completeAnalysis).length > 0;

  // Check if user can access premium tabs:
  // Either the relationship has been analyzed (purchased) OR user has Plus subscription
  const canAccessPremiumTabs = isAnalysisComplete || entitlements.isPlus;

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  // Security check: Redirect if user tries to access a different user's data
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-loading">
          <div className="loading-spinner"></div>
          <p>Loading relationship...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="relationship-analysis-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Build sections array for RelationshipDetailLayout
  const sections = [
    {
      id: 'scores',
      content: <ScoresTab relationship={relationship} />
    },
    {
      id: 'overview',
      content: <OverviewTab relationship={relationship} compositeId={compositeId} />
    },
    {
      id: 'charts',
      content: <ChartsTab relationship={relationship} />
    },
    {
      id: 'analysis',
      content: canAccessPremiumTabs ? (
        <AnalysisTab
          relationship={relationship}
          compositeId={compositeId}
          onAnalysisComplete={handleAnalysisComplete}
          userId={userId}
        />
      ) : (
        <LockedContent
          title="360° Relationship Analysis"
          description="Discover the deeper dynamics of your relationship with comprehensive astrological insights."
          features={[
            'Synastry aspect interpretations',
            'Composite chart analysis',
            'Relationship strengths & challenges',
            'Growth opportunities as a couple'
          ]}
          ctaText="Unlock with Plus"
          showPurchaseOption={true}
          analysisType="RELATIONSHIP"
          analysisId={compositeId}
          purchasePrice={entitlements.relationshipPrice}
          showUseQuotaOption={true}
          quotaRemaining={entitlements.credits?.total || 0}
          isPlus={entitlements.isPlus}
          isLoading={checkout.isLoading}
          onUpgradeClick={checkout.startSubscription}
          onPurchase={(type, id) => checkout.purchaseAnalysis(type, id)}
          onUseQuota={async (type, id) => {
            const result = await entitlements.checkAndUseAnalysis(type, id);
            if (result.success) {
              // Refresh the page to show unlocked content
              window.location.reload();
            }
          }}
        />
      )
    }
  ];

  // Determine which sections are locked
  const lockedSections = canAccessPremiumTabs ? [] : ['analysis'];

  return (
    <DashboardLayout user={stelliumUser} defaultSection="relationships">
      {() => (
        <div className="relationship-analysis-page">
          <RelationshipDetailLayout
            relationship={relationship}
            onBackClick={handleBackClick}
            sections={sections}
            lockedSections={lockedSections}
            defaultSection="overview"
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default RelationshipAnalysisPage;
