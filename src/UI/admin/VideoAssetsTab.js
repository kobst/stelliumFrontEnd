import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchAvailableDomains,
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
const DOMAIN_DRILL_FORMAT = 'domain_drill';

function formatLabel(format) {
  return format
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDomainLabel(domain) {
  if (!domain) return '';
  if (typeof domain === 'string') return domain;
  if (typeof domain === 'object') return domain.title || domain.key || '';
  return String(domain);
}

function formatCopyValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return value.title || value.text || value.key || JSON.stringify(value);
  return String(value);
}

function buildAssetMarkdown(asset) {
  const copy = asset.copy || {};
  const lines = [];
  const hook = formatCopyValue(copy.hook);
  const slides = Array.isArray(copy.slides) ? copy.slides : [];
  const caption = formatCopyValue(copy.caption);
  const hashtags = Array.isArray(copy.hashtags) ? copy.hashtags : [];

  if (hook) {
    lines.push('## Hook', hook);
  }

  if (slides.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('## Slides');
    slides.forEach((slide, index) => {
      const type = formatCopyValue(slide?.type || `Slide ${index + 1}`);
      const text = formatCopyValue(slide?.text);
      const subtext = formatCopyValue(slide?.subtext);
      lines.push(`### ${index + 1}. ${type}`);
      if (text) lines.push(text);
      if (subtext) lines.push('', subtext);
      if (index < slides.length - 1) lines.push('');
    });
  }

  if (caption) {
    if (lines.length > 0) lines.push('');
    lines.push('## Caption', caption);
  }

  if (hashtags.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('## Hashtags', hashtags.map((tag) => `#${String(tag).replace(/^#/, '')}`).join(' '));
  }

  return lines.join('\n');
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
    status: asset.status || 'draft',
    notes: asset.notes || '',
    postedUrl: asset.postedUrl || '',
  }));
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [busy, setBusy] = useState(false);
  const lastSyncedAssetIdRef = useRef(asset.id);

  // If parent supplies a new asset object, sync local state.
  useEffect(() => {
    if (lastSyncedAssetIdRef.current !== asset.id) {
      lastSyncedAssetIdRef.current = asset.id;
      setDraft({
        status: asset.status || 'draft',
        notes: asset.notes || '',
        postedUrl: asset.postedUrl || '',
      });
    }
  }, [asset]);

  const assetMarkdown = useMemo(() => buildAssetMarkdown(asset), [asset]);
  const selectedDomainLabel = formatDomainLabel(asset.selectedDomain);

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

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(assetMarkdown);
      setSaveState({ status: 'saved', message: 'Copied' });
    } catch (err) {
      setSaveState({ status: 'error', message: 'Copy failed' });
    }
  };

  return (
    <div className="va-asset-card">
      <div className="va-asset-header">
        <span className="va-asset-format">
          {formatLabel(asset.format)} · v{asset.variantIndex ?? 0}
        </span>
        <span className={`va-asset-status-pill ${draft.status}`}>{draft.status}</span>
      </div>

      <div>
        <div className="va-markdown-header">
          <div className="va-asset-field-label">Generated Copy</div>
          <button
            type="button"
            className="va-button va-button-compact"
            onClick={handleCopyMarkdown}
            disabled={!assetMarkdown}
          >
            Copy
          </button>
        </div>
        <textarea
          className="va-asset-textarea va-markdown-copy"
          rows={16}
          readOnly
          value={assetMarkdown || 'No generated copy.'}
        />
      </div>

      <div>
        <div className="va-asset-field-label">Notes</div>
        <textarea
          className="va-asset-textarea"
          rows={3}
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
        {selectedDomainLabel && <span>domain: {selectedDomainLabel}</span>}
        {asset.postedAt && <span>posted: {new Date(asset.postedAt).toLocaleString()}</span>}
      </div>
    </div>
  );
}

function VideoAssetsTab() {
  const [celebrity, setCelebrity] = useState(null);
  const [selectedFormats, setSelectedFormats] = useState(['big_three']);
  const [variantsPerFormat, setVariantsPerFormat] = useState(1);
  const [selectedDomainKey, setSelectedDomainKey] = useState('');
  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState(null);
  const [starting, setStarting] = useState(false);

  const [availableDomains, setAvailableDomains] = useState([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [domainsError, setDomainsError] = useState(null);

  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [assetsPagination, setAssetsPagination] = useState({ total: 0, limit: 50, offset: 0 });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterScope, setFilterScope] = useState('all'); // 'all' | 'celebrity' | 'job'
  const [assetLimit, setAssetLimit] = useState(50);
  const [assetOffset, setAssetOffset] = useState(0);

  const includesDomainDrill = selectedFormats.includes(DOMAIN_DRILL_FORMAT);
  const hasDomains = availableDomains.length > 0;
  const fanoutDomainDrill = includesDomainDrill && !selectedDomainKey;
  const reqAssetCount = useMemo(() => {
    const nonDrillCount = selectedFormats.filter((f) => f !== DOMAIN_DRILL_FORMAT).length * variantsPerFormat;
    if (!includesDomainDrill) return nonDrillCount;
    const drillCount = selectedDomainKey ? 1 : availableDomains.length;
    return nonDrillCount + drillCount;
  }, [selectedFormats, variantsPerFormat, includesDomainDrill, selectedDomainKey, availableDomains.length]);

  useEffect(() => {
    if (includesDomainDrill && variantsPerFormat !== 1) {
      setVariantsPerFormat(1);
    }
  }, [includesDomainDrill, variantsPerFormat]);

  // Fetch available domains whenever the selected celebrity changes.
  useEffect(() => {
    if (!celebrity?._id) {
      setAvailableDomains([]);
      setDomainsError(null);
      setDomainsLoading(false);
      setSelectedDomainKey('');
      return undefined;
    }

    let cancelled = false;
    setDomainsLoading(true);
    setDomainsError(null);
    setSelectedDomainKey('');

    fetchAvailableDomains(celebrity._id)
      .then((res) => {
        if (cancelled) return;
        setAvailableDomains(Array.isArray(res?.domains) ? res.domains : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setAvailableDomains([]);
        setDomainsError(err.message || 'Failed to load available domains');
      })
      .finally(() => {
        if (!cancelled) setDomainsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [celebrity]);

  // If the selected key is no longer available (celebrity changed), clear it.
  useEffect(() => {
    if (!selectedDomainKey) return;
    if (!availableDomains.some((d) => d.key === selectedDomainKey)) {
      setSelectedDomainKey('');
    }
  }, [availableDomains, selectedDomainKey]);

  const loadAssets = useCallback(async () => {
    setAssetsLoading(true);
    setAssetsError(null);
    try {
      const filters = { limit: assetLimit, offset: assetOffset };
      if (filterScope === 'job' && job?.id) {
        filters.jobId = job.id;
      } else if (filterScope === 'celebrity' && celebrity) {
        filters.celebrityId = celebrity._id;
      }
      if (filterStatus) filters.status = filterStatus;
      if (filterFormat) filters.format = filterFormat;
      const res = await fetchVideoAssets(filters);
      setAssets(res?.assets || []);
      setAssetsPagination(res?.pagination || { total: res?.assets?.length || 0, limit: assetLimit, offset: assetOffset });
    } catch (err) {
      setAssetsError(err.message || 'Failed to load assets');
      setAssets([]);
      setAssetsPagination({ total: 0, limit: assetLimit, offset: assetOffset });
    } finally {
      setAssetsLoading(false);
    }
  }, [assetLimit, assetOffset, celebrity, job, filterScope, filterStatus, filterFormat]);

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
    setSelectedFormats((prev) => {
      const next = prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format];
      if (format === DOMAIN_DRILL_FORMAT && !next.includes(DOMAIN_DRILL_FORMAT)) {
        setSelectedDomainKey('');
      }
      return next;
    });
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
    if (includesDomainDrill && !hasDomains) {
      setJobError('No domains available for this celebrity. Domain Drill cannot be generated.');
      return;
    }

    setStarting(true);
    setJobError(null);
    try {
      const res = await startVideoAssetJob({
        celebrityId: celebrity._id,
        formats: selectedFormats,
        variantsPerFormat,
        domainKey: includesDomainDrill && selectedDomainKey ? selectedDomainKey : null,
      });
      if (res?.job) {
        setJob(res.job);
        setFilterScope('job');
        setAssetOffset(0);
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
          <CelebrityPicker
            selected={celebrity}
            onSelect={(nextCelebrity) => {
              setCelebrity(nextCelebrity);
              setAssetOffset(0);
              if (nextCelebrity) {
                setFilterScope('celebrity');
              } else if (filterScope === 'celebrity') {
                setFilterScope('all');
              }
            }}
          />
        </div>

        <div className="va-row">
          <span className="va-label">Formats</span>
          <div className="va-checkbox-group">
            {VIDEO_ASSET_FORMATS.map((f) => {
              const isDomainDrill = f === DOMAIN_DRILL_FORMAT;
              const disabled = isDomainDrill && celebrity && !domainsLoading && !hasDomains;
              return (
                <label
                  key={f}
                  className={`va-checkbox${disabled ? ' va-checkbox-disabled' : ''}`}
                  title={disabled ? 'No domains available for this celebrity' : undefined}
                >
                  <input
                    type="checkbox"
                    checked={selectedFormats.includes(f)}
                    onChange={() => toggleFormat(f)}
                    disabled={disabled}
                  />
                  {formatLabel(f)}
                </label>
              );
            })}
          </div>
        </div>

        {includesDomainDrill && (
          <div className="va-row">
            <span className="va-label">Domain Drill domain</span>
            <select
              className="va-select"
              value={selectedDomainKey}
              onChange={(e) => setSelectedDomainKey(e.target.value)}
              disabled={!celebrity || domainsLoading || !hasDomains}
              style={{ minWidth: 260 }}
            >
              <option value="">All available domains</option>
              {availableDomains.map((domain) => (
                <option key={domain.key} value={domain.key}>
                  {domain.title}
                </option>
              ))}
            </select>
            {!celebrity && (
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                Pick a celebrity to load domains.
              </span>
            )}
            {celebrity && domainsLoading && (
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                Loading domains...
              </span>
            )}
            {celebrity && !domainsLoading && !hasDomains && !domainsError && (
              <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>
                No domains available for this celebrity.
              </span>
            )}
            {domainsError && (
              <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{domainsError}</span>
            )}
          </div>
        )}

        <div className="va-row">
          <span className="va-label">Variants per format</span>
          <select
            className="va-select"
            value={variantsPerFormat}
            onChange={(e) => setVariantsPerFormat(Number(e.target.value))}
            disabled={includesDomainDrill}
            style={{ minWidth: 100 }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
            = {reqAssetCount} asset{reqAssetCount === 1 ? '' : 's'} requested
            {fanoutDomainDrill && hasDomains ? ` (Domain Drill: one per domain × ${availableDomains.length})` : ''}
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
            onChange={(e) => {
              setFilterScope(e.target.value);
              setAssetOffset(0);
            }}
            style={{ minWidth: 180 }}
          >
            <option value="all">All generated assets</option>
            <option value="celebrity" disabled={!celebrity}>All for selected celebrity</option>
            <option value="job" disabled={!job}>From current job</option>
          </select>

          <select
            className="va-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setAssetOffset(0);
            }}
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
            onChange={(e) => {
              setFilterFormat(e.target.value);
              setAssetOffset(0);
            }}
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
            disabled={assetsLoading}
          >
            {assetsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="va-row va-pagination-row">
          <span className="va-label">Results</span>
          <span className="va-pagination-summary">
            Showing {assets.length === 0 ? 0 : assetOffset + 1}
            -{assetOffset + assets.length} of {assetsPagination.total ?? assets.length}
          </span>
          <select
            className="va-select"
            value={assetLimit}
            onChange={(e) => {
              setAssetLimit(Number(e.target.value));
              setAssetOffset(0);
            }}
            style={{ minWidth: 110 }}
          >
            {[25, 50, 100].map((n) => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          <button
            type="button"
            className="va-button"
            onClick={() => setAssetOffset(Math.max(0, assetOffset - assetLimit))}
            disabled={assetsLoading || assetOffset === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="va-button"
            onClick={() => setAssetOffset(assetOffset + assetLimit)}
            disabled={assetsLoading || assetOffset + assetLimit >= (assetsPagination.total ?? 0)}
          >
            Next
          </button>
        </div>

        {assetsError && <div className="va-error">{assetsError}</div>}

        {assets.length === 0 && !assetsLoading ? (
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
