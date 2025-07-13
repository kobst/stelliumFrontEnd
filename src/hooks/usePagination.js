import { useState, useMemo } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  const hasNext = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPrev = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentPage(1);
  };

  const updateTotalItems = (total) => {
    setTotalItems(total);
  };

  const changeItemsPerPage = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNext,
    hasPrev,
    goToPage,
    goToNext,
    goToPrev,
    reset,
    updateTotalItems,
    changeItemsPerPage
  };
};