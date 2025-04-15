import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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

// Mock stores
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock the stores/lists module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: { get: vi.fn() },
    listUIState: { get: vi.fn() },
    shareList: vi.fn()
  };
});

// Import the component and dependencies after mock definitions
import ShareList from './ShareList';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, shareList } from '../../../stores/lists';

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
      if (store === listStore) {
        return mockStoreData;
      }
      if (store === listUIState) {
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
      if (store === listStore) {
        return { 
          lists: [mockList],
          activeListId: '999' // Non-existent ID
        };
      }
      if (store === listUIState) {
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
      if (store === listStore) {
        return mockStoreData;
      }
      if (store === listUIState) {
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