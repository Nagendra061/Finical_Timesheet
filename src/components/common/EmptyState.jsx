/**
 * EmptyState
 *
 * Friendly empty placeholder shown when no records match filter criteria
 * or when an entity collection has no data yet.
 *
 * Props:
 * @param {string} [title='No records found']
 * @param {string} [description='Try adjusting your search or filters.']
 * @param {React.ComponentType} [icon]
 * @param {React.ReactNode} [action]
 */

import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search or filters to see more results.',
  icon: Icon = FileQuestion,
  action,
  className = ''
}) => {
  return (
    <div className={`py-12 px-4 text-center rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-stone-900 mb-1">{title}</h3>
      <p className="text-xs text-stone-500 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
