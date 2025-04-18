import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareList from '@components/features/sharing/ShareList';
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';

// Mock window.open and window.location
const originalWindow = { ...window };
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
});
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '' }
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

// Define mock data first
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

// Mock stores
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => {
    if (store === listsStore.listStore) {
      return mockStoreData;
    }
    if (store === listsStore.listUIState) {
      return mockUIState;
    }
    if (store === listsStore.sharingUIState) {
      return { isLoading: false, error: null, isPublished: false, shareUrl: null };
    }
    return {};
  })
}));

// Mock the stores/lists module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => mockStoreData),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      get: vi.fn(() => mockUIState),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    sharingUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null, isPublished: false, shareUrl: null })),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    shareList: vi.fn().mockResolvedValue(true),
    getShareableUrl: vi.fn((list) => {
      if (!list) return null;
      return list.slug 
        ? `http://localhost:3000/list/${list.slug}`
        : `http://localhost:3000/list/${list.id}`;
    })
  };
});

describe('ShareList', () => {
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
      if (store === listsStore.listStore) {
        return mockStoreData;
      }
      if (store === listsStore.listUIState) {
        return mockUIState;
      }
      return {};
    });

    // Reset mocked functions
    window.open.mockReset();
    window.location.href = '';
    navigator.clipboard.writeText.mockReset();
    navigator.clipboard.writeText.mockResolvedValue(undefined);
  });

  it('renders the share list component', () => {
    render(<ShareList listId="1" />);
    expect(screen.getByText(/Share List/i)).toBeInTheDocument();
    expect(screen.getByText(/Share your list with others/i)).toBeInTheDocument();
  });

  it('displays the shareable URL', () => {
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        ...window.location,
        origin: 'http://localhost:3000'
      }
    });

    render(<ShareList listId="1" />);
    
    // Check if the input contains the expected URL
    const input = screen.getByLabelText(/Shareable URL/i);
    expect(input).toHaveValue('http://localhost:3000/list/test-list');
  });

  it('copies URL to clipboard when Copy URL button is clicked', async () => {
    render(<ShareList listId="1" />);
    
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText(/URL copied to clipboard!/i)).toBeInTheDocument();
    });
  });

  it('opens Twitter share dialog when Twitter button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    fireEvent.click(twitterButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'));
  });

  it('opens LinkedIn share dialog when LinkedIn button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const linkedinButton = screen.getByRole('button', { name: /LinkedIn/i });
    fireEvent.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('linkedin.com/sharing'));
  });

  it('opens email client when Email button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const emailButton = screen.getByRole('button', { name: /Email/i });
    fireEvent.click(emailButton);
    
    expect(window.location.href).toMatch(/^mailto:/);
  });

  it('returns null when activeList is not found', () => {
    // Override useStore to return no active list
    useStore.mockImplementation((store) => {
      if (store === listsStore.listStore) {
        return { 
          lists: [mockList],
          activeListId: '999' // Non-existent ID
        };
      }
      if (store === listsStore.listUIState) {
        return mockUIState;
      }
      return {};
    });

    const { container } = render(<ShareList listId="999" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays error message when there is an error', () => {
    // Override useStore to return an error
    useStore.mockImplementation((store) => {
      if (store === listsStore.listStore) {
        return mockStoreData;
      }
      if (store === listsStore.listUIState) {
        return { 
          isLoading: false,
          error: 'Failed to share list'
        };
      }
      return {};
    });

    render(<ShareList listId="1" />);
    expect(screen.getByText(/Failed to share list/i)).toBeInTheDocument();
  });
});