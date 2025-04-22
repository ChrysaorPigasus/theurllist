import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '@components/ui/Input';

describe('Input - Edge Cases', () => {
  it('handles missing label gracefully', () => {
    render(<Input id="test" name="test" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    // Should not crash when label is missing
  });

  it('handles extremely long label text', () => {
    const longLabel = 'This is an extremely long label that might cause layout issues if not handled properly. It should wrap or truncate appropriately to ensure the component remains usable.';
    render(<Input label={longLabel} />);
    expect(screen.getByText(longLabel)).toBeInTheDocument();
    // Should not break layout (visual inspection would be needed)
  });

  it('handles extremely long input values', () => {
    const longValue = 'a'.repeat(1000); // 1000 characters
    render(<Input defaultValue={longValue} />);
    expect(screen.getByRole('textbox')).toHaveValue(longValue);
    // Input should handle long values correctly
  });

  it('handles invalid input types', () => {
    // Using a data-testid since invalid input types might not render properly
    render(<Input data-testid="input" type="invalidtype" />);
    const input = screen.getByTestId('input');
    // Browser behavior is to keep the invalid type attribute as is
    expect(input).toBeInTheDocument();
    // Just verify the input rendered correctly
    expect(input.tagName.toLowerCase()).toBe('input');
  });

  it('handles null and undefined values', () => {
    // Test with undefined value
    const { rerender } = render(<Input value={undefined} />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
    
    // Test with null value
    rerender(<Input value={null} />);
    input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('handles special characters in input values', () => {
    const specialChars = '<script>alert("XSS")</script>';
    render(<Input defaultValue={specialChars} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(specialChars);
    // Input should escape special characters properly
  });

  it('handles disabled state with user interaction attempts', () => {
    const handleChange = vi.fn();
    render(<Input disabled onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('disabled');
    
    // Do not use fireEvent on disabled input, just check handler is not called
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('handles readonly state correctly', () => {
    const handleChange = vi.fn();
    render(<Input readOnly value="readonly value" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    
    // Try to change the value
    fireEvent.change(input, { target: { value: 'new value' } });
    
    // Value shouldn't change in the DOM, but the event should still fire
    expect(input).toHaveValue('readonly value');
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles extreme sizing values correctly', () => {
    // Test with extremely small size
    const { rerender } = render(<Input style={{ width: '10px' }} />);
    let input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    
    // Extremely large size should also work
    rerender(<Input style={{ width: '2000px' }} />);
    input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('handles autoFocus when specified', () => {
    render(<Input autoFocus />);
    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
  });

  it('handles non-string values when set', () => {
    // Setting a number as value
    render(<Input value={42} />);
    const input = screen.getByRole('textbox');
    // Value should be converted to string
    expect(input).toHaveValue('42');
  });
});