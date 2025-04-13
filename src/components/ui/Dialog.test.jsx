import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from './Dialog';

describe('Dialog', () => {
  it('renders nothing when not open', () => {
    render(<Dialog title="Test Dialog">Content</Dialog>);
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Dialog open title="Test Dialog" description="Test Description">
        Dialog Content
      </Dialog>
    );
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('handles primary action click', () => {
    const handlePrimary = vi.fn();
    render(
      <Dialog
        open
        title="Test"
        primaryAction={handlePrimary}
        primaryActionText="Submit"
      />
    );
    
    fireEvent.click(screen.getByText('Submit'));
    expect(handlePrimary).toHaveBeenCalledTimes(1);
  });

  it('handles secondary action click', () => {
    const handleSecondary = vi.fn();
    render(
      <Dialog
        open
        title="Test"
        secondaryAction={handleSecondary}
        secondaryActionText="Cancel"
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleSecondary).toHaveBeenCalledTimes(1);
  });

  it('handles backdrop click for closing', () => {
    const handleClose = vi.fn();
    render(
      <Dialog open onClose={handleClose} title="Test">
        Content
      </Dialog>
    );
    
    fireEvent.click(screen.getByRole('presentation', { hidden: true }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders danger variant when specified', () => {
    render(
      <Dialog
        open
        title="Delete"
        danger
        primaryAction={() => {}}
        primaryActionText="Delete"
      />
    );
    
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies custom button props', () => {
    render(
      <Dialog
        open
        title="Test"
        primaryAction={() => {}}
        primaryButtonProps={{ 'data-testid': 'primary-btn' }}
        secondaryAction={() => {}}
        secondaryButtonProps={{ 'data-testid': 'secondary-btn' }}
      />
    );
    
    expect(screen.getByTestId('primary-btn')).toBeInTheDocument();
    expect(screen.getByTestId('secondary-btn')).toBeInTheDocument();
  });
});