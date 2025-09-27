import React from 'react';

export default function FeatureGridSection() {
  return (
    <section className="feature-grid-section">
      <div className="feature-grid-container">

        {/* Row 1 */}
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Tap to Explain</h3>
            <p>Instant, human-sounding breakdowns for any chart element.</p>
          </div>

          <div className="feature-item">
            <h3>Relationship Library</h3>
            <p>Save partners, friends, family; switch between quick scores and full reports.</p>
          </div>

          <div className="feature-item">
            <h3>Transit Zoom</h3>
            <p>"What does Mars square Venus mean for me today?"—get context in seconds.</p>
          </div>
        </div>


        {/* Optional badge */}
        <div className="coming-soon-badge">
          Celebrity matching coming soon.
        </div>

      </div>
    </section>
  );
}