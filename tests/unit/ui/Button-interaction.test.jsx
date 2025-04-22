import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@components/ui/Button';

describe('Button - Interaction', () => {
  it('handles click events when not disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click events when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('prevents click events when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button loading onClick={handleClick}>Loading</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation via tab', async () => {
    const user = userEvent.setup();
    
    render(
      <>
        <Button>First Button</Button>
        <Button>Second Button</Button>
      </>
    );
    
    // Set focus on the first button
    const firstButton = screen.getByText('First Button');
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
    
    // Tab to next button
    await user.tab();
    const secondButton = screen.getByText('Second Button');
    expect(document.activeElement).toBe(secondButton);
  });
  
  it('handles keyboard activation via Enter key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Press Enter</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('handles keyboard activation via Space key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Press Space</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('forwards additional props to button element', () => {
    render(
      <Button 
        data-testid="custom-prop"
        aria-label="Custom button"
      >
        With Custom Props
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'custom-prop');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });
  
  it('handles focus state styling', () => {
    render(<Button>Focus Me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.focus(button);
    
    expect(button).toHaveClass('focus:outline-none focus:ring-2');
  });
  
  it('handles hover state styling', () => {
    render(<Button variant="primary">Hover Me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.mouseOver(button);
    
    expect(button).toHaveClass('hover:bg-brand-700');
  });
});