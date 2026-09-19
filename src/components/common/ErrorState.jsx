/**
 * ErrorState
 *
 * Error presentation card with alert styling and retry action.
 *
 * Props:
 * @param {string} [title='Something went wrong']
 * @param {string} [message]
 * @param {() => void} [onRetry]
 */

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'An error occurred',
  message = 'Failed to load records. Please try again.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`py-10 px-4 text-center rounded-xl bg-rose-50 border border-rose-200 shadow-xs flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs text-rose-600 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="bg-white border-rose-300 text-rose-700">
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
