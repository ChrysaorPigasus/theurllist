import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addUrlToList, updateUrl, deleteUrl, listUIState } from './urlStore';
import { getActiveList } from '../urlListStore';

// Mock dependencies
vi.mock('../urlListStore', () => ({
  getActiveList: vi.fn()
}));

// Mock dynamically imported modules
vi.mock('./listStore', async () => {
  const actual = await vi.importActual('./listStore');
  return {
    ...actual,
    fetchListDetails: vi.fn(() => Promise.resolve({ id: 123, name: 'Test List', urls: [] }))
  };
});

// Mock console methods
console.error = vi.fn();
console.log = vi.fn();

// Mock fetch API for test isolation
global.fetch = vi.fn();

describe('urlStore', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    fetch.mockReset();
    console.error.mockClear();
    console.log.mockClear();
    
    // Reset store state
    listUIState.set({ isLoading: false, error: null });
  });

  describe('addUrlToList', () => {
    const validListId = '123';
    const validUrlData = { 
      url: 'https://example.com', 
      title: 'Example', 
      description: 'Description',
      image: 'image.jpg'
    };

    it('should add URL to the list successfully', async () => {
      // Set up mock to return success
      const mockResponse = { id: 'url-1', ...validUrlData };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      
      const result = await addUrlToList(validListId, validUrlData);
      
      expect(fetch).toHaveBeenCalledWith('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validUrlData, list_id: 123 })
      });
      
      expect(result).toEqual(mockResponse);
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle invalid list ID format', async () => {
      const result = await addUrlToList('invalid', validUrlData);
      
      expect(result).toBeNull();
      expect(listUIState.get().error).toBe('Invalid list ID');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle API error response', async () => {
      // Set up mock to return error
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Server error')
      });
      
      const result = await addUrlToList(validListId, validUrlData);
      
      expect(result).toBeNull();
      expect(listUIState.get().error).toBe('Failed to add URL. Please try again.');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      // Set up mock to simulate network error
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await addUrlToList(validListId, validUrlData);
      
      expect(result).toBeNull();
      expect(listUIState.get().error).toBe('Failed to add URL. Please try again.');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateUrl', () => {
    const urlId = '456';
    const urlData = { 
      url: 'https://example.com/updated', 
      title: 'Updated Example'
    };

    it('should update URL successfully', async () => {
      // Set up mock active list
      const activeList = { id: 123, name: 'Test List' };
      getActiveList.mockReturnValueOnce(activeList);
      
      // Set up mock to return success
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...urlData, id: urlId })
      });
      
      const result = await updateUrl(urlId, urlData);
      
      expect(fetch).toHaveBeenCalledWith('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...urlData, id: urlId })
      });
      
      expect(result).toBe(true);
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle API error response', async () => {
      // Set up mock active list
      const activeList = { id: 123, name: 'Test List' };
      getActiveList.mockReturnValueOnce(activeList);
      
      // Set up mock to return error
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Server error')
      });
      
      const result = await updateUrl(urlId, urlData);
      
      expect(result).toBe(false);
      expect(listUIState.get().error).toBe('Failed to update URL. Please try again.');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle case when no active list is found', async () => {
      // Set up mock for no active list
      getActiveList.mockReturnValueOnce(null);
      
      const result = await updateUrl(urlId, urlData);
      
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
      expect(listUIState.get().error).toBe('No active list found.');
    });
  });

  describe('deleteUrl', () => {
    const urlId = '789';

    it('should delete URL successfully', async () => {
      // Set up mock active list
      const activeList = { id: 123, name: 'Test List' };
      getActiveList.mockReturnValueOnce(activeList);
      
      // Set up mock to return success
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });
      
      const result = await deleteUrl(urlId);
      
      expect(fetch).toHaveBeenCalledWith(`/api/links?id=${urlId}`, {
        method: 'DELETE'
      });
      
      expect(result).toBe(true);
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle API error response', async () => {
      // Set up mock active list
      const activeList = { id: 123, name: 'Test List' };
      getActiveList.mockReturnValueOnce(activeList);
      
      // Set up mock to return error
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Server error')
      });
      
      const result = await deleteUrl(urlId);
      
      expect(result).toBe(false);
      expect(listUIState.get().error).toBe('Failed to delete URL. Please try again.');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle case when no active list is found', async () => {
      // Set up mock for no active list
      getActiveList.mockReturnValueOnce(null);
      
      const result = await deleteUrl(urlId);
      
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
      expect(listUIState.get().error).toBe('No active list found.');
    });
  });
});