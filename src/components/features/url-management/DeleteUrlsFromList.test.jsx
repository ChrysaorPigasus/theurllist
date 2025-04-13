import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteUrlsFromList from './DeleteUrlsFromList';
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
  deleteUrl: vi.fn()
}));

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
    // Reset mock state
    listStore.set({ lists: [mockList], activeListId: '123' });
    listUIState.set({ isLoading: false, error: null });
  });

  it('renders the list of URLs with delete buttons', () => {
    render(<DeleteUrlsFromList listId="123" />);
    
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
  });

  it('shows loading state', () => {
    listUIState.set({ isLoading: true, error: null });
    render(<DeleteUrlsFromList listId="123" />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    listStore.set({
      lists: [{ ...mockList, urls: [] }],
      activeListId: '123'
    });
    
    render(<DeleteUrlsFromList listId="123" />);
    expect(screen.getByText(/no urls to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/add some urls to your list first/i)).toBeInTheDocument();
  });

  it('successfully deletes a URL', async () => {
    vi.mocked(deleteUrl).mockResolvedValue(true);
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
    });
  });

  it('handles delete error gracefully', async () => {
    vi.mocked(deleteUrl).mockRejectedValue(new Error('Failed to delete URL'));
    listUIState.set({ isLoading: false, error: 'Failed to delete URL' });
    
    render(<DeleteUrlsFromList listId="123" />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete url/i)).toBeInTheDocument();
    });
  });

  it('disables delete buttons when loading', () => {
    listUIState.set({ isLoading: true, error: null });
    
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