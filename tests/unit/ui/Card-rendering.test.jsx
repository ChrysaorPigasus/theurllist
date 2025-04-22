import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '@components/ui/Card';

describe('Card - Rendering', () => {
  it('renders correctly with default props', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with a title', () => {
    render(
      <Card title="Card Title">
        Test Content
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with a description', () => {
    render(
      <Card 
        title="Card Title" 
        description="Card Description"
      >
        Test Content
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with href as a link', () => {
    render(
      <Card 
        title="Card Title" 
        href="/test-link"
      >
        Test Content
      </Card>
    );
    // Find the link element that contains the title or content
    const linkElement = screen.getByText('Card Title').closest('a') || 
                        screen.getByText('Test Content').closest('a');
    expect(linkElement).toHaveAttribute('href', '/test-link');
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders with optional border styling', () => {
    render(
      <Card noBorder>
        Test Content
      </Card>
    );
    const cardElement = screen.getByText('Test Content').closest('div');
    expect(cardElement).toHaveClass('no-border');
  });

  it('renders with optional padding styling', () => {
    render(
      <Card noPadding>
        Test Content
      </Card>
    );
    const cardElement = screen.getByText('Test Content').closest('div');
    expect(cardElement).toHaveClass('no-padding');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        Test Content
      </Card>
    );
    // The custom className is applied to the outermost div, 
    // so we need to check the container's first child
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('renders with action component', () => {
    render(
      <Card 
        title="Card Title" 
        action={<button>Action Button</button>}
      >
        Test Content
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with footer component', () => {
    render(
      <Card 
        title="Card Title" 
        footer={<div>Footer Content</div>}
      >
        Test Content
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with custom data attributes', () => {
    render(
      <Card data-testid="custom-card">
        Test Content
      </Card>
    );
    const element = screen.getByText('Test Content').closest('[data-testid="custom-card"]');
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});