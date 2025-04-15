import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessSharedList from './AccessSharedList';

// Mock variables to prevent reference errors
const listStoreMock = {
  get: vi.fn(),
  set: vi.fn(),
  subscribe: vi.fn(),
  mockLists: [],
  mockActiveListId: null
};

const listUIStateMock = {
  get: vi.fn(),
  set: vi.fn(),
  subscribe: vi.fn(),
  mockIsLoading: false,
  mockError: null
};

const mockInitializeStore = vi.fn();
const mockSetActiveListId = vi.fn();

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    initializeStore: mockInitializeStore,
    setActiveListId: mockSetActiveListId
  };
});

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: (store) => {
    if (store === listStoreMock) {
      return { 
        lists: listStoreMock.mockLists, 
        activeListId: listStoreMock.mockActiveListId 
      };
    }
    if (store === listUIStateMock) {
      return { 
        isLoading: listUIStateMock.mockIsLoading, 
        error: listUIStateMock.mockError 
      };
    }
    return {};
  }
}));

describe('AccessSharedList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    isPublished: true,
    publishedAt: '2025-01-01T00:00:00Z',
    urls: [
      { id: 'url1', url: 'https://example.com', title: 'Example 1' },
      { id: 'url2', url: 'https://example.org', title: 'Example 2' },
    ]
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = [];
    listStoreMock.mockActiveListId = null;
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Default mock implementation
    mockInitializeStore.mockResolvedValue({
      listFound: true,
      list: mockList
    });
  });

  it('initializes store and fetches the shared list', async () => {
    render(<AccessSharedList listId="123" />);
    
    expect(mockInitializeStore).toHaveBeenCalledWith('123');
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockSetActiveListId).toHaveBeenCalledWith('123');
    });
  });

  it('shows loading state while list is being fetched', () => {
    // Simulate loading state
    listUIStateMock.mockIsLoading = true;
    
    render(<AccessSharedList listId="123" />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays the list title once loaded', async () => {
    // Simulate successful list load
    mockInitializeStore.mockResolvedValueOnce({
      listFound: true,
      list: mockList
    });
    
    render(<AccessSharedList listId="123" />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Check that list info is displayed
    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(screen.getByText('Shared list')).toBeInTheDocument();
  });

  it('shows error message when list access fails', async () => {
    // Simulate API error
    mockInitializeStore.mockRejectedValueOnce(new Error('Failed to access list'));
    
    render(<AccessSharedList listId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to access list')).toBeInTheDocument();
    });
  });

  it('shows warning when list is not published', async () => {
    // Simulate unpublished list
    const unpublishedList = { ...mockList, isPublished: false };
    mockInitializeStore.mockResolvedValueOnce({
      listFound: true,
      list: unpublishedList
    });
    
    render(<AccessSharedList listId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('This list is not published')).toBeInTheDocument();
    });
  });

  it('shows error when list is not found', async () => {
    // Simulate list not found
    mockInitializeStore.mockResolvedValueOnce({
      listFound: false
    });
    
    render(<AccessSharedList listId="999" />);
    
    await waitFor(() => {
      expect(screen.getByText('List not found')).toBeInTheDocument();
    });
  });

  it('displays published date for published lists', async () => {
    mockInitializeStore.mockResolvedValueOnce({
      listFound: true,
      list: mockList
    });
    
    render(<AccessSharedList listId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText(`Published on ${new Date('2025-01-01T00:00:00Z').toLocaleDateString()}`)).toBeInTheDocument();
    });
  });
});