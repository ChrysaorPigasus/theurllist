import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description correctly', () => {
    render(
      <EmptyState
        title="No items found"
        description="Start by creating a new item"
      />
    );
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Start by creating a new item')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(
      <EmptyState
        title="Test"
        description="Test description"
        icon={TestIcon}
      />
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon').closest('div')).toHaveClass('text-gray-400');
  });

  it('handles action click', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Test"
        description="Test description"
        action={handleAction}
        actionText="Create New"
      />
    );
    
    fireEvent.click(screen.getByText('Create New'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when no action or actionText provided', () => {
    render(
      <EmptyState
        title="Test"
        description="Test description"
      />
    );
    
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <EmptyState
        title="Test"
        description="Test description"
        className="custom-class"
      />
    );
    
    const container = screen.getByText('Test').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});