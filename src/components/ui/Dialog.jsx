import React, { Fragment } from 'react';
import Button from './Button';

export default function Dialog({
  open = false,
  onClose,
  title,
  description,
  children,
  primaryAction,
  primaryActionText = 'Confirm',
  secondaryAction,
  secondaryActionText = 'Cancel',
  primaryButtonProps = {},
  secondaryButtonProps = {},
  danger = false,
}) {
  if (!open) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose} />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div className="mt-3 text-center sm:mt-5">
                {title && (
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </h3>
                )}
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {description}
                    </p>
                  </div>
                )}
                {children && (
                  <div className="mt-4">
                    {children}
                  </div>
                )}
              </div>
            </div>

            {(primaryAction || secondaryAction) && (
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                {primaryAction && (
                  <Button
                    onClick={primaryAction}
                    variant={danger ? 'danger' : 'primary'}
                    className="w-full sm:col-start-2"
                    {...primaryButtonProps}
                  >
                    {primaryActionText}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    onClick={secondaryAction}
                    variant="secondary"
                    className={`mt-3 w-full sm:mt-0 ${
                      primaryAction ? 'sm:col-start-1' : 'sm:col-start-2'
                    }`}
                    {...secondaryButtonProps}
                  >
                    {secondaryActionText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}