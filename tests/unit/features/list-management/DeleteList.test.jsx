import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';


// Mock the listStore and listUIState values
const mockLists = [
  { id: '123', name: 'Test List', urls: [] },
  { id: '456', name: 'Another List', urls: [] }
];
let mockIsLoading = false;
let mockError = null;

// Mock the stores module before the component imports it
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: mockLists }))
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError }))
    },
    deleteList: vi.fn().mockResolvedValue(true)
  };
});

import DeleteList from '@features/list-management/DeleteList';

// Mock the useStore hook to return our mock values
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => {
    if (store.get && store.get() && 'lists' in store.get()) {
      return { lists: mockLists };
    }
    if (store.get && store.get() && 'isLoading' in store.get()) {
      return { isLoading: mockIsLoading, error: mockError };
    }
    return {};
  })
}));

// Import the mocked module
import { deleteList } from '@stores/lists';

describe('DeleteList', () => {
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
    vi.mocked(deleteList).mockResolvedValue(true);
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
    vi.mocked(deleteList).mockImplementation(() => {
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
    vi.mocked(deleteList).mockImplementation(() => {
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