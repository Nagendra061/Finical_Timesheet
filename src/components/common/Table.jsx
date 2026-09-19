/**
 * Table
 *
 * Clean data table container with responsive overflow, standard borders,
 * alternating row highlights, and header styling.
 *
 * Props:
 * @param {React.ReactNode} children - <thead> and <tbody> contents
 * @param {string} [className] - Additional wrapper class
 */

import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs ${className}`}>
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        {children}
      </table>
    </div>
  );
};

export default Table;
