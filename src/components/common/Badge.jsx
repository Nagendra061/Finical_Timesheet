/**
 * Badge / StatusBadge
 *
 * Displays styled visual indicators for statuses, tags, categories, and numeric counts.
 * Used throughout Employee, Client, Timesheet, AR/AP, and Report tables and modals.
 *
 * Props:
 * @param {React.ReactNode} children - Text or content inside badge
 * @param {'neutral'|'success'|'warning'|'danger'|'info'|'purple'} [variant='neutral'] - Color scheme
 * @param {'sm'|'md'} [size='md'] - Padding and typography scale
 * @param {string} [className] - Additional Tailwind classes
 */

import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = Badge;

export default Badge;
