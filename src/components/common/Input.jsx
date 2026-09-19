/**
 * Input
 *
 * Standardized form input field with optional label, helper text, and error validation feedback.
 *
 * Props:
 * @param {string} [label] - Input label
 * @param {string} [error] - Validation error message
 * @param {string} [id] - HTML element id
 * @param {string} [className] - Additional wrapper styling
 */

import React from 'react';

export const Input = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 transition-colors ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-stone-300 focus:border-stone-500 focus:ring-stone-200'
        }`}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
