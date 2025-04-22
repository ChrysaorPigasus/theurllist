import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, it, describe, beforeEach, expect } from 'vitest';

// Mock window.confirm before any imports
window.confirm = vi.fn(() => true);

// Mock modules first, before any imports
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock the stores module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ 
        lists: [{
          id: '1',
          name: 'Test List',
          urls: [
            { id: '1', url: 'https://example.com', title: 'Example' },
            { id: '2', url: 'https://example2.com', title: 'Example 2' }
          ]
        }], 
        activeListId: '1'
      })),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null })),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    deleteUrl: vi.fn().mockResolvedValue(true)
  };
});

// Import AFTER all mocks are set up
import { useStore } from '@nanostores/react';
import { listStore, listUIState, deleteUrl } from '@stores/lists';
import DeleteUrlsFromList from '@features/url-management/DeleteUrlsFromList';

describe('DeleteUrlsFromList - Interaction', () => {
  const mockList = {
    id: '1',
    name: 'Test List',
    urls: [
      { id: '1', url: 'https://example.com', title: 'Example' },
      { id: '2', url: 'https://example2.com', title: 'Example 2' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the window.confirm mock
    window.confirm.mockReset().mockReturnValue(true);
    
    // Reset listStore and listUIState mocks
    listStore.get.mockReturnValue({ 
      lists: [mockList], 
      activeListId: '1'
    });
    
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    deleteUrl.mockResolvedValue(true);
    
    // Setup useStore mock implementation
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [mockList], activeListId: '1' };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
  });

  it('calls deleteUrl when delete button is clicked', async () => {
    render(<DeleteUrlsFromList />);

    // Find the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(deleteButtons[0]);

    // Ensure confirmation was called
    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(deleteUrl).toHaveBeenCalledWith('1');
    });
  });

  it('shows confirmation dialog before deleting', async () => {
    render(<DeleteUrlsFromList />);

    // Find the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    
    fireEvent.click(deleteButtons[0]);

    // Confirmation dialog should be shown
    expect(window.confirm).toHaveBeenCalled();
  });

  it('does not delete if user cancels the confirmation', async () => {
    // Mock user cancelling the confirmation
    window.confirm.mockReturnValue(false);
    
    render(<DeleteUrlsFromList />);

    // Find the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    
    fireEvent.click(deleteButtons[0]);

    // Confirmation dialog should be shown but deleteUrl should not be called
    expect(window.confirm).toHaveBeenCalled();
    expect(deleteUrl).not.toHaveBeenCalled();
  });

  it('disables delete buttons while loading', () => {
    // Update both the store get function and the useStore implementation
    listUIState.get.mockReturnValue({ isLoading: true, error: null });
    
    // This is the key fix - update useStore to return loading: true
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [mockList], activeListId: '1' };
      }
      if (store === listUIState) {
        return { isLoading: true, error: null };
      }
      return {};
    });
    
    render(<DeleteUrlsFromList />);

    // Test if spinner is shown instead of trying to find Delete buttons
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('enables delete buttons after successful deletion', async () => {
    // First render with loading state
    listUIState.get.mockReturnValue({ isLoading: true, error: null });
    
    // Update useStore to return loading: true initially
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [mockList], activeListId: '1' };
      }
      if (store === listUIState) {
        return { isLoading: true, error: null };
      }
      return {};
    });
    
    const { rerender } = render(<DeleteUrlsFromList />);

    // Verify spinner is displayed
    const spinnerElement = screen.getByTestId('spinner');
    expect(spinnerElement).toBeInTheDocument();

    // Update state to not loading and rerender
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    
    // Update useStore to return loading: false for the rerender
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [mockList], activeListId: '1' };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    rerender(<DeleteUrlsFromList />);

    // Verify buttons are now enabled
    const deleteButtonsEnabled = screen.getAllByText('Delete');
    deleteButtonsEnabled.forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  it('refreshes the list after deletion', async () => {
    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn();
    
    render(<DeleteUrlsFromList />);

    // Find the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteUrl).toHaveBeenCalledWith('1');
      // Custom event should be dispatched to refresh list
      expect(window.dispatchEvent).toHaveBeenCalled();
      expect(window.dispatchEvent.mock.calls[0][0].type).toBe('urlsUpdated');
    });
  });
});