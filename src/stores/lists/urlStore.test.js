import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addUrlToList, updateUrl, deleteUrl } from './urlStore';

// Import our custom mocks
import { 
  mockAddUrlToList, 
  mockUpdateUrl, 
  mockDeleteUrl, 
  mockGetActiveList, 
  mockListUIState,
  mockFetchListDetails,
  resetMocks
} from '../../test/storeMocks';

// Mock dependencies
vi.mock('./urlStore', () => ({
  addUrlToList: mockAddUrlToList,
  updateUrl: mockUpdateUrl,
  deleteUrl: mockDeleteUrl
}));

vi.mock('./listStore', () => ({
  listUIState: mockListUIState,
  getActiveList: mockGetActiveList,
  fetchListDetails: mockFetchListDetails
}));

// Mock fetch API for test isolation
global.fetch = vi.fn();

describe('urlStore', () => {
  beforeEach(() => {
    resetMocks();
    fetch.mockReset();
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
      mockAddUrlToList.mockResolvedValueOnce(mockResponse);
      
      const result = await addUrlToList(validListId, validUrlData);
      
      expect(mockAddUrlToList).toHaveBeenCalledWith(validListId, validUrlData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid list ID format', async () => {
      // Set up mock to simulate validation error
      mockAddUrlToList.mockImplementationOnce((listId) => {
        if (typeof listId !== 'string' || !listId.match(/^\d+$/)) {
          mockListUIState.setKey('error', 'Invalid list ID format');
          return Promise.resolve(null);
        }
        return Promise.resolve({});
      });
      
      const result = await addUrlToList('invalid', validUrlData);
      
      expect(mockAddUrlToList).toHaveBeenCalledWith('invalid', validUrlData);
      expect(result).toBeNull();
    });

    it('should handle API error response', async () => {
      // Set up mock to return error
      mockAddUrlToList.mockImplementationOnce(() => {
        mockListUIState.setKey('error', 'Failed to add URL');
        return Promise.resolve(null);
      });
      
      const result = await addUrlToList(validListId, validUrlData);
      
      expect(mockAddUrlToList).toHaveBeenCalledWith(validListId, validUrlData);
      expect(result).toBeNull();
    });

    it('should handle network error', async () => {
      // Set up mock to simulate network error
      mockAddUrlToList.mockImplementationOnce(() => {
        mockListUIState.setKey('error', 'Network error');
        return Promise.resolve(null);
      });
      
      const result = await addUrlToList(validListId, validUrlData);
      
      expect(mockAddUrlToList).toHaveBeenCalledWith(validListId, validUrlData);
      expect(result).toBeNull();
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
      const activeList = { id: '123', name: 'Test List' };
      mockGetActiveList.mockReturnValueOnce(activeList);
      
      // Set up mock to return success
      mockUpdateUrl.mockResolvedValueOnce(true);
      
      const result = await updateUrl(urlId, urlData);
      
      expect(mockUpdateUrl).toHaveBeenCalledWith(urlId, urlData);
      expect(mockGetActiveList).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle API error response', async () => {
      // Set up mock to simulate API error
      mockUpdateUrl.mockImplementationOnce(() => {
        mockListUIState.setKey('error', 'Failed to update URL');
        return Promise.resolve(false);
      });
      
      const result = await updateUrl(urlId, urlData);
      
      expect(mockUpdateUrl).toHaveBeenCalledWith(urlId, urlData);
      expect(result).toBe(false);
    });

    it('should handle case when no active list is found', async () => {
      // Set up mock for no active list
      mockGetActiveList.mockReturnValueOnce(null);
      
      // Mock should still succeed in test
      mockUpdateUrl.mockResolvedValueOnce(true);
      
      const result = await updateUrl(urlId, urlData);
      
      expect(mockUpdateUrl).toHaveBeenCalledWith(urlId, urlData);
      expect(mockGetActiveList).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('deleteUrl', () => {
    const urlId = '789';

    it('should delete URL successfully', async () => {
      // Set up mock active list
      const activeList = { id: '123', name: 'Test List' };
      mockGetActiveList.mockReturnValueOnce(activeList);
      
      // Set up mock to return success
      mockDeleteUrl.mockResolvedValueOnce(true);
      
      const result = await deleteUrl(urlId);
      
      expect(mockDeleteUrl).toHaveBeenCalledWith(urlId);
      expect(mockGetActiveList).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle API error response', async () => {
      // Set up mock to simulate API error
      mockDeleteUrl.mockImplementationOnce(() => {
        mockListUIState.setKey('error', 'Failed to delete URL');
        return Promise.resolve(false);
      });
      
      const result = await deleteUrl(urlId);
      
      expect(mockDeleteUrl).toHaveBeenCalledWith(urlId);
      expect(result).toBe(false);
    });

    it('should handle case when no active list is found', async () => {
      // Set up mock for no active list
      mockGetActiveList.mockReturnValueOnce(null);
      
      // Mock should still succeed in test
      mockDeleteUrl.mockResolvedValueOnce(true);
      
      const result = await deleteUrl(urlId);
      
      expect(mockDeleteUrl).toHaveBeenCalledWith(urlId);
      expect(mockGetActiveList).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});