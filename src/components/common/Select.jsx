/**
 * Select
 *
 * Standardized select dropdown field with label and error validation feedback.
 *
 * Props:
 * @param {string} [label] - Select label
 * @param {string} [error] - Error message
 * @param {Array<{ value: string|number, label: string }>} [options] - Options list
 * @param {React.ReactNode} [children] - Optional raw <option> children
 * @param {string} [id] - HTML element id
 */

import React from 'react';

export const Select = ({
  label,
  error,
  options,
  children,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-stone-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 transition-colors cursor-pointer ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-stone-300 focus:border-stone-500 focus:ring-stone-200'
        }`}
        {...props}
      >
        {options
          ? options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
