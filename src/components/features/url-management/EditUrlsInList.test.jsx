import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditUrlsInList from './EditUrlsInList';
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
  updateUrl: vi.fn()
}));

describe('EditUrlsInList', () => {
  const mockUrls = [
    { id: '1', url: 'https://example.com', title: 'Example' },
    { id: '2', url: 'https://test.com', title: '' }
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

  it('renders the table of URLs', () => {
    render(<EditUrlsInList listId="123" />);
    
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2);
  });

  it('shows loading state', () => {
    listUIState.set({ isLoading: true, error: null });
    render(<EditUrlsInList listId="123" />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    listStore.set({
      lists: [{ ...mockList, urls: [] }],
      activeListId: '123'
    });
    
    render(<EditUrlsInList listId="123" />);
    expect(screen.getByText(/no urls to edit/i)).toBeInTheDocument();
    expect(screen.getByText(/add some urls to your list first/i)).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<EditUrlsInList listId="123" />);
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Example')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('updates URL and title fields in edit mode', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Enter edit mode
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Update fields
    const urlInput = screen.getByDisplayValue('https://example.com');
    const titleInput = screen.getByDisplayValue('Example');

    fireEvent.change(urlInput, { target: { value: 'https://newexample.com' } });
    fireEvent.change(titleInput, { target: { value: 'New Example' } });

    expect(screen.getByDisplayValue('https://newexample.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Example')).toBeInTheDocument();
  });

  it('handles successful URL update', async () => {
    vi.mocked(updateUrl).mockResolvedValue(true);
    
    render(<EditUrlsInList listId="123" />);
    
    // Enter edit mode
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Update URL and save
    const urlInput = screen.getByDisplayValue('https://example.com');
    fireEvent.change(urlInput, { target: { value: 'https://newexample.com' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty URL', async () => {
    render(<EditUrlsInList listId="123" />);
    
    // Enter edit mode
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Clear URL and try to save
    const urlInput = screen.getByDisplayValue('https://example.com');
    fireEvent.change(urlInput, { target: { value: '' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/url cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('handles update error gracefully', async () => {
    vi.mocked(updateUrl).mockRejectedValue(new Error('Failed to update URL'));
    listUIState.set({ isLoading: false, error: 'Failed to update URL' });
    
    render(<EditUrlsInList listId="123" />);
    
    // Enter edit mode and try to save
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update url/i)).toBeInTheDocument();
    });
  });

  it('cancels edit mode without saving', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Enter edit mode
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Make changes
    const urlInput = screen.getByDisplayValue('https://example.com');
    fireEvent.change(urlInput, { target: { value: 'https://newexample.com' } });

    // Cancel edit
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Verify we're back to view mode with original values
    expect(screen.queryByDisplayValue('https://newexample.com')).not.toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    listUIState.set({ isLoading: true, error: null });
    
    render(<EditUrlsInList listId="123" />);
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    editButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});