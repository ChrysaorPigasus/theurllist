import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateNewList from './CreateNewList';

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

const mockCreateList = vi.fn();

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    createList: mockCreateList
  };
});

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

describe('CreateNewList', () => {
  beforeEach(() => {
    // Reset mock state for stores
    listStoreMock.mockLists = [];
    listUIStateMock.mockIsLoading = false;
    listUIStateMock.mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the create list form', () => {
    render(<CreateNewList />);
    
    expect(screen.getByText('Create New List')).toBeInTheDocument();
    expect(screen.getByLabelText('List Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create list/i })).toBeInTheDocument();
  });

  it('submits the form with list data', async () => {
    mockCreateList.mockResolvedValueOnce({ id: 'new-list-id' });
    
    render(<CreateNewList />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('List Name'), {
      target: { value: 'My Test List' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a test list description' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    
    // Check if createList was called with correct data
    expect(mockCreateList).toHaveBeenCalledWith({
      name: 'My Test List',
      description: 'This is a test list description'
    });
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('List created successfully!')).toBeInTheDocument();
    });
  });

  it('validates required fields', () => {
    render(<CreateNewList />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    
    // Should show validation errors
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(mockCreateList).not.toHaveBeenCalled();
  });

  it('shows loading state when creating list', async () => {
    // Setup a promise that doesn't resolve immediately
    let resolvePromise;
    const createPromise = new Promise(resolve => { resolvePromise = resolve; });
    mockCreateList.mockReturnValueOnce(createPromise);
    
    render(<CreateNewList />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('List Name'), {
      target: { value: 'My Test List' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    
    // Button should be in loading state
    const button = screen.getByRole('button', { name: /creating/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise({ id: 'new-list-id' });
    await createPromise;
  });

  it('handles API errors gracefully', async () => {
    mockCreateList.mockRejectedValueOnce(new Error('Failed to create list'));
    
    render(<CreateNewList />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('List Name'), {
      target: { value: 'My Test List' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to create list')).toBeInTheDocument();
    });
  });

  it('resets the form after successful submission', async () => {
    mockCreateList.mockResolvedValueOnce({ id: 'new-list-id' });
    
    render(<CreateNewList />);
    
    // Fill out the form
    const nameInput = screen.getByLabelText('List Name');
    const descInput = screen.getByLabelText('Description');
    
    fireEvent.change(nameInput, { target: { value: 'My Test List' } });
    fireEvent.change(descInput, { target: { value: 'This is a test list description' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText('List created successfully!')).toBeInTheDocument();
    });
    
    // Form should be reset
    expect(nameInput.value).toBe('');
    expect(descInput.value).toBe('');
  });
});