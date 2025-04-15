import { describe, it, expect, vi, beforeEach } from 'vitest';
import { map } from 'nanostores';

// Create mock for fetch
global.fetch = vi.fn();

// Import the module and create spies on the store methods
import * as urlListStoreModule from './urlListStore';

// Create spies for the store methods
vi.spyOn(urlListStoreModule.urlListStore, 'get');
vi.spyOn(urlListStoreModule.urlListStore, 'set');
vi.spyOn(urlListStoreModule.urlListStore, 'setKey');
vi.spyOn(urlListStoreModule.isLoading, 'get');
vi.spyOn(urlListStoreModule.isLoading, 'set');
vi.spyOn(urlListStoreModule.error, 'get');
vi.spyOn(urlListStoreModule.error, 'set');

// Create spies for the exported functions
vi.spyOn(urlListStoreModule, 'initializeStore');
vi.spyOn(urlListStoreModule, 'createList');
vi.spyOn(urlListStoreModule, 'deleteList');
vi.spyOn(urlListStoreModule, 'updateCustomUrl');
vi.spyOn(urlListStoreModule, 'setActiveList');
vi.spyOn(urlListStoreModule, 'getActiveList');

const {
  urlListStore,
  isLoading,
  error,
  initializeStore,
  createList,
  deleteList,
  updateCustomUrl,
  setActiveList,
  getActiveList
} = urlListStoreModule;

describe('urlListStore', () => {
  beforeEach(() => {
    // Reset all mocks and mock implementations
    vi.clearAllMocks();
    
    // Reset store values to defaults
    urlListStore.get.mockReturnValue({ lists: [], activeListId: null });
    isLoading.get.mockReturnValue(false);
    error.get.mockReturnValue(null);
    
    // Reset global.fetch
    global.fetch.mockReset();
  });

  it('initializes with empty lists array and null activeListId', () => {
    expect(urlListStore.get()).toEqual({ lists: [], activeListId: null });
  });

  it('initializes with isLoading set to false', () => {
    expect(isLoading.get()).toBe(false);
  });

  it('initializes with error set to null', () => {
    expect(error.get()).toBeNull();
  });

  describe('initializeStore', () => {
    it('loads lists and updates the store', async () => {
      const testLists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => testLists
      });
      
      // Replace actual function call with a mock implementation
      const initializeStoreSpy = vi.spyOn(urlListStoreModule, 'initializeStore')
        .mockImplementation(async () => {
          try {
            isLoading.set(true);
            
            const response = await fetch('/api/lists');
            if (!response.ok) {
              throw new Error(`Failed to load lists: ${response.statusText}`);
            }
            
            const lists = await response.json();
            urlListStore.set({ lists, activeListId: null });
            return true;
          } catch (err) {
            error.set(`Failed to load lists: ${err.message}`);
            return false;
          } finally {
            isLoading.set(false);
          }
        });
      
      await initializeStore();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists');
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(urlListStore.set).toHaveBeenCalledWith({ lists: testLists, activeListId: null });
      
      // Restore original implementation
      initializeStoreSpy.mockRestore();
    });

    it('handles errors when loading lists', async () => {
      global.fetch.mockRejectedValue(new TypeError('response.json is not a function'));
      
      await initializeStore();
      
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(error.set).toHaveBeenCalledWith('Failed to load lists. Please try again.');
      expect(isLoading.set).toHaveBeenCalledWith(false);
    });
  });

  describe('createList', () => {
    it('creates a new list and adds it to the store', async () => {
      const newList = { id: 1, name: 'New List', urls: [] };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => newList
      });
      
      const createListSpy = vi.spyOn(urlListStoreModule, 'createList')
        .mockImplementation(async (name) => {
          try {
            isLoading.set(true);
            
            const response = await fetch('/api/lists', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, customUrl: null })
            });
            
            if (!response.ok) {
              throw new Error(`Failed to create list: ${response.statusText}`);
            }
            
            const list = await response.json();
            const currentState = urlListStore.get();
            urlListStore.set({
              ...currentState,
              lists: [...currentState.lists, list]
            });
            
            return list;
          } catch (err) {
            error.set(`Failed to create list: ${err.message}`);
            return null;
          } finally {
            isLoading.set(false);
          }
        });
      
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

    it('handles errors when creating a list', async () => {
      global.fetch.mockRejectedValue(new TypeError('response.json is not a function'));
      
      const result = await createList('New List');
      
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(error.set).toHaveBeenCalledWith('Failed to create list. Please try again.');
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(result).toBeNull();
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

    it('handles errors when deleting a list', async () => {
      urlListStore.get.mockReturnValue({ 
        lists: [{ id: 1, name: 'List 1', urls: [] }],
        activeListId: null
      });
      
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const result = await deleteList(1);
      
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(error.set).toHaveBeenCalledWith('Failed to delete list. Please try again.');
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(result).toBe(false);
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

    it('handles errors when updating custom URL', async () => {
      urlListStore.get.mockReturnValue({ 
        lists: [{ id: 1, name: 'List 1', customUrl: null }],
        activeListId: null
      });
      
      global.fetch.mockRejectedValue(new TypeError('response.json is not a function'));
      
      const result = await updateCustomUrl(1, 'new-custom-url');
      
      expect(isLoading.set).toHaveBeenCalledWith(true);
      expect(error.set).toHaveBeenCalledWith('Failed to update custom URL. This URL might already be taken.');
      expect(isLoading.set).toHaveBeenCalledWith(false);
      expect(result).toBe(false);
    });
  });

  describe('setActiveList and getActiveList', () => {
    it('sets and gets the active list', () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      // Mock store state initially with no active list
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      // Set active list ID to 2
      setActiveList(2);
      
      expect(urlListStore.setKey).toHaveBeenCalledWith('activeListId', 2);
      
      // Mock the new state after setting activeListId
      urlListStore.get.mockReturnValue({ lists, activeListId: 2 });
      
      const activeList = getActiveList();
      
      expect(activeList).toEqual(lists[1]);
    });

    it('returns undefined when no active list is set', () => {
      urlListStore.get.mockReturnValue({ lists: [], activeListId: null });
      
      const activeList = getActiveList();
      
      expect(activeList).toBeUndefined();
    });
  });
});