import React, { useState } from 'react';
import './RelationshipTabs.css';

function ChartsTab({ relationship }) {
  const [activeSubTab, setActiveSubTab] = useState('synastry');

  return (
    <div className="relationship-tab-content charts-tab">
      {/* Sub-tabs */}
      <div className="charts-sub-tabs">
        <button
          className={`sub-tab ${activeSubTab === 'synastry' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('synastry')}
        >
          Synastry
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'composite' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('composite')}
        >
          Composite
        </button>
      </div>

      {/* Content */}
      <div className="charts-content">
        {activeSubTab === 'synastry' ? (
          <div className="chart-placeholder">
            <div className="placeholder-icon">◎</div>
            <h3>Synastry Chart</h3>
            <p>The synastry chart shows how your planets interact with your partner's planets.</p>
            <p className="placeholder-note">Chart visualization coming soon</p>
          </div>
        ) : (
          <div className="chart-placeholder">
            <div className="placeholder-icon">◎</div>
            <h3>Composite Chart</h3>
            <p>The composite chart represents the relationship itself as a single entity.</p>
            <p className="placeholder-note">Chart visualization coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartsTab;
