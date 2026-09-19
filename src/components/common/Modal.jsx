/**
 * Modal
 *
 * Accessible modal dialog component with backdrop overlay and escape key dismissal.
 * Used for forms, details drawers, approval workflows, and CSV previews.
 *
 * Props:
 * @param {boolean} isOpen - Whether modal is visible
 * @param {() => void} onClose - Callback invoked on backdrop click or close button
 * @param {string} title - Primary header title
 * @param {string} [subtitle] - Contextual subtitle
 * @param {React.ReactNode} children - Modal body content
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|'4xl'|'5xl'} [maxWidth='2xl'] - Width constraint
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  }[maxWidth] || 'max-w-2xl';

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-container"
        className={`w-full ${maxWidthClass} bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            id="modal-close-button"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
