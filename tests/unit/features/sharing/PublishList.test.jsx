import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';
import PublishList  from '@components/features/sharing/PublishList';

// Create mock values for the tests
const mockLists = [
  {
    id: '123',
    name: 'Test List',
    urls: [],
    published: false,
    publishedAt: null
  },
  {
    id: '456',
    name: 'Published List',
    urls: [],
    published: true,
    publishedAt: '2023-01-01T12:00:00Z'
  }
];
let mockIsLoading = false;
let mockError = null;

// Mock the imported modules first
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => {
    if (store === listsStore.listStore) {
      return { lists: mockLists };
    } 
    if (store === listsStore.listUIState) {
      return { isLoading: mockIsLoading, error: mockError };
    }
    if (store === listsStore.sharingUIState) {
      return { isLoading: mockIsLoading, error: mockError, isPublished: false, shareUrl: null };
    }
    return {};
  })
}));

// Mock the stores and functions
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: mockLists })),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError })),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    sharingUIState: {
      get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError, isPublished: false, shareUrl: null })),
      set: vi.fn(),
      setKey: vi.fn(),
      subscribe: vi.fn()
    },
    publishList: vi.fn().mockResolvedValue(true),
    unpublishList: vi.fn().mockResolvedValue(true)
  };
});

describe('PublishList', () => {
  const mockListId = '123';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset test values
    mockIsLoading = false;
    mockError = null;
  });
  
  it('renders the publish button for unpublished list', () => {
    render(<PublishList listId="123" />);
    
    expect(screen.getByText(/your list is currently private/i)).toBeInTheDocument();
    const publishButton = screen.getByRole('button', { name: /publish list/i });
    expect(publishButton).toBeInTheDocument();
  });
  
  it('shows publish status for published list', () => {
    render(<PublishList listId="456" />);
    
    // Use a more specific, exact text match to avoid ambiguity
    expect(screen.getByText(/^Published$/)).toBeInTheDocument();
    const makePrivateButton = screen.getByRole('button', { name: /make private/i });
    expect(makePrivateButton).toBeInTheDocument();
  });
  
  it('publishes the list when publish button is clicked', () => {
    render(<PublishList listId="123" />);
    
    fireEvent.click(screen.getByRole('button', { name: /publish list/i }));
    
    expect(listsStore.publishList).toHaveBeenCalledWith('123');
  });
  
  it('unpublishes the list when make private button is clicked', () => {
    render(<PublishList listId="456" />);
    
    fireEvent.click(screen.getByRole('button', { name: /make private/i }));
    
    expect(listsStore.unpublishList).toHaveBeenCalledWith('456');
  });
  
  it('shows loading state when publishing', () => {
    mockIsLoading = true;
    
    render(<PublishList listId="123" />);
    
    const publishButton = screen.getByRole('button', { name: /publish list/i });
    expect(publishButton).toBeDisabled();
  });
  
  it('handles publishing errors gracefully', () => {
    mockError = 'Failed to publish list';
    
    render(<PublishList listId="123" />);
    
    expect(screen.getByText('Failed to publish list')).toBeInTheDocument();
  });
  
  it('returns null when list is not found', () => {
    const { container } = render(<PublishList listId="999" />);
    
    // The component should return null if the list is not found
    expect(container.firstChild).toBeNull();
  });
});