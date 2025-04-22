import React from 'react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm leading-4',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base',
};

const loadingStates = {
  primary: 'bg-brand-400',
  secondary: 'bg-gray-100',
  danger: 'bg-red-400',
  success: 'bg-green-400',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  icon,
  href,
  block = false,
  rounded = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = loading ? loadingStates[variant] : variants[variant];
  const sizeClasses = sizes[size];
  const blockClasses = block ? 'w-full' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  
  const finalBaseClasses = baseClasses.replace('rounded-md', '');
  
  const buttonContent = (
    <>
      {loading ? (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </>
  );
  
  const combinedClasses = `${finalBaseClasses} ${roundedClasses} ${variantClasses} ${sizeClasses} ${blockClasses} ${className}`.trim();
  
  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={combinedClasses}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {buttonContent}
    </button>
  );
}