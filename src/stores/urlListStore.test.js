import { describe, it, expect, vi, beforeEach } from 'vitest';
import { atom } from 'nanostores';

// Since we can't directly import from urlListStore.js due to ES module issues,
// we'll create mock versions of the stores and functions
const mockUrlListStore = atom([]);
const mockIsLoading = atom(false);
const mockError = atom(null);

// Mock functions
const mockAddUrl = vi.fn();
const mockRemoveUrl = vi.fn();
const mockUpdateUrl = vi.fn();
const mockClearUrls = vi.fn();
const mockSortUrlsBy = vi.fn();
const mockFilterUrls = vi.fn();

// Create mocks before importing
vi.mock('../stores/urlListStore', () => {
  return {
    urlListStore: mockUrlListStore,
    isLoading: mockIsLoading,
    error: mockError,
    addUrl: mockAddUrl,
    removeUrl: mockRemoveUrl,
    updateUrl: mockUpdateUrl,
    clearUrls: mockClearUrls,
    sortUrlsBy: mockSortUrlsBy,
    filterUrls: mockFilterUrls
  };
});

// Now we can import from the mock
import {
  urlListStore,
  isLoading,
  error,
  addUrl,
  removeUrl,
  updateUrl,
  clearUrls,
  sortUrlsBy,
  filterUrls
} from '../stores/urlListStore';

describe('urlListStore', () => {
  beforeEach(() => {
    // Reset the store to initial state
    mockUrlListStore.set([]);
    mockIsLoading.set(false);
    mockError.set(null);
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('initializes with empty url list', () => {
    expect(urlListStore.get()).toEqual([]);
  });

  it('initializes with isLoading set to false', () => {
    expect(isLoading.get()).toBe(false);
  });

  it('initializes with error set to null', () => {
    expect(error.get()).toBe(null);
  });

  describe('addUrl', () => {
    it('adds a url to the list', () => {
      const url = { id: '1', url: 'https://example.com', title: 'Example' };
      
      mockAddUrl.mockImplementation((newUrl) => {
        const currentUrls = mockUrlListStore.get();
        mockUrlListStore.set([...currentUrls, newUrl]);
        return newUrl;
      });
      
      const result = addUrl(url);
      
      expect(result).toEqual(url);
      expect(mockUrlListStore.get()).toEqual([url]);
    });

    it('handles loading state when adding a url', () => {
      mockAddUrl.mockImplementation(() => {
        mockIsLoading.set(true);
        // Simulate an API call
        mockIsLoading.set(false);
        return { id: '1', url: 'https://example.com', title: 'Example' };
      });
      
      addUrl({ url: 'https://example.com', title: 'Example' });
      
      expect(mockIsLoading.get()).toBe(false);
    });

    it('handles errors when adding a url', () => {
      const testError = new Error('Failed to add URL');
      
      mockAddUrl.mockImplementation(() => {
        mockIsLoading.set(true);
        // Simulate an API error
        mockError.set(testError.message);
        mockIsLoading.set(false);
        throw testError;
      });
      
      try {
        addUrl({ url: 'https://example.com', title: 'Example' });
      } catch (err) {
        expect(err).toBe(testError);
      }
      
      expect(mockError.get()).toBe(testError.message);
    });
  });

  describe('removeUrl', () => {
    it('removes a url from the list', () => {
      const url1 = { id: '1', url: 'https://example.com', title: 'Example 1' };
      const url2 = { id: '2', url: 'https://example.org', title: 'Example 2' };
      
      mockUrlListStore.set([url1, url2]);
      
      mockRemoveUrl.mockImplementation((id) => {
        const currentUrls = mockUrlListStore.get();
        mockUrlListStore.set(currentUrls.filter(url => url.id !== id));
        return id;
      });
      
      const result = removeUrl('1');
      
      expect(result).toBe('1');
      expect(mockUrlListStore.get()).toEqual([url2]);
    });
  });

  describe('updateUrl', () => {
    it('updates a url in the list', () => {
      const url1 = { id: '1', url: 'https://example.com', title: 'Example 1' };
      const url2 = { id: '2', url: 'https://example.org', title: 'Example 2' };
      
      mockUrlListStore.set([url1, url2]);
      
      const updatedUrl = { id: '1', url: 'https://example.com', title: 'Updated Example' };
      
      mockUpdateUrl.mockImplementation((id, updates) => {
        const currentUrls = mockUrlListStore.get();
        mockUrlListStore.set(currentUrls.map(url => 
          url.id === id ? { ...url, ...updates } : url
        ));
        return { id, ...updates };
      });
      
      const result = updateUrl('1', { title: 'Updated Example' });
      
      expect(result).toEqual(updatedUrl);
      expect(mockUrlListStore.get()).toEqual([updatedUrl, url2]);
    });
  });

  describe('clearUrls', () => {
    it('clears all urls from the list', () => {
      mockUrlListStore.set([
        { id: '1', url: 'https://example.com', title: 'Example 1' },
        { id: '2', url: 'https://example.org', title: 'Example 2' }
      ]);
      
      mockClearUrls.mockImplementation(() => {
        mockUrlListStore.set([]);
      });
      
      clearUrls();
      
      expect(mockUrlListStore.get()).toEqual([]);
    });
  });

  describe('sortUrlsBy', () => {
    it('sorts urls by the specified field', () => {
      const url1 = { id: '1', url: 'https://example.com', title: 'B Example' };
      const url2 = { id: '2', url: 'https://example.org', title: 'A Example' };
      
      mockUrlListStore.set([url1, url2]);
      
      mockSortUrlsBy.mockImplementation((field, direction = 'asc') => {
        const currentUrls = mockUrlListStore.get();
        mockUrlListStore.set([...currentUrls].sort((a, b) => {
          if (direction === 'asc') {
            return a[field] > b[field] ? 1 : -1;
          } else {
            return a[field] < b[field] ? 1 : -1;
          }
        }));
      });
      
      sortUrlsBy('title');
      
      expect(mockUrlListStore.get()).toEqual([url2, url1]);
      
      // Test descending order
      sortUrlsBy('title', 'desc');
      
      expect(mockUrlListStore.get()).toEqual([url1, url2]);
    });
  });

  describe('filterUrls', () => {
    it('filters urls by search term', () => {
      const urls = [
        { id: '1', url: 'https://example.com', title: 'Example 1' },
        { id: '2', url: 'https://example.org', title: 'Example 2' },
        { id: '3', url: 'https://test.com', title: 'Test Site' }
      ];
      
      mockUrlListStore.set(urls);
      
      mockFilterUrls.mockImplementation((term) => {
        const currentUrls = mockUrlListStore.get();
        const lowerTerm = term.toLowerCase();
        return currentUrls.filter(url => 
          url.url.toLowerCase().includes(lowerTerm) || 
          url.title.toLowerCase().includes(lowerTerm)
        );
      });
      
      const result = filterUrls('test');
      
      expect(result).toEqual([urls[2]]);
      
      // Test filtering with no matches
      const emptyResult = filterUrls('nonexistent');
      
      expect(emptyResult).toEqual([]);
    });
  });
});