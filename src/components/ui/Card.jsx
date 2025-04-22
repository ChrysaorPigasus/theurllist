import React from 'react';

export default function Card({ 
  children, 
  title, 
  description,
  className = '',
  footer,
  noPadding = false,
  noBorder = false,
  href,
  action,
  role = undefined,
  onClick,
  'aria-label': ariaLabel,
  ...restProps
}) {
  const handleClick = (e) => {
    // If the click is directly on an interactive element inside the card
    // (like a button), don't trigger the card's onClick
    if (onClick) {
      // Check if the clicked element or any of its parents up to the card
      // is an interactive element (button, a, input, etc.)
      let target = e.target;
      const isInteractiveElement = (el) => {
        if (!el) return false;
        const tag = el.tagName?.toLowerCase();
        return ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
      };
      
      // Only check up to the current card element (e.currentTarget)
      while (target && target !== e.currentTarget) {
        if (isInteractiveElement(target)) {
          return; // Don't trigger card's onClick if we clicked on an interactive element
        }
        target = target.parentElement;
      }
      
      // If we get here, the click was on the card or a non-interactive element in the card
      onClick(e);
    }
  };

  const cardContent = (
    <>
      {(title || description || action) && (
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="px-4 py-5 sm:px-6">
              {title && (
                <h3 className="text-lg font-medium leading-6 text-gray-900" id="card-title">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 max-w-2xl text-sm text-gray-500" id="card-description">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="ml-4 flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={`${noPadding ? 'no-padding' : 'px-4 py-5 sm:p-6'} ${noBorder ? 'no-border' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50">
          {footer}
        </div>
      )}
    </>
  );

  const cardClasses = `bg-white shadow sm:rounded-lg overflow-hidden ${noBorder ? 'border-0' : 'border border-gray-200'} ${className}`;

  if (href) {
    return (
      <a 
        href={href} 
        className={cardClasses}
        role={role} 
        aria-label={ariaLabel}
        onClick={handleClick}
        {...restProps}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div 
      className={cardClasses} 
      role={role} 
      aria-label={ariaLabel}
      onClick={handleClick}
      {...restProps}
    >
      {cardContent}
    </div>
  );
}