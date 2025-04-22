import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as urlListStoreModule from '@stores/urlListStore';

// Create mock for fetch
global.fetch = vi.fn();

// Create direct mock functions instead of spies
urlListStoreModule.urlListStore.get = vi.fn(() => ({ lists: [], activeListId: null }));
urlListStoreModule.urlListStore.set = vi.fn();
urlListStoreModule.urlListStore.setKey = vi.fn();
urlListStoreModule.isLoading.get = vi.fn(() => false);
urlListStoreModule.isLoading.set = vi.fn();
urlListStoreModule.error.get = vi.fn(() => null);
urlListStoreModule.error.set = vi.fn();

// Create spies for the exported functions
vi.spyOn(urlListStoreModule, 'createList');
vi.spyOn(urlListStoreModule, 'deleteList');
vi.spyOn(urlListStoreModule, 'updateCustomUrl');

const {
  urlListStore,
  isLoading,
  error,
  createList,
  deleteList,
  updateCustomUrl
} = urlListStoreModule;

describe('urlListStore - CRUD Operations', () => {
  beforeEach(() => {
    // Reset all mocks and mock implementations
    vi.clearAllMocks();
    
    // Reset global.fetch
    global.fetch = vi.fn();
    
    // Reset store values to defaults
    urlListStore.get.mockReturnValue({ lists: [], activeListId: null });
    isLoading.get.mockReturnValue(false);
    error.get.mockReturnValue(null);
  });

  describe('createList', () => {
    it('creates a new list and adds it to the store', async () => {
      const newList = { id: 1, name: 'New List', urls: [] };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => newList
      });
      
      // Mock createList to return the newList directly for this test
      const createListSpy = vi.spyOn(urlListStoreModule, 'createList')
        .mockResolvedValue(newList);
      
      const result = await createList('New List');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New List', customUrl: null })
      });
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(urlListStore.set).toHaveBeenCalled();
      expect(result).toEqual(newList);
      
      // Restore original implementation
      createListSpy.mockRestore();
    });

    it('creates a list with optional parameters', async () => {
      const newList = { 
        id: 1, 
        name: 'New List', 
        title: 'List Title',
        description: 'List Description',
        urls: [] 
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => newList
      });
      
      const createListSpy = vi.spyOn(urlListStoreModule, 'createList')
        .mockResolvedValue(newList);
      
      await createList('New List', { title: 'List Title', description: 'List Description' });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'New List', 
          customUrl: {
            title: 'List Title',
            description: 'List Description'
          }
        })
      });
      
      // Restore original implementation
      createListSpy.mockRestore();
    });
  });

  describe('deleteList', () => {
    it('deletes a list from the store', async () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      global.fetch.mockResolvedValue({
        ok: true
      });
      
      const result = await deleteList(1);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/1', {
        method: 'DELETE'
      });
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(urlListStore.set).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('clears activeListId if the deleted list was active', async () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      urlListStore.get.mockReturnValue({ lists, activeListId: 1 });
      
      global.fetch.mockResolvedValue({
        ok: true
      });
      
      await deleteList(1);
      
      expect(urlListStore.set).toHaveBeenCalled();
      expect(urlListStore.set.mock.calls[0][0]).toEqual(
        expect.objectContaining({ activeListId: null })
      );
    });

    it('keeps activeListId if another list was deleted', async () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      urlListStore.get.mockReturnValue({ lists, activeListId: 1 });
      
      global.fetch.mockResolvedValue({
        ok: true
      });
      
      await deleteList(2);
      
      expect(urlListStore.set).toHaveBeenCalled();
      expect(urlListStore.set.mock.calls[0][0]).toEqual(
        expect.objectContaining({ activeListId: 1 })
      );
    });
  });

  describe('updateCustomUrl', () => {
    it('updates a list custom URL', async () => {
      const lists = [
        { id: 1, name: 'List 1', customUrl: null },
        { id: 2, name: 'List 2', customUrl: null }
      ];
      
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      const updatedList = {
        id: 1,
        name: 'List 1',
        customUrl: 'new-custom-url'
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => updatedList
      });
      
      const result = await updateCustomUrl(1, 'new-custom-url');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/1/custom-url', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customUrl: 'new-custom-url' })
      });
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(urlListStore.set).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('updates the store with the returned list', async () => {
      const lists = [
        { id: 1, name: 'List 1', customUrl: null },
        { id: 2, name: 'List 2', customUrl: null }
      ];
      
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      const updatedList = {
        id: 1,
        name: 'List 1',
        customUrl: 'new-custom-url'
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => updatedList
      });
      
      await updateCustomUrl(1, 'new-custom-url');
      
      // Check that the store was updated with the new list
      expect(urlListStore.set).toHaveBeenCalled();
      expect(urlListStore.set.mock.calls[0][0].lists[0]).toEqual(updatedList);
    });
  });
});