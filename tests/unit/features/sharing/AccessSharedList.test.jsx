import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessSharedList  from '@components/features/sharing/AccessSharedList';
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';

// Mock dependencies before importing the component
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => {
    // This implementation will be overridden in beforeEach
    return {};
  })
}));

// Mock the stores module using the factory pattern
// This approach avoids hoisting issues with vi.mock
vi.mock('@stores/lists', () => {
  return {
    listStore: {},
    listUIState: {},
    initializeStore: vi.fn(),
    setActiveList: vi.fn()
  };
});

describe('AccessSharedList', () => {
  // Define test data
  const mockLists = [
    {
      id: '123',
      name: 'Test List',
      urls: [
        { id: '1', title: 'Example', url: 'https://example.com', createdAt: '2023-01-01' }
      ],
      isPublished: true
    },
    {
      id: '456',
      name: 'Private List',
      urls: [],
      isPublished: false
    }
  ];
  
  let mockActiveListId;
  let mockIsLoading;
  let mockError;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock values for each test
    mockActiveListId = null;
    mockIsLoading = false;
    mockError = null;
    
    // Set up useStore mock implementation for each test
    useStore.mockImplementation((store) => {
      if (store === listsStore.listStore) {
        return { lists: mockLists, activeListId: mockActiveListId };
      }
      if (store === listsStore.listUIState) {
        return { isLoading: mockIsLoading, error: mockError };
      }
      return {};
    });
  });

  it('initializes store and sets active list when mounted', () => {
    render(<AccessSharedList listId="123" />);
    
    expect(listsStore.initializeStore).toHaveBeenCalled();
    expect(listsStore.setActiveList).toHaveBeenCalledWith('123');
  });

  it('shows loading spinner while list is being loaded', () => {
    mockIsLoading = true;
    
    render(<AccessSharedList listId="123" />);
    
    // Use data-testid instead of role to find the spinner
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('displays the shared list when loaded successfully', () => {
    mockActiveListId = '123';
    
    render(<AccessSharedList listId="123" />);
    
    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    mockError = 'Failed to access list';
    
    render(<AccessSharedList listId="123" />);
    
    expect(screen.getByText('Failed to access list')).toBeInTheDocument();
  });

  it('shows "List Not Found" message when list does not exist', () => {
    mockActiveListId = '999'; // Non-existent list ID
    
    render(<AccessSharedList listId="999" />);
    
    expect(screen.getByText('List Not Found')).toBeInTheDocument();
  });

  it('shows "Private List" message for unpublished lists', () => {
    mockActiveListId = '456'; // The unpublished list
    
    render(<AccessSharedList listId="456" />);
    
    expect(screen.getByText('Private List')).toBeInTheDocument();
  });
});