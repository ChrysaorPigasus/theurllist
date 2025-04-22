// Import modules first
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Define test data
const mockList = { 
  id: '1', 
  name: 'Test List',
  urls: [
    { id: 1, url: 'https://example.com', title: 'Example' }
  ],
  slug: 'test-list'
};

const mockEmptyList = { 
  id: '1', 
  name: 'Empty List',
  urls: []
};

// Mock modules FIRST before accessing any mocked objects
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

vi.mock('@stores/lists', () => {
  // Create mock store objects inside the factory function
  const listStore = {
    get: vi.fn(),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  };
  
  const listUIState = {
    get: vi.fn(),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  };
  
  const sharingUIState = {
    get: vi.fn(),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  };
  
  return {
    listStore,
    listUIState,
    sharingUIState,
    shareList: vi.fn(),
    getShareableUrl: vi.fn((list) => {
      if (!list) return null;
      return list.slug 
        ? `http://localhost:3000/list/${list.slug}`
        : `http://localhost:3000/list/${list.id}`;
    })
  };
});

// Import mocked modules after mocking
import ShareList from '@components/features/sharing/ShareList';
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';

// Get references to the mocked store objects
const { listStore, listUIState, sharingUIState } = listsStore;

describe('ShareList - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup window.location mock
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        ...window.location,
        origin: 'http://localhost:3000'
      }
    });
  });

  it('renders nothing when list ID is not found', () => {
    // Mock store to return a non-existent list ID
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { 
          lists: [mockList],
          activeListId: '999' // Non-existent ID
        };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      if (store === sharingUIState) {
        return { isLoading: false, error: null, isPublished: false, shareUrl: null };
      }
      return {};
    });

    const { container } = render(<ShareList listId="999" />);
    expect(container).not.toBeEmptyDOMElement(); // Should render EmptyState component
    
    // Use getAllByText instead of getByText since multiple elements match the pattern
    const emptyStateElements = screen.getAllByText(/Empty List|could not be found/i);
    expect(emptyStateElements.length).toBeGreaterThan(0);
  });

  it('shows error message when there is an error', () => {
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { 
          lists: [mockList],
          activeListId: '1'
        };
      }
      if (store === listUIState) {
        return { 
          isLoading: false,
          error: 'Failed to share list'
        };
      }
      if (store === sharingUIState) {
        return { isLoading: false, error: null, isPublished: false, shareUrl: null };
      }
      return {};
    });

    render(<ShareList listId="1" />);
    expect(screen.getByText(/Failed to share list/i)).toBeInTheDocument();
  });

  it('displays loading spinner when loading', () => {
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { 
          lists: [mockList],
          activeListId: '1'
        };
      }
      if (store === listUIState) {
        return { 
          isLoading: true,
          error: null
        };
      }
      if (store === sharingUIState) {
        return { isLoading: false, error: null, isPublished: false, shareUrl: null };
      }
      return {};
    });

    render(<ShareList listId="1" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows a message when there are no URLs in the list', () => {
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { 
          lists: [mockEmptyList],
          activeListId: '1'
        };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      if (store === sharingUIState) {
        return { isLoading: false, error: null, isPublished: false, shareUrl: null };
      }
      return {};
    });

    render(<ShareList listId="1" />);
    expect(screen.getByText(/Empty List/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no urls in this list/i)).toBeInTheDocument();
  });
});