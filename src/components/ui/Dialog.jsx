import React, { Fragment, useEffect } from 'react';
import Button from '@ui/Button';

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = false,
}) {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose && onClose(event);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && onClose) {
      onClose(e);
    }
  };

  return (
    <Fragment>
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10" 
        aria-hidden="true" 
        onClick={handleBackdropClick}
        tabIndex={closeOnBackdropClick ? 0 : -1}
        onKeyDown={closeOnBackdropClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBackdropClick(e);
          }
        } : undefined}
        role="button"
        aria-label="Close dialog"
      />

      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? `${typeof title === 'string' ? title.replace(/\s+/g, '-') : 'dialog-title'}` : undefined}
            aria-describedby={description ? `${typeof description === 'string' ? description.replace(/\s+/g, '-') : 'dialog-description'}` : undefined}
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            {showCloseButton && (
              <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    onClick={onClose}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onClose(e);
                      }
                    }}
                    aria-label="Close"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
            )}

            <div>
              <div className="mt-3 text-center sm:mt-5">
                {title && (
                  <h3
                    id={typeof title === 'string' ? title.replace(/\s+/g, '-') : 'dialog-title'}
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <div className="mt-2">
                    <p
                      id={typeof description === 'string' ? description.replace(/\s+/g, '-') : 'dialog-description'}
                      className="text-sm text-gray-500"
                    >
                      {description}
                    </p>
                  </div>
                )}
                {children && (
                  <div className="mt-4 text-left">
                    {children}
                  </div>
                )}
              </div>
            </div>

            {actions && (
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}