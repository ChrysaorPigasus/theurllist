import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateNewList from './CreateNewList';
import { createList } from '../../../stores/lists';

// Import our mocks
import { mockListStore, mockListUIState, mockCreateList, resetMocks } from '../../../test/storeMocks';

// Mock the stores module
vi.mock('../../../stores/lists', () => ({
  listStore: mockListStore,
  listUIState: mockListUIState,
  createList: mockCreateList
}));

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: (store) => {
    if (store === mockListStore) {
      return { lists: [], activeListId: null };
    }
    if (store === mockListUIState) {
      return { isLoading: false, error: null };
    }
    return {};
  }
}));

describe('CreateNewList', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('renders the create list form', () => {
    render(<CreateNewList />);
    expect(screen.getByLabelText(/list name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create list/i })).toBeInTheDocument();
  });

  it('handles list creation successfully', async () => {
    // Mock the useStore implementation for this test
    const { useStore } = require('@nanostores/react');
    
    // First call - initial render state
    useStore.mockImplementationOnce((store) => {
      if (store === mockListStore) {
        return { lists: [], activeListId: null };
      }
      if (store === mockListUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    // Second call - success state after creating list
    useStore.mockImplementationOnce((store) => {
      if (store === mockListStore) {
        return { lists: [{ id: 'mock-id', name: 'Test List' }], activeListId: null };
      }
      if (store === mockListUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    // Set up the createList mock to return success
    mockCreateList.mockResolvedValueOnce({ id: 'mock-id', name: 'Test List' });
    
    render(<CreateNewList />);
    
    const input = screen.getByLabelText(/list name/i);
    const button = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'Test List' } });
    fireEvent.click(button);

    expect(mockCreateList).toHaveBeenCalledWith('Test List');
  });

  it('shows validation error for empty list name', async () => {
    render(<CreateNewList />);
    
    const button = screen.getByRole('button', { name: /create list/i });
    fireEvent.click(button);
    
    // Validation should happen client-side, no need to wait
    expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
    expect(mockCreateList).not.toHaveBeenCalled();
  });

  it('handles server errors gracefully', async () => {
    // Mock the useStore implementation for this test
    const { useStore } = require('@nanostores/react');
    
    // First call - initial render state
    useStore.mockImplementationOnce((store) => {
      if (store === mockListStore) {
        return { lists: [], activeListId: null };
      }
      if (store === mockListUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    // Second call - error state after failed creation
    useStore.mockImplementationOnce((store) => {
      if (store === mockListStore) {
        return { lists: [], activeListId: null };
      }
      if (store === mockListUIState) {
        return { isLoading: false, error: 'Failed to create list. Please try again.' };
      }
      return {};
    });
    
    // Set up the createList mock to simulate an error
    mockCreateList.mockRejectedValueOnce(new Error('Server error'));
    
    render(<CreateNewList />);
    
    const input = screen.getByLabelText(/list name/i);
    const button = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'Test List' } });
    fireEvent.click(button);
    
    expect(mockCreateList).toHaveBeenCalledWith('Test List');
  });
});