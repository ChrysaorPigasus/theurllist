// For testing purposes only - these mocks should not affect the actual application
import { vi } from 'vitest';

// Create mock store objects with proper methods - only for testing
export const mockListStore = { 
  get: vi.fn(() => ({ lists: [], activeListId: null })),
  set: vi.fn(),
  setKey: vi.fn(),
  mockState: { lists: [], activeListId: null }
};

export const mockListUIState = { 
  get: vi.fn(() => ({ isLoading: false, error: null })),
  set: vi.fn(),
  setKey: vi.fn(),
  mockState: { isLoading: false, error: null }
};

// Mock store functions - only for testing
export const mockInitializeStore = vi.fn(() => Promise.resolve());
export const mockCreateList = vi.fn(() => Promise.resolve({ id: 'mock-id', name: 'Mock List' }));
export const mockDeleteList = vi.fn(() => Promise.resolve(true));
export const mockSetActiveList = vi.fn();
export const mockGetActiveList = vi.fn(() => null);
export const mockFetchLists = vi.fn(() => Promise.resolve([]));
export const mockFetchListDetails = vi.fn(() => Promise.resolve({ id: 'mock-id', name: 'Mock List', urls: [] }));

// URL management mock functions - only for testing
export const mockAddUrlToList = vi.fn(() => Promise.resolve({ id: 'mock-url-id', url: 'https://example.com' }));
export const mockUpdateUrl = vi.fn(() => Promise.resolve(true));
export const mockDeleteUrl = vi.fn(() => Promise.resolve(true));

// Sharing mock functions - only for testing
export const mockUpdateCustomUrl = vi.fn(() => Promise.resolve({ customUrl: 'mock-custom-url' }));
export const mockPublishList = vi.fn(() => Promise.resolve({ shareUrl: 'https://example.com/list/mock-id' }));
export const mockGetShareableUrl = vi.fn(() => 'https://example.com/list/mock-id');
export const mockShareList = vi.fn(() => Promise.resolve('https://example.com/list/mock-id'));

// Reset all mocks - call this in beforeEach in test files
export function resetMocks() {
  vi.clearAllMocks();
  
  // Reset store mocks
  mockListStore.get.mockReturnValue({ lists: [], activeListId: null });
  mockListStore.mockState = { lists: [], activeListId: null };
  
  mockListUIState.get.mockReturnValue({ isLoading: false, error: null });
  mockListUIState.mockState = { isLoading: false, error: null };
  
  // Reset function mocks
  mockGetActiveList.mockReturnValue(null);
}

// Important: These mocks should ONLY be used in test files with vi.mock() 
// Do not use these in actual implementation code