import React from 'react';

export default function Card({ 
  children, 
  title, 
  description,
  className = '',
  footer,
  noPadding = false,
}) {
  return (
    <div className={`bg-white shadow sm:rounded-lg overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-4 py-5 sm:px-6">
          {title && (
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-4 py-5 sm:p-6'}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}