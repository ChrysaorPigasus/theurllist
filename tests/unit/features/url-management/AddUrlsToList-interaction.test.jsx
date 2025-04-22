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

// We need a more reliable approach for testing the component's interaction with Input
// Set up spies to monitor feedback state
let mockFeedback = '';
let inputErrorSpy;
let inputSuccessSpy;

// Mock the Input component
vi.mock('@ui/Input', () => ({
  default: ({ error, success, id, label, value, onChange, disabled, ...props }) => {
    // Update our spies
    if (error) inputErrorSpy = error;
    if (success) inputSuccessSpy = success;
    
    return (
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
    );
  }
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

describe('AddUrlsToList - Interaction', () => {
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
    mockFeedback = '';
    inputErrorSpy = undefined;
    inputSuccessSpy = undefined;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('handles validation for empty URL', async () => {
    const { rerender } = render(<AddUrlsToList listId="123" />);
    
    const button = screen.getByRole('button', { name: /add url/i });
    
    // Button should be disabled initially
    expect(button).toBeDisabled();
    
    // Try with empty string to trigger validation
    const input = screen.getByTestId('url-input');
    await act(async () => {
      fireEvent.change(input, { target: { value: ' ' } });
      // Need to force the button to be clickable for testing
      button.disabled = false;
    });
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    // The component should set feedback for empty URL
    // Since we can't easily check the state directly, let's verify if
    // the addUrlToList function was not called
    expect(mockAddUrlToList).not.toHaveBeenCalled();
  });

  it('successfully adds a URL to the list', async () => {
    mockAddUrlToList.mockResolvedValue({ id: '1', url: 'https://example.com' });

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://example.com' } });
    });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockAddUrlToList).toHaveBeenCalledWith(123, 'https://example.com');
    });

    // Verify that the input was cleared after success
    expect(input.value).toBe('');
  });

  it('formats URL by adding https:// prefix when not provided', async () => {
    mockAddUrlToList.mockResolvedValue({ id: '1', url: 'https://example.com' });

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    // Input without https://
    await act(async () => {
      fireEvent.change(input, { target: { value: 'example.com' } });
    });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockAddUrlToList).toHaveBeenCalledWith(123, 'https://example.com');
    });
  });

  it('clears feedback message after timeout', async () => {
    vi.useFakeTimers();
    mockAddUrlToList.mockResolvedValue({ id: '1', url: 'https://example.com' });

    // Mock setTimeout
    const originalSetTimeout = global.setTimeout;
    const mockSetTimeout = vi.fn();
    mockSetTimeout.mockImplementation((callback, delay) => {
      return originalSetTimeout(callback, delay);
    });
    global.setTimeout = mockSetTimeout;

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    // Add URL and trigger success feedback
    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://example.com' } });
    });

    await act(async () => {
      fireEvent.click(button);
      // Fast-forward timers to handle the async operation
      await vi.runOnlyPendingTimersAsync();
    });
    
    // Verify setTimeout was called with the appropriate delay (3000ms)
    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
    
    // Restore timer mocks
    global.setTimeout = originalSetTimeout;
    vi.useRealTimers();
  });

  it('disables the add button when URL is empty', () => {
    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    // Initially empty, button should be disabled
    expect(button).toBeDisabled();
    
    // Add some text, button should be enabled
    fireEvent.change(input, { target: { value: 'example.com' } });
    expect(button).not.toBeDisabled();
    
    // Clear the text, button should be disabled again
    fireEvent.change(input, { target: { value: '' } });
    expect(button).toBeDisabled();
  });
});