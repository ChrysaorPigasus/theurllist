import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock modules first, before any other imports - using direct factory functions
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Use factory function for mocking with proper structure
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      get: vi.fn(),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    sharingUIState: {
      get: vi.fn(),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
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
import { useStore } from '@nanostores/react';
import { listStore, listUIState, sharingUIState, getShareableUrl, shareList } from '@stores/lists';
import ShareList from '@features/sharing/ShareList';

describe('ShareList - Rendering', () => {
  // Define mock data
  const mockList = { 
    id: '1', 
    name: 'Test List',
    urls: [
      { id: 1, url: 'https://example.com', title: 'Example' }
    ],
    slug: 'test-list'
  };

  const mockStoreData = {
    lists: [mockList],
    activeListId: '1'
  };

  const mockUIState = {
    isLoading: false,
    error: null
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up the mock return values for useStore
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return mockStoreData;
      }
      if (store === listUIState) {
        return mockUIState;
      }
      if (store === sharingUIState) {
        return { isLoading: false, error: null, isPublished: false, shareUrl: null };
      }
      return {};
    });

    // Set up window.location.origin mock
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        ...window.location,
        origin: 'http://localhost:3000'
      }
    });
  });

  it('renders the share list component', () => {
    render(<ShareList listId="1" />);
    expect(screen.getByText(/Share List/i)).toBeInTheDocument();
    expect(screen.getByText(/Share your list with others/i)).toBeInTheDocument();
  });

  it('displays the shareable URL', () => {
    render(<ShareList listId="1" />);
    
    // Check if the input contains the expected URL
    const input = screen.getByLabelText(/Shareable URL/i);
    expect(input).toHaveValue('http://localhost:3000/list/test-list');
  });

  it('renders social sharing buttons', () => {
    render(<ShareList listId="1" />);
    
    expect(screen.getByRole('button', { name: /Copy URL/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LinkedIn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Email/i })).toBeInTheDocument();
  });
});