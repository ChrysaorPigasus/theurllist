import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteList from './DeleteList';
import { deleteList } from '../../../stores/lists';

// Mock variables to prevent reference errors
const listStoreMock = {
  get: vi.fn(),
  set: vi.fn(),
  subscribe: vi.fn(),
  mockLists: []
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
    deleteList: vi.fn()
  };
});

// Mock Dialog component to make testing easier
vi.mock('../../../components/ui/Dialog', () => ({
  default: ({ isOpen, onClose, title, description, children, actions }) => 
    isOpen ? (
      <div data-testid="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        <div data-testid="dialog-actions">{actions}</div>
      </div>
    ) : null
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

describe('DeleteList', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: []
  };

  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = [mockList];
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the delete button', () => {
    render(<DeleteList listId="123" />);
    
    expect(screen.getByRole('button', { name: /delete list/i })).toBeInTheDocument();
  });

  it('opens the confirmation dialog when delete button is clicked', () => {
    render(<DeleteList listId="123" />);
    
    const deleteButton = screen.getByRole('button', { name: /delete list/i });
    fireEvent.click(deleteButton);
    
    // Check if dialog is open with correct content
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete List')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Test List"/)).toBeInTheDocument();
  });

  it('has cancel and delete buttons in the dialog', () => {
    render(<DeleteList listId="123" />);
    
    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete list/i });
    fireEvent.click(deleteButton);
    
    // Check for dialog buttons
    const dialogActions = screen.getByTestId('dialog-actions');
    expect(dialogActions).toBeInTheDocument();
    
    // Find buttons within dialog actions
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const confirmDeleteButton = screen.getByRole('button', { name: /delete$/i });
    
    expect(cancelButton).toBeInTheDocument();
    expect(confirmDeleteButton).toBeInTheDocument();
  });

  it('closes the dialog when cancel button is clicked', () => {
    render(<DeleteList listId="123" />);
    
    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete list/i });
    fireEvent.click(deleteButton);
    
    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if dialog is closed
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('deletes the list when confirmation button is clicked', async () => {
    const mockDeleteFn = deleteList;
    mockDeleteFn.mockResolvedValueOnce(true);
    
    render(<DeleteList listId="123" />);
    
    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete list/i });
    fireEvent.click(deleteButton);
    
    // Click confirm delete
    const confirmDeleteButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmDeleteButton);
    
    // Check if deleteList function was called
    expect(mockDeleteFn).toHaveBeenCalledWith('123');
    
    // Check if dialog is closed after successful deletion
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows loading state when deleting', () => {
    listUIStateMock.mockIsLoading = true;
    
    render(<DeleteList listId="123" />);
    
    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete list/i });
    fireEvent.click(deleteButton);
    
    // Check if buttons have correct state
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const confirmDeleteButton = screen.getByRole('button', { name: /delete$/i });
    
    expect(cancelButton).toHaveAttribute('disabled');
    expect(confirmDeleteButton).toHaveAttribute('disabled');
    expect(confirmDeleteButton).toHaveAttribute('loading');
  });

  it('displays error message when there is an error', () => {
    listUIStateMock.mockError = 'Failed to delete list';
    
    render(<DeleteList listId="123" />);
    
    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete list/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByText('Failed to delete list')).toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStoreMock.mockLists = [];
    
    const { container } = render(<DeleteList listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});