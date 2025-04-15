import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewAllLists from './ViewAllLists';
import { fetchLists } from '../../../stores/lists';

// Mock variables to prevent reference errors
const listStoreMock = {
  get: vi.fn(),
  set: vi.fn(),
  subscribe: vi.fn(),
  mockLists: [],
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
    fetchLists: vi.fn(() => Promise.resolve())
  };
});

// Mock the DeleteList component to simplify testing
vi.mock('./DeleteList', () => ({
  default: ({ listId }) => <button data-testid={`delete-list-${listId}`}>Delete List</button>
}));

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: (store) => {
    if (store === listStoreMock) {
      return { 
        lists: listStoreMock.mockLists
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

describe('ViewAllLists', () => {
  const mockLists = [
    {
      id: '1',
      name: 'Test List 1',
      title: 'Test Title 1',
      description: 'Test Description 1',
      created_at: '2025-01-01T00:00:00Z',
      slug: 'test-list-1'
    },
    {
      id: '2',
      name: 'Test List 2',
      description: 'Test Description 2',
      created_at: '2025-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = mockLists;
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  it('fetches lists on mount', () => {
    const mockFetchFn = fetchLists;
    
    render(<ViewAllLists />);
    
    expect(mockFetchFn).toHaveBeenCalled();
  });

  it('renders loading state when data is loading', () => {
    listUIStateMock.mockIsLoading = true;
    
    render(<ViewAllLists />);
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no lists are found', () => {
    listStoreMock.mockLists = [];
    
    render(<ViewAllLists />);
    
    expect(screen.getByText('No Lists Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first URL list to get started')).toBeInTheDocument();
  });

  it('renders a list of all URL lists', () => {
    render(<ViewAllLists />);
    
    expect(screen.getByText('Your URL Lists')).toBeInTheDocument();
    expect(screen.getByText('Manage and organize your collections of URLs')).toBeInTheDocument();
    
    // Check if each list is rendered
    expect(screen.getByText('Test List 1')).toBeInTheDocument();
    expect(screen.getByText('Test Title 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    
    expect(screen.getByText('Test List 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays formatted dates for each list', () => {
    render(<ViewAllLists />);
    
    // Check if dates are formatted correctly
    expect(screen.getByText(`Created ${new Date('2025-01-01T00:00:00Z').toLocaleDateString()}`)).toBeInTheDocument();
    expect(screen.getByText(`Created ${new Date('2025-01-02T00:00:00Z').toLocaleDateString()}`)).toBeInTheDocument();
  });

  it('displays custom slug when available', () => {
    render(<ViewAllLists />);
    
    // First list has a slug
    expect(screen.getByText('/test-list-1')).toBeInTheDocument();
    
    // Second list doesn't have a slug, so no slug text should be rendered for it
    // This is challenging to test directly with the current structure,
    // but we can check that there's only one slug displayed
    const slugElements = screen.getAllByText(/\/.*/);
    expect(slugElements).toHaveLength(1);
  });

  it('renders view buttons with correct hrefs', () => {
    render(<ViewAllLists />);
    
    const viewButtons = screen.getAllByRole('link', { name: /view/i });
    expect(viewButtons).toHaveLength(2);
    
    // First list should link to the slug
    expect(viewButtons[0]).toHaveAttribute('href', '/list/test-list-1');
    
    // Second list should link to the ID
    expect(viewButtons[1]).toHaveAttribute('href', '/list/2');
  });

  it('renders delete buttons for each list', () => {
    render(<ViewAllLists />);
    
    // Check if delete buttons are rendered with correct IDs
    expect(screen.getByTestId('delete-list-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-list-2')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    listUIStateMock.mockError = 'Failed to fetch lists';
    
    render(<ViewAllLists />);
    
    expect(screen.getByText('Failed to fetch lists')).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    const mockFetchFn = fetchLists;
    mockFetchFn.mockRejectedValueOnce(new Error('Network error'));
    
    render(<ViewAllLists />);
    
    // Should log the error but not crash
    expect(console.error).toHaveBeenCalled();
  });
});