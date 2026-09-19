/**
 * Button
 *
 * Reusable button component with styled variants (primary, secondary, danger, outline, ghost).
 * Preserves Tailwind color schemes and interactive hover/focus states.
 *
 * Props:
 * @param {React.ReactNode} children
 * @param {'primary'|'secondary'|'danger'|'outline'|'ghost'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {boolean} [disabled]
 * @param {string} [type='button']
 * @param {() => void} [onClick]
 * @param {string} [className]
 */

import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-stone-400';

  const variants = {
    primary: 'bg-stone-900 text-white hover:bg-stone-800 shadow-xs',
    secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs',
    outline: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 shadow-2xs',
    ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
