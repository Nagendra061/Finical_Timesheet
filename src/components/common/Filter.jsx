/**
 * Filter
 *
 * Filter dropdown selector with filter icon.
 *
 * Props:
 * @param {string} value - Current selected value
 * @param {(val: string) => void} onChange - Callback on change
 * @param {Array<{ value: string, label: string }>} options - Options list
 * @param {string} [className]
 */

import React from 'react';
import { Filter as FilterIcon } from 'lucide-react';

export const Filter = ({
  value,
  onChange,
  options = [],
  className = ''
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <FilterIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-7 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-colors cursor-pointer appearance-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
