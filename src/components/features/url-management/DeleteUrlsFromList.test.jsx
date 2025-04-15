import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteUrlsFromList from './DeleteUrlsFromList';

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

const mockDeleteUrl = vi.fn();

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    deleteUrl: mockDeleteUrl
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

describe('DeleteUrlsFromList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: [
      { id: 'url1', url: 'https://example.com', title: 'Example 1' },
      { id: 'url2', url: 'https://example.org', title: 'Example 2' },
    ]
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = [mockList];
    listStoreMock.mockActiveListId = '123';
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders delete buttons for each URL', () => {
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('deletes a URL when delete button is clicked', () => {
    mockDeleteUrl.mockResolvedValueOnce(true);
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockDeleteUrl).toHaveBeenCalledWith('123', 'url1');
  });

  it('shows loading state for specific URL when deleting', async () => {
    // Setup a promise that doesn't resolve immediately
    let resolvePromise;
    const deletePromise = new Promise(resolve => { resolvePromise = resolve; });
    mockDeleteUrl.mockReturnValueOnce(deletePromise);
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check that specific button is in loading state
    expect(deleteButtons[0]).toHaveAttribute('disabled');
    expect(deleteButtons[0].querySelector('.animate-spin')).toBeInTheDocument();
    
    // Other button should still be clickable
    expect(deleteButtons[1]).not.toHaveAttribute('disabled');
    
    // Resolve the promise
    resolvePromise(true);
    await deletePromise;
  });

  it('displays error message when deletion fails', async () => {
    mockDeleteUrl.mockRejectedValueOnce(new Error('Failed to delete URL'));
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(await screen.findByText('Failed to delete URL')).toBeInTheDocument();
  });

  it('shows an empty state when there are no URLs', () => {
    const emptyList = {
      id: '456',
      name: 'Empty List',
      urls: []
    };
    
    listStoreMock.mockLists = [emptyList];
    listStoreMock.mockActiveListId = '456';
    
    render(<DeleteUrlsFromList listId="456" />);
    
    expect(screen.getByText('No URLs')).toBeInTheDocument();
    expect(screen.getByText('This list does not contain any URLs yet')).toBeInTheDocument();
  });

  it('shows success message after URL is deleted', async () => {
    mockDeleteUrl.mockResolvedValueOnce(true);
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(await screen.findByText('URL deleted successfully')).toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStoreMock.mockLists = [];
    listStoreMock.mockActiveListId = null;
    
    const { container } = render(<DeleteUrlsFromList listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});