import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Dialog from '@components/ui/Dialog';
import Button from '@components/ui/Button';

describe('Dialog - Interaction', () => {
  it('handles primary action click', () => {
    const handlePrimary = vi.fn();
    const actions = (
      <>
        <Button onClick={handlePrimary}>Submit</Button>
        <Button variant="secondary">Cancel</Button>
      </>
    );
    
    render(
      <Dialog
        isOpen
        title="Test"
        actions={actions}
      />
    );
    
    fireEvent.click(screen.getByText('Submit'));
    expect(handlePrimary).toHaveBeenCalledTimes(1);
  });

  it('handles secondary action click', () => {
    const handleSecondary = vi.fn();
    const actions = (
      <>
        <Button>Submit</Button>
        <Button variant="secondary" onClick={handleSecondary}>Cancel</Button>
      </>
    );
    
    render(
      <Dialog
        isOpen
        title="Test"
        actions={actions}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleSecondary).toHaveBeenCalledTimes(1);
  });

  it('handles backdrop click for closing', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen onClose={handleClose} title="Test">
        Content
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Content').closest('.z-20').previousSibling);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop click when closeOnBackdropClick is false', () => {
    const handleClose = vi.fn();
    render(
      <Dialog 
        isOpen 
        onClose={handleClose} 
        title="Test"
        closeOnBackdropClick={false}
      >
        Content
      </Dialog>
    );
    
    // Using a different approach to get the backdrop element more reliably
    const backdropElement = document.querySelector('.fixed.inset-0.bg-gray-500');
    fireEvent.click(backdropElement);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Dialog 
        isOpen 
        onClose={handleClose} 
        title="Test"
        showCloseButton
      >
        Content
      </Dialog>
    );
    
    // Instead of using role and name, use a data-testid if it exists,
    // or check for a close icon button in the Dialog component
    const closeButton = document.querySelector('button[aria-label="Close"]');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('handles ESC key to close dialog', () => {
    const handleClose = vi.fn();
    render(
      <Dialog 
        isOpen 
        onClose={handleClose} 
        title="Test"
      >
        Content
      </Dialog>
    );
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on ESC key when closeOnEsc is false', () => {
    const handleClose = vi.fn();
    render(
      <Dialog 
        isOpen 
        onClose={handleClose} 
        title="Test"
        closeOnEsc={false}
      >
        Content
      </Dialog>
    );
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });
});