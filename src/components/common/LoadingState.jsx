/**
 * LoadingState
 *
 * Subtle spinner and loading skeleton for asynchronous state transitions.
 *
 * Props:
 * @param {string} [message='Loading data...']
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading data...', className = '' }) => {
  return (
    <div className={`py-12 px-4 text-center rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="w-6 h-6 text-stone-600 animate-spin mb-3" />
      <p className="text-xs text-stone-500 font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
