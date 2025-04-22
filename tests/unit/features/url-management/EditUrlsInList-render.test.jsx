import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the imported modules
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Create mock data
const mockLists = [
  {
    id: '123',
    name: 'Test List',
    urls: [
      { id: '1', title: 'Example 1', url: 'https://example.com/1' },
      { id: '2', title: 'Example 2', url: 'https://example.com/2' }
    ]
  }
];
let mockIsLoading = false;
let mockError = null;
let mockActiveListId = '123';

// Mock updateUrl function
const mockUpdateUrl = vi.fn();

// Mock the stores
vi.mock('@stores/lists', () => ({
  listStore: { 
    toString: () => 'listStore',
    get: vi.fn(() => ({ lists: mockLists, activeListId: mockActiveListId })),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  },
  listUIState: { 
    toString: () => 'listUIState',
    get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError })),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  },
  updateUrl: (...args) => mockUpdateUrl(...args)
}));

// Import useStore after mocking
import { useStore } from '@nanostores/react';
// Import component after all mocks are set up
import EditUrlsInList from '@components/features/url-management/EditUrlsInList';

describe('EditUrlsInList - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset test values
    mockIsLoading = false;
    mockError = null;
    mockActiveListId = '123';
    
    // Set up useStore to return different values based on which store is passed
    useStore.mockImplementation((store) => {
      if (store.toString() === 'listStore') {
        return { 
          lists: mockLists, 
          activeListId: mockActiveListId 
        };
      } else if (store.toString() === 'listUIState') {
        return { 
          isLoading: mockIsLoading, 
          error: mockError 
        };
      }
      return {};
    });
  });
  
  it('renders list of URLs with edit buttons', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Since the component doesn't show edit forms until Edit is clicked,
    // we should see the URLs displayed as text first
    expect(screen.getByText('https://example.com/1')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/2')).toBeInTheDocument();
    expect(screen.getByText('Example 1')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
    
    // Should have Edit buttons
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(2);
  });
  
  it('shows loading state while URLs are loading', () => {
    mockIsLoading = true;
    
    render(<EditUrlsInList listId="123" />);
    
    // Should show loading spinner
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });
  
  it('shows error message if loading fails', () => {
    mockError = 'Failed to load URLs';
    
    render(<EditUrlsInList listId="123" />);
    
    // Should show error message
    expect(screen.getByText('Failed to load URLs')).toBeInTheDocument();
  });
  
  it('renders an empty state when no URLs are available', () => {
    // Mock a list with no URLs
    const emptyList = [
      {
        id: '123',
        name: 'Empty List',
        urls: []
      }
    ];
    
    useStore.mockImplementation((store) => {
      if (store.toString() === 'listStore') {
        return { 
          lists: emptyList, 
          activeListId: '123' 
        };
      } else if (store.toString() === 'listUIState') {
        return { 
          isLoading: false, 
          error: null 
        };
      }
      return {};
    });
    
    render(<EditUrlsInList listId="123" />);
    
    // Should show empty state message
    expect(screen.getByText(/No URLs to edit/i)).toBeInTheDocument();
  });
  
  it('displays the list title', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Should show the list title
    expect(screen.getByText(/Edit URLs in Test List/i)).toBeInTheDocument();
  });
});