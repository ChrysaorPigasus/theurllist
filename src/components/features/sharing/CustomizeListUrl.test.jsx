import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Define the mock functions before vi.mock calls
const mockUpdateCustomUrl = vi.fn();
const mockValidateCustomUrl = vi.fn();

// Mock the stores module 
vi.mock('../../../stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn()
    },
    updateCustomUrl: (...args) => mockUpdateCustomUrl(...args)
  };
});

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: (store) => {
    if (store.mockId === 'listStore') {
      return { 
        lists: store.mockLists || [], 
        activeListId: store.mockActiveListId || null
      };
    }
    if (store.mockId === 'listUIState') {
      return { 
        isLoading: store.mockIsLoading || false,
        error: store.mockError || null
      };
    }
    return {};
  }
}));

// Mock the utility functions
vi.mock('../../../utils/urlGeneration', () => ({
  validateCustomUrl: (url) => mockValidateCustomUrl(url)
}));

// Import the component after all mocks are defined
import CustomizeListUrl from './CustomizeListUrl';
// Import the mocked modules to have access to the mock functions
import { listStore, listUIState } from '../../../stores/lists';

describe('CustomizeListUrl', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    customUrl: 'test-url'
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStore.mockId = 'listStore';
    listStore.mockLists = [mockList];
    listStore.mockActiveListId = '123';
    
    listUIState.mockId = 'listUIState';
    listUIState.mockIsLoading = false;
    listUIState.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
    mockUpdateCustomUrl.mockReset();
    mockValidateCustomUrl.mockReset();
    mockValidateCustomUrl.mockImplementation(() => null); // no validation error by default
  });

  it('renders the customize URL form', () => {
    render(<CustomizeListUrl listId="123" />);
    
    expect(screen.getByText('Customize URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update url/i })).toBeInTheDocument();
  });

  it('displays the current custom URL if it exists', async () => {
    // Set the initial customUrl to empty to avoid React warnings
    const { rerender } = render(<CustomizeListUrl listId="123" />);
    
    // Set a new custom URL
    const input = screen.getByLabelText('Custom URL');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test-url' } });
    });
    
    expect(input).toHaveValue('test-url');
  });

  it('updates the custom URL when form is submitted', async () => {
    mockUpdateCustomUrl.mockResolvedValueOnce(true);
    
    render(<CustomizeListUrl listId="123" />);
    
    // Change the custom URL
    const urlInput = screen.getByLabelText('Custom URL');
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'new-custom-url' } });
    });
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /update url/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });
    
    expect(mockUpdateCustomUrl).toHaveBeenCalledWith('123', 'new-custom-url');
    
    // Verify the success message via the Input component
    await waitFor(() => {
      const input = screen.getByLabelText('Custom URL');
      expect(input.getAttribute('aria-invalid')).toBe('false');
    });
  });

  it('validates the custom URL format', async () => {
    mockValidateCustomUrl.mockReturnValue('URL must contain only lowercase letters, numbers, and hyphens');
    
    render(<CustomizeListUrl listId="123" />);
    
    // Enter invalid URL (with spaces and special characters)
    const urlInput = screen.getByLabelText('Custom URL');
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'invalid url!' } });
    });
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /update url/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });
    
    // Should not call updateCustomUrl
    expect(mockUpdateCustomUrl).not.toHaveBeenCalled();
    expect(mockValidateCustomUrl).toHaveBeenCalledWith('invalid url!');
  });

  it('validates the minimum length of custom URL', async () => {
    mockValidateCustomUrl.mockReturnValue('URL must be at least 3 characters long');
    
    render(<CustomizeListUrl listId="123" />);
    
    // Enter URL that's too short
    const urlInput = screen.getByLabelText('Custom URL');
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'ab' } });
    });
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /update url/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });
    
    // Should not call updateCustomUrl
    expect(mockUpdateCustomUrl).not.toHaveBeenCalled();
    expect(mockValidateCustomUrl).toHaveBeenCalledWith('ab');
  });

  it('shows loading state when updating URL', async () => {
    // Setup a promise that doesn't resolve immediately
    let resolvePromise;
    const updatePromise = new Promise(resolve => { resolvePromise = resolve; });
    mockUpdateCustomUrl.mockReturnValueOnce(updatePromise);
    
    // Mock the loading state
    listUIState.mockIsLoading = true;
    
    render(<CustomizeListUrl listId="123" />);
    
    // Change the custom URL
    const urlInput = screen.getByLabelText('Custom URL');
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'new-custom-url' } });
    });
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /update url/i });
    expect(updateButton).toBeDisabled();
    
    // Resolve the promise
    await act(async () => {
      resolvePromise(true);
      await updatePromise;
    });
  });

  it('handles API errors gracefully', async () => {
    listUIState.mockError = 'Failed to update URL';
    
    render(<CustomizeListUrl listId="123" />);
    
    // Should show error message
    expect(screen.getByText('Failed to update URL')).toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStore.mockLists = [];
    
    const { container } = render(<CustomizeListUrl listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});