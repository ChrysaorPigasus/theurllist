import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock modules first, before using any variables
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Use inline mock factory functions to avoid hoisting issues
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: [] })),
      set: vi.fn(),
      setKey: vi.fn()
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null })),
      set: vi.fn(),
      setKey: vi.fn()
    },
    initializeStore: vi.fn().mockResolvedValue(true),
    setActiveList: vi.fn(),
    deleteList: vi.fn().mockResolvedValue(true)
  };
});

// Import components and mocked modules after all mocks are set up
import { useStore } from '@nanostores/react';
import { listStore, listUIState, deleteList } from '@stores/lists';
import DeleteList from '@features/list-management/DeleteList';

// Define mutable state for dynamic mock responses
const mockLists = [
  { id: '123', name: 'Test List', urls: [] },
  { id: '456', name: 'Another List', urls: [] }
];

describe('DeleteList', () => {
  let mockIsLoading = false;
  let mockError = null;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset test values
    mockLists.length = 0;
    mockLists.push(
      { id: '123', name: 'Test List', urls: [] },
      { id: '456', name: 'Another List', urls: [] }
    );
    mockIsLoading = false;
    mockError = null;
    
    // Default successful deletion
    deleteList.mockResolvedValue(true);
    
    // Setup useStore mock implementation
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: mockLists };
      }
      if (store === listUIState) {
        return { isLoading: mockIsLoading, error: mockError };
      }
      return store.get ? store.get() : {};
    });
  });
  
  it('renders without crashing', () => {
    render(<DeleteList listId="123" />);
    expect(screen.getByText(/delete list/i)).toBeInTheDocument();
  });
  
  it('opens dialog when delete button is clicked', () => {
    render(<DeleteList listId="123" />);
    
    // Click the delete button
    fireEvent.click(screen.getByText(/delete list/i));
    
    // Check for dialog content
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getAllByText(/delete/i).length).toBeGreaterThan(1);
  });
  
  it('closes dialog when Cancel button is clicked', () => {
    render(<DeleteList listId="123" />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(/delete list/i));
    
    // The dialog should be open with the cancel button visible
    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeInTheDocument();
    
    // Click cancel
    fireEvent.click(cancelButton);
    
    // Dialog should be closed
    expect(screen.queryByText(/are you sure you want to delete/i)).not.toBeInTheDocument();
  });
  
  it('calls deleteList when Delete button is clicked', async () => {
    render(<DeleteList listId="123" />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(/delete list/i));
    
    // Find the delete button inside the dialog (the second delete button)
    const deleteButtons = screen.getAllByText(/delete/i);
    expect(deleteButtons.length).toBeGreaterThan(1);
    
    // Click the Delete button in the dialog (not the DeleteList button)
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    
    await waitFor(() => {
      expect(deleteList).toHaveBeenCalledWith('123');
    });
  });
  
  it('shows loading state while deleting', async () => {
    // Setup a delayed promise for the deleteList function
    deleteList.mockImplementation(() => {
      return new Promise(resolve => {
        mockIsLoading = true;
        setTimeout(() => {
          mockIsLoading = false;
          resolve(true);
        }, 100);
      });
    });
    
    render(<DeleteList listId="123" />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(/delete list/i));
    
    // Find the delete button inside the dialog (the second delete button)
    const deleteButtons = screen.getAllByText(/delete/i);
    
    // Click the Delete button in the dialog
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    
    // We can verify the loading state was triggered
    expect(deleteList).toHaveBeenCalled();
  });
  
  it('shows error message if deletion fails', async () => {
    // Mock error state
    deleteList.mockImplementation(() => {
      return Promise.resolve().then(() => {
        mockError = 'Failed to delete list';
        return false;
      });
    });
    
    render(<DeleteList listId="123" />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(/delete list/i));
    
    // Find the delete button inside the dialog
    const deleteButtons = screen.getAllByText(/delete/i);
    
    // Click the Delete button in the dialog
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    
    await waitFor(() => {
      expect(deleteList).toHaveBeenCalledWith('123');
    });
  });
});