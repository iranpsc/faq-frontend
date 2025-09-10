'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

interface BaseModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BaseModal({
  visible,
  title,
  subtitle,
  size = 'md',
  closable = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  onClose,
  children,
  footer,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    const handleBackdrop = (e: MouseEvent) => {
      if (closeOnBackdrop && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleBackdrop);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleBackdrop);
      document.body.style.overflow = 'unset';
    };
  }, [visible, closeOnEscape, closeOnBackdrop, onClose]);

  if (!visible) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        {/* Modal */}
        <div
          ref={modalRef}
          className={clsx(
            'relative w-full transform overflow-hidden rounded-lg bg-white shadow-xl transition-all',
            sizeClasses[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            {closable && (
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
