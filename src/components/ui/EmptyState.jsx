import React from 'react';
import Button from '@ui/Button';

export default function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  actionText,
  className = '',
  role = undefined,
  'aria-label': ariaLabel,
}) {
  return (
    <div className={`text-center ${className}`} role={role} aria-label={ariaLabel}>
      {Icon && (
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Icon />
        </div>
      )}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && actionText && (
        <div className="mt-6">
          <Button onClick={action} size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}