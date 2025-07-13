import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import { useSearch } from './useSearch';

export const usePaginatedData = (fetchFunction, initialOptions = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pagination = usePagination(
    initialOptions.page || 1,
    initialOptions.limit || 20
  );

  const search = useSearch('', 500);

  const [sortBy, setSortBy] = useState(initialOptions.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState(initialOptions.sortOrder || 'asc');

  const fetchData = useCallback(async (additionalParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy,
        sortOrder,
        ...additionalParams
      };

      // Only add search if there's a search term
      if (search.debouncedSearchTerm.trim()) {
        options.search = search.debouncedSearchTerm.trim();
      }

      const result = await fetchFunction(options);
      
      if (result.success) {
        setData(result.data || []);
        pagination.updateTotalItems(result.pagination?.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
      setData([]);
      pagination.updateTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination.currentPage, pagination.itemsPerPage, search.debouncedSearchTerm, sortBy, sortOrder]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (search.debouncedSearchTerm !== search.searchTerm) {
      pagination.reset();
    }
  }, [search.debouncedSearchTerm, search.searchTerm, pagination.reset]);

  const refresh = useCallback((additionalParams = {}) => {
    fetchData(additionalParams);
  }, [fetchData]);

  const changeSort = useCallback((field, order = 'asc') => {
    setSortBy(field);
    setSortOrder(order);
    pagination.reset();
  }, [pagination.reset]);

  return {
    data,
    loading,
    error,
    pagination,
    search,
    sortBy,
    sortOrder,
    refresh,
    changeSort
  };
};