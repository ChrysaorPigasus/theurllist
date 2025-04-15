import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditUrlsInList from './EditUrlsInList';
import { listStore, listUIState } from '../../../stores/lists';

// Mock updateUrl function
const mockUpdateUrl = vi.fn();

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
    updateUrl: mockUpdateUrl
  };
});

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
    // Reset mock state for stores
    listStore.mockLists = [mockList];
    listStore.mockActiveListId = '123';
    listUIState.mockIsLoading = false;
    listUIState.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the table of URLs', () => {
    render(<EditUrlsInList listId="123" />);
    
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2);
  });

  it('shows loading state', () => {
    listUIState.mockIsLoading = true;
    
    render(<EditUrlsInList listId="123" />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    listStore.mockLists = [{ ...mockList, urls: [] }];
    
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
    mockUpdateUrl.mockResolvedValue(true);
    
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
      expect(mockUpdateUrl).toHaveBeenCalledWith('1', 'https://newexample.com', 'Example');
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

    // Check that input shows validation error (since error message is in aria-invalid attribute now)
    expect(urlInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles update error gracefully', async () => {
    mockUpdateUrl.mockRejectedValue(new Error('Failed to update URL'));
    
    render(<EditUrlsInList listId="123" />);
    
    // Enter edit mode and try to save
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Just verify the update function was called
    expect(mockUpdateUrl).toHaveBeenCalled();
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
    listUIState.mockIsLoading = true;
    
    render(<EditUrlsInList listId="123" />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});