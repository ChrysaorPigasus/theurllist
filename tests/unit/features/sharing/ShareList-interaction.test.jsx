import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock modules first
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock the stores/notificationStore module
vi.mock('@stores/notificationStore', () => {
  return {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn()
  };
});

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

// Import directly after mocking
import { showSuccess, showError, showInfo } from '@stores/notificationStore';

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
  let hrefValue = '';
  Object.defineProperty(window, 'open', {
    writable: true,
    value: vi.fn()
  });
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

    // Reset clipboard mock
    navigator.clipboard.writeText.mockReset();
    navigator.clipboard.writeText.mockResolvedValue(undefined);
    
    // Reset window.open mock
    window.open.mockReset();
    
    // Reset href value
    hrefValue = '';
  });

  it('copies URL to clipboard when Copy URL button is clicked', async () => {
    render(<ShareList listId="1" />);
    
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/list/test-list');
      expect(showSuccess).toHaveBeenCalledWith('URL copied to clipboard! You can now share this link with others.');
    });
  });

  it('shows feedback message after successfully copying', async () => {
    render(<ShareList listId="1" />);
    
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith('URL copied to clipboard! You can now share this link with others.');
    });
  });

  it('opens Twitter sharing when Twitter button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    fireEvent.click(twitterButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'));
    expect(showInfo).toHaveBeenCalledWith('Opened Twitter sharing in a new window');
  });

  it('opens LinkedIn sharing when LinkedIn button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const linkedinButton = screen.getByRole('button', { name: /LinkedIn/i });
    fireEvent.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('linkedin.com/sharing'));
    expect(showInfo).toHaveBeenCalledWith('Opened LinkedIn sharing in a new window');
  });

  it('opens email client when Email button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const emailButton = screen.getByRole('button', { name: /Email/i });
    fireEvent.click(emailButton);
    
    expect(window.location.href).toMatch(/^mailto:/);
    expect(showInfo).toHaveBeenCalledWith('Opened email client');
  });
});