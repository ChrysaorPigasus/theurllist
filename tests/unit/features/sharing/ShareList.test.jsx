import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareList from '@components/features/sharing/ShareList';
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';

// Mock react-toastify to render messages for tests
vi.mock('react-toastify', () => {
  // Create a mocked version that actually renders text for tests
  const toastFunctions = {};
  ['success', 'error', 'info', 'warning'].forEach(type => {
    toastFunctions[type] = (message) => {
      // Render the message in the DOM for tests to find
      document.body.innerHTML += `<div data-testid="toast-${type}">${message}</div>`;
      return `toast-id-${Math.random()}`;
    };
  });
  
  return {
    toast: toastFunctions,
    ToastContainer: () => <div data-testid="toast-container"></div>
  };
});

// Mock notificationStore
vi.mock('@stores/notificationStore', () => {
  return {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn()
  };
});

// Import directly after mocking
import { showSuccess, showError, showInfo } from '@stores/notificationStore';

// Save original navigator functions
const originalClipboardWriteText = navigator.clipboard?.writeText;

// Save original window properties
const originalOpen = window.open;
const originalLocation = { ...window.location };

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

  // Setup for realistic user interaction
  let user;
  let clipboardWriteTextMock;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.open
    window.open = vi.fn();
    
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: '',
        origin: 'http://localhost:3000'
      },
      writable: true
    });
    
    // Instead of replacing navigator.clipboard, just mock its method
    clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
    
    if (navigator.clipboard) {
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(clipboardWriteTextMock);
    } else {
      // If clipboard API isn't available in the test environment
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: clipboardWriteTextMock
        },
        configurable: true
      });
    }
    
    // Set up the mock return values for useStore
    useStore.mockImplementation((store) => {
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
    });
  });

  afterEach(() => {
    // Restore original window.open
    window.open = originalOpen;
    
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
    
    // Restore original clipboard method if it existed
    if (originalClipboardWriteText) {
      if (navigator.clipboard) {
        vi.mocked(navigator.clipboard.writeText).mockRestore();
      }
    }
  });

  it('renders the share list component with all social buttons visible', () => {
    render(<ShareList listId="1" />);
    
    // Check if the component is visible
    expect(screen.getByText(/Share List/i)).toBeInTheDocument();
    expect(screen.getByText(/Share your list with others/i)).toBeInTheDocument();
    
    // Check if all buttons are visible
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    const linkedinButton = screen.getByRole('button', { name: /LinkedIn/i });
    const emailButton = screen.getByRole('button', { name: /Email/i });
    
    expect(copyButton).toBeInTheDocument();
    expect(twitterButton).toBeInTheDocument();
    expect(linkedinButton).toBeInTheDocument();
    expect(emailButton).toBeInTheDocument();
  });

  it('displays the shareable URL in a visible and selectable input field', () => {
    render(<ShareList listId="1" />);
    
    // Check if input is visible and selectable
    const input = screen.getByLabelText(/Shareable URL/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveValue('http://localhost:3000/list/test-list');
  });

  it('copies URL to clipboard when Copy URL button is clicked and shows feedback to user', async () => {
    render(<ShareList listId="1" />);
    
    // Get the button
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    
    // Use fireEvent instead of userEvent for simpler interaction without clipboard conflicts
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalledWith('http://localhost:3000/list/test-list');
      expect(showSuccess).toHaveBeenCalledWith('URL copied to clipboard! You can now share this link with others.');
    });
  });

  it('opens Twitter share dialog when Twitter button is clicked with correct visuals', () => {
    render(<ShareList listId="1" />);
    
    // Get the button
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    
    // Use fireEvent for simpler interaction
    fireEvent.click(twitterButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'));
    expect(showInfo).toHaveBeenCalledWith('Opened Twitter sharing in a new window');
  });

  it('opens LinkedIn share dialog when LinkedIn button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const linkedinButton = screen.getByRole('button', { name: /LinkedIn/i });
    
    // Use fireEvent for simpler interaction
    fireEvent.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('linkedin.com/sharing'));
    expect(showInfo).toHaveBeenCalledWith('Opened LinkedIn sharing in a new window');
  });

  it('opens email client when Email button is clicked', () => {
    render(<ShareList listId="1" />);
    
    const emailButton = screen.getByRole('button', { name: /Email/i });
    
    // Use fireEvent for simpler interaction
    fireEvent.click(emailButton);
    
    expect(window.location.href).toMatch(/^mailto:/);
    expect(showInfo).toHaveBeenCalledWith('Opened email client');
  });

  it('renders empty state when activeList is not found', () => {
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

    render(<ShareList listId="999" />);
    expect(screen.getByText(/No active list found/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select a valid list/i)).toBeInTheDocument();
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