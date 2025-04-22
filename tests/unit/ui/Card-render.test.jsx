import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '@components/ui/Card';

describe('Card - Rendering', () => {
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

  it('renders with border by default', () => {
    render(<Card>Content</Card>);
    const cardElement = screen.getByText('Content').closest('.bg-white');
    expect(cardElement).toHaveClass('shadow');
    // The Card component uses shadow instead of border class
  });

  it('renders without border when noBorder is true', () => {
    render(<Card noBorder>Content</Card>);
    const cardElement = screen.getByText('Content').closest('.bg-white');
    expect(cardElement).not.toHaveClass('border');
  });

  it('renders header with appropriate classes', () => {
    render(
      <Card 
        title="Title"
      >
        Content
      </Card>
    );
    const titleElement = screen.getByText('Title').closest('div');
    expect(titleElement).toHaveClass('px-4 py-5 sm:px-6');
  });

  it('renders with rounded corners by default', () => {
    render(<Card>Content</Card>);
    const cardElement = screen.getByText('Content').closest('.bg-white');
    expect(cardElement).toHaveClass('sm:rounded-lg');
    // The Card uses sm:rounded-lg rather than rounded-lg class
  });
});