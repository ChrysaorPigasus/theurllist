// Add type declaration for vitest-dom
declare global {
  var __vitest_dom_installed: boolean | undefined;
}

// Import testing-library matchers synchronously
import '@testing-library/jest-dom/vitest';

// Import necessary test utilities
import { cleanup } from '@testing-library/react';
import { beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';

// Global error handlers for tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Fail tests on unhandled console errors
  if (args[0] instanceof Error) {
    // Make test fail
    throw args[0];
  }
  originalConsoleError(...args);
};

// Handle unhandled promise rejections and make tests fail
window.addEventListener('unhandledrejection', (event) => {
  throw new Error(`Unhandled promise rejection: ${event.reason}`);
});

// Mock implementation for @stores/lists module
const mockListStore = { 
  get: vi.fn(() => ({ lists: [] })), 
  setKey: vi.fn(),
  set: vi.fn()
};
  
const mockListUIState = { 
  get: vi.fn(() => ({ isLoading: false, error: null })), 
  setKey: vi.fn(),
  set: vi.fn()
};

const mockCreateList = vi.fn().mockResolvedValue({ id: '123', name: 'Test List' });
const mockDeleteList = vi.fn().mockResolvedValue(true);
const mockSetActiveList = vi.fn();
const mockGetActiveList = vi.fn().mockReturnValue({ id: '123', name: 'Test List' });
const mockFetchLists = vi.fn().mockResolvedValue([]);
const mockFetchListDetails = vi.fn().mockResolvedValue({});
const mockAddUrlToList = vi.fn().mockResolvedValue(true);
const mockUpdateUrl = vi.fn().mockResolvedValue(true);
const mockDeleteUrl = vi.fn().mockResolvedValue(true);
const mockUpdateCustomUrl = vi.fn().mockResolvedValue(true);
const mockPublishList = vi.fn().mockResolvedValue(true);
const mockUnpublishList = vi.fn().mockResolvedValue(true);
const mockGetShareableUrl = vi.fn().mockReturnValue('https://example.com/share/list-1');
const mockShareList = vi.fn().mockResolvedValue(true);

// Create the mock module before imports
vi.mock('@stores/lists', () => {
  return {
    // List store exports
    listStore: mockListStore,
    listUIState: mockListUIState,
    initializeStore: vi.fn().mockResolvedValue([]),
    createList: mockCreateList,
    deleteList: mockDeleteList,
    setActiveList: mockSetActiveList,
    getActiveList: mockGetActiveList,
    fetchLists: mockFetchLists,
    fetchListDetails: mockFetchListDetails,
    
    // URL store exports
    addUrlToList: mockAddUrlToList,
    updateUrl: mockUpdateUrl, 
    deleteUrl: mockDeleteUrl,
    
    // Sharing store exports
    updateCustomUrl: mockUpdateCustomUrl,
    publishList: mockPublishList,
    unpublishList: mockUnpublishList,
    getShareableUrl: mockGetShareableUrl,
    shareList: mockShareList
  };
});

// Make mock functions and objects available globally for tests
global.__mocks__ = {
  stores: {
    lists: {
      listStore: mockListStore,
      listUIState: mockListUIState,
      createList: mockCreateList,
      deleteList: mockDeleteList,
      setActiveList: mockSetActiveList,
      getActiveList: mockGetActiveList,
      fetchLists: mockFetchLists,
      fetchListDetails: mockFetchListDetails,
      addUrlToList: mockAddUrlToList,
      updateUrl: mockUpdateUrl,
      deleteUrl: mockDeleteUrl,
      updateCustomUrl: mockUpdateCustomUrl,
      publishList: mockPublishList,
      unpublishList: mockUnpublishList,
      getShareableUrl: mockGetShareableUrl,
      shareList: mockShareList
    }
  }
};

// Make TypeScript happy with our global mocks
declare global {
  var __mocks__: {
    stores: {
      lists: {
        listStore: any;
        listUIState: any;
        createList: any;
        deleteList: any;
        setActiveList: any;
        getActiveList: any;
        fetchLists: any;
        fetchListDetails: any;
        addUrlToList: any;
        updateUrl: any;
        deleteUrl: any;
        updateCustomUrl: any;
        publishList: any;
        unpublishList: any;
        getShareableUrl: any;
        shareList: any;
      }
    }
  };
}

// Also mock the nanostores/react module
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => {
    if (store === mockListStore) {
      return { lists: mockListStore.get().lists };
    }
    if (store === mockListUIState) {
      return mockListUIState.get();
    }
    return store.get ? store.get() : {};
  })
}));

// Initialize test environment
import { initTestEnvironment, teardownAll } from '../utils/test-setup.jsx';

// Initialize the test environment before any tests run
beforeAll(async () => {
  // Load environment variables and initialize services
  await initTestEnvironment();
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset default mock return values
  mockListStore.get.mockReturnValue({ lists: [] });
  mockListUIState.get.mockReturnValue({ isLoading: false, error: null });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Tear down all services after tests are complete
afterAll(async () => {
  await teardownAll();
});

// Import and log the integration configuration
import { logIntegrationConfig } from '../utils/environment.jsx';
logIntegrationConfig();