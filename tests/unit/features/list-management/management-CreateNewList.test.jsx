import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as listsStore from '@stores/lists';

// Mocks need to be defined before importing the component
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get())
}));

// Mock the stores/lists module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: [] }))
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null }))
    },
    createList: vi.fn()
  };
});

// Import the component and mocked dependencies after mock definitions
import { listStore, listUIState, createList } from '@stores/lists';
import  CreateNewList  from '@components/features/list-management/CreateNewList';


describe('CreateNewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock return values
    listStore.get.mockReturnValue({ lists: [] });
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    createList.mockResolvedValue(true);
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
    // Check for SVG spinner
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
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