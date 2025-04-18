import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DeleteUrlsFromList from '@components/features/url-management/DeleteUrlsFromList';

// Mocks
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn().mockImplementation(store => {
    if (store === listStore) {
      return { lists: listStore.get().lists, activeListId: listStore.get().activeListId };
    }
    if (store === listUIState) {
      return listUIState.get();
    }
    return store.get();
  })
}));

// Mock the stores/lists module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ 
        lists: [],
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
    deleteUrl: vi.fn()
  };
});

import { listStore, listUIState, deleteUrl } from '@stores/lists';

describe('DeleteUrlsFromList', () => {
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
    listStore.get.mockReturnValue({ 
      lists: [mockList], 
      activeListId: '1'
    });
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    deleteUrl.mockResolvedValue(true);
  });

  it('renders without crashing', () => {
    render(<DeleteUrlsFromList />);
    expect(screen.getByText('Delete URLs')).toBeInTheDocument();
  });

  it('displays the URLs to be deleted', () => {
    render(<DeleteUrlsFromList />);
    
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://example2.com')).toBeInTheDocument();
  });

  it('calls deleteUrl when delete button is clicked', async () => {
    render(<DeleteUrlsFromList />);

    // Find the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteUrl).toHaveBeenCalledWith('1');
    });
  });

  it('shows loading state while deleting', () => {
    listUIState.get.mockReturnValue({ isLoading: true, error: null });
    
    render(<DeleteUrlsFromList />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error message when deletion fails', () => {
    listUIState.get.mockReturnValue({ 
      isLoading: false, 
      error: 'Failed to delete URLs' 
    });

    render(<DeleteUrlsFromList />);

    expect(screen.getByText('Failed to delete URLs')).toBeInTheDocument();
  });

  it('shows empty state when no URLs are available', () => {
    const emptyList = {
      id: '1',
      name: 'Test List',
      urls: []
    };
    
    listStore.get.mockReturnValue({ 
      lists: [emptyList], 
      activeListId: '1'
    });

    render(<DeleteUrlsFromList />);

    expect(screen.getByText('No URLs to Delete')).toBeInTheDocument();
    expect(screen.getByText('Add some URLs to your list first')).toBeInTheDocument();
  });
});