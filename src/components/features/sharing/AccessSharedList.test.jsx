import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AccessSharedList from './AccessSharedList';
import { listStore, listUIState } from '../../../stores/lists';

// Mock initializeStore and setActiveList functions
const mockInitializeStore = vi.fn();
const mockSetActiveList = vi.fn();

// Mock the @nanostores/react useStore hook
vi.mock('@nanostores/react', () => ({
  useStore: (store) => {
    if (store === listStore) {
      return { lists: listStore.mockLists, activeListId: listStore.mockActiveListId };
    }
    if (store === listUIState) {
      return { isLoading: listUIState.mockIsLoading, error: listUIState.mockError };
    }
    return {};
  }
}));

// Mock the stores module
vi.mock('../../../stores/lists', () => {
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

  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    initializeStore: mockInitializeStore,
    setActiveList: mockSetActiveList
  };
});

describe('AccessSharedList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: [
      { id: '1', url: 'https://example.com', title: 'Example', createdAt: new Date().toISOString() }
    ],
    isPublished: true
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStore.mockLists = [];
    listStore.mockActiveListId = null;
    listUIState.mockIsLoading = false;
    listUIState.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    listUIState.mockIsLoading = true;
    
    render(<AccessSharedList listId="123" />);
    
    // Check for Spinner component instead of status role
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    listUIState.mockError = 'Failed to load list';
    
    render(<AccessSharedList listId="123" />);
    
    // Check for the error message in the component's error UI
    expect(screen.getByText('Failed to load list')).toBeInTheDocument();
  });

  it('renders not found state when list does not exist', async () => {
    // Don't add any lists to mockLists
    render(<AccessSharedList listId="nonexistent" />);
    
    await waitFor(() => {
      expect(screen.getByText('List Not Found')).toBeInTheDocument();
    });
  });

  it('renders private state when list is not published', async () => {
    // Add a private list to mockLists
    const privateList = { ...mockList, isPublished: false };
    listStore.mockLists = [privateList];
    listStore.mockActiveListId = '123';
    
    render(<AccessSharedList listId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Private List')).toBeInTheDocument();
    });
  });

  it('renders list content when list exists and is published', async () => {
    // Add a published list to mockLists
    listStore.mockLists = [mockList];
    listStore.mockActiveListId = '123';
    
    render(<AccessSharedList listId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test List')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });
  });
});