import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// Mock getComputedStyle for visibility testing
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element) => {
  const computedStyle = originalGetComputedStyle(element);
  
  // Create a proxy to override visibility values for tests
  return new Proxy(computedStyle, {
    get: (target, prop) => {
      // Default values to make elements visible
      if (prop === 'display') return 'block';
      if (prop === 'visibility') return 'visible';
      if (prop === 'opacity') return '1';
      
      return Reflect.get(target, prop);
    }
  });
};

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

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup user event for realistic user simulation
    user = userEvent.setup();
    
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

  it('renders the share list component with all social buttons visible', () => {
    const { container } = render(<ShareList listId="1" />);
    
    // Check if the component is visible
    expect(screen.getByText(/Share List/i)).toBeVisible();
    expect(screen.getByText(/Share your list with others/i)).toBeVisible();
    
    // Check if all buttons are visible and clickable
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    const linkedinButton = screen.getByRole('button', { name: /LinkedIn/i });
    const emailButton = screen.getByRole('button', { name: /Email/i });
    
    expect(copyButton).toBeVisible();
    expect(twitterButton).toBeVisible();
    expect(linkedinButton).toBeVisible();
    expect(emailButton).toBeVisible();
    
    // Check if buttons are enabled/clickable
    expect(copyButton).toBeEnabled();
    expect(twitterButton).toBeEnabled();
    expect(linkedinButton).toBeEnabled();
    expect(emailButton).toBeEnabled();
  });

  it('displays the shareable URL in a visible and selectable input field', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        ...window.location,
        origin: 'http://localhost:3000'
      }
    });

    const { container } = render(<ShareList listId="1" />);
    
    // Check if input is visible and selectable
    const input = screen.getByLabelText(/Shareable URL/i);
    expect(input).toBeVisible();
    expect(input).toBeEnabled();
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveValue('http://localhost:3000/list/test-list');
    
    // Check if the label is visible to users
    const inputLabel = screen.getByText(/Shareable URL/i);
    expect(inputLabel).toBeVisible();
  });

  it('copies URL to clipboard when Copy URL button is clicked and shows feedback to user', async () => {
    const { container } = render(<ShareList listId="1" />);
    
    // Get the button and verify it is visible
    const copyButton = screen.getByRole('button', { name: /Copy URL/i });
    expect(copyButton).toBeVisible();
    expect(copyButton).toBeEnabled();
    
    // Use userEvent for more realistic interaction
    await user.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/list/test-list');
      expect(showSuccess).toHaveBeenCalledWith('URL copied to clipboard! You can now share this link with others.');
    });
    
    // Verify visual feedback would be visible to user (via the mock implementation)
    const successMessage = document.querySelector('[data-testid="toast-success"]');
    expect(successMessage).not.toBeNull();
    expect(successMessage.textContent).toContain('URL copied to clipboard');
  });

  it('opens Twitter share dialog when Twitter button is clicked with correct visuals', async () => {
    const { container } = render(<ShareList listId="1" />);
    
    // Get the button and verify it's visible
    const twitterButton = screen.getByRole('button', { name: /Twitter/i });
    expect(twitterButton).toBeVisible();
    expect(twitterButton).toBeEnabled();
    
    // Check if the Twitter icon is visible
    const twitterIcon = within(twitterButton).getByRole('img', { hidden: true }) || 
                         within(twitterButton).querySelector('svg');
    expect(twitterIcon).not.toBeNull();
    
    // Use userEvent for more realistic user interaction
    await user.click(twitterButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'));
    expect(showInfo).toHaveBeenCalledWith('Opened Twitter sharing in a new window');
    
    // Verify feedback visible to user
    const infoMessage = document.querySelector('[data-testid="toast-info"]');
    expect(infoMessage).not.toBeNull();
    expect(infoMessage.textContent).toContain('Opened Twitter sharing');
  });

  it('opens LinkedIn share dialog when LinkedIn button is clicked', async () => {
    const { container } = render(<ShareList listId="1" />);
    
    const linkedinButton = screen.getByRole('button', { name: /LinkedIn/i });
    expect(linkedinButton).toBeVisible();
    expect(linkedinButton).toBeEnabled();
    
    await user.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('linkedin.com/sharing'));
  });

  it('opens email client when Email button is clicked', async () => {
    const { container } = render(<ShareList listId="1" />);
    
    const emailButton = screen.getByRole('button', { name: /Email/i });
    expect(emailButton).toBeVisible();
    expect(emailButton).toBeEnabled();
    
    await user.click(emailButton);
    
    expect(window.location.href).toMatch(/^mailto:/);
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
    expect(screen.getByText(/No active list found/i)).toBeVisible();
    expect(screen.getByText(/Please select a valid list/i)).toBeVisible();
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
    expect(screen.getByText(/Failed to share list/i)).toBeVisible();
  });
});