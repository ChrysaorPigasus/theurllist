import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveList } from '../urlListStore';

// Create mock for fetch
global.fetch = vi.fn();

// Mock the urlListStore module's getActiveList function
vi.mock('../urlListStore', () => ({
  getActiveList: vi.fn()
}));

// Mock the listStore module
vi.mock('./listStore', async () => {
  const actual = await vi.importActual('./listStore');
  return {
    ...actual,
    fetchListDetails: vi.fn()
  };
});

// Import the module after mocking
import * as urlStoreModule from './urlStore';
import { listUIState } from './urlStore';
import { fetchListDetails } from './listStore';

// Create spies for the module functions
vi.spyOn(urlStoreModule, 'addUrlToList');
vi.spyOn(urlStoreModule, 'updateUrl');
vi.spyOn(urlStoreModule, 'deleteUrl');

// Spy on UI state methods
vi.spyOn(listUIState, 'setKey');

const { addUrlToList, updateUrl, deleteUrl } = urlStoreModule;

describe('urlStore', () => {
  const activeListId = 1;
  const urlId = 1;
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset global.fetch
    global.fetch.mockReset();
    
    // Setup mock return values
    getActiveList.mockReturnValue({ id: activeListId, name: 'Test List', urls: [] });
    fetchListDetails.mockResolvedValue({ id: activeListId, name: 'Test List', urls: [] });
  });

  describe('addUrlToList', () => {
    it('adds a URL to a list successfully', async () => {
      const newUrl = {
        url: 'https://example.com',
        title: 'Example'
      };
      
      const addedUrl = {
        id: 1,
        url: 'https://example.com',
        title: 'Example',
        list_id: 1
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => addedUrl
      });
      
      const result = await addUrlToList(activeListId, newUrl);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...newUrl, list_id: activeListId })
      });
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(result).toEqual(addedUrl);
    });

    it('returns false if no active list is selected', async () => {
      const result = await addUrlToList(null, { url: 'https://example.com' });
      
      expect(result).toBeNull();
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Invalid list ID');
    });

    it('handles errors when adding a URL', async () => {
      const newUrl = {
        url: 'https://example.com',
        title: 'Example'
      };
      
      global.fetch.mockRejectedValue(new Error('Failed to add URL'));
      
      const result = await addUrlToList(activeListId, newUrl);
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to add URL. Please try again.');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(result).toBeNull();
    });
  });

  describe('updateUrl', () => {
    it('updates a URL successfully', async () => {
      const updatedUrl = {
        url: 'https://updated-example.com',
        title: 'Updated Example'
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: urlId, ...updatedUrl })
      });
      
      const result = await updateUrl(urlId, updatedUrl);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...updatedUrl, id: urlId })
      });
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(result).toBe(true);
    });

    it('handles errors when updating a URL', async () => {
      const updatedUrl = {
        url: 'https://updated-example.com',
        title: 'Updated Example'
      };
      
      global.fetch.mockRejectedValue(new Error('Failed to update URL'));
      
      const result = await updateUrl(urlId, updatedUrl);
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to update URL. Please try again.');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(result).toBe(false);
    });
  });

  describe('deleteUrl', () => {
    it('deletes a URL successfully', async () => {
      global.fetch.mockResolvedValue({
        ok: true
      });
      
      const result = await deleteUrl(urlId);
      
      expect(global.fetch).toHaveBeenCalledWith(`/api/links?id=${urlId}`, {
        method: 'DELETE'
      });
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(result).toBe(true);
    });

    it('handles errors when deleting a URL', async () => {
      global.fetch.mockRejectedValue(new Error('Failed to delete URL'));
      
      const result = await deleteUrl(urlId);
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to delete URL. Please try again.');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(result).toBe(false);
    });
  });
});