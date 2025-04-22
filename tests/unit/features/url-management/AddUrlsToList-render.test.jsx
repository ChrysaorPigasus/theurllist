import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('AddUrlsToList - Rendering', () => {
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

  it('renders the URL input form', () => {
    render(<AddUrlsToList listId="123" />);
    expect(screen.getByText(/Add URL to List/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add url/i })).toBeInTheDocument();
  });

  it('renders the URL input and button with correct initial state', () => {
    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled(); // Button should be disabled initially
  });

  it('displays list of existing URLs', () => {
    mockLists = [{
      ...mockList,
      urls: [
        { id: '1', url: 'https://example.com' },
        { id: '2', url: 'https://test.com' }
      ]
    }];

    render(<AddUrlsToList listId="123" />);
    
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
  });

  it('shows empty state when no URLs exist', () => {
    render(<AddUrlsToList listId="123" />);
    expect(screen.getByText(/no urls added yet/i)).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    mockIsLoading = true;

    render(<AddUrlsToList listId="123" />);
    
    const input = screen.getByTestId('url-input');
    const button = screen.getByRole('button', { name: /add url/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button.getAttribute('data-loading')).toBe('true');
  });
});