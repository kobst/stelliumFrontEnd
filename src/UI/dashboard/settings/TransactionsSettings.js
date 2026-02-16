import React, { useState, useEffect, useCallback } from 'react';
import { fetchCreditTransactions } from '../../../Utilities/api';
import './TransactionsSettings.css';

const LIMIT = 20;

function TransactionsSettings({ userId }) {
  // Filter state — initialised from URL params
  const params = new URLSearchParams(window.location.search);
  const [type, setType] = useState(params.get('txType') || 'all');
  const [startDate, setStartDate] = useState(params.get('txStart') || '');
  const [endDate, setEndDate] = useState(params.get('txEnd') || '');

  // Applied filters (only sent to API on Apply)
  const [appliedFilters, setAppliedFilters] = useState({
    type: params.get('txType') || 'all',
    startDate: params.get('txStart') || '',
    endDate: params.get('txEnd') || '',
  });

  const [transactions, setTransactions] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [exporting, setExporting] = useState(null); // 'csv' | 'pdf' | null

  // Persist filter state to URL
  const syncURL = useCallback((filters) => {
    const url = new URL(window.location);
    if (filters.type && filters.type !== 'all') {
      url.searchParams.set('txType', filters.type);
    } else {
      url.searchParams.delete('txType');
    }
    if (filters.startDate) {
      url.searchParams.set('txStart', filters.startDate);
    } else {
      url.searchParams.delete('txStart');
    }
    if (filters.endDate) {
      url.searchParams.set('txEnd', filters.endDate);
    } else {
      url.searchParams.delete('txEnd');
    }
    window.history.replaceState({}, '', url);
  }, []);

  // Fetch transactions (initial or after filter apply)
  const loadTransactions = useCallback(async (filters, cursor = null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const data = await fetchCreditTransactions({
        type: filters.type,
        limit: LIMIT,
        cursor,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      if (cursor) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTransactions(appliedFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters
  const handleApply = () => {
    const filters = { type, startDate, endDate };
    setAppliedFilters(filters);
    syncURL(filters);
    loadTransactions(filters);
  };

  // Reset filters
  const handleReset = () => {
    const defaults = { type: 'all', startDate: '', endDate: '' };
    setType('all');
    setStartDate('');
    setEndDate('');
    setAppliedFilters(defaults);
    syncURL(defaults);
    loadTransactions(defaults);
  };

  // Load more
  const handleLoadMore = () => {
    if (nextCursor) {
      loadTransactions(appliedFilters, nextCursor);
    }
  };

  // Export
  const handleExport = async (format) => {
    try {
      setExporting(format);
      const blob = await fetchCreditTransactions({
        type: appliedFilters.type,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        format,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  // Copy receipt ID
  const handleCopy = async (receiptId) => {
    try {
      await navigator.clipboard.writeText(receiptId);
      setCopiedId(receiptId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback — ignore
    }
  };

  // Skeleton rows while loading
  const renderSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="transactions-settings__skeleton-row">
          <td><div className="transactions-settings__skeleton-cell" style={{ width: '120px' }} /></td>
          <td><div className="transactions-settings__skeleton-cell" style={{ width: '70px' }} /></td>
          <td><div className="transactions-settings__skeleton-cell" style={{ width: '180px' }} /></td>
          <td><div className="transactions-settings__skeleton-cell" style={{ width: '80px' }} /></td>
          <td><div className="transactions-settings__skeleton-cell" style={{ width: '60px' }} /></td>
          <td><div className="transactions-settings__skeleton-cell" style={{ width: '100px' }} /></td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="transactions-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Transactions</h3>
      </div>

      <p className="transactions-settings__description">
        View your credit purchase and usage history.
      </p>

      {/* Filter Bar */}
      <div className="transactions-settings__filters">
        <div className="transactions-settings__filter-group">
          <label className="transactions-settings__filter-label">Type</label>
          <select
            className="transactions-settings__filter-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="purchase">Purchase</option>
            <option value="charge">Charge</option>
          </select>
        </div>

        <div className="transactions-settings__filter-group">
          <label className="transactions-settings__filter-label">Start Date</label>
          <input
            type="date"
            className="transactions-settings__filter-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="transactions-settings__filter-group">
          <label className="transactions-settings__filter-label">End Date</label>
          <input
            type="date"
            className="transactions-settings__filter-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="transactions-settings__filter-actions">
          <button className="transactions-settings__filter-btn" onClick={handleApply}>
            Apply
          </button>
          <button
            className="transactions-settings__filter-btn transactions-settings__filter-btn--reset"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Export Bar */}
      <div className="transactions-settings__export">
        <button
          className="transactions-settings__export-btn"
          onClick={() => handleExport('csv')}
          disabled={exporting || loading || transactions.length === 0}
        >
          {exporting === 'csv' ? 'Exporting...' : 'Download CSV'}
        </button>
        <button
          className="transactions-settings__export-btn"
          onClick={() => handleExport('pdf')}
          disabled={exporting || loading || transactions.length === 0}
        >
          {exporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="transactions-settings__error">
          <span>{error}</span>
          <button className="transactions-settings__retry-btn" onClick={() => loadTransactions(appliedFilters)}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="transactions-settings__table-wrapper">
        <table className="transactions-settings__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderSkeleton()
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="transactions-settings__empty">
                    <div className="transactions-settings__empty-icon">
                      {appliedFilters.type !== 'all' || appliedFilters.startDate || appliedFilters.endDate
                        ? 'No transactions match your filters.'
                        : 'No transactions yet.'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id || tx.id}>
                  <td>{new Date(tx.timestamp || tx.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`transactions-settings__type-badge transactions-settings__type-badge--${tx.type}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.description || '—'}</td>
                  <td>
                    {(() => {
                      const isPositive = tx.type === 'purchase';
                      const absAmount = Math.abs(tx.amount);
                      return (
                        <span className={isPositive
                          ? 'transactions-settings__amount--positive'
                          : 'transactions-settings__amount--negative'
                        }>
                          {isPositive ? '+' : '-'}{absAmount} credits
                        </span>
                      );
                    })()}
                  </td>
                  <td>{(tx.balance_after ?? tx.balanceAfter) != null ? (tx.balance_after ?? tx.balanceAfter) : '—'}</td>
                  <td>
                    {(() => {
                      const rid = tx.stripe_receipt_id || tx.receiptId;
                      return rid ? (
                      <span className="transactions-settings__receipt">
                        <span className="transactions-settings__receipt-id">
                          {rid}
                        </span>
                        <button
                          className="transactions-settings__copy-btn"
                          onClick={() => handleCopy(rid)}
                          title="Copy receipt ID"
                        >
                          {copiedId === rid ? 'Copied' : 'Copy'}
                        </button>
                      </span>
                    ) : (
                      '—'
                    );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {nextCursor && !loading && (
        <div className="transactions-settings__load-more">
          <button
            className="transactions-settings__load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionsSettings;
