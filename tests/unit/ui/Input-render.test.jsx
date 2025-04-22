import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '@components/ui/Input';

// Cleanup after each test to prevent DOM pollution
afterEach(() => {
  cleanup();
});

describe('Input - Rendering', () => {
  it('renders with basic props', () => {
    render(<Input id="test" name="test" label="Test Input" />);
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Input id="size-sm" name="size-sm" label="Size SM" size="sm" />);
    const inputSm = screen.getByRole('textbox');
    expect(inputSm).toHaveClass('px-3 py-2 text-sm leading-4');

    rerender(<Input id="size-md" name="size-md" label="Size MD" size="md" />);
    const inputMd = screen.getByRole('textbox');
    expect(inputMd).toHaveClass('px-3 py-2 text-base leading-6');

    rerender(<Input id="size-lg" name="size-lg" label="Size LG" size="lg" />);
    const inputLg = screen.getByRole('textbox');
    expect(inputLg).toHaveClass('px-4 py-3 text-lg leading-6');
  });

  it('shows required asterisk when required prop is true', () => {
    render(<Input id="required-field" name="required-field" label="Required Field" required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('handles error state correctly', () => {
    render(
      <Input 
        id="error-input"
        name="error-input"
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
        id="success-input"
        name="success-input"
        label="Success Input"
        success="Validation passed"
      />
    );
    const input = screen.getByRole('textbox');
    const successIcon = document.querySelector('svg.text-green-500');
    const successMessage = screen.getByText('Validation passed');
    
    expect(input).toBeInTheDocument();
    expect(successIcon).toBeInTheDocument();
    expect(successMessage).toHaveClass('text-green-600');
  });

  it('handles disabled state correctly', () => {
    render(<Input id="disabled-input" name="disabled-input" label="Disabled Input" disabled />);
    const disabledInput = screen.getByRole('textbox');
    expect(disabledInput).toBeDisabled();
    expect(disabledInput).toHaveClass('disabled:bg-gray-50', 'disabled:cursor-not-allowed');
  });

  it('handles disabled state correctly with no ID', () => {
    cleanup(); // Ensure previous test DOM is cleared
    render(<Input label="Disabled Input 2" disabled />);
    const disabledInput = screen.getByRole('textbox');
    expect(disabledInput).toBeDisabled();
    expect(disabledInput).toHaveClass('disabled:bg-gray-50', 'disabled:cursor-not-allowed');
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
    render(<Input id="password" name="password" label="Password" type="password" />);
    // Password inputs don't have the 'textbox' role by default, so we need to query by tag instead
    const inputElement = document.querySelector('input[type="password"]');
    expect(inputElement).toBeInTheDocument();
  });

  it('renders with proper CSS classes based on variant', () => {
    const { rerender } = render(<Input id="outlined" name="outlined" label="Outlined" variant="outlined" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-gray-300');
    
    rerender(<Input id="filled" name="filled" label="Filled" variant="filled" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-gray-100');
    
    rerender(<Input id="flushed" name="flushed" label="Flushed" variant="flushed" />);
    input = screen.getByRole('textbox');
    // Check if the input or its parent has the 'border-b-2' class
    const flushedWrapper = input.closest('.border-b-2') || input.parentElement;
    expect(
      input.classList.contains('border-b-2') ||
      (flushedWrapper && flushedWrapper.classList.contains('border-b-2'))
    ).toBe(true);
  });

  it('renders with placeholder text', () => {
    render(<Input id="placeholder-test" label="Placeholder Input" placeholder="Enter your text here" />);
    const input = screen.getByPlaceholderText('Enter your text here');
    expect(input).toBeInTheDocument();
  });

  it('renders with prefix and suffix', () => {
    // Clean up first to avoid prefix/suffix test-id duplications
    cleanup();
    render(
      <Input 
        id="amount"
        label="Amount"
        prefix={<span role="presentation">$</span>}
        suffix={<span role="presentation">.00</span>}
        aria-label="Amount input"
      />
    );
    
    // Use more specific queries to avoid duplication issues
    const prefixContainer = document.querySelector('.mr-2');
    const suffixContainer = document.querySelector('.ml-2');
    
    expect(prefixContainer).toBeInTheDocument();
    expect(suffixContainer).toBeInTheDocument();
    expect(prefixContainer.textContent).toBe('$');
    expect(suffixContainer.textContent).toBe('.00');
  });
});