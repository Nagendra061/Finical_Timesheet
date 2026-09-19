/**
 * SearchBar
 *
 * Search input field with search icon and clear button.
 *
 * Props:
 * @param {string} value - Current query
 * @param {(val: string) => void} onChange - Callback on input change
 * @param {string} [placeholder='Search...'] - Placeholder text
 * @param {string} [className]
 */

import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 p-1 rounded-md text-stone-400 hover:text-stone-600 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
