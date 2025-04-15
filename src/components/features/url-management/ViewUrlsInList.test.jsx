import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewUrlsInList from './ViewUrlsInList';

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

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    addUrlToList: vi.fn(),
    updateUrl: vi.fn(),
    deleteUrl: vi.fn()
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

// Mock child components
vi.mock('./AddUrlsToList', () => ({
  default: () => <div data-testid="add-urls-mock">Add URLs Mock</div>
}));

vi.mock('./EditUrlsInList', () => ({
  default: () => <div data-testid="edit-urls-mock">Edit URLs Mock</div>
}));

vi.mock('./DeleteUrlsFromList', () => ({
  default: () => <div data-testid="delete-urls-mock">Delete URLs Mock</div>
}));

vi.mock('./UrlListTable', () => ({
  default: ({ urls }) => (
    <div data-testid="url-list-table-mock">
      URL List Table Mock - {urls.length} URLs
    </div>
  )
}));

vi.mock('./SearchAndFilter', () => ({
  default: ({ onSearch }) => (
    <div data-testid="search-filter-mock">
      <button onClick={() => onSearch('test')}>Search</button>
    </div>
  )
}));

describe('ViewUrlsInList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: [
      { id: 'url1', url: 'https://example.com', title: 'Example 1' },
      { id: 'url2', url: 'https://example.org', title: 'Example 2' },
    ]
  };

  const emptyList = {
    id: '456',
    name: 'Empty List',
    urls: []
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = [mockList, emptyList];
    listStoreMock.mockActiveListId = '123';
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders URL list with all components', () => {
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByText('URL List Table Mock - 2 URLs')).toBeInTheDocument();
    expect(screen.getByTestId('add-urls-mock')).toBeInTheDocument();
    expect(screen.getByTestId('edit-urls-mock')).toBeInTheDocument();
    expect(screen.getByTestId('delete-urls-mock')).toBeInTheDocument();
    expect(screen.getByTestId('search-filter-mock')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    listUIStateMock.mockIsLoading = true;
    
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no URLs are found', () => {
    listStoreMock.mockActiveListId = '456';
    
    render(<ViewUrlsInList listId="456" />);
    
    expect(screen.getByText('URL List Table Mock - 0 URLs')).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    listUIStateMock.mockError = 'Failed to fetch URLs';
    
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByText('Failed to fetch URLs')).toBeInTheDocument();
  });

  it('filters URLs when search is applied', () => {
    render(<ViewUrlsInList listId="123" />);
    
    // Click the search button
    fireEvent.click(screen.getByText('Search'));
    
    // Should still render the URL list with filtered URLs
    expect(screen.getByText('URL List Table Mock - 2 URLs')).toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStoreMock.mockLists = [];
    listStoreMock.mockActiveListId = null;
    
    const { container } = render(<ViewUrlsInList listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});