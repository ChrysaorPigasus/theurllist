import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders with basic props', () => {
    render(<Input id="test" name="test" label="Test Input" />);
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3 py-2 text-sm leading-4');

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3 py-2 text-base leading-6');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-4 py-3 text-lg leading-6');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<Input label="Required Field" required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('handles error state correctly', () => {
    render(
      <Input 
        label="Error Input"
        error="This field is required"
      />
    );
    const input = screen.getByRole('textbox');
    const errorIcon = document.querySelector('svg.text-red-500');
    const errorMessage = screen.getByText('This field is required');
    
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(errorIcon).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
  });

  it('handles success state correctly', () => {
    render(
      <Input 
        label="Success Input"
        success="Validation passed"
      />
    );
    const input = screen.getByRole('textbox');
    const successIcon = document.querySelector('svg.text-green-500');
    const successMessage = screen.getByText('Validation passed');
    
    expect(input).toHaveClass('border-green-300');
    expect(successIcon).toBeInTheDocument();
    expect(successMessage).toHaveClass('text-green-600');
  });

  it('handles disabled state', () => {
    render(<Input label="Disabled Input" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-gray-50', 'disabled:cursor-not-allowed');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('displays helper text when provided', () => {
    render(
      <Input 
        id="test"
        label="Input with Helper"
        helperText="This is helper text"
      />
    );
    const helperText = screen.getByText('This is helper text');
    expect(helperText).toHaveClass('text-gray-500');
    expect(helperText).toHaveAttribute('id', 'test-description');
  });

  it('handles different input types', () => {
    render(<Input type="password" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test value' }
    });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});