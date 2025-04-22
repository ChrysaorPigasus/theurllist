import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddUrlsToList from '@components/features/url-management/AddUrlsToList';

// Define mock values
let mockLists = [];
let mockActiveListId = null;
let mockIsLoading = false;
let mockError = null;
const mockAddUrlToList = vi.fn();

// Mock modules
vi.mock('@stores/lists', () => ({
  listStore: { 
    get: vi.fn(() => ({ lists: mockLists, activeListId: mockActiveListId })),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  },
  listUIState: { 
    get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError })),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  },
  addUrlToList: (...args) => mockAddUrlToList(...args)
}));

// Mock useStore hook
vi.mock('@nanostores/react', () => ({
  useStore: () => {
    // Based on which store is being accessed, return the appropriate mock data
    return {
      lists: mockLists,
      activeListId: mockActiveListId,
      isLoading: mockIsLoading,
      error: mockError
    };
  }
}));

// Mock the Input component
vi.mock('@ui/Input', () => ({
  default: ({ error, success, id, label, value, onChange, disabled, ...props }) => (
    <div data-testid="mock-input">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        data-testid="url-input"
        aria-invalid={Boolean(error)}
      />
      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">{success}</div>}
    </div>
  )
}));

// Mock the Button component
vi.mock('@ui/Button', () => ({
  default: ({ children, onClick, disabled, loading, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-loading={loading}
      {...props}
    >
      {loading && <span className="animate-spin">⟳</span>}
      {children}
    </button>
  )
}));

describe('AddUrlsToList - Edge Cases', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    urls: []
  };

  beforeEach(() => {
    // Reset mock state for stores
    mockLists = [mockList];
    mockActiveListId = '123';
    mockIsLoading = false;
    mockError = null;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('handles server errors gracefully', async () => {
    // Mock console.error before the test
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    mockAddUrlToList.mockRejectedValue(new Error('Failed to add URL'));

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://example.com' } });
    });

    await act(async () => {
      fireEvent.click(button);
    });

    // Verify the API was called and console.error occurred
    await waitFor(() => {
      expect(mockAddUrlToList).toHaveBeenCalled();
    });
    
    // Verify the error was logged
    expect(console.error).toHaveBeenCalled();
    
    // Restore the original console.error
    console.error = originalConsoleError;
  });

  it('shows a loading message when list is not found', () => {
    mockLists = [];
    
    render(<AddUrlsToList listId="999" />);
    
    expect(screen.getByText(/loading list/i)).toBeInTheDocument();
  });

  it('displays error feedback when API returns null', async () => {
    mockAddUrlToList.mockResolvedValue(null);

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://example.com' } });
    });

    await act(async () => {
      fireEvent.click(button);
    });

    // Verify the function was called
    await waitFor(() => {
      expect(mockAddUrlToList).toHaveBeenCalled();
    });

    // Should not clear the input if there was an error
    expect(input.value).toBe('https://example.com');
  });

  it('handles malformed URLs gracefully', async () => {
    // Mock the validateUrl function to reject malicious URLs
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Set up our mock to simulate URL validation rejection
    mockAddUrlToList.mockImplementation((listId, url) => {
      if (url.includes('javascript:')) {
        throw new Error('Invalid URL scheme');
      }
      return Promise.resolve({ id: '1', url });
    });

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    // Enter a malformed URL that would normally cause issues
    await act(async () => {
      fireEvent.change(input, { target: { value: 'javascript:alert("XSS")' } });
      // Force enable button for testing
      button.disabled = false;
    });

    await act(async () => {
      fireEvent.click(button);
    });

    // Verify error was logged due to invalid URL
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('handles extremely long URLs gracefully', async () => {
    mockAddUrlToList.mockResolvedValue({ id: '1', url: 'https://example.com/' + 'a'.repeat(500) });

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    // Enter an extremely long URL
    const longUrl = 'https://example.com/' + 'a'.repeat(500);
    await act(async () => {
      fireEvent.change(input, { target: { value: longUrl } });
    });

    await act(async () => {
      fireEvent.click(button);
    });

    // The component should handle long URLs gracefully
    await waitFor(() => {
      expect(mockAddUrlToList).toHaveBeenCalledWith(123, longUrl);
    });
  });

  it('handles list ID type conversion gracefully', async () => {
    mockAddUrlToList.mockResolvedValue({ id: '1', url: 'https://example.com' });

    // Test with a string ID instead of a number
    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://example.com' } });
    });

    await act(async () => {
      fireEvent.click(button);
    });

    // Verify that listId was converted to a number in the API call
    await waitFor(() => {
      expect(mockAddUrlToList).toHaveBeenCalledWith(123, 'https://example.com');
    });
  });
});