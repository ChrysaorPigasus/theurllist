import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title and description when provided', () => {
    render(
      <Card 
        title="Test Title" 
        description="Test Description"
      >
        Content
      </Card>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies padding by default', () => {
    render(<Card>Content</Card>);
    // In the Card component, the padding is applied to the content wrapper div, not the main card div
    const content = screen.getByText('Content').closest('div');
    expect(content).toHaveClass('px-4 py-5 sm:p-6');
  });

  it('removes padding when noPadding is true', () => {
    render(<Card noPadding>Content</Card>);
    const content = screen.getByText('Content').closest('div');
    expect(content).not.toHaveClass('px-4 py-5 sm:p-6');
  });

  it('renders footer when provided', () => {
    render(
      <Card footer={<div>Footer Content</div>}>
        Content
      </Card>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
    const footerElement = screen.getByText('Footer Content').closest('.bg-gray-50');
    expect(footerElement).toHaveClass('bg-gray-50');
  });

  it('applies custom className when provided', () => {
    render(<Card className="custom-class">Content</Card>);
    const cardElement = screen.getByText('Content').closest('.bg-white');
    expect(cardElement).toHaveClass('custom-class');
  });
});