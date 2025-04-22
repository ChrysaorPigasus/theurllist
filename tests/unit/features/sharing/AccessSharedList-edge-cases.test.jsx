import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the modules first before defining mock implementations
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

vi.mock('@stores/lists', () => {
  // Define mock objects here inside the mock factory
  const listStore = {
    get: vi.fn(),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  };
  
  const listUIState = {
    get: vi.fn(),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  };
  
  return {
    listStore,
    listUIState,
    initializeStore: vi.fn(),
    setActiveList: vi.fn(),
    getActiveList: vi.fn()
  };
});

// Import mocked modules after mocking
import { useStore } from '@nanostores/react';
import * as listsStore from '@stores/lists';
import AccessSharedList from '@components/features/sharing/AccessSharedList';

// Get references to the mocked store objects
const { listStore, listUIState } = listsStore;

describe('AccessSharedList Edge Cases', () => {
  let mockSetActiveList;
  let mockInitializeStore;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockSetActiveList = vi.fn();
    mockInitializeStore = vi.fn().mockResolvedValue(true);
    
    listsStore.setActiveList.mockImplementation(mockSetActiveList);
    listsStore.initializeStore.mockImplementation(mockInitializeStore);
  });

  it('toont een laad-indicator tijdens het laden', () => {
    // Setup mock voor laadstatus
    useStore.mockImplementation(store => {
      if (store === listStore) {
        return { lists: [], activeListId: null };
      }
      if (store === listUIState) {
        return { isLoading: true, error: null };
      }
      return {};
    });

    render(<AccessSharedList listId="123" />);
    
    // Check that the loading spinner is displayed using testId instead of role
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('toont foutmelding bij API error', () => {
    // Setup mock voor foutmelding
    useStore.mockImplementation(store => {
      if (store === listStore) {
        return { lists: [], activeListId: null };
      }
      if (store === listUIState) {
        return { isLoading: false, error: "Failed to load list" };
      }
      return {};
    });

    render(<AccessSharedList listId="123" />);
    
    // Check dat de foutmelding getoond wordt
    expect(screen.getByText(/Failed to load list/i)).toBeInTheDocument();
  });

  it('toont "List Not Found" wanneer de liste niet bestaat', () => {
    // Setup mock voor niet-bestaande lijst
    useStore.mockImplementation(store => {
      if (store === listStore) {
        return { lists: [], activeListId: "999" };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });

    render(<AccessSharedList listId="999" />);
    
    // Check dat de "niet gevonden" boodschap getoond wordt
    expect(screen.getByText(/List Not Found/i)).toBeInTheDocument();
  });

  it('toont "Private List" voor niet-gepubliceerde lijsten', () => {
    // Setup mock voor niet-gepubliceerde lijst
    useStore.mockImplementation(store => {
      if (store === listStore) {
        return { 
          lists: [{ id: "123", name: "Private Test List", isPublished: false }],
          activeListId: "123" 
        };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });

    render(<AccessSharedList listId="123" />);
    
    // Check dat de "privé lijst" boodschap getoond wordt
    expect(screen.getByText(/Private List/i)).toBeInTheDocument();
  });

  it('toont een lege lijst correct', () => {
    // Setup mock voor een lege lijst (wel gepubliceerd)
    useStore.mockImplementation(store => {
      if (store === listStore) {
        return { 
          lists: [{ 
            id: "123", 
            name: "Empty List", 
            urls: [], 
            isPublished: true 
          }],
          activeListId: "123" 
        };
      }
      if (store === listUIState) {
        return { isLoading: false, error: null };
      }
      return {};
    });

    render(<AccessSharedList listId="123" />);
    
    // Check dat de lijst naam correct getoond wordt
    expect(screen.getByText(/Empty List/i)).toBeInTheDocument();
    
    // Check dat de tabel een lege tbody heeft
    const tbodies = screen.getAllByRole('rowgroup');
    // Get the second rowgroup element which should be the tbody
    const tbody = tbodies[1]; // Skip the thead which is also a rowgroup
    expect(tbody).toBeInTheDocument();
    expect(tbody.children.length).toBe(0);
  });
});