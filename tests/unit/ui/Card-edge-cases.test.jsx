import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '@components/ui/Card';

describe('Card - Edge Cases', () => {
  it('renders correctly without children', () => {
    render(<Card />);
    // Should render without crashing
    const cardElement = document.querySelector('.bg-white');
    expect(cardElement).toBeInTheDocument();
  });

  it('handles empty title and description', () => {
    render(
      <Card 
        title="" 
        description=""
      >
        Content
      </Card>
    );
    // Should render without crashing and still show content
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles non-string title and description', () => {
    render(
      <Card 
        title={<div data-testid="custom-title">Custom Title Component</div>} 
        description={<span data-testid="custom-desc">Custom Description Component</span>}
      >
        Content
      </Card>
    );
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
  });

  it('handles extremely long content gracefully', () => {
    const longText = 'a'.repeat(1000); // 1000 character string
    render(<Card>{longText}</Card>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('handles nested Card components', () => {
    render(
      <Card title="Outer Card">
        <div>Outer Content</div>
        <Card title="Inner Card">
          Inner Content
        </Card>
      </Card>
    );
    
    expect(screen.getByText('Outer Card')).toBeInTheDocument();
    expect(screen.getByText('Inner Card')).toBeInTheDocument();
    expect(screen.getByText('Outer Content')).toBeInTheDocument();
    expect(screen.getByText('Inner Content')).toBeInTheDocument();
  });

  it('handles extremely deep nesting of content', () => {
    render(
      <Card>
        <div>
          <div>
            <div>
              <div>
                <div>
                  <div>Deeply Nested Content</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
    
    expect(screen.getByText('Deeply Nested Content')).toBeInTheDocument();
  });

  it('gracefully handles boolean children', () => {
    // @ts-ignore - Intentionally testing incorrect usage
    render(<Card>{true}</Card>);
    // Should render without crashing
    const cardElement = document.querySelector('.bg-white');
    expect(cardElement).toBeInTheDocument();
  });

  it('gracefully handles null children', () => {
    render(<Card>{null}</Card>);
    // Should render without crashing
    const cardElement = document.querySelector('.bg-white');
    expect(cardElement).toBeInTheDocument();
  });

  it('handles multiple children correctly', () => {
    render(
      <Card>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </Card>
    );
    
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  it('renders correctly with unconventional class combinations', () => {
    render(
      <Card 
        className="text-center uppercase text-3xl font-bold text-red-500 animate-pulse"
        noPadding 
        noBorder
      >
        Styled Content
      </Card>
    );
    
    const cardElement = screen.getByText('Styled Content').closest('.bg-white');
    expect(cardElement).toHaveClass('text-center');
    expect(cardElement).toHaveClass('uppercase');
    expect(cardElement).not.toHaveClass('border');
  });

  it('handles malformed HTML in children', () => {
    render(
      <Card>
        <div dangerouslySetInnerHTML={{ __html: '<p>Valid HTML</p><p unclosed>' }} />
      </Card>
    );
    
    // Should render without crashing
    expect(screen.getByText('Valid HTML')).toBeInTheDocument();
  });
});