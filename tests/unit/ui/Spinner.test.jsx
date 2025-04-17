import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '@components/ui/Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8 w-8', 'text-brand-600', 'animate-spin');
  });

  it('applies different sizes correctly', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
    const sizeClasses = {
      xs: 'h-4 w-4',
      sm: 'h-5 w-5',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    };

    sizes.forEach(size => {
      const { rerender } = render(<Spinner size={size} />);
      expect(screen.getByTestId('spinner')).toHaveClass(sizeClasses[size]);
      rerender(null);
    });
  });

  it('renders in light mode when light prop is true', () => {
    render(<Spinner light />);
    expect(screen.getByTestId('spinner')).toHaveClass('text-white');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    expect(screen.getByTestId('spinner')).toHaveClass('custom-class');
  });

  it('maintains required SVG attributes', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('fill', 'none');
    expect(spinner).toHaveAttribute('viewBox', '0 0 24 24');
    expect(spinner.querySelector('circle')).toHaveAttribute('stroke', 'currentColor');
    expect(spinner.querySelector('path')).toHaveAttribute('fill', 'currentColor');
  });
});