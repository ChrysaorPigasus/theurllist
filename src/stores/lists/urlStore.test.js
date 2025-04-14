import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addUrlToList, updateUrl, deleteUrl } from './urlStore';
import { listUIState, getActiveList, fetchListDetails } from './listStore';

// Mock dependencies
vi.mock('./listStore', () => ({
  listUIState: {
    setKey: vi.fn(),
  },
  getActiveList: vi.fn(),
  fetchListDetails: vi.fn(),
}));

// Mock fetch API
global.fetch = vi.fn();

describe('urlStore', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    listUIState.setKey.mockClear();
    getActiveList.mockClear();
    fetchListDetails.mockClear();
    fetch.mockReset();
  });

  describe('addUrlToList', () => {
    const validListId = 123;
    const validUrlData = { 
      url: 'https://example.com', 
      title: 'Example', 
      description: 'Description',
      image: 'image.jpg'
    };

    it('should add URL to the list successfully', async () => {
      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: validUrlData })
      });

      const result = await addUrlToList(validListId, validUrlData);

      // Verify loading state management
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', null);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);

      // Verify fetch call
      expect(fetch).toHaveBeenCalledWith(`/api/lists/${validListId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: validUrlData.url,
          title: validUrlData.title,
          description: validUrlData.description,
          image: validUrlData.image
        }),
      });

      // Verify list refresh
      expect(fetchListDetails).toHaveBeenCalledWith(validListId);
      
      // Verify result
      expect(result).toEqual(validUrlData);
    });

    it('should handle invalid list ID format', async () => {
      const invalidListId = 'invalid';
      
      const result = await addUrlToList(invalidListId, validUrlData);

      expect(result).toBeNull();
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Invalid list ID format');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle API error response', async () => {
      const errorMessage = 'Failed to add URL';
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage })
      });

      const result = await addUrlToList(validListId, validUrlData);

      expect(result).toBeNull();
      expect(listUIState.setKey).toHaveBeenCalledWith('error', errorMessage);
    });

    it('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await addUrlToList(validListId, validUrlData);

      expect(result).toBeNull();
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Network error');
    });
  });

  describe('updateUrl', () => {
    const urlId = 456;
    const urlData = { 
      url: 'https://example.com/updated', 
      title: 'Updated Example', 
      description: 'Updated Description',
      image: 'updated-image.jpg'
    };

    it('should update URL successfully', async () => {
      // Mock active list
      const activeList = { id: 123 };
      getActiveList.mockReturnValueOnce(activeList);

      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(urlData)
      });

      const result = await updateUrl(urlId, urlData);

      // Verify loading state management
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', null);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);

      // Verify fetch call
      expect(fetch).toHaveBeenCalledWith('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: urlId,
          url: urlData.url,
          title: urlData.title,
          description: urlData.description,
          image: urlData.image
        }),
      });

      // Verify list refresh
      expect(getActiveList).toHaveBeenCalled();
      expect(fetchListDetails).toHaveBeenCalledWith(activeList.id);
      
      // Verify result
      expect(result).toBe(true);
    });

    it('should handle API error response', async () => {
      const errorMessage = 'Failed to update URL';
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage })
      });

      const result = await updateUrl(urlId, urlData);

      expect(result).toBe(false);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', errorMessage);
    });

    it('should handle case when no active list is found', async () => {
      // Mock no active list
      getActiveList.mockReturnValueOnce(null);

      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(urlData)
      });

      const result = await updateUrl(urlId, urlData);

      expect(result).toBe(true);
      expect(fetchListDetails).not.toHaveBeenCalled();
    });
  });

  describe('deleteUrl', () => {
    const urlId = 789;

    it('should delete URL successfully', async () => {
      // Mock active list
      const activeList = { id: 123 };
      getActiveList.mockReturnValueOnce(activeList);

      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await deleteUrl(urlId);

      // Verify loading state management
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', null);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);

      // Verify fetch call
      expect(fetch).toHaveBeenCalledWith(`/api/links?id=${urlId}`, {
        method: 'DELETE',
      });

      // Verify list refresh
      expect(getActiveList).toHaveBeenCalled();
      expect(fetchListDetails).toHaveBeenCalledWith(activeList.id);
      
      // Verify result
      expect(result).toBe(true);
    });

    it('should handle API error response', async () => {
      const errorMessage = 'Failed to delete URL';
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage })
      });

      const result = await deleteUrl(urlId);

      expect(result).toBe(false);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', errorMessage);
    });

    it('should handle case when no active list is found', async () => {
      // Mock no active list
      getActiveList.mockReturnValueOnce(null);

      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await deleteUrl(urlId);

      expect(result).toBe(true);
      expect(fetchListDetails).not.toHaveBeenCalled();
    });
  });
});