import React, { forwardRef } from 'react';

const variants = {
  default: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
  error: 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 text-green-900 placeholder-green-300 focus:border-green-500 focus:ring-green-500',
  filled: 'bg-gray-100 border border-gray-300 focus:bg-white',
  flushed: 'border-0 border-b-2 border-gray-300 focus:border-brand-500 rounded-none',
};

const sizes = {
  sm: 'px-3 py-2 text-sm leading-4',
  md: 'px-3 py-2 text-base leading-6',
  lg: 'px-4 py-3 text-lg leading-6',
};

const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  error,
  success,
  helperText,
  size = 'md',
  className = '',
  required = false,
  disabled = false,
  readOnly = false,
  prefix,
  suffix,
  clearable = false,
  onClear,
  onFocus,
  onBlur,
  onKeyPress,
  variant = 'default',
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-md shadow-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size];

  const handleChange = (e) => {
    if (disabled || readOnly) return;
    if (props.onChange) props.onChange(e);
  };

  // Convert null value to empty string to avoid React warnings
  const safeValue = props.value === null ? '' : props.value;
  const inputProps = { ...props };
  if (props.value !== undefined) {
    inputProps.value = safeValue;
  }

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="mt-1 relative flex items-center">
        {prefix && <span data-testid="prefix" className="mr-2">{prefix}</span>}
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`${baseClasses} ${variantClasses} ${sizeClasses}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperText ? `${id}-description` : undefined}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          {...inputProps}
        />
        {clearable && !disabled && !readOnly && (
          <button
            type="button"
            aria-label="Clear"
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={onClear}
            tabIndex={0}
            data-testid="clear-button"
          >
            ×
          </button>
        )}
        {suffix && <span data-testid="suffix" className="ml-2">{suffix}</span>}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-red-500" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-green-500" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>
      {(error || helperText || success) && (
        <p 
          className={`mt-2 text-sm ${
            error ? 'text-red-600' : 
            success ? 'text-green-600' : 
            'text-gray-500'
          }`} 
          id={`${id}-description`}
        >
          {error || helperText || success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;