import React from 'react';

function DetailedAnalysisPanels({ 
  completeAnalysis, 
  userAName, 
  userBName 
}) {
  if (!completeAnalysis) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        <h3>📖 Detailed Analysis Panels</h3>
        <p>Complete your full analysis to unlock detailed cluster insights and AI-generated interpretations.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '30px', textAlign: 'center' }}>
        📖 Detailed Analysis for {userAName} and {userBName}
      </h2>
      
      {Object.entries(completeAnalysis).map(([clusterName, clusterPanels]) => (
        <div key={`complete-${clusterName}`} style={{ 
          marginBottom: '40px', 
          padding: '30px', 
          backgroundColor: '#fefefe', 
          borderRadius: '12px', 
          border: '2px solid #e5e7eb', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)' 
        }}>
          <h3 style={{ 
            color: '#1f2937', 
            marginBottom: '25px', 
            fontSize: '24px', 
            borderBottom: '3px solid #f3f4f6', 
            paddingBottom: '15px',
            textAlign: 'center'
          }}>
            {clusterName} Analysis
          </h3>

          {/* Synastry Analysis Section */}
          {clusterPanels.synastry && (
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ 
                color: '#4f46e5', 
                marginBottom: '20px', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '2px solid #e0e7ff',
                paddingBottom: '10px'
              }}>
                💫 Synastry Analysis
              </h4>
              
              {/* Support Panel */}
              {clusterPanels.synastry.supportPanel && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
                    ✅ Supportive Dynamics
                  </h5>
                  <div style={{ 
                    lineHeight: '1.7', 
                    color: '#1f2937', 
                    fontSize: '15px', 
                    backgroundColor: '#f0fdf4', 
                    padding: '18px', 
                    borderRadius: '10px', 
                    border: '2px solid #bbf7d0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {clusterPanels.synastry.supportPanel}
                  </div>
                </div>
              )}
              
              {/* Challenge Panel */}
              {clusterPanels.synastry.challengePanel && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
                    ⚡ Growth Opportunities
                  </h5>
                  <div style={{ 
                    lineHeight: '1.7', 
                    color: '#1f2937', 
                    fontSize: '15px', 
                    backgroundColor: '#fef2f2', 
                    padding: '18px', 
                    borderRadius: '10px', 
                    border: '2px solid #fecaca',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {clusterPanels.synastry.challengePanel}
                  </div>
                </div>
              )}
              
              {/* Synthesis Panel */}
              {clusterPanels.synastry.synthesisPanel && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#7c3aed', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
                    🔮 Integration & Balance
                  </h5>
                  <div style={{ 
                    lineHeight: '1.7', 
                    color: '#1f2937', 
                    fontSize: '15px', 
                    backgroundColor: '#faf5ff', 
                    padding: '18px', 
                    borderRadius: '10px', 
                    border: '2px solid #e9d5ff',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {clusterPanels.synastry.synthesisPanel}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Composite Analysis Section */}
          {clusterPanels.composite && (
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ 
                color: '#059669', 
                marginBottom: '20px', 
                fontSize: '18px', 
                fontWeight: '600', 
                borderBottom: '2px solid #bae6fd',
                paddingBottom: '10px'
              }}>
                🌟 Composite Analysis
              </h4>
              
              {/* Support Panel */}
              {clusterPanels.composite.supportPanel && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
                    ✅ Relationship Strengths
                  </h5>
                  <div style={{ 
                    lineHeight: '1.7', 
                    color: '#1f2937', 
                    fontSize: '15px', 
                    backgroundColor: '#ecfccb', 
                    padding: '18px', 
                    borderRadius: '10px', 
                    border: '2px solid #bef264',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {clusterPanels.composite.supportPanel}
                  </div>
                </div>
              )}
              
              {/* Challenge Panel */}
              {clusterPanels.composite.challengePanel && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
                    ⚡ Relationship Growth Areas
                  </h5>
                  <div style={{ 
                    lineHeight: '1.7', 
                    color: '#1f2937', 
                    fontSize: '15px', 
                    backgroundColor: '#fef2f2', 
                    padding: '18px', 
                    borderRadius: '10px', 
                    border: '2px solid #fecaca',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {clusterPanels.composite.challengePanel}
                  </div>
                </div>
              )}
              
              {/* Synthesis Panel */}
              {clusterPanels.composite.synthesisPanel && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#7c3aed', marginBottom: '10px', fontSize: '15px', fontWeight: '600' }}>
                    🔮 Unified Relationship Dynamic
                  </h5>
                  <div style={{ 
                    lineHeight: '1.7', 
                    color: '#1f2937', 
                    fontSize: '15px', 
                    backgroundColor: '#f0f9ff', 
                    padding: '18px', 
                    borderRadius: '10px', 
                    border: '2px solid #bae6fd',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    {clusterPanels.composite.synthesisPanel}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DetailedAnalysisPanels;