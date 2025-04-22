import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Card from '@components/ui/Card';

describe('Card - Interaction', () => {
  it('handles click events on the card', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    
    await user.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('allows interaction with elements inside the card', async () => {
    const buttonClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Card>
        <button onClick={buttonClick}>Click Me</button>
      </Card>
    );
    
    await user.click(screen.getByRole('button', { name: 'Click Me' }));
    expect(buttonClick).toHaveBeenCalledTimes(1);
  });

  it('applies hover styles when hovered', () => {
    render(<Card className="hover:shadow-lg">Hover Card</Card>);
    
    const card = screen.getByText('Hover Card').closest('.bg-white');
    fireEvent.mouseOver(card);
    
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('maintains interactivity when containing interactive elements', async () => {
    const cardClick = vi.fn();
    const buttonClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Card onClick={cardClick}>
        <div>Card Content</div>
        <button onClick={buttonClick}>Button</button>
      </Card>
    );
    
    // Click the button
    await user.click(screen.getByRole('button'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    
    // Click another area of the card
    await user.click(screen.getByText('Card Content'));
    expect(cardClick).toHaveBeenCalledTimes(1);
  });

  it('shows focus styles when focusable and focused', () => {
    render(
      <Card tabIndex={0} className="focus:ring-2">
        Focusable Card
      </Card>
    );
    
    // Get the card directly rather than via the text content
    const card = screen.getByText('Focusable Card').parentElement;
    fireEvent.focus(card);
    
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveClass('focus:ring-2');
  });

  it('allows keyboard navigation when focusable', async () => {
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();
    
    render(
      <Card tabIndex={0} onKeyDown={handleKeyDown}>
        Keyboard Navigable
      </Card>
    );
    
    // Get the card directly rather than via the text content
    const card = screen.getByText('Keyboard Navigable').parentElement;
    card.focus();
    
    await user.keyboard('{Enter}');
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('supports interaction with custom interactive elements in header', async () => {
    const handleHeaderClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Card 
        title={<button onClick={handleHeaderClick}>Interactive Title</button>}
      >
        Content
      </Card>
    );
    
    await user.click(screen.getByRole('button', { name: 'Interactive Title' }));
    expect(handleHeaderClick).toHaveBeenCalledTimes(1);
  });

  it('supports interaction with custom interactive elements in footer', async () => {
    const handleFooterClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Card 
        footer={<button onClick={handleFooterClick}>Footer Button</button>}
      >
        Content
      </Card>
    );
    
    await user.click(screen.getByRole('button', { name: 'Footer Button' }));
    expect(handleFooterClick).toHaveBeenCalledTimes(1);
  });
});