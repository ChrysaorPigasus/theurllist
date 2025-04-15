import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AutomaticUrlGeneration from './AutomaticUrlGeneration';
import * as nanostores from '@nanostores/react';

// Mock the imported modules
vi.mock('../../../stores/lists', () => ({
  listStore: {
    subscribe: vi.fn(),
  },
  listUIState: {
    subscribe: vi.fn(),
  },
  updateCustomUrl: vi.fn().mockResolvedValue(true)
}));

vi.mock('../../../utils/urlGeneration', () => ({
  generateUrlSlug: vi.fn().mockReturnValue('test-generated-url'),
  validateCustomUrl: vi.fn().mockReturnValue(null) // No error by default
}));

vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Import after mocking
import { listStore, listUIState, updateCustomUrl } from '../../../stores/lists';
import { generateUrlSlug, validateCustomUrl } from '../../../utils/urlGeneration';

// Mock window.location.origin
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com'
  },
  writable: true
});

describe('AutomaticUrlGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    nanostores.useStore.mockImplementation((store) => {
      if (store === listStore) {
        return {
          lists: [{ id: '123', name: 'Test List' }],
          activeListId: '123'
        };
      }
      if (store === listUIState) {
        return {
          isLoading: false,
          error: null
        };
      }
      return {};
    });
  });
  
  it('renders the Custom URL card', () => {
    render(<AutomaticUrlGeneration listId="123" />);
    
    // Look for the card title specifically using the heading role
    const cardTitle = screen.getByRole('heading', { name: /Custom URL/i });
    expect(cardTitle).toBeInTheDocument();
    
    // Check for Generate button
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    expect(generateButton).toBeInTheDocument();
    
    // Check for Save button
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeInTheDocument();
  });
  
  it('generates a URL when the Generate button is clicked', () => {
    render(<AutomaticUrlGeneration listId="123" />);
    
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateButton);
    
    // Check that the input now has the generated value
    const input = screen.getByLabelText(/Custom URL/i);
    expect(input.value).toBe('test-generated-url');
    
    // Verify feedback message shown
    expect(screen.getByText(/URL generated/i)).toBeInTheDocument();
  });
  
  it('validates and saves a custom URL', async () => {
    render(<AutomaticUrlGeneration listId="123" />);
    
    // First generate a URL
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateButton);
    
    // Then save it
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);
    
    // Verify the updateCustomUrl function was called
    expect(updateCustomUrl).toHaveBeenCalledWith('123', 'test-generated-url');
    
    // Wait for success message
    const successMessage = await screen.findByText(/Custom URL saved successfully/i);
    expect(successMessage).toBeInTheDocument();
  });
  
  it('shows validation error when URL is invalid', () => {
    // Override the validation mock to return an error
    validateCustomUrl.mockReturnValueOnce('URL must be at least 3 characters');
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    // Set a custom URL by typing
    const input = screen.getByLabelText(/Custom URL/i);
    fireEvent.change(input, { target: { value: 'ab' } });
    
    // Try to save
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);
    
    // Check for error message
    expect(screen.getByText(/URL must be at least 3 characters/i)).toBeInTheDocument();
    
    // Verify updateCustomUrl was not called
    expect(updateCustomUrl).not.toHaveBeenCalled();
  });
  
  it('shows loading state during save operation', () => {
    // Mock loading state
    nanostores.useStore.mockImplementation((store) => {
      if (store === listStore) {
        return {
          lists: [{ id: '123', name: 'Test List' }],
          activeListId: '123'
        };
      }
      if (store === listUIState) {
        return {
          isLoading: true,
          error: null
        };
      }
      return {};
    });
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    // Check that buttons are in loading state
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    
    expect(generateButton).toHaveAttribute('disabled');
    expect(saveButton).toHaveAttribute('disabled');
  });
  
  it('shows error messages from the store', () => {
    // Mock error state
    nanostores.useStore.mockImplementation((store) => {
      if (store === listStore) {
        return {
          lists: [{ id: '123', name: 'Test List' }],
          activeListId: '123'
        };
      }
      if (store === listUIState) {
        return {
          isLoading: false,
          error: 'Failed to update list'
        };
      }
      return {};
    });
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    // Check that error is displayed
    expect(screen.getByText('Failed to update list')).toBeInTheDocument();
  });
});