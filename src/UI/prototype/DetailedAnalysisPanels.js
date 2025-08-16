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

          {/* Synastry Panel */}
          {clusterPanels.synastryPanel && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#4f46e5', 
                marginBottom: '15px', 
                fontSize: '16px', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💫 Synastry Analysis
              </h4>
              <div style={{ 
                lineHeight: '1.7', 
                color: '#1f2937', 
                fontSize: '16px', 
                backgroundColor: '#f8f9ff', 
                padding: '20px', 
                borderRadius: '10px', 
                border: '2px solid #e0e7ff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                {clusterPanels.synastryPanel}
              </div>
            </div>
          )}

          {/* Composite Panel */}
          {clusterPanels.compositePanel && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#059669', 
                marginBottom: '15px', 
                fontSize: '16px', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌟 Composite Analysis
              </h4>
              <div style={{ 
                lineHeight: '1.7', 
                color: '#1f2937', 
                fontSize: '16px', 
                backgroundColor: '#f0f9ff', 
                padding: '20px', 
                borderRadius: '10px', 
                border: '2px solid #bae6fd',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                {clusterPanels.compositePanel}
              </div>
            </div>
          )}

          {/* Partners Perspectives */}
          {clusterPanels.partnersPerspectives && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                color: '#dc2626', 
                marginBottom: '15px', 
                fontSize: '16px', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👥 Partners' Perspectives
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {clusterPanels.partnersPerspectives.partnerA && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    border: '2px solid #fecaca',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h5 style={{ color: '#dc2626', fontSize: '15px', marginBottom: '12px', fontWeight: '600' }}>
                      {userAName || 'Partner A'}'s Perspective:
                    </h5>
                    <div style={{ 
                      lineHeight: '1.6', 
                      color: '#1f2937', 
                      fontSize: '15px'
                    }}>
                      {clusterPanels.partnersPerspectives.partnerA}
                    </div>
                  </div>
                )}
                {clusterPanels.partnersPerspectives.partnerB && (
                  <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    border: '2px solid #bae6fd',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h5 style={{ color: '#2563eb', fontSize: '15px', marginBottom: '12px', fontWeight: '600' }}>
                      {userBName || 'Partner B'}'s Perspective:
                    </h5>
                    <div style={{ 
                      lineHeight: '1.6', 
                      color: '#1f2937', 
                      fontSize: '15px'
                    }}>
                      {clusterPanels.partnersPerspectives.partnerB}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metrics Interpretation */}
          {clusterPanels.metricsInterpretation && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ 
                color: '#7c3aed', 
                marginBottom: '15px', 
                fontSize: '16px', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Metrics Interpretation
              </h4>
              <div style={{ 
                lineHeight: '1.7', 
                color: '#1f2937', 
                fontSize: '15px', 
                backgroundColor: '#faf5ff', 
                padding: '20px', 
                borderRadius: '10px', 
                border: '2px solid #e9d5ff', 
                fontStyle: 'italic',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                {clusterPanels.metricsInterpretation}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DetailedAnalysisPanels;