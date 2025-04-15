import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutomaticUrlGeneration from './AutomaticUrlGeneration';

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

const mockUpdateCustomUrl = vi.fn();

// Mock the stores module
vi.mock('../../../stores/lists', () => {
  return {
    listStore: listStoreMock,
    listUIState: listUIStateMock,
    updateCustomUrl: mockUpdateCustomUrl
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

// Mock the utility functions
vi.mock('../../../utils/urlGeneration', () => ({
  generateUrlSlug: () => 'auto-generated-slug',
  validateCustomUrl: (url) => url.length >= 3
}));

describe('AutomaticUrlGeneration', () => {
  const mockList = {
    id: '123',
    name: 'Test List',
    customUrl: ''
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

  it('renders the automatic URL generation component', () => {
    render(<AutomaticUrlGeneration listId="123" />);
    
    expect(screen.getByText('Generate Sharing URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('generates a URL slug when button is clicked', async () => {
    mockUpdateCustomUrl.mockResolvedValueOnce(true);
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);
    
    expect(mockUpdateCustomUrl).toHaveBeenCalledWith('123', 'auto-generated-slug');
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('URL generated successfully')).toBeInTheDocument();
    });
  });

  it('shows loading state when generating URL', async () => {
    // Setup a promise that doesn't resolve immediately
    let resolvePromise;
    const updatePromise = new Promise(resolve => { resolvePromise = resolve; });
    mockUpdateCustomUrl.mockReturnValueOnce(updatePromise);
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);
    
    // Button should be in loading state
    expect(generateButton).toBeDisabled();
    expect(generateButton.querySelector('.animate-spin')).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise(true);
    await updatePromise;
  });

  it('handles errors when generating URL', async () => {
    mockUpdateCustomUrl.mockRejectedValueOnce(new Error('Failed to generate URL'));
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to generate URL')).toBeInTheDocument();
    });
  });

  it('displays the generated URL when list already has a customUrl', () => {
    const listWithCustomUrl = {
      id: '123',
      name: 'Test List',
      customUrl: 'my-custom-url'
    };
    
    listStoreMock.mockLists = [listWithCustomUrl];
    
    render(<AutomaticUrlGeneration listId="123" />);
    
    expect(screen.getByText(/current url/i)).toBeInTheDocument();
    expect(screen.getByText('my-custom-url')).toBeInTheDocument();
  });

  it('does not display current URL section when no custom URL exists', () => {
    render(<AutomaticUrlGeneration listId="123" />);
    
    expect(screen.queryByText(/current url/i)).not.toBeInTheDocument();
  });

  it('returns null when list is not found', () => {
    listStoreMock.mockLists = [];
    
    const { container } = render(<AutomaticUrlGeneration listId="999" />);
    expect(container.firstChild).toBeNull();
  });
});