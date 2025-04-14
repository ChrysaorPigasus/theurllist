import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  listStore, 
  listUIState, 
  initializeStore, 
  fetchLists, 
  createList, 
  deleteList, 
  setActiveList, 
  getActiveList,
  fetchListDetails
} from './listStore';

// Mock fetch API
global.fetch = vi.fn();

// Mock console methods
console.error = vi.fn();
console.log = vi.fn();

describe('listStore', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    fetch.mockReset();
    console.error.mockClear();
    console.log.mockClear();
    
    // Reset store state
    listStore.set({ lists: [], activeListId: null });
    listUIState.set({ isLoading: false, error: null });
  });

  describe('initializeStore', () => {
    it('should fetch and store lists', async () => {
      const mockLists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockLists)
      });

      await initializeStore();

      expect(fetch).toHaveBeenCalledWith('/api/lists');
      expect(listStore.get()).toEqual({ lists: mockLists, activeListId: null });
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await initializeStore();

      expect(console.error).toHaveBeenCalled();
      expect(listUIState.get().error).toBe('Failed to load lists. Please try again.');
      expect(listUIState.get().isLoading).toBe(false);
    });
  });

  describe('fetchLists', () => {
    it('should fetch and update lists', async () => {
      const mockLists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockLists)
      });

      await fetchLists();

      expect(fetch).toHaveBeenCalledWith('/api/lists');
      expect(listStore.get()).toEqual({ lists: mockLists, activeListId: null });
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await fetchLists();

      expect(console.error).toHaveBeenCalled();
      expect(listUIState.get().error).toBe('Failed to load lists. Please try again.');
      expect(listUIState.get().isLoading).toBe(false);
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      const listName = 'New List';
      const customUrl = 'custom-url';
      const newList = { id: 3, name: listName, customUrl };
      
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(newList)
      });

      const result = await createList(listName, customUrl);

      expect(fetch).toHaveBeenCalledWith('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: listName, customUrl })
      });
      
      expect(result).toEqual(newList);
      expect(listStore.get().lists).toContainEqual(newList);
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle creation error', async () => {
      fetch.mockRejectedValueOnce(new Error('Creation failed'));

      const result = await createList('Failed List');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(listUIState.get().error).toBe('Failed to create list. Please try again.');
      expect(listUIState.get().isLoading).toBe(false);
    });
  });

  describe('deleteList', () => {
    beforeEach(() => {
      // Setup initial state with lists
      listStore.set({
        lists: [
          { id: 1, name: 'List 1' },
          { id: 2, name: 'List 2' }
        ],
        activeListId: 1
      });
    });

    it('should delete a list', async () => {
      fetch.mockResolvedValueOnce({});

      const result = await deleteList(1);

      expect(fetch).toHaveBeenCalledWith('/api/lists?id=1', { method: 'DELETE' });
      expect(result).toBe(true);
      
      // Should remove the list from the store
      expect(listStore.get().lists).toHaveLength(1);
      expect(listStore.get().lists[0].id).toBe(2);
      
      // Should clear active list ID if it was the deleted list
      expect(listStore.get().activeListId).toBeNull();
      
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should not change activeListId if different from deleted list', async () => {
      // Set active list to a different one
      listStore.setKey('activeListId', 2);
      
      fetch.mockResolvedValueOnce({});

      await deleteList(1);

      // Active list ID should remain unchanged
      expect(listStore.get().activeListId).toBe(2);
    });

    it('should handle deletion error', async () => {
      fetch.mockRejectedValueOnce(new Error('Deletion failed'));

      const result = await deleteList(1);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
      expect(listUIState.get().error).toBe('Failed to delete list. Please try again.');
      expect(listUIState.get().isLoading).toBe(false);
      
      // List should still be in the store
      expect(listStore.get().lists).toHaveLength(2);
    });
  });

  describe('setActiveList and getActiveList', () => {
    beforeEach(() => {
      // Setup initial state with lists
      listStore.set({
        lists: [
          { id: 1, name: 'List 1' },
          { id: 2, name: 'List 2' }
        ],
        activeListId: null
      });
    });

    it('should set and get active list', () => {
      setActiveList(2);
      expect(listStore.get().activeListId).toBe(2);
      
      const activeList = getActiveList();
      expect(activeList).toEqual({ id: 2, name: 'List 2' });
    });

    it('should return undefined when no active list', () => {
      const activeList = getActiveList();
      expect(activeList).toBeUndefined();
    });
  });

  describe('fetchListDetails', () => {
    beforeEach(() => {
      // Setup initial state with lists
      listStore.set({
        lists: [
          { id: 1, name: 'List 1' },
          { id: 2, name: 'List 2' }
        ],
        activeListId: null
      });
    });

    it('should fetch and update list details for existing list', async () => {
      const listId = 1;
      const listDetails = { 
        id: 1, 
        name: 'List 1', 
        urls: [{ id: 101, url: 'https://example.com' }]
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(listDetails)
      });

      const result = await fetchListDetails(listId);

      expect(fetch).toHaveBeenCalledWith(`/api/lists/${listId}`);
      expect(result).toEqual(listDetails);
      
      // Should update the list in the store
      expect(listStore.get().lists[0].urls).toEqual(listDetails.urls);
      
      // Should set as active list
      expect(listStore.get().activeListId).toBe(listId);
      
      expect(listUIState.get().isLoading).toBe(false);
      expect(listUIState.get().error).toBe(null);
    });

    it('should handle non-existing list', async () => {
      const listId = 3;
      const listDetails = { 
        id: 3, 
        name: 'New List', 
        urls: [{ id: 103, url: 'https://example3.com' }]
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(listDetails)
      });

      const result = await fetchListDetails(listId);

      // Should add new list to the store
      expect(listStore.get().lists).toHaveLength(3);
      expect(listStore.get().lists[2].id).toBe(3);
      
      // Should set as active list
      expect(listStore.get().activeListId).toBe(listId);
    });

    it('should handle invalid list ID', async () => {
      const result = await fetchListDetails('invalid');
      
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(listUIState.get().error).toBe('Invalid list ID format');
    });

    it('should handle API error response', async () => {
      const listId = 1;
      const errorMessage = 'List not found';
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage })
      });

      const result = await fetchListDetails(listId);

      expect(result).toBeNull();
      expect(listUIState.get().error).toBe(errorMessage);
      expect(listUIState.get().isLoading).toBe(false);
    });

    it('should handle network error', async () => {
      const listId = 1;
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchListDetails(listId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(listUIState.get().error).toBe('Network error');
      expect(listUIState.get().isLoading).toBe(false);
    });

    it('should handle empty listId', async () => {
      await fetchListDetails(null);
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});