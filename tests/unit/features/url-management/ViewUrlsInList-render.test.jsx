import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, it, describe } from 'vitest';
import ViewUrlsInList from '@features/url-management/ViewUrlsInList';

// Mock data
const mockUrls = [
  { id: 1, url: 'https://example.com', title: 'Example', created_at: '2023-01-01' },
  { id: 2, url: 'https://example2.com', title: 'Example 2', created_at: '2023-01-02' }
];
const mockList = {
  id: 1,
  name: 'Test List',
  urls: mockUrls
};

// Mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock the stores/lists module with complete objects
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(),
      set: vi.fn(),
      setKey: vi.fn()
    },
    listUIState: {
      get: vi.fn(),
      set: vi.fn(),
      setKey: vi.fn()
    },
    addUrlToList: vi.fn().mockResolvedValue(true),
    updateUrl: vi.fn().mockResolvedValue(true),
    deleteUrl: vi.fn().mockResolvedValue(true)
  };
});

import { useStore } from '@nanostores/react';
import { listStore, listUIState } from '@stores/lists';

describe('ViewUrlsInList - Rendering', () => {
  const mockListId = '1';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for normal tests
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [mockList], activeListId: 1 };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
  });

  it('renders without crashing', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    expect(screen.getByText('URLs in List')).toBeInTheDocument();
  });

  it('displays URLs in the list', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
    expect(screen.getByText('https://example2.com')).toBeInTheDocument();
  });

  it('shows an empty state when no URLs are in the list', () => {
    // Mock an empty list
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: [{ id: 1, name: 'Empty List', urls: [] }], activeListId: 1 };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });
    
    render(<ViewUrlsInList listId={mockListId} />);
    
    const emptyStateTexts = screen.getAllByText('No URLs in this list yet');
    expect(emptyStateTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Add some URLs to get started')).toBeInTheDocument();
  });

  it('renders all UI elements correctly', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Check for main UI elements
    expect(screen.getByText('URLs in List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Add URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search URLs...')).toBeInTheDocument();
    expect(screen.getByText('Show additional fields')).toBeInTheDocument();
  });

  it('renders the URL table with correct headers', () => {
    render(<ViewUrlsInList listId={mockListId} />);
    
    // Use a more specific query to find the table headers
    // First check if the table exists
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Look for column headers within the table's thead
    const tableHeaders = table.querySelectorAll('th');
    const headerTexts = Array.from(tableHeaders).map(th => th.textContent);
    
    // Output header texts for debugging
    console.log('Actual table headers:', headerTexts);
    
    // Check for each header in the collected texts
    expect(headerTexts).toContain('URL');
    // The component is using 'Name' instead of 'Title'
    expect(headerTexts).toContain('Name');
    expect(headerTexts).toContain('Added');
    expect(headerTexts).toContain('Actions');
  });
});