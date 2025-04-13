import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewUrlsInList from './ViewUrlsInList';
import { listStore, listUIState } from '../../../stores/lists/listStore';

// Mock the stores module
vi.mock('../../../stores/lists/listStore', () => ({
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
  setActiveList: vi.fn()
}));

describe('ViewUrlsInList', () => {
  const mockUrls = [
    { 
      id: '1', 
      url: 'https://example.com', 
      title: 'Example Site',
      createdAt: '2025-04-13T10:00:00Z'
    },
    { 
      id: '2', 
      url: 'https://test.com', 
      title: 'Test Site',
      createdAt: '2025-04-13T11:00:00Z'
    },
    { 
      id: '3', 
      url: 'https://another.com', 
      title: '',
      createdAt: '2025-04-13T12:00:00Z'
    }
  ];

  const mockList = {
    id: '123',
    name: 'Test List',
    description: 'Test Description',
    urls: mockUrls
  };

  beforeEach(() => {
    // Reset mock state
    listStore.set({ lists: [mockList], activeListId: '123' });
    listUIState.set({ isLoading: false, error: null });
    vi.clearAllMocks();
  });

  it('renders the list of URLs with titles and dates', () => {
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByText('Example Site')).toBeInTheDocument();
    expect(screen.getByText('Test Site')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument(); // For empty title
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getByText('https://another.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    listUIState.set({ isLoading: true, error: null });
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('filters URLs by search term', () => {
    render(<ViewUrlsInList listId="123" />);
    
    const searchInput = screen.getByPlaceholderText(/search urls/i);
    fireEvent.change(searchInput, { target: { value: 'example' } });

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.queryByText('https://test.com')).not.toBeInTheDocument();
  });

  it('shows empty state when search has no results', () => {
    render(<ViewUrlsInList listId="123" />);
    
    const searchInput = screen.getByPlaceholderText(/search urls/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/no matching urls found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your search term/i)).toBeInTheDocument();
  });

  it('shows empty state when list has no URLs', () => {
    listStore.set({
      lists: [{ ...mockList, urls: [] }],
      activeListId: '123'
    });
    
    render(<ViewUrlsInList listId="123" />);
    expect(screen.getByText(/no urls in this list yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add some urls to get started/i)).toBeInTheDocument();
  });

  it('sorts URLs by URL when URL header is clicked', () => {
    render(<ViewUrlsInList listId="123" />);
    
    const urlHeader = screen.getByText('URL').closest('th');
    fireEvent.click(urlHeader);

    const urls = screen.getAllByRole('link');
    expect(urls[0]).toHaveTextContent('https://another.com');
    
    // Click again to reverse sort order
    fireEvent.click(urlHeader);
    const urlsReversed = screen.getAllByRole('link');
    expect(urlsReversed[0]).toHaveTextContent('https://test.com');
  });

  it('sorts URLs by title when Title header is clicked', () => {
    render(<ViewUrlsInList listId="123" />);
    
    const titleHeader = screen.getByText('Title').closest('th');
    fireEvent.click(titleHeader);

    const cells = screen.getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('Example Site');
    
    // Click again to reverse sort order
    fireEvent.click(titleHeader);
    const cellsReversed = screen.getAllByRole('cell');
    expect(cellsReversed[1]).toHaveTextContent('Test Site');
  });

  it('sorts URLs by date when Added header is clicked', () => {
    render(<ViewUrlsInList listId="123" />);
    
    const dateHeader = screen.getByText('Added').closest('th');
    fireEvent.click(dateHeader);

    const cells = screen.getAllByRole('cell');
    // Most recent first in desc order
    expect(cells[2]).toHaveTextContent(new Date('2025-04-13T12:00:00Z').toLocaleDateString());
    
    // Click again to reverse sort order
    fireEvent.click(dateHeader);
    const cellsReversed = screen.getAllByRole('cell');
    // Oldest first in asc order
    expect(cellsReversed[2]).toHaveTextContent(new Date('2025-04-13T10:00:00Z').toLocaleDateString());
  });

  it('renders list title and description', () => {
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays error state when present', () => {
    listUIState.set({ isLoading: false, error: 'Failed to load URLs' });
    
    render(<ViewUrlsInList listId="123" />);
    
    expect(screen.getByText('Failed to load URLs')).toBeInTheDocument();
  });

  it('renders URLs as clickable links with correct attributes', () => {
    render(<ViewUrlsInList listId="123" />);
    
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://example.com');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('calls setActiveList with listId on mount', () => {
    render(<ViewUrlsInList listId="123" />);
    expect(vi.mocked(setActiveList)).toHaveBeenCalledWith('123');
  });
});