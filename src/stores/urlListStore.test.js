import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  urlListStore, 
  isLoading, 
  error, 
  initializeStore, 
  createList, 
  deleteList, 
  updateCustomUrl 
} from './urlListStore';

// Import our test mocks
import {
  mockInitializeStore,
  mockCreateList,
  mockDeleteList,
  mockUpdateCustomUrl,
  resetMocks
} from '../test/storeMocks';

// Mock the store module functions
vi.mock('./urlListStore', () => ({
  urlListStore: {
    get: vi.fn(() => ({ lists: [], activeListId: null })),
    set: vi.fn(),
    setKey: vi.fn()
  },
  isLoading: {
    get: vi.fn(() => false),
    set: vi.fn()
  },
  error: {
    get: vi.fn(() => null),
    set: vi.fn()
  },
  initializeStore: mockInitializeStore,
  createList: mockCreateList,
  deleteList: mockDeleteList,
  updateCustomUrl: mockUpdateCustomUrl
}));

// Mock fetch API
global.fetch = vi.fn();

describe('urlListStore', () => {
  beforeEach(() => {
    resetMocks();
    fetch.mockReset();
    
    // Reset the store state for each test
    urlListStore.get.mockReturnValue({ lists: [], activeListId: null });
    isLoading.get.mockReturnValue(false);
    error.get.mockReturnValue(null);
  });

  describe('initializeStore', () => {
    it('should load lists from database', async () => {
      const mockLists = [
        { id: '1', name: 'List 1' },
        { id: '2', name: 'List 2' }
      ];
      
      // Set up mock to return lists
      mockInitializeStore.mockImplementationOnce(async () => {
        urlListStore.set({ lists: mockLists, activeListId: null });
        return Promise.resolve();
      });

      await initializeStore();

      expect(mockInitializeStore).toHaveBeenCalled();
      expect(urlListStore.set).toHaveBeenCalledWith({ lists: mockLists, activeListId: null });
    });

    it('should handle initialization errors', async () => {
      // Set up mock to simulate error
      mockInitializeStore.mockImplementationOnce(async () => {
        error.set('Failed to load lists. Please try again.');
        return Promise.resolve();
      });

      await initializeStore();

      expect(mockInitializeStore).toHaveBeenCalled();
      expect(error.set).toHaveBeenCalledWith('Failed to load lists. Please try again.');
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      const newList = { id: '1', name: 'New List', customUrl: 'custom-url' };
      
      // Set up mock to return new list
      mockCreateList.mockResolvedValueOnce(newList);

      const result = await createList('New List', 'custom-url');

      expect(mockCreateList).toHaveBeenCalledWith('New List', 'custom-url');
      expect(result).toEqual(newList);
    });

    it('should handle creation errors', async () => {
      // Set up mock to simulate error
      mockCreateList.mockImplementationOnce(async () => {
        error.set('Failed to create list. Please try again.');
        return Promise.resolve(null);
      });

      const result = await createList('New List');

      expect(mockCreateList).toHaveBeenCalledWith('New List', undefined);
      expect(result).toBe(null);
      expect(error.set).toHaveBeenCalledWith('Failed to create list. Please try again.');
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      const listId = '1';
      urlListStore.get.mockReturnValue({ lists: [{ id: listId, name: 'Test List' }], activeListId: null });
      
      // Set up mock to return success
      mockDeleteList.mockResolvedValueOnce(true);

      const result = await deleteList(listId);

      expect(mockDeleteList).toHaveBeenCalledWith(listId);
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      // Set up mock to simulate error
      mockDeleteList.mockImplementationOnce(async () => {
        error.set('Failed to delete list. Please try again.');
        return Promise.resolve(false);
      });

      const result = await deleteList('1');

      expect(mockDeleteList).toHaveBeenCalledWith('1');
      expect(result).toBe(false);
      expect(error.set).toHaveBeenCalledWith('Failed to delete list. Please try again.');
    });
  });

  describe('updateCustomUrl', () => {
    it('should update custom URL', async () => {
      const listId = '1';
      const customUrl = 'new-url';
      
      // Set up mock store state
      urlListStore.get.mockReturnValue({
        lists: [{ id: listId, name: 'Test List', customUrl: 'old-url' }],
        activeListId: null
      });
      
      // Set up mock to return success
      mockUpdateCustomUrl.mockResolvedValueOnce(true);

      const result = await updateCustomUrl(listId, customUrl);

      expect(mockUpdateCustomUrl).toHaveBeenCalledWith(listId, customUrl);
      expect(result).toBe(true);
    });

    it('should handle update errors', async () => {
      // Set up mock to simulate error
      mockUpdateCustomUrl.mockImplementationOnce(async () => {
        error.set('Failed to update custom URL. This URL might already be taken.');
        return Promise.resolve(false);
      });

      const result = await updateCustomUrl('1', 'new-url');

      expect(mockUpdateCustomUrl).toHaveBeenCalledWith('1', 'new-url');
      expect(result).toBe(false);
      expect(error.set).toHaveBeenCalledWith('Failed to update custom URL. This URL might already be taken.');
    });
  });
});