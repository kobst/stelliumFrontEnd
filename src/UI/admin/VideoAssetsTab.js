import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchCelebritiesPaginated,
  fetchVideoAssetJob,
  fetchVideoAssets,
  regenerateVideoAsset,
  startVideoAssetJob,
  trashVideoAsset,
  updateVideoAsset,
  VIDEO_ASSET_FORMATS,
  VIDEO_ASSET_STATUSES,
} from '../../Utilities/adminApi';
import './VideoAssetsTab.css';

const POLL_INTERVAL_MS = 2500;
const TERMINAL_STATUSES = new Set(['completed', 'failed']);

function formatLabel(format) {
  return format
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function CelebrityPicker({ selected, onSelect }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (selected) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) {
      setResults([]);
      return undefined;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchCelebritiesPaginated({
          page: 1,
          limit: 10,
          search: term.trim(),
          sortBy: 'name',
          sortOrder: 'asc',
        });
        setResults(res?.data || []);
        setOpen(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term, selected]);

  if (selected) {
    return (
      <span className="va-selected-celebrity">
        {selected.firstName} {selected.lastName}
        <button type="button" onClick={() => onSelect(null)} aria-label="Clear celebrity">
          &times;
        </button>
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
      <input
        type="text"
        className="va-input va-input-wide"
        placeholder="Search celebrity by name..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (results.length > 0 || loading) && (
        <div className="va-celebrity-search-results">
          {loading && <div className="va-celebrity-result">Searching...</div>}
          {results.map((c) => (
            <div
              key={c._id}
              className="va-celebrity-result"
              onClick={() => {
                onSelect(c);
                setTerm('');
                setOpen(false);
                setResults([]);
              }}
            >
              {c.firstName} {c.lastName}
              {c.dateOfBirth ? ` — ${c.dateOfBirth}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset, onChanged, onRemoved }) {
  const [draft, setDraft] = useState(() => ({
    copy: asset.copy || { hook: '', slides: [], caption: '', hashtags: [] },
    status: asset.status || 'draft',
    notes: asset.notes || '',
    postedUrl: asset.postedUrl || '',
  }));
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef(null);
  const lastSyncedAssetIdRef = useRef(asset.id);

  // If parent supplies a new asset object, sync local state.
  useEffect(() => {
    if (lastSyncedAssetIdRef.current !== asset.id) {
      lastSyncedAssetIdRef.current = asset.id;
      setDraft({
        copy: asset.copy || { hook: '', slides: [], caption: '', hashtags: [] },
        status: asset.status || 'draft',
        notes: asset.notes || '',
        postedUrl: asset.postedUrl || '',
      });
    }
  }, [asset]);

  const persist = useCallback(async (patch) => {
    setSaveState({ status: 'saving', message: 'Saving...' });
    try {
      const res = await updateVideoAsset(asset.id, patch);
      if (res?.asset) onChanged(res.asset);
      setSaveState({ status: 'saved', message: 'Saved' });
    } catch (err) {
      setSaveState({ status: 'error', message: err.message || 'Save failed' });
    }
  }, [asset.id, onChanged]);

  const debouncedPersistCopy = useCallback((nextCopy) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persist({ copy: nextCopy });
    }, 800);
  }, [persist]);

  const updateCopy = (mutator) => {
    setDraft((prev) => {
      const nextCopy = mutator(prev.copy);
      debouncedPersistCopy(nextCopy);
      return { ...prev, copy: nextCopy };
    });
  };

  const updateField = (field, value, options = {}) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (options.persist !== false) persist({ [field]: value });
  };

  const handleStatusChange = (next) => {
    updateField('status', next);
  };

  const handleNotesBlur = () => {
    if (draft.notes !== (asset.notes || '')) persist({ notes: draft.notes });
  };

  const handlePostedUrlBlur = () => {
    if (draft.postedUrl !== (asset.postedUrl || '')) persist({ postedUrl: draft.postedUrl });
  };

  const handleHashtagsChange = (raw) => {
    const next = raw
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);
    updateCopy((c) => ({ ...c, hashtags: next }));
  };

  const handleSlideChange = (index, field, value) => {
    updateCopy((c) => {
      const slides = (c.slides || []).map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide,
      );
      return { ...c, slides };
    });
  };

  const handleTrash = async () => {
    if (!window.confirm('Trash this asset?')) return;
    setBusy(true);
    try {
      const res = await trashVideoAsset(asset.id);
      if (res?.asset) onRemoved(res.asset);
    } catch (err) {
      setSaveState({ status: 'error', message: err.message || 'Trash failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleRegenerate = async () => {
    setBusy(true);
    setSaveState({ status: 'saving', message: 'Queueing regeneration...' });
    try {
      const res = await regenerateVideoAsset(asset.id);
      setSaveState({
        status: 'saved',
        message: `Regen queued (job ${res?.job?.id || '...'})`,
      });
    } catch (err) {
      setSaveState({ status: 'error', message: err.message || 'Regenerate failed' });
    } finally {
      setBusy(false);
    }
  };

  const slides = draft.copy?.slides || [];
  const hashtagInputValue = (draft.copy?.hashtags || []).map((h) => `#${h}`).join(' ');

  return (
    <div className="va-asset-card">
      <div className="va-asset-header">
        <span className="va-asset-format">
          {formatLabel(asset.format)} · v{asset.variantIndex ?? 0}
        </span>
        <span className={`va-asset-status-pill ${draft.status}`}>{draft.status}</span>
      </div>

      <div>
        <div className="va-asset-field-label">Hook</div>
        <input
          type="text"
          className="va-asset-textarea"
          value={draft.copy?.hook || ''}
          onChange={(e) => updateCopy((c) => ({ ...c, hook: e.target.value }))}
        />
      </div>

      <div>
        <div className="va-asset-field-label">Slides</div>
        {slides.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>No slides.</div>
        )}
        {slides.map((slide, i) => (
          <div key={i} className="va-slide-row">
            <span className="va-slide-type">{slide.type || 'slide'}</span>
            <div className="va-slide-fields">
              <textarea
                className="va-asset-textarea"
                rows={2}
                value={slide.text || ''}
                onChange={(e) => handleSlideChange(i, 'text', e.target.value)}
                placeholder="text"
              />
              <textarea
                className="va-asset-textarea"
                rows={1}
                value={slide.subtext || ''}
                onChange={(e) => handleSlideChange(i, 'subtext', e.target.value)}
                placeholder="subtext"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="va-asset-field-label">Caption</div>
        <textarea
          className="va-asset-textarea"
          rows={2}
          value={draft.copy?.caption || ''}
          onChange={(e) => updateCopy((c) => ({ ...c, caption: e.target.value }))}
        />
      </div>

      <div>
        <div className="va-asset-field-label">Hashtags</div>
        <input
          type="text"
          className="va-asset-textarea"
          value={hashtagInputValue}
          onChange={(e) => handleHashtagsChange(e.target.value)}
          placeholder="#example #tags"
        />
      </div>

      <div>
        <div className="va-asset-field-label">Notes</div>
        <textarea
          className="va-asset-textarea"
          rows={2}
          value={draft.notes}
          onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
          onBlur={handleNotesBlur}
        />
      </div>

      <div>
        <div className="va-asset-field-label">Posted URL</div>
        <input
          type="text"
          className="va-asset-textarea"
          value={draft.postedUrl}
          onChange={(e) => setDraft((p) => ({ ...p, postedUrl: e.target.value }))}
          onBlur={handlePostedUrlBlur}
          placeholder="https://..."
        />
      </div>

      <div className="va-asset-actions">
        <select
          className="va-select"
          value={draft.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={busy}
          style={{ minWidth: 140 }}
        >
          {VIDEO_ASSET_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="button" className="va-button" onClick={handleRegenerate} disabled={busy}>
          Regenerate
        </button>
        <button
          type="button"
          className="va-button va-button-danger"
          onClick={handleTrash}
          disabled={busy}
        >
          Trash
        </button>
        <span className={`va-asset-save-status ${saveState.status === 'error' ? 'error' : ''}`}>
          {saveState.message}
        </span>
      </div>

      <div className="va-asset-meta">
        {asset.celebrityName && <span>{asset.celebrityName}</span>}
        {asset.source?.model && <span>{asset.source.model}</span>}
        {asset.source?.promptVersion && <span>{asset.source.promptVersion}</span>}
        {asset.selectedDomain && <span>domain: {asset.selectedDomain}</span>}
        {asset.postedAt && <span>posted: {new Date(asset.postedAt).toLocaleString()}</span>}
      </div>
    </div>
  );
}

function VideoAssetsTab() {
  const [celebrity, setCelebrity] = useState(null);
  const [selectedFormats, setSelectedFormats] = useState(['big_three']);
  const [variantsPerFormat, setVariantsPerFormat] = useState(1);
  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState(null);
  const [starting, setStarting] = useState(false);

  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterScope, setFilterScope] = useState('celebrity'); // 'celebrity' | 'job'

  const reqAssetCount = useMemo(
    () => selectedFormats.length * variantsPerFormat,
    [selectedFormats, variantsPerFormat],
  );

  const loadAssets = useCallback(async () => {
    if (!celebrity && !job) {
      setAssets([]);
      return;
    }
    setAssetsLoading(true);
    setAssetsError(null);
    try {
      const filters = { limit: 100 };
      if (filterScope === 'job' && job?.id) {
        filters.jobId = job.id;
      } else if (celebrity) {
        filters.celebrityId = celebrity._id;
      }
      if (filterStatus) filters.status = filterStatus;
      if (filterFormat) filters.format = filterFormat;
      const res = await fetchVideoAssets(filters);
      setAssets(res?.assets || []);
    } catch (err) {
      setAssetsError(err.message || 'Failed to load assets');
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [celebrity, job, filterScope, filterStatus, filterFormat]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Poll the active job until it reaches a terminal status.
  useEffect(() => {
    if (!job?.id) return undefined;
    if (TERMINAL_STATUSES.has(job.status)) return undefined;

    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetchVideoAssetJob(job.id);
        if (cancelled) return;
        if (res?.job) {
          setJob(res.job);
          if (TERMINAL_STATUSES.has(res.job.status)) {
            // Refresh asset list once the job ends.
            loadAssets();
          }
        }
      } catch (err) {
        if (!cancelled) setJobError(err.message || 'Failed to poll job');
      }
    };

    const timer = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [job, loadAssets]);

  const toggleFormat = (format) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  };

  const handleStartJob = async () => {
    if (!celebrity) {
      setJobError('Pick a celebrity first.');
      return;
    }
    if (selectedFormats.length === 0) {
      setJobError('Select at least one format.');
      return;
    }

    setStarting(true);
    setJobError(null);
    try {
      const res = await startVideoAssetJob({
        celebrityId: celebrity._id,
        formats: selectedFormats,
        variantsPerFormat,
      });
      if (res?.job) {
        setJob(res.job);
        setFilterScope('job');
      } else {
        throw new Error('No job returned');
      }
    } catch (err) {
      setJobError(err.message || 'Failed to start job');
    } finally {
      setStarting(false);
    }
  };

  const handleAssetChanged = (updated) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  };

  const handleAssetRemoved = (updated) => {
    // Soft delete: backend returns the asset with status=trashed.
    if (filterStatus && filterStatus !== 'trashed') {
      setAssets((prev) => prev.filter((a) => a.id !== updated.id));
    } else {
      handleAssetChanged(updated);
    }
  };

  const jobProgress = job
    ? `${job.completedAssetCount ?? 0}/${job.requestedAssetCount ?? 0}`
    : null;

  return (
    <div className="video-assets">
      <h2>Video Asset Generator</h2>

      <div className="va-section">
        <h3>New Generation Job</h3>

        <div className="va-row">
          <span className="va-label">Celebrity</span>
          <CelebrityPicker selected={celebrity} onSelect={setCelebrity} />
        </div>

        <div className="va-row">
          <span className="va-label">Formats</span>
          <div className="va-checkbox-group">
            {VIDEO_ASSET_FORMATS.map((f) => (
              <label key={f} className="va-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(f)}
                  onChange={() => toggleFormat(f)}
                />
                {formatLabel(f)}
              </label>
            ))}
          </div>
        </div>

        <div className="va-row">
          <span className="va-label">Variants per format</span>
          <select
            className="va-select"
            value={variantsPerFormat}
            onChange={(e) => setVariantsPerFormat(Number(e.target.value))}
            style={{ minWidth: 100 }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
            = {reqAssetCount} asset{reqAssetCount === 1 ? '' : 's'} requested
          </span>
        </div>

        <div className="va-row">
          <button
            type="button"
            className="va-button va-button-primary"
            onClick={handleStartJob}
            disabled={starting || !celebrity || selectedFormats.length === 0}
          >
            {starting ? 'Starting...' : 'Generate'}
          </button>
        </div>

        {jobError && <div className="va-error">{jobError}</div>}

        {job && (
          <div className="va-job-status" style={{ marginTop: 12 }}>
            <span>Job <code>{job.id}</code></span>
            <span className={`va-job-badge ${job.status}`}>{job.status}</span>
            <span>{jobProgress} done</span>
            {job.failedAssetCount > 0 && (
              <span style={{ color: '#ef4444' }}>{job.failedAssetCount} failed</span>
            )}
            {job.error && <span style={{ color: '#ef4444' }}>{job.error}</span>}
          </div>
        )}
      </div>

      <div className="va-section">
        <h3>Assets</h3>

        <div className="va-row">
          <span className="va-label">Showing</span>
          <select
            className="va-select"
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            style={{ minWidth: 180 }}
            disabled={!job}
          >
            <option value="celebrity">All for selected celebrity</option>
            <option value="job">From current job</option>
          </select>

          <select
            className="va-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">Any status</option>
            {VIDEO_ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="va-select"
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">Any format</option>
            {VIDEO_ASSET_FORMATS.map((f) => (
              <option key={f} value={f}>{formatLabel(f)}</option>
            ))}
          </select>

          <button
            type="button"
            className="va-button"
            onClick={loadAssets}
            disabled={assetsLoading || (!celebrity && !job)}
          >
            {assetsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {assetsError && <div className="va-error">{assetsError}</div>}

        {!celebrity && !job ? (
          <div className="va-empty">Pick a celebrity or start a job to view assets.</div>
        ) : assets.length === 0 && !assetsLoading ? (
          <div className="va-empty">No assets match the current filters.</div>
        ) : (
          <div className="va-asset-grid">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onChanged={handleAssetChanged}
                onRemoved={handleAssetRemoved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoAssetsTab;
