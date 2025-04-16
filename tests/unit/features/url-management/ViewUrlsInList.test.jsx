import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ViewUrlsInList from '@features/url-management/ViewUrlsInList';

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock the stores/lists module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn()
    },
    listUIState: {
      get: vi.fn()
    },
    addUrlToList: vi.fn(),
    updateUrl: vi.fn(),
    deleteUrl: vi.fn()
  };
});

import { useStore } from '@nanostores/react';
import { listStore, listUIState, addUrlToList, updateUrl, deleteUrl } from '@stores/lists';

describe('ViewUrlsInList', () => {
  const mockListId = '1';
  const mockUrls = [
    { id: 1, url: 'https://example.com', title: 'Example', created_at: '2023-01-01' },
    { id: 2, url: 'https://example2.com', title: 'Example 2', created_at: '2023-01-02' }
  ];
  const mockList = {
    id: 1,
    name: 'Test List',
    urls: mockUrls
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for normal tests
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [mockList], activeListId: 1 };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    // Set up function mocks
    addUrlToList.mockResolvedValue(true);
    updateUrl.mockResolvedValue(true);
    deleteUrl.mockResolvedValue(true);
    
    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn();
  });

  it('renders without crashing', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    expect(screen.getByText('URLs in List')).toBeInTheDocument();
  });

  it('displays URLs in the list', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
    expect(screen.getByText('https://example2.com')).toBeInTheDocument();
  });

  it('shows an empty state when no URLs are in the list', () => {
    // Mock an empty list
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [{ id: 1, name: 'Empty List', urls: [] }], activeListId: 1 };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    render(<ViewUrlsInList listId={mockListId} />);
    
    const emptyStateTexts = screen.getAllByText('No URLs in this list yet');
    expect(emptyStateTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Add some URLs to get started')).toBeInTheDocument();
  });

  it('allows adding a new URL', async () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Fill in the URL input
    const urlInput = screen.getByPlaceholderText('https://example.com');
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } });
    
    // Click the Add URL button
    const addButton = screen.getByText('Add URL');
    fireEvent.click(addButton);
    
    // Verify addUrlToList was called with correct parameters
    expect(addUrlToList).toHaveBeenCalledWith(mockListId, expect.objectContaining({
      url: 'https://test.com'
    }));
    
    // Verify dispatchEvent was called to refresh the list
    await waitFor(() => {
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
    });
  });

  it('shows and hides additional fields when button is clicked', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Initially additional fields should be hidden
    expect(screen.queryByText('Name', { selector: 'label' })).not.toBeInTheDocument();
    
    // Click to show additional fields
    fireEvent.click(screen.getByText('Show additional fields'));
    
    // Now the fields should be visible
    // Use getAllByText to find labels
    expect(screen.getByText('Name', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('Title', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('Description', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('Image URL', { selector: 'label' })).toBeInTheDocument();
    
    // Click to hide additional fields
    fireEvent.click(screen.getByText('Hide additional fields'));
    
    // Now the fields should be hidden again
    expect(screen.queryByText('Name', { selector: 'label' })).not.toBeInTheDocument();
  });

  it('opens edit URL dialog when edit button is clicked', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Find and click the first edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify edit dialog is open
    expect(screen.getByText('Edit URL')).toBeInTheDocument();
    expect(screen.getByText('Update details for this URL')).toBeInTheDocument();
  });

  it('opens delete URL dialog when delete button is clicked', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Find and click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify delete dialog is open
    expect(screen.getByText('Delete URL')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });

  it('allows searching URLs in the list', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Initially both URLs should be visible
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
    
    // Search for the first URL
    const searchInput = screen.getByPlaceholderText('Search URLs...');
    fireEvent.change(searchInput, { target: { value: 'example.com' } });
    
    // Now only the first URL should be in the document, not the second
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.queryByText('Example 2')).not.toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    // Mock loading state
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        // Make sure to include a valid list here to prevent "find" error
        return { lists: [mockList], activeListId: 1 };
      }
      if (store === listUIState) {
        return { isLoading: true, error: null };
      }
      return {};
    });
    
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Check for spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    // Mock error state
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        // Make sure to include a valid list here to prevent "find" error
        return { lists: [mockList], activeListId: 1 };
      }
      if (store === listUIState) {
        return { isLoading: false, error: 'Failed to load list' };
      }
      return {};
    });
    
    render(<ViewUrlsInList listId={mockListId} />);
    
    expect(screen.getByText('Failed to load list')).toBeInTheDocument();
  });
});