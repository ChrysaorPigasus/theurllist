import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the imported modules first
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Mock the stores and functions
vi.mock('../../../stores/lists', () => {
  return {
    listStore: {},
    listUIState: {},
    publishList: vi.fn().mockResolvedValue(true)
  };
});

// Import after mocking
import { useStore } from '@nanostores/react';
import { listStore, listUIState, publishList } from '../../../stores/lists';
import PublishList from './PublishList';

// Create mock values for the tests
const mockLists = [
  {
    id: '123',
    name: 'Test List',
    urls: [],
    isPublished: false,
    publishedAt: null
  },
  {
    id: '456',
    name: 'Published List',
    urls: [],
    isPublished: true,
    publishedAt: '2023-01-01T12:00:00Z'
  }
];

describe('PublishList', () => {
  const mockListId = '123';
  let mockIsLoading = false;
  let mockError = null;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset test values
    mockIsLoading = false;
    mockError = null;
    
    // Mock useStore to return store values
    useStore.mockImplementation((store) => {
      if (store === listStore) {
        return { lists: mockLists };
      } else if (store === listUIState) {
        return { isLoading: mockIsLoading, error: mockError };
      }
      return {};
    });
  });
  
  it('renders the publish button for unpublished list', () => {
    render(<PublishList listId="123" />);
    
    expect(screen.getByText(/your list is currently private/i)).toBeInTheDocument();
    const publishButton = screen.getByRole('button', { name: /publish list/i });
    expect(publishButton).toBeInTheDocument();
  });
  
  it('shows publish status for published list', () => {
    render(<PublishList listId="456" />);
    
    expect(screen.getByText(/published on/i)).toBeInTheDocument();
    const publishedButton = screen.getByRole('button', { name: /published/i });
    expect(publishedButton).toBeInTheDocument();
    expect(publishedButton).toBeDisabled();
  });
  
  it('publishes the list when publish button is clicked', () => {
    render(<PublishList listId="123" />);
    
    fireEvent.click(screen.getByRole('button', { name: /publish list/i }));
    
    expect(publishList).toHaveBeenCalledWith('123');
  });
  
  it('shows loading state when publishing', () => {
    mockIsLoading = true;
    
    render(<PublishList listId="123" />);
    
    const publishButton = screen.getByRole('button', { name: /publish list/i });
    expect(publishButton).toBeDisabled();
  });
  
  it('handles publishing errors gracefully', () => {
    mockError = 'Failed to publish list';
    
    render(<PublishList listId="123" />);
    
    expect(screen.getByText('Failed to publish list')).toBeInTheDocument();
  });
  
  it('returns null when list is not found', () => {
    const { container } = render(<PublishList listId="999" />);
    
    // The component should return null if the list is not found
    expect(container.firstChild).toBeNull();
  });
});