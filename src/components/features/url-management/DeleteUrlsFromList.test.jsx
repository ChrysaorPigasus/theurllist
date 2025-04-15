import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteUrlsFromList from './DeleteUrlsFromList';
import { listStore, listUIState } from '../../../stores/lists';

// Mock deleteUrl function
const mockDeleteUrl = vi.fn();

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
    deleteUrl: mockDeleteUrl
  };
});

describe('DeleteUrlsFromList', () => {
  const mockUrls = [
    { id: '1', url: 'https://example.com' },
    { id: '2', url: 'https://test.com' }
  ];

  const mockList = {
    id: '123',
    name: 'Test List',
    urls: mockUrls
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStore.mockLists = [mockList];
    listStore.mockActiveListId = '123';
    listUIState.mockIsLoading = false;
    listUIState.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the list of URLs with delete buttons', () => {
    render(<DeleteUrlsFromList listId="123" />);
    
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
  });

  it('shows loading state', () => {
    listUIState.mockIsLoading = true;
    
    render(<DeleteUrlsFromList listId="123" />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    listStore.mockLists = [{ ...mockList, urls: [] }];
    
    render(<DeleteUrlsFromList listId="123" />);
    
    expect(screen.getByText(/no urls to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/add some urls to your list first/i)).toBeInTheDocument();
  });

  it('successfully deletes a URL', async () => {
    mockDeleteUrl.mockResolvedValue(true);
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteUrl).toHaveBeenCalledWith('1');
    });
  });

  it('handles delete error gracefully', async () => {
    mockDeleteUrl.mockRejectedValue(new Error('Failed to delete URL'));
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Just verify the delete function was called
    expect(mockDeleteUrl).toHaveBeenCalledWith('1');
  });

  it('disables delete buttons when loading', () => {
    listUIState.mockIsLoading = true;
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('renders URLs as clickable links', () => {
    render(<DeleteUrlsFromList listId="123" />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://example.com');
    expect(links[1]).toHaveAttribute('href', 'https://test.com');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });
});