import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddUrlsToList from './AddUrlsToList';
import { listStore, listUIState } from '../../../stores/lists';

// Mock the stores module
vi.mock('../../../stores/lists', () => ({
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
  addUrlToList: vi.fn()
}));

describe('AddUrlsToList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: []
  };

  beforeEach(() => {
    // Reset mock state
    listStore.set({ lists: [mockList], activeListId: '123' });
    listUIState.set({ isLoading: false, error: null });
  });

  it('renders the URL input form', () => {
    render(<AddUrlsToList listId="123" />);
    expect(screen.getByLabelText(/add url to list/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add url/i })).toBeInTheDocument();
  });

  it('shows validation error for empty URL', async () => {
    render(<AddUrlsToList listId="123" />);
    
    const button = screen.getByRole('button', { name: /add url/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/url cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('successfully adds a URL to the list', async () => {
    const mockAddUrl = vi.fn().mockResolvedValue({ id: '1', url: 'https://example.com' });
    vi.mocked(addUrlToList).mockImplementation(mockAddUrl);

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByLabelText(/add url to list/i);
    const button = screen.getByRole('button', { name: /add url/i });

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/added successfully/i)).toBeInTheDocument();
      expect(input).toHaveValue('');
    });
  });

  it('handles server errors gracefully', async () => {
    vi.mocked(addUrlToList).mockRejectedValue(new Error('Failed to add URL'));
    listUIState.set({ isLoading: false, error: 'Failed to add URL' });

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByLabelText(/add url to list/i);
    const button = screen.getByRole('button', { name: /add url/i });

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to add url/i)).toBeInTheDocument();
    });
  });

  it('displays list of existing URLs', () => {
    const listWithUrls = {
      ...mockList,
      urls: [
        { id: '1', url: 'https://example.com' },
        { id: '2', url: 'https://test.com' }
      ]
    };
    listStore.set({ lists: [listWithUrls], activeListId: '123' });

    render(<AddUrlsToList listId="123" />);
    
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    render(<AddUrlsToList listId="123" />);
    expect(screen.getByText(/no urls added yet/i)).toBeInTheDocument();
  });

  it('disables input and button when loading', () => {
    listUIState.set({ isLoading: true, error: null });

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByLabelText(/add url to list/i);
    const button = screen.getByRole('button', { name: /add url/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});