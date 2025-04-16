import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

describe('Dialog', () => {
  it('renders nothing when not open', () => {
    render(<Dialog title="Test Dialog">Content</Dialog>);
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Dialog isOpen title="Test Dialog" description="Test Description">
        Dialog Content
      </Dialog>
    );
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

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

  it('renders danger variant when specified', () => {
    const actions = (
      <Button variant="danger">Delete Button</Button>
    );
    
    render(
      <Dialog
        isOpen
        title="Delete Confirmation"
        actions={actions}
      />
    );
    
    const button = screen.getByText('Delete Button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies custom button props', () => {
    const actions = (
      <>
        <Button data-testid="primary-btn">Submit</Button>
        <Button variant="secondary" data-testid="secondary-btn">Cancel</Button>
      </>
    );
    
    render(
      <Dialog
        isOpen
        title="Test"
        actions={actions}
      />
    );
    
    expect(screen.getByTestId('primary-btn')).toBeInTheDocument();
    expect(screen.getByTestId('secondary-btn')).toBeInTheDocument();
  });
});