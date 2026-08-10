import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  confirmProfilePhotoUpload,
  createGuestSubject,
  fetchUser,
  getProfilePhotoPresignedUrl,
  getUserSubjects,
  uploadProfilePhotoToS3,
} from '../Utilities/api';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import AddChartModal from '../UI/dashboard/AddChartModal';
import InsufficientCreditsModal from '../UI/entitlements/InsufficientCreditsModal';
import InkNav from '../UI/ink/InkNav';
import '../styles/ink.css';
import './InkMyChartsPage.css';

const PORTRAIT_TINTS = ['blue', 'gold', 'rose', 'sage'];

function getChartName(chart) {
  return `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim() || 'Untitled Chart';
}

function getInitials(chart) {
  const first = chart?.firstName?.trim()?.[0] || '';
  const last = chart?.lastName?.trim()?.[0] || '';
  return `${first}${last}`.toUpperCase() || '✦';
}

function getSunSign(chart) {
  return chart?.birthChart?.planets?.find((planet) => planet?.name === 'Sun')?.sign || null;
}

function ChartPortrait({ chart, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = chart?.profilePhotoUrl;
  const name = getChartName(chart);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  return (
    <span className={`ink-my-charts__portrait ink-my-charts__portrait--${PORTRAIT_TINTS[index % PORTRAIT_TINTS.length]}`}>
      <span className="ink-my-charts__initials" aria-hidden="true">{getInitials(chart)}</span>
      {photoUrl && !imageFailed && (
        <img
          src={photoUrl}
          alt={`${name} portrait`}
          loading={index === 0 ? 'eager' : 'lazy'}
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}

function ChartCard({ chart, index, userId }) {
  const name = getChartName(chart);
  const sunSign = getSunSign(chart);
  const chartId = chart?._id;

  if (!chartId) return null;

  return (
    <Link
      className={`ink-my-charts__card${chart.isOwn ? ' ink-my-charts__card--active' : ''}`}
      to={`/dashboard/${userId}/chart/${chartId}`}
      aria-label={`Open ${name}'s birth chart`}
    >
      <span className="ink-my-charts__number" aria-hidden="true">{index + 1}</span>
      {chart.isOwn && (
        <span className="ink-my-charts__active-mark" title="Your active chart" aria-label="Active chart">✳</span>
      )}
      <ChartPortrait chart={chart} index={index} />
      <span className="ink-my-charts__card-info">
        <span className="ink-my-charts__name" title={name}>{name}</span>
        <span className="ink-my-charts__sign">
          {sunSign || 'Sun sign unavailable'}
        </span>
      </span>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="ink-my-charts__grid" aria-label="Loading birth charts" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div className="ink-my-charts__skeleton" key={index} aria-hidden="true">
          <span className="ink-my-charts__skeleton-portrait" />
          <span className="ink-my-charts__skeleton-line" />
          <span className="ink-my-charts__skeleton-line ink-my-charts__skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

/**
 * Standalone ink treatment for the dashboard's Charts segment.
 * Optional props make the page previewable before route integration.
 */
function InkMyChartsPage({ user: userOverride, userId: userIdOverride }) {
  const routeParams = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const userId = userIdOverride || routeParams.userId || userOverride?._id || stelliumUser?._id;
  const fallbackUser = userOverride || (stelliumUser?._id === userId ? stelliumUser : null);

  const [user, setUser] = useState(fallbackUser);
  const [guestCharts, setGuestCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creatingChart, setCreatingChart] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const addButtonRef = useRef(null);

  const entitlements = useEntitlements(user || fallbackUser);
  const credits = useEntitlementsStore((state) => state.credits);
  const fetchEntitlements = useEntitlementsStore((state) => state.fetchEntitlements);
  const applyOptimisticCreditSpend = useEntitlementsStore((state) => state.applyOptimisticCreditSpend);
  const restoreCredits = useEntitlementsStore((state) => state.restoreCredits);

  const loadCharts = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setGuestCharts([]);
      setLoadError('Sign in to view your birth chart collection.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');

    const [userResult, subjectsResult] = await Promise.allSettled([
      fetchUser(userId),
      getUserSubjects(userId),
    ]);

    if (userResult.status === 'fulfilled') {
      setUser(userResult.value);
    } else if (fallbackUser) {
      setUser(fallbackUser);
    } else {
      setUser(null);
    }

    if (subjectsResult.status === 'fulfilled') {
      const subjects = Array.isArray(subjectsResult.value) ? subjectsResult.value : [];
      setGuestCharts(subjects.filter((subject) => subject?.kind !== 'accountSelf'));
    } else {
      setGuestCharts([]);
    }

    if (userResult.status === 'rejected' && !fallbackUser && subjectsResult.status === 'rejected') {
      setLoadError('We could not load your birth charts. Please try again.');
    } else if (subjectsResult.status === 'rejected') {
      setLoadError('Your chart is here, but the rest of your collection could not be loaded.');
    } else if (userResult.status === 'rejected' && !fallbackUser) {
      setLoadError('Your saved charts loaded, but your active chart is unavailable right now.');
    }

    setLoading(false);
  }, [fallbackUser, userId]);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'My Birth Charts | Astral Gravity';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    window.requestAnimationFrame(() => addButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isAddModalOpen) return undefined;

    document.body.classList.add('ink-my-charts-modal-open');
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAddModal();
    };
    document.addEventListener('keydown', handleKeyDown);

    const frame = window.requestAnimationFrame(() => {
      const dialog = document.querySelector('.ink-my-charts__modal-skin .add-chart-modal__content');
      const closeButton = dialog?.querySelector('.add-chart-modal__close-btn');
      dialog?.setAttribute('role', 'dialog');
      dialog?.setAttribute('aria-modal', 'true');
      dialog?.setAttribute('aria-label', 'Add Birth Chart');
      closeButton?.setAttribute('aria-label', 'Close Add Birth Chart');
      closeButton?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove('ink-my-charts-modal-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeAddModal, isAddModalOpen]);

  useEffect(() => {
    if (!actionMessage) return undefined;
    const timer = window.setTimeout(() => setActionMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const allCharts = useMemo(() => {
    const ownChart = user?._id ? [{ ...user, isOwn: true }] : [];
    return [...ownChart, ...guestCharts];
  }, [guestCharts, user]);

  const handleChartSubmit = async (guestData) => {
    const cost = CREDIT_COSTS.GUEST_CHART;
    if (!entitlements?.isPlus && (credits?.total ?? 0) < cost) {
      setShowPaywall(true);
      return;
    }

    const { photoFile, ...apiData } = guestData;
    setCreatingChart({ firstName: guestData.firstName, lastName: guestData.lastName });
    setActionMessage('');

    let creditsSnapshot = null;
    try {
      if (!entitlements?.isPlus) creditsSnapshot = applyOptimisticCreditSpend(cost);
      const result = await createGuestSubject(apiData);

      if (!(result?.success || result?.userId || result?.guestSubject)) {
        throw new Error(result?.error || 'Failed to create chart');
      }

      const subjectId = result?.userId || result?.guestSubject?._id;
      let photoUploadFailed = false;
      if (photoFile && subjectId) {
        try {
          const { uploadUrl, photoKey } = await getProfilePhotoPresignedUrl(subjectId, photoFile.type);
          await uploadProfilePhotoToS3(uploadUrl, photoFile);
          await confirmProfilePhotoUpload(subjectId, photoKey);
        } catch (photoError) {
          photoUploadFailed = true;
          console.error('Photo upload failed (chart was created):', photoError);
        }
      }

      await loadCharts();
      await fetchEntitlements(userId);
      setActionMessage(
        photoUploadFailed
          ? `${guestData.firstName}'s chart was created, but the photo could not be uploaded.`
          : `${guestData.firstName}'s birth chart was created.`
      );
    } catch (error) {
      console.error('Error creating guest chart:', error);
      restoreCredits(creditsSnapshot);
      if (error?.statusCode === 402) {
        setShowPaywall(true);
      } else {
        setActionMessage(`We could not create ${guestData.firstName}'s chart. Please try again.`);
      }
    } finally {
      setCreatingChart(null);
    }
  };

  const activeCount = user?._id ? 1 : 0;
  return (
    <div className="ink-page ink-my-charts">
      <InkNav variant="app" activeSegment="charts" user={user || fallbackUser} />

      <main className="ink-my-charts__wrap">
        <header className="ink-my-charts__page-head">
          <div className="ink-my-charts__heading-group">
            <span className="ink-eyebrow">Your collection</span>
            <h1>My <span className="ink-italic">Birth Charts</span></h1>
            <hr className="ink-rule ink-rule--gold" />
          </div>
          <span className="ink-my-charts__count" aria-live="polite">
            <b>{loading ? '…' : allCharts.length}</b> charts · <b>{loading ? '…' : activeCount}</b> active
          </span>
        </header>

        {actionMessage && (
          <div className="ink-my-charts__notice" role="status">{actionMessage}</div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : (
          <>
            {loadError && (
              <div className="ink-my-charts__state" role="alert">
                <p>{loadError}</p>
                {userId && (
                  <button type="button" className="ink-my-charts__retry" onClick={loadCharts}>Try again</button>
                )}
              </div>
            )}

            {!loadError && allCharts.length === 0 && (
              <div className="ink-my-charts__state">
                <p>Your collection is waiting for its first birth chart.</p>
              </div>
            )}

            {(allCharts.length > 0 || userId) && (
              <div className="ink-my-charts__grid">
                {allCharts.map((chart, index) => (
                  <ChartCard
                    chart={chart}
                    index={index}
                    userId={userId}
                    key={chart._id || `${chart.firstName}-${chart.lastName}-${index}`}
                  />
                ))}

                <button
                  ref={addButtonRef}
                  type="button"
                  className="ink-my-charts__add-card"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <span className="ink-my-charts__plus" aria-hidden="true">＋</span>
                  <b>Add Birth Chart</b>
                </button>
              </div>
            )}
          </>
        )}

        {creatingChart && (
          <div className="ink-my-charts__creating" role="status">
            <span className="ink-my-charts__spinner" aria-hidden="true" />
            Creating chart for {creatingChart.firstName} {creatingChart.lastName}…
          </div>
        )}
      </main>

      <div className="ink-my-charts__modal-skin">
        <AddChartModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          userId={userId}
          onSubmit={handleChartSubmit}
        />
      </div>

      <InsufficientCreditsModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsNeeded={CREDIT_COSTS.GUEST_CHART}
        creditsAvailable={credits?.total ?? 0}
        onBuyCredits={() => { setShowPaywall(false); navigate('/pricingTable'); }}
        onSubscribe={() => { setShowPaywall(false); navigate('/pricingTable'); }}
      />
    </div>
  );
}

export default InkMyChartsPage;
