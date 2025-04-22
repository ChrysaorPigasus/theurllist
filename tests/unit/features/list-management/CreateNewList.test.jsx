import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the @nanostores/react module first
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock @stores/lists BEFORE importing the component
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: [] })),
      setKey: vi.fn(),
      set: vi.fn()
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null })),
      setKey: vi.fn(),
      set: vi.fn()
    },
    createList: vi.fn().mockResolvedValue({ id: '123', name: 'My New List' })
  };
});

// Import mocked modules after mocking
import { useStore } from '@nanostores/react';
import { listStore, listUIState, createList } from '@stores/lists';
import CreateNewList from '@features/list-management/CreateNewList';

describe('CreateNewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock return values
    listStore.get.mockReturnValue({ lists: [] });
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    createList.mockResolvedValue(true);
    
    // Setup useStore mock implementation
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: listStore.get().lists };
      }
      if (store === listUIState) {
        return listUIState.get();
      }
      return store.get ? store.get() : {};
    });
  });

  it('renders without crashing', () => {
    render(<CreateNewList />);
    expect(screen.getByText('Create New List')).toBeInTheDocument();
  });

  it('allows inputting a list name', () => {
    render(<CreateNewList />);
    
    const input = screen.getByPlaceholderText('Enter list name');
    fireEvent.change(input, { target: { value: 'My New List' } });
    
    expect(input.value).toBe('My New List');
  });

  it('disables the create button when input is empty', () => {
    render(<CreateNewList />);
    
    const createButton = screen.getByText('Create List');
    expect(createButton).toBeDisabled();
  });

  it('enables the create button when input has text', () => {
    render(<CreateNewList />);
    
    const input = screen.getByPlaceholderText('Enter list name');
    fireEvent.change(input, { target: { value: 'My New List' } });
    
    const createButton = screen.getByText('Create List');
    expect(createButton).not.toBeDisabled();
  });

  it('calls createList when the create button is clicked', async () => {
    render(<CreateNewList />);
    
    const input = screen.getByPlaceholderText('Enter list name');
    fireEvent.change(input, { target: { value: 'My New List' } });
    
    const createButton = screen.getByText('Create List');
    fireEvent.click(createButton);
    
    expect(createList).toHaveBeenCalledWith({
      name: 'My New List',
      title: '',
      description: '',
      slug: ''
    });
    
    await waitFor(() => {
      // Check for success feedback
      expect(screen.getByText(/List "My New List" created successfully!/)).toBeInTheDocument();
    });
  });

  it('shows loading state while creating a list', () => {
    // Mock loading state
    listUIState.get.mockReturnValue({ isLoading: true, error: null });
    
    render(<CreateNewList />);
    
    // Look for a disabled button with loading state
    const createButton = screen.getByText('Create List');
    expect(createButton).toBeDisabled();
    
    // Check for loading spinner instead of relying on role="status"
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows error message if list creation fails', () => {
    // Mock error state
    listUIState.get.mockReturnValue({ isLoading: false, error: 'List creation failed' });
    
    render(<CreateNewList />);
    
    expect(screen.getByText('List creation failed')).toBeInTheDocument();
  });

  it('clears the input after successful list creation', async () => {
    render(<CreateNewList />);
    
    const input = screen.getByPlaceholderText('Enter list name');
    fireEvent.change(input, { target: { value: 'My New List' } });
    
    const createButton = screen.getByText('Create List');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      // After successful creation, the input should be cleared
      expect(input.value).toBe('');
    });
  });
});