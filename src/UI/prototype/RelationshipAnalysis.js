import React from 'react';
import { RelationshipCategoriesEnum, orderedCategoryKeys } from '../../Utilities/constants';
import ScoredItemsTable from './ScoredItemsTable';

function RelationshipAnalysis({ 
  analysis, 
  userAName, 
  userBName, 
  scoreAnalysis, 
  clusterAnalysis, 
  overall,
  completeAnalysis,
  initialOverview,
  isFullAnalysisComplete = false,
  onStartFullAnalysis = null,
  isStartingAnalysis = false
}) {
    // If we have cluster analysis, prioritize it
    if (clusterAnalysis?.clusters) {
      
      return (
        <div className="relationship-analysis-display" style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3>Enhanced Relationship Analysis for {userAName} and {userBName}</h3>
          
          {/* Initial Overview (Phase 1) */}
          {initialOverview && (
            <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8f9ff', borderRadius: '8px', border: '2px solid #e0e7ff' }}>
              <h4 style={{ color: '#3730a3', marginBottom: '15px' }}>💫 Initial Overview</h4>
              <p style={{ lineHeight: '1.6', color: '#1f2937', margin: 0, fontSize: '16px' }}>
                {initialOverview}
              </p>
            </div>
          )}

          {/* Overall Analysis Summary */}
          {overall && (
            <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '2px solid #bae6fd' }}>
              <h4 style={{ color: '#0c4a6e', marginBottom: '15px' }}>📊 Overall Compatibility</h4>
              
              {/* Tier and Profile */}
              <div style={{ marginBottom: '15px' }}>
                {overall.tier && (
                  <div style={{ display: 'inline-block', marginRight: '15px' }}>
                    <span style={{ 
                      backgroundColor: '#0c4a6e', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: '600' 
                    }}>
                      {overall.tier}
                    </span>
                  </div>
                )}
                {overall.profile && (
                  <div style={{ color: '#374151', fontSize: '16px', fontWeight: '500', marginTop: '8px' }}>
                    {overall.profile}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#1f2937' }}>
                <div>
                  <strong style={{ color: '#0c4a6e' }}>Overall Score:</strong> <span style={{ color: '#1f2937' }}>{overall.score}%</span>
                </div>
                {overall.dominantCluster && (
                  <div>
                    <strong style={{ color: '#16a34a' }}>Strongest Area:</strong> <span style={{ color: '#1f2937' }}>{overall.dominantCluster}</span>
                  </div>
                )}
                {overall.challengeCluster && (
                  <div>
                    <strong style={{ color: '#dc2626' }}>Growth Area:</strong> <span style={{ color: '#1f2937' }}>{overall.challengeCluster}</span>
                  </div>
                )}
              </div>
              
              {/* Strength and Growth Clusters */}
              {(overall.strengthClusters?.length > 0 || overall.growthClusters?.length > 0) && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {overall.strengthClusters?.length > 0 && (
                    <div>
                      <strong style={{ color: '#16a34a' }}>Strength Areas:</strong>
                      <div style={{ marginTop: '5px' }}>
                        {overall.strengthClusters.map((cluster, idx) => (
                          <span key={idx} style={{ 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            marginRight: '6px',
                            display: 'inline-block',
                            marginBottom: '4px'
                          }}>
                            {cluster}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {overall.growthClusters?.length > 0 && (
                    <div>
                      <strong style={{ color: '#dc2626' }}>Growth Areas:</strong>
                      <div style={{ marginTop: '5px' }}>
                        {overall.growthClusters.map((cluster, idx) => (
                          <span key={idx} style={{ 
                            backgroundColor: '#fef2f2', 
                            color: '#991b1b', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            marginRight: '6px',
                            display: 'inline-block',
                            marginBottom: '4px'
                          }}>
                            {cluster}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {overall.formula && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#4b5563' }}>
                  <strong style={{ color: '#1f2937' }}>Formula:</strong> <span style={{ color: '#6b7280' }}>{overall.formula}</span>
                </div>
              )}
            </div>
          )}

          {/* Start Full Analysis Button (if not complete) */}
          {!isFullAnalysisComplete && onStartFullAnalysis && (
            <div style={{ 
              marginBottom: '30px', 
              padding: '25px', 
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', 
              borderRadius: '12px', 
              textAlign: 'center',
              border: '2px solid #d1d5db',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '20px' }}>🚀 Unlock Your Complete Analysis</h4>
              <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
                Get detailed cluster insights, keystone aspects, and personalized compatibility analysis for each dimension of your relationship.
              </p>
              <button
                onClick={onStartFullAnalysis}
                disabled={isStartingAnalysis}
                style={{
                  backgroundColor: isStartingAnalysis ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isStartingAnalysis ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  if (!isStartingAnalysis) {
                    e.target.style.backgroundColor = '#7c3aed';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isStartingAnalysis) {
                    e.target.style.backgroundColor = '#8b5cf6';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isStartingAnalysis ? (
                  <>
                    <span style={{ marginRight: '8px' }}>🔄</span>
                    Starting Analysis...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '8px' }}>✨</span>
                    Start Complete Analysis
                  </>
                )}
              </button>
            </div>
          )}

          {/* Cluster Analysis */}
          <h4 style={{ color: '#1f2937', marginBottom: '20px' }}>🎯 Five-Cluster Analysis</h4>
          {Object.entries(clusterAnalysis.clusters).map(([clusterName, clusterData]) => (
            <div key={clusterName} style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h5 style={{ color: '#1f2937', margin: 0 }}>{clusterName}</h5>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: clusterData.score >= 70 ? '#16a34a' : clusterData.score >= 40 ? '#d97706' : '#dc2626' }}>
                  {clusterData.score}%
                </div>
              </div>

              {/* Progressive disclosure: Show detailed metrics only if full analysis is complete */}
              {isFullAnalysisComplete && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '15px', fontSize: '14px' }}>
                  {clusterData.supportPct !== undefined && (
                    <div>
                      <strong style={{ color: '#16a34a' }}>Support:</strong> {clusterData.supportPct}%
                    </div>
                  )}
                  {clusterData.challengePct !== undefined && (
                    <div>
                      <strong style={{ color: '#dc2626' }}>Challenge:</strong> {clusterData.challengePct}%
                    </div>
                  )}
                  {clusterData.heatPct !== undefined && (
                    <div>
                      <strong style={{ color: '#ea580c' }}>Heat:</strong> {clusterData.heatPct}%
                    </div>
                  )}
                  {clusterData.activityPct !== undefined && (
                    <div>
                      <strong style={{ color: '#7c3aed' }}>Activity:</strong> {clusterData.activityPct}%
                    </div>
                  )}
                  {clusterData.quadrant && (
                    <div>
                      <strong style={{ color: '#6b7280' }}>Quadrant:</strong> {clusterData.quadrant}
                    </div>
                  )}
                  {clusterData.sparkElements !== undefined && (
                    <div>
                      <strong style={{ color: '#f59e0b' }}>Spark Elements:</strong> {clusterData.sparkElements}
                    </div>
                  )}
                </div>
              )}

              {/* Keystone Aspects (only for full analysis) */}
              {isFullAnalysisComplete && clusterData.keystoneAspects && clusterData.keystoneAspects.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <strong style={{ color: '#1f2937' }}>🌟 Key Factors:</strong>
                  <div style={{ marginTop: '10px' }}>
                    {clusterData.keystoneAspects.slice(0, 3).map((aspect, index) => (
                      <div key={index} style={{ 
                        marginBottom: '8px', 
                        padding: '8px 12px', 
                        backgroundColor: 'white', 
                        borderRadius: '4px',
                        fontSize: '14px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{aspect.description}</div>
                        {aspect.reason && (
                          <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                            {aspect.reason}
                          </div>
                        )}
                      </div>
                    ))}
                    {clusterData.keystoneAspects.length > 3 && (
                      <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                        ...and {clusterData.keystoneAspects.length - 3} more factors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isFullAnalysisComplete && (
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '14px', color: '#92400e' }}>
                  🔄 Complete your full analysis to unlock detailed metrics and key factors for this cluster!
                </div>
              )}
            </div>
          ))}

        </div>
      );
    }

    // Fallback to legacy analysis display if no cluster analysis
    if (!analysis || !analysis.analysis || Object.keys(analysis.analysis).length === 0) {
      return <p>No relationship analysis data available to display.</p>;
    }
  
    // Use the predefined order of keys from the enum
    const categoriesToDisplay = orderedCategoryKeys.filter(key => analysis.analysis[key]);
  
    return (
      <div className="relationship-analysis-display" style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3>Relationship Analysis Details for {userAName} and {userBName}</h3>
        
        {/* Initial Overview for legacy format */}
        {initialOverview && (
          <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8f9ff', borderRadius: '8px', border: '2px solid #e0e7ff' }}>
            <h4 style={{ color: '#3730a3', marginBottom: '15px' }}>💫 Initial Overview</h4>
            <p style={{ lineHeight: '1.6', color: '#1f2937', margin: 0, fontSize: '16px' }}>
              {initialOverview}
            </p>
          </div>
        )}
        
        {categoriesToDisplay.map(categoryKey => {
          const categoryData = analysis.analysis[categoryKey];
          
          // Check if categoryData and its panels exist
          if (categoryData && categoryData.panels) {
            const categoryLabel = RelationshipCategoriesEnum[categoryKey]?.label || categoryKey.replace(/_/g, ' ');
            const { composite, fullAnalysis, synastry } = categoryData.panels;
  
            return (
              <div key={categoryKey} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ color: '#333' }}>{categoryLabel}</h4>
                
                {synastry && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#555' }}>Synopsis:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', margin: '5px 0 0 0' }}>
                      {synastry}
                    </p>
                  </div>
                )}

                {composite && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#555' }}>Composite Analysis:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', margin: '5px 0 0 0' }}>
                      {composite}
                    </p>
                  </div>
                )}

                {fullAnalysis && (
                  <div style={{ marginTop: '5px' }}>
                    <strong style={{ color: '#555' }}>Detailed Analysis:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0', lineHeight: '1.6' }}>
                      {fullAnalysis}
                    </p>
                  </div>
                )}

                {scoreAnalysis?.[categoryKey]?.scoredItems && (
                  <ScoredItemsTable 
                    scoredItems={scoreAnalysis[categoryKey].scoredItems} 
                    categoryName={categoryLabel}
                  />
                )}
              </div>
            );
          }
          return null; // Skip rendering if data is not in the expected format
        })}
        {categoriesToDisplay.length === 0 && <p>Analysis data is present but no categories could be displayed.</p>}
      </div>
    );
  }
  
  export default RelationshipAnalysis;