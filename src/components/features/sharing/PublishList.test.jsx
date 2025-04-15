import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Define mock functions before vi.mock calls
const mockPublishList = vi.fn();

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      get: vi.fn(),
      set: vi.fn(),
      subscribe: vi.fn()
    },
    publishList: (...args) => mockPublishList(...args)
  };
});

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: (store) => {
    if (store.mockId === 'listStore') {
      return { 
        lists: store.mockLists || [], 
        activeListId: store.mockActiveListId || null
      };
    }
    if (store.mockId === 'listUIState') {
      return { 
        isLoading: store.mockIsLoading || false,
        error: store.mockError || null
      };
    }
    return {};
  }
}));

// Import the component after all mocks are defined
import PublishList from './PublishList';
// Import the mocked modules to have access to the mock functions
import { listStore, listUIState } from '../../../stores/lists';

describe('PublishList', () => {
  const mockUnpublishedList = {
    id: '123',
    name: 'Test List',
    isPublished: false,
    customUrl: 'test-url'
  };

  const mockPublishedList = {
    id: '456',
    name: 'Published List',
    isPublished: true,
    publishedAt: '2025-01-01T00:00:00Z',
    customUrl: 'published-list'
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStore.mockId = 'listStore';
    listStore.mockLists = [mockUnpublishedList, mockPublishedList];
    listStore.mockActiveListId = '123';
    
    listUIState.mockId = 'listUIState';
    listUIState.mockIsLoading = false;
    listUIState.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
    mockPublishList.mockReset();
  });

  it('renders the publish button for unpublished list', () => {
    render(<PublishList listId="123" />);
    
    // Look for the heading (use a more specific selector)
    expect(screen.getByRole('heading', { name: 'Publish List' })).toBeInTheDocument();
    
    // Check if the button with the text "Publish List" exists
    expect(screen.getByRole('button', { name: /publish list/i })).toBeInTheDocument();
    
    // Check for the private status message
    expect(screen.getByText('Your list is currently private')).toBeInTheDocument();
  });

  it('shows publish status for published list', () => {
    listStore.mockActiveListId = '456';
    render(<PublishList listId="456" />);
    
    // Check for publish date text
    expect(screen.getByText(`Published on ${new Date('2025-01-01T00:00:00Z').toLocaleDateString()}`)).toBeInTheDocument();
    
    // Check for the Published button (which should be disabled)
    const publishButton = screen.getByRole('button', { name: /published/i });
    expect(publishButton).toBeInTheDocument();
    expect(publishButton).toBeDisabled();
  });

  it('disables the publish button for published lists', () => {
    listStore.mockActiveListId = '456';
    render(<PublishList listId="456" />);
    
    const publishButton = screen.getByRole('button', { name: /published/i });
    expect(publishButton).toBeDisabled();
  });

  it('publishes the list when publish button is clicked', async () => {
    mockPublishList.mockResolvedValueOnce(true);
    
    render(<PublishList listId="123" />);
    
    const publishButton = screen.getByRole('button', { name: /publish list/i });
    await act(async () => {
      fireEvent.click(publishButton);
    });
    
    expect(mockPublishList).toHaveBeenCalledWith('123');
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/published successfully/i)).toBeInTheDocument();
    });
  });

  it('shows loading state when publishing', async () => {
    // Setup a promise that doesn't resolve immediately
    let resolvePromise;
    const publishPromise = new Promise(resolve => { resolvePromise = resolve; });
    mockPublishList.mockReturnValueOnce(publishPromise);
    
    // Mock the loading state
    listUIState.mockIsLoading = true;
    
    render(<PublishList listId="123" />);
    
    const publishButton = screen.getByRole('button', { name: /publish list/i });
    expect(publishButton).toBeDisabled();
    
    // Resolve the promise
    await act(async () => {
      resolvePromise(true);
      await publishPromise;
    });
  });

  it('handles publishing errors gracefully', async () => {
    listUIState.mockError = 'Failed to publish list';
    
    render(<PublishList listId="123" />);
    
    // Should show error message
    expect(screen.getByText('Failed to publish list')).toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStore.mockLists = [];
    
    const { container } = render(<PublishList listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});