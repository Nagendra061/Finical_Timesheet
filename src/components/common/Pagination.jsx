/**
 * Pagination
 *
 * Provides page controls and item range indicators for paginated tables.
 * Used across Employees, Clients, Placements, Timesheets, AR, and AP views.
 *
 * Props:
 * @param {number} currentPage - Currently active page index (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total records matching filter
 * @param {number} pageSize - Number of items displayed per page
 * @param {(page: number) => void} onPageChange - Callback when user navigates
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-stone-200 sm:px-6 text-sm">
      <div className="text-stone-500 text-xs sm:text-sm">
        Showing <span className="font-medium text-stone-900">{start}</span> to{' '}
        <span className="font-medium text-stone-900">{end}</span> of{' '}
        <span className="font-medium text-stone-900">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-1">
        <button
          id="pagination-prev"
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                id={`pagination-page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium border cursor-pointer ${
                  page === currentPage
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <span key={page} className="px-1 text-stone-400">
                ...
              </span>
            );
          }
          return null;
        })}
        <button
          id="pagination-next"
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
