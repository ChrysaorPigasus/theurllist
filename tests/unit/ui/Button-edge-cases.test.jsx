import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@components/ui/Button';

describe('Button - Edge Cases', () => {
  it('handles empty children gracefully', () => {
    render(<Button />);
    // Should render without crashing, even with no children
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles non-string children', () => {
    render(
      <Button>
        <div data-testid="child-div">Complex Child</div>
      </Button>
    );
    expect(screen.getByTestId('child-div')).toBeInTheDocument();
  });

  it('handles extremely long text content', () => {
    const longText = 'This is an extremely long button text that might potentially cause layout issues if not handled properly by the component implementation.';
    render(<Button>{longText}</Button>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('handles rapid clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click Rapidly</Button>);
    const button = screen.getByRole('button');
    
    // Click multiple times rapidly
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('handles unusual props combination gracefully', () => {
    // Sending contradictory props
    render(
      <Button 
        disabled 
        loading 
        variant="primary" 
        className="custom-override"
        style={{ opacity: 1 }} // This would contradict the disabled opacity styling
      >
        Unusual Props
      </Button>
    );
    
    const button = screen.getByRole('button');
    // It should prioritize being disabled due to loading/disabled props
    expect(button).toBeDisabled();
    // But should still include all classes
    expect(button).toHaveClass('custom-override');
    // Ensure variant class is applied without hardcoding the exact class name
    expect(button.className).toMatch(/bg-.*-400/);
  });

  it('preserves default behavior when onClick is not provided', async () => {
    const user = userEvent.setup();
    render(<Button>No Handler</Button>);
    
    // Should not throw an error when clicked without a handler
    await user.click(screen.getByRole('button'));
    // Test passes if no error is thrown
  });

  it('handles non-function onClick prop gracefully', async () => {
    // This is an incorrect usage but component should handle it gracefully
    const user = userEvent.setup();
    
    // Mock console.error to prevent React warning from appearing in test output
    const originalError = console.error;
    console.error = vi.fn();
    
    try {
      // Wrap in try/catch to catch any errors during click
      const errorSpy = vi.spyOn(console, 'error');
      
      // @ts-ignore - Intentionally passing incorrect prop type
      render(<Button onClick="not a function">Invalid Handler</Button>);
      
      try {
        // Should not throw unhandled error when clicked with invalid handler type
        await user.click(screen.getByRole('button'));
      } catch (e) {
        // We expect an error might be thrown, but it should be caught and handled
        expect(e.message).toContain('onClick');
      }
      
      // We expect the console.error to be called due to the invalid prop type
      expect(errorSpy).toHaveBeenCalled();
      
    } finally {
      // Restore original console.error
      console.error = originalError;
    }
  });

  it('handles button with excessive nesting', () => {
    render(
      <Button>
        <div>
          <span>
            <strong>
              <em>Deeply Nested</em>
            </strong>
          </span>
        </div>
      </Button>
    );
    
    expect(screen.getByText('Deeply Nested')).toBeInTheDocument();
  });

  it('renders correctly with HTML entities in content', () => {
    render(<Button>Special © Characters</Button>);
    // The rendered text should contain the copyright symbol
    expect(screen.getByRole('button').textContent).toContain('Special © Characters');
  });

  it('works with very small viewports', () => {
    // Simulate a very small container
    const container = document.createElement('div');
    container.style.width = '50px';
    container.style.height = '20px';
    document.body.appendChild(container);
    
    render(<Button>Small</Button>, { container });
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Clean up
    document.body.removeChild(container);
  });
});