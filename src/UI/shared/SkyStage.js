import React, { useState } from 'react';
import { ChartScene } from './chartScene';
import './SkyStage.css';

/**
 * The one way the 3D chart exists in the app: as the stage. The scene
 * owns the viewport below the nav; content docks beside it in a
 * floating panel (collapsible — the panel yields, never the sky).
 *
 *   <SkyStage
 *     sceneProps={{ natal, natalAspects, ... }}
 *     panel={<HoroscopeReading ... />}
 *     footer={<TransitScrubber ... />}   // bottom-center overlay
 *     overlay={<SelectionDetail ... />}  // bottom-left overlay
 *   />
 */
function SkyStage({ sceneProps, panel, panelHeader, footer, overlay }) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [interacted, setInteracted] = useState(false);

  // the stage owns the viewport; nothing behind it should scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // the scene recenters itself in the space the panel leaves open, so
  // the whole chart and the whole text are visible at the same time
  const coveredRightPx =
    panel && panelOpen
      ? Math.min(500, (typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.44) + 40
      : 0;

  return (
    <div className="sky-stage" onPointerDown={() => setInteracted(true)}>
      <div className="sky-stage__canvas">
        <ChartScene {...sceneProps} coveredRightPx={coveredRightPx} />
      </div>

      {!interacted && !overlay && (
        <div className="sky-stage__hint">
          drag to orbit · scroll to zoom · click a planet
        </div>
      )}

      {overlay && <div className="sky-stage__overlay">{overlay}</div>}
      {footer && (
        <div
          className="sky-stage__footer"
          style={{
            // center the timeline in the uncovered sky, clear of the panel
            transform: `translateX(calc(-50% - ${coveredRightPx / 2}px))`,
          }}
        >
          {footer}
        </div>
      )}

      {panel && (
        <>
          {!panelOpen && (
            <button
              className="sky-stage__panel-toggle sky-stage__panel-toggle--closed"
              onClick={() => setPanelOpen(true)}
            >
              ⤌ Reading
            </button>
          )}
          <aside
            className={`sky-stage__panel${panelOpen ? '' : ' sky-stage__panel--hidden'}`}
          >
            <div className="sky-stage__panel-chrome">
              <div>{panelHeader}</div>
              <button
                className="sky-stage__panel-collapse"
                onClick={() => setPanelOpen(false)}
                title="Hide panel"
              >
                ⤍
              </button>
            </div>
            {panel}
          </aside>
        </>
      )}
    </div>
  );
}

export default SkyStage;
