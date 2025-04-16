import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock implementation for fetch
global.fetch = vi.fn();

// Mock the nanostores map implementation
vi.mock('nanostores', () => {
  const mapFn = () => {
    const store = {
      get: vi.fn(() => ({})),
      set: vi.fn(),
      setKey: vi.fn()
    };
    return store;
  };
  
  return {
    map: mapFn,
    atom: vi.fn()
  };
});

// Import modules AFTER mocking
import * as listStoreModule from '@stores/lists/listStore';
import * as urlListStoreModule from '@stores/urlListStore';

// Direct access to exported functions
const {
  listStore,
  listUIState,
  initializeStore,
  setActiveList,
  getActiveList,
  fetchLists,
  createList,
  deleteList,
  fetchListDetails
} = listStoreModule;

// Direct access to urlListStore
const { urlListStore } = urlListStoreModule;

describe('listStore', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset global.fetch
    global.fetch.mockReset();
    
    // Set up default responses for mock functions
    listStore.get.mockReturnValue({ lists: [] });
    listUIState.get.mockReturnValue({ isLoading: false, error: null });
    urlListStore.get.mockReturnValue({ lists: [], activeListId: null });
  });

  it('initializes with empty lists array', () => {
    expect(listStore.get()).toEqual({ lists: [] });
  });

  it('initializes UI state with isLoading false and error null', () => {
    expect(listUIState.get()).toEqual({ isLoading: false, error: null });
  });

  describe('initializeStore', () => {
    it('fetches lists and updates the store', async () => {
      const testLists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      // Mock the fetch call with the correct test data
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => testLists
      });
      
      // Clear all mock functions for the test
      listUIState.setKey.mockClear();
      listStore.setKey.mockClear();
      
      // Call the function being tested
      await initializeStore();
      
      // Verify the expected calls
      expect(global.fetch).toHaveBeenCalledWith('/api/lists');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(listStore.setKey).toHaveBeenCalledWith('lists', testLists);
    });

    it('handles errors when initializing', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      await initializeStore();
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', expect.any(String));
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });

  describe('setActiveList and getActiveList', () => {
    it('sets the active list in urlListStore', () => {
      const listId = 1;
      
      setActiveList(listId);
      
      expect(urlListStore.setKey).toHaveBeenCalledWith('activeListId', listId);
    });

    it('gets the active list from urlListStore', () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      urlListStore.get.mockReturnValue({ lists, activeListId: 2 });
      listStore.get.mockReturnValue({ lists });
      
      const activeList = getActiveList();
      
      expect(activeList).toEqual(lists[1]);
    });

    it('returns undefined when no active list is set', () => {
      urlListStore.get.mockReturnValue({ lists: [], activeListId: null });
      
      const activeList = getActiveList();
      
      expect(activeList).toBeUndefined();
    });
  });

  describe('fetchLists', () => {
    it('fetches lists and updates both stores', async () => {
      const testLists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => testLists
      });
      
      // Clear all mock functions for the test
      listUIState.setKey.mockClear();
      urlListStore.setKey.mockClear();
      listStore.setKey.mockClear();
      
      // Call the function being tested
      await fetchLists();
      
      // Verify the expected calls
      expect(global.fetch).toHaveBeenCalledWith('/api/lists');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      expect(urlListStore.setKey).toHaveBeenCalledWith('lists', testLists);
      expect(listStore.setKey).toHaveBeenCalledWith('lists', testLists);
    });

    it('handles errors when fetching lists', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      await fetchLists();
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', expect.any(String));
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });

  describe('createList', () => {
    it('creates a new list and updates both stores', async () => {
      const newList = { id: 1, name: 'New List', urls: [] };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => newList
      });
      
      await createList('New List');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ name: 'New List' })
      }));
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('handles errors when creating a list', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request'
      });
      
      await createList('New List');
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', expect.any(String));
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });

  describe('deleteList', () => {
    it('deletes a list and updates both stores', async () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      listStore.get.mockReturnValue({ lists });
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      global.fetch.mockResolvedValue({
        ok: true
      });
      
      await deleteList(1);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/1', {
        method: 'DELETE'
      });
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('clears activeListId if the deleted list was active', async () => {
      const lists = [
        { id: 1, name: 'List 1', urls: [] },
        { id: 2, name: 'List 2', urls: [] }
      ];
      
      listStore.get.mockReturnValue({ lists });
      urlListStore.get.mockReturnValue({ lists, activeListId: 1 });
      
      global.fetch.mockResolvedValue({
        ok: true
      });
      
      await deleteList(1);
      
      expect(urlListStore.setKey).toHaveBeenCalledWith('activeListId', null);
    });

    it('handles errors when deleting a list', async () => {
      listStore.get.mockReturnValue({ lists: [{ id: 1, name: 'List 1', urls: [] }] });
      
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      await deleteList(1);
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', expect.any(String));
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });

  describe('fetchListDetails', () => {
    it('fetches details for a specific list and updates stores', async () => {
      const lists = [
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' }
      ];
      
      const listDetails = { 
        id: 1, 
        name: 'List 1', 
        urls: [
          { id: 1, url: 'https://example.com', title: 'Example' }
        ] 
      };
      
      listStore.get.mockReturnValue({ lists });
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => listDetails
      });
      
      await fetchListDetails('1');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/1');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('adds a new list if it does not exist in the store', async () => {
      const lists = [
        { id: 1, name: 'List 1' }
      ];
      
      const newListDetails = { 
        id: 2, 
        name: 'List 2', 
        urls: [
          { id: 1, url: 'https://example.com', title: 'Example' }
        ] 
      };
      
      listStore.get.mockReturnValue({ lists });
      urlListStore.get.mockReturnValue({ lists, activeListId: null });
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => newListDetails
      });
      
      await fetchListDetails('2');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/2');
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('handles errors when fetching list details', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      await fetchListDetails('1');
      
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', expect.any(String));
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });
});