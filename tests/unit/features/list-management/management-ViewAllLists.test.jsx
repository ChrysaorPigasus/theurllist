import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock data voor alle tests
const mockLists = [
  { id: '1', name: 'Test List 1', urls: [] },
  { id: '2', name: 'Test List 2', urls: [] }
];

// Mutable state voor dynamische mock responses
let mockIsLoading = false;
let mockError = null;
let mockListsData = [...mockLists]; // Standaardwaarde die aangepast kan worden in tests

// Mock @nanostores/react VÓÓR import van de component
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => {
    if (store.name === 'listStore') {
      return { lists: mockListsData };
    }
    if (store.name === 'listUIState') {
      return { isLoading: mockIsLoading, error: mockError };
    }
    return store.get ? store.get() : {};
  })
}));

// Mock de stores/lists module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      name: 'listStore',
      get: vi.fn(() => ({ lists: mockListsData })),
      set: vi.fn(),
      setKey: vi.fn()
    },
    listUIState: {
      name: 'listUIState',
      get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError })),
      set: vi.fn(),
      setKey: vi.fn()
    },
    fetchLists: vi.fn().mockResolvedValue(true),
    setActiveList: vi.fn()
  };
});

// Mock DeleteList component
vi.mock('./DeleteList', () => ({
  default: ({ listId }) => <button data-testid={`delete-list-${listId}`}>Delete List</button>
}));

// Import de component en mocked dependencies NA de mock definities
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';
import ViewAllLists from '@components/features/list-management/ViewAllLists';

describe('ViewAllLists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mockstate naar standaardwaarden voor elke test
    mockIsLoading = false;
    mockError = null;
    mockListsData = [...mockLists];
  });

  it('fetches lists when mounted', () => {
    render(<ViewAllLists />);
    expect(listsStore.fetchLists).toHaveBeenCalled();
  });

  it('displays loading spinner while fetching lists', () => {
    // Set loading state
    mockIsLoading = true;
    mockListsData = [];
    
    render(<ViewAllLists />);
    
    // Check voor de aanwezigheid van een spinner in plaats van een heading
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('displays lists when available', () => {
    // Standaard mockListsData wordt gebruikt
    
    render(<ViewAllLists />);
    
    // Should display list card with correct title
    expect(screen.getByText('Your URL Lists')).toBeInTheDocument();
    
    // Should display all lists
    expect(screen.getByText('Test List 1')).toBeInTheDocument();
    expect(screen.getByText('Test List 2')).toBeInTheDocument();
  });

  it('displays empty state when no lists exist', () => {
    // Lege lijst voor deze test
    mockListsData = [];
    
    render(<ViewAllLists />);
    
    expect(screen.getByText('No Lists Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first URL list to get started')).toBeInTheDocument();
  });

  it('shows error message when fetching lists fails', async () => {
    // Set error state
    mockError = 'Failed to load lists';
    
    render(<ViewAllLists />);
    
    // Gebruik query in plaats van getBy om geen error te krijgen als het element niet direct beschikbaar is
    const errorElement = screen.queryByText('Failed to load lists');
    expect(errorElement).toBeInTheDocument();
  });
});