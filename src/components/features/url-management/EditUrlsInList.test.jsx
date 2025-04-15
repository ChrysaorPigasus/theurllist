import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditUrlsInList from './EditUrlsInList';

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

const mockUpdateUrl = vi.fn();

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    updateUrl: mockUpdateUrl
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

describe('EditUrlsInList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: [
      { id: 'url1', url: 'https://example.com', title: 'Example 1' },
      { id: 'url2', url: 'https://example.org', title: 'Example 2' },
    ]
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = [mockList];
    listStoreMock.mockActiveListId = '123';
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders edit buttons for each URL', () => {
    render(<EditUrlsInList listId="123" />);
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons).toHaveLength(2);
  });

  it('shows edit form when edit button is clicked', () => {
    render(<EditUrlsInList listId="123" />);
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Check that edit form is displayed
    expect(screen.getByLabelText('URL')).toHaveValue('https://example.com');
    expect(screen.getByLabelText('Title')).toHaveValue('Example 1');
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('updates URL when form is submitted', async () => {
    mockUpdateUrl.mockResolvedValueOnce(true);
    
    render(<EditUrlsInList listId="123" />);
    
    // Open edit form
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Modify URL and title
    const urlInput = screen.getByLabelText('URL');
    const titleInput = screen.getByLabelText('Title');
    
    fireEvent.change(urlInput, { target: { value: 'https://newexample.com' } });
    fireEvent.change(titleInput, { target: { value: 'New Example Title' } });
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(mockUpdateUrl).toHaveBeenCalledWith('123', 'url1', {
      url: 'https://newexample.com',
      title: 'New Example Title'
    });
    
    // Should show success message
    expect(await screen.findByText('URL updated successfully')).toBeInTheDocument();
  });

  it('validates URL input', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Open edit form
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Enter invalid URL
    const urlInput = screen.getByLabelText('URL');
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } });
    
    // Try to submit
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should show validation error
    expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    
    // Should not call updateUrl
    expect(mockUpdateUrl).not.toHaveBeenCalled();
  });

  it('handles update errors gracefully', async () => {
    mockUpdateUrl.mockRejectedValueOnce(new Error('Failed to update URL'));
    
    render(<EditUrlsInList listId="123" />);
    
    // Open edit form
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Submit form without changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should show error message
    expect(await screen.findByText('Failed to update URL')).toBeInTheDocument();
  });

  it('cancels editing when cancel button is clicked', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Open edit form
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Now click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Edit form should be closed
    expect(screen.queryByLabelText('URL')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });

  it('shows loading state when updating', async () => {
    let resolvePromise;
    const updatePromise = new Promise(resolve => { resolvePromise = resolve; });
    mockUpdateUrl.mockReturnValueOnce(updatePromise);
    
    render(<EditUrlsInList listId="123" />);
    
    // Open edit form
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Submit form without changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Save button should be in loading state
    expect(saveButton).toBeDisabled();
    expect(saveButton.querySelector('.animate-spin')).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise(true);
    await updatePromise;
  });

  it('shows an empty state when there are no URLs', () => {
    const emptyList = {
      id: '456',
      name: 'Empty List',
      urls: []
    };
    
    listStoreMock.mockLists = [emptyList];
    listStoreMock.mockActiveListId = '456';
    
    render(<EditUrlsInList listId="456" />);
    
    expect(screen.getByText('No URLs')).toBeInTheDocument();
    expect(screen.getByText('This list does not contain any URLs yet')).toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStoreMock.mockLists = [];
    listStoreMock.mockActiveListId = null;
    
    const { container } = render(<EditUrlsInList listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});