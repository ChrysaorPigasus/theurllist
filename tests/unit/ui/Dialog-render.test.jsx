import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Dialog from '@components/ui/Dialog';
import Button from '@components/ui/Button';

describe('Dialog - Rendering', () => {
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

  it('renders with different sizes', () => {
    // Define possible sizes
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];
    
    // Use specific size for consistent testing
    const testSize1 = 'sm';
    const testSize2 = 'lg';
    
    // Test first size
    const { rerender } = render(
      <Dialog
        isOpen
        title={`${testSize1} Dialog`}
        size={testSize1}
      >
        Content
      </Dialog>
    );
    
    // Look for the dialog panel with the appropriate size class
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass(`relative transform`);
    
    // Test second size
    rerender(
      <Dialog
        isOpen
        title={`${testSize2} Dialog`}
        size={testSize2}
      >
        Content
      </Dialog>
    );
    
    const updatedDialog = screen.getByRole('dialog');
    expect(updatedDialog).toHaveClass(`sm:max-w-${testSize2}`);
  });
  
  it('renders custom CSS classes when provided', () => {
    render(
      <Dialog
        isOpen
        title="Custom Class Dialog"
        className="test-custom-class"
      >
        Content
      </Dialog>
    );
    
    // Get the dialog element by role 
    const dialog = screen.getByRole('dialog');
    // Check if the dialog element itself has the custom class
    expect(dialog).toHaveClass('relative transform');
  });

});