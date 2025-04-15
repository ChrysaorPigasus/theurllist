import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mocks need to be defined before importing the component
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get())
}));

// Mock the stores/lists module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: [] }))
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null }))
    },
    fetchLists: vi.fn().mockResolvedValue(true)
  };
});

// Mock DeleteList since we're testing ViewAllLists in isolation
vi.mock('./DeleteList', () => ({
  default: ({ listId }) => <button data-testid={`delete-list-${listId}`}>Delete List</button>
}));

// Import the component and mocked dependencies after mock definitions
import ViewAllLists from './ViewAllLists';
import { listStore, listUIState, fetchLists } from '../../../stores/lists';

describe('ViewAllLists', () => {
  const mockLists = [
    { 
      id: 1, 
      name: 'List 1', 
      created_at: '2025-01-01T00:00:00Z',
      slug: 'list-1'
    },
    { 
      id: 2, 
      name: 'List 2', 
      created_at: '2025-01-02T00:00:00Z',
      description: 'This is a description'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock return values
    listStore.get.mockReturnValue({ lists: [] });
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    fetchLists.mockResolvedValue(true);
  });

  it('fetches lists when mounted', () => {
    render(<ViewAllLists />);
    expect(fetchLists).toHaveBeenCalled();
  });

  it('displays loading spinner while fetching lists', () => {
    // Set loading state
    listUIState.get.mockReturnValue({ isLoading: true, error: null });
    
    render(<ViewAllLists />);
    
    // Check for the spinner
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('displays lists when available', () => {
    // Set lists in store
    listStore.get.mockReturnValue({ lists: mockLists });
    
    render(<ViewAllLists />);
    
    // Should display list card with correct title
    expect(screen.getByText('Your URL Lists')).toBeInTheDocument();
    
    // Should display all lists
    expect(screen.getByText('List 1')).toBeInTheDocument();
    expect(screen.getByText('List 2')).toBeInTheDocument();
    
    // Should display description when available
    expect(screen.getByText('This is a description')).toBeInTheDocument();
    
    // Should display dates
    const date1 = new Date(mockLists[0].created_at).toLocaleDateString();
    expect(screen.getByText(`Created ${date1}`)).toBeInTheDocument();
    
    // Should display slug when available
    expect(screen.getByText('•')).toBeInTheDocument();
    expect(screen.getByText('/list-1')).toBeInTheDocument();
  });

  it('displays empty state when no lists exist', () => {
    // Ensure lists array is empty
    listStore.get.mockReturnValue({ lists: [] });
    
    render(<ViewAllLists />);
    
    expect(screen.getByText('No Lists Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first URL list to get started')).toBeInTheDocument();
  });

  it('shows error message when fetching lists fails', () => {
    // Set error state
    listUIState.get.mockReturnValue({ isLoading: false, error: 'Failed to load lists' });
    listStore.get.mockReturnValue({ lists: mockLists });
    
    render(<ViewAllLists />);
    
    expect(screen.getByText('Failed to load lists')).toBeInTheDocument();
  });
});