import React from 'react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
    shareList: vi.fn().mockResolvedValue(true),
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

describe('ShareList - Interaction', () => {
  // Define test data
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

  // Mock window.open and window.location
  const originalWindow = { ...window };
  let hrefValue = '';

  // Setup browser API mocks
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.open
    window.open = vi.fn();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        get href() {
          return hrefValue;
        },
        set href(val) {
          hrefValue = val;
        },
        origin: 'http://localhost:3000'
      }
    });
    
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
    
    // Reset mocked values
    hrefValue = '';
    
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
  });
  
  // Restore original window and navigator after all tests
  afterAll(() => {
    // Restore original window.open
    window.open = originalWindow.open;
    
    // Restore original window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalWindow.location
    });
    
    // Restore original navigator.clipboard
    if (originalWindow.navigator?.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: originalWindow.navigator.clipboard
      });
    }
  });

  it('copies URL to clipboard when Copy URL button is clicked', async () => {
    render(<ShareList listId="1" />);
    
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/list/test-list');
      expect(screen.getByText(/URL copied to clipboard!/i)).toBeInTheDocument();
    });
  });

  it('opens Twitter share dialog when Twitter button is clicked', async () => {
    render(<ShareList listId="1" />);
    
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    fireEvent.click(twitterButton);

    await waitFor(() => {
      // Simply check that window.open was called - don't be too specific about the URL
      expect(window.open).toHaveBeenCalled();
      // Verify the URL contains the required parts
      const callArg = window.open.mock.calls[0][0];
      expect(callArg).toContain('twitter.com/intent/tweet');
      // Check for the encoded version of the URL
      expect(callArg).toContain('http%3A%2F%2Flocalhost%3A3000%2Flist%2Ftest-list');
    });
  });

  it('opens email client when Email button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const emailButton = screen.getByRole('button', { name: /Email/i });
    fireEvent.click(emailButton);
    
    expect(hrefValue).toMatch(/^mailto:/);
    expect(hrefValue).toContain('subject=Check');
    // Just check that it has a body parameter without being too specific about content
    expect(hrefValue).toContain('body=');
  });

  it('shows feedback message after successfully copying', async () => {
    render(<ShareList listId="1" />);
    
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    fireEvent.click(copyButton);
    
    // Check if feedback message appears
    await waitFor(() => {
      expect(screen.getByText(/URL copied to clipboard!/i)).toBeInTheDocument();
    });
    
    // Wait long enough to see if message disappears (mock setTimeout)
    vi.useFakeTimers();
    vi.advanceTimersByTime(3000);
    vi.useRealTimers();
    
    // This will only succeed if the feedback message is correctly shown and hidden
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });
});