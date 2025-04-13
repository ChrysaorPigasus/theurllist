import { describe, it, expect, vi, beforeEach } from 'vitest';
import { urlListStore, isLoading, error, initializeStore, createList, deleteList, updateCustomUrl } from './urlListStore';
import { getLists, createList as dbCreateList, deleteList as dbDeleteList, updateCustomUrl as dbUpdateCustomUrl } from '../utils/database';

// Mock database functions
vi.mock('../utils/database', () => ({
  getLists: vi.fn(),
  createList: vi.fn(),
  deleteList: vi.fn(),
  updateCustomUrl: vi.fn()
}));

describe('urlListStore', () => {
  beforeEach(() => {
    // Reset store state
    urlListStore.set({ lists: [], activeListId: null });
    isLoading.set(false);
    error.set(null);
    
    // Clear mocks
    vi.clearAllMocks();
  });

  describe('initializeStore', () => {
    it('should load lists from database', async () => {
      const mockLists = [
        { id: '1', name: 'List 1' },
        { id: '2', name: 'List 2' }
      ];
      getLists.mockResolvedValue(mockLists);

      await initializeStore();

      expect(getLists).toHaveBeenCalled();
      expect(urlListStore.get().lists).toEqual(mockLists);
      expect(isLoading.get()).toBe(false);
      expect(error.get()).toBe(null);
    });

    it('should handle initialization errors', async () => {
      const errorMsg = 'Database error';
      getLists.mockRejectedValue(new Error(errorMsg));

      await initializeStore();

      expect(getLists).toHaveBeenCalled();
      expect(urlListStore.get().lists).toEqual([]);
      expect(isLoading.get()).toBe(false);
      expect(error.get()).toBe('Failed to load lists. Please try again.');
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      const newList = { id: '1', name: 'New List', customUrl: 'custom-url' };
      dbCreateList.mockResolvedValue(newList);

      const result = await createList('New List', 'custom-url');

      expect(dbCreateList).toHaveBeenCalledWith('New List', 'custom-url');
      expect(result).toEqual(newList);
      expect(urlListStore.get().lists).toContain(newList);
      expect(isLoading.get()).toBe(false);
      expect(error.get()).toBe(null);
    });

    it('should handle creation errors', async () => {
      dbCreateList.mockRejectedValue(new Error('Creation failed'));

      const result = await createList('New List');

      expect(result).toBe(null);
      expect(error.get()).toBe('Failed to create list. Please try again.');
      expect(isLoading.get()).toBe(false);
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      const listId = '1';
      urlListStore.set({ lists: [{ id: listId, name: 'Test List' }], activeListId: null });
      dbDeleteList.mockResolvedValue(true);

      const result = await deleteList(listId);

      expect(dbDeleteList).toHaveBeenCalledWith(listId);
      expect(result).toBe(true);
      expect(urlListStore.get().lists).toEqual([]);
      expect(isLoading.get()).toBe(false);
      expect(error.get()).toBe(null);
    });

    it('should handle deletion errors', async () => {
      dbDeleteList.mockRejectedValue(new Error('Deletion failed'));

      const result = await deleteList('1');

      expect(result).toBe(false);
      expect(error.get()).toBe('Failed to delete list. Please try again.');
      expect(isLoading.get()).toBe(false);
    });
  });

  describe('updateCustomUrl', () => {
    it('should update custom URL', async () => {
      const listId = '1';
      const customUrl = 'new-url';
      const updatedList = { id: listId, customUrl };
      urlListStore.set({ lists: [{ id: listId, name: 'Test List', customUrl: 'old-url' }], activeListId: null });
      dbUpdateCustomUrl.mockResolvedValue(updatedList);

      const result = await updateCustomUrl(listId, customUrl);

      expect(dbUpdateCustomUrl).toHaveBeenCalledWith(listId, customUrl);
      expect(result).toBe(true);
      expect(urlListStore.get().lists[0].customUrl).toBe(customUrl);
      expect(isLoading.get()).toBe(false);
      expect(error.get()).toBe(null);
    });

    it('should handle update errors', async () => {
      dbUpdateCustomUrl.mockRejectedValue(new Error('Update failed'));

      const result = await updateCustomUrl('1', 'new-url');

      expect(result).toBe(false);
      expect(error.get()).toBe('Failed to update custom URL. This URL might already be taken.');
      expect(isLoading.get()).toBe(false);
    });
  });
});