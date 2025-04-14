import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCustomUrl, publishList, shareList, getShareableUrl } from './sharingStore';
import { listUIState, getActiveList } from './listStore';
import { updateCustomUrl as dbUpdateCustomUrl, publishList as dbPublishList } from '../../utils/database';

// Mock dependencies
vi.mock('./listStore', () => ({
  listUIState: {
    setKey: vi.fn(),
  },
  getActiveList: vi.fn(),
}));

vi.mock('../../utils/database', () => ({
  updateCustomUrl: vi.fn(),
  publishList: vi.fn(),
}));

describe('sharingStore', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    listUIState.setKey.mockClear();
    getActiveList.mockClear();
    dbUpdateCustomUrl.mockClear();
    dbPublishList.mockClear();
  });

  describe('updateCustomUrl', () => {
    it('should update custom URL successfully', async () => {
      const listId = 123;
      const customUrl = 'my-custom-url';
      const mockActiveList = { id: listId, name: 'Test List' };
      const mockUpdatedList = { id: listId, name: 'Test List', customUrl };
      
      // Setup mocks
      dbUpdateCustomUrl.mockResolvedValue(mockUpdatedList);
      getActiveList.mockReturnValue(mockActiveList);
      
      const result = await updateCustomUrl(listId, customUrl);
      
      // Verify database call
      expect(dbUpdateCustomUrl).toHaveBeenCalledWith(listId, customUrl);
      
      // Verify loading state management
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', null);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      
      // Verify active list update
      expect(mockActiveList.customUrl).toBe(customUrl);
      expect(result).toBe(true);
    });
    
    it('should handle errors when updating custom URL', async () => {
      const listId = 123;
      const customUrl = 'my-custom-url';
      
      // Setup mocks for failure case
      dbUpdateCustomUrl.mockRejectedValue(new Error('URL already taken'));
      
      const result = await updateCustomUrl(listId, customUrl);
      
      // Verify error handling
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to update custom URL. This URL might already be taken.');
      expect(result).toBe(false);
    });
    
    it('should not update active list if none is found', async () => {
      const listId = 123;
      const customUrl = 'my-custom-url';
      const mockUpdatedList = { id: listId, name: 'Test List', customUrl };
      
      // Setup mocks
      dbUpdateCustomUrl.mockResolvedValue(mockUpdatedList);
      getActiveList.mockReturnValue(null);
      
      const result = await updateCustomUrl(listId, customUrl);
      
      expect(result).toBe(true);
    });
  });

  describe('publishList', () => {
    it('should publish list successfully', async () => {
      const listId = 123;
      const publishedAt = new Date().toISOString();
      const mockActiveList = { id: listId, name: 'Test List', isPublished: false };
      const mockPublishedList = { 
        id: listId, 
        name: 'Test List', 
        isPublished: true, 
        publishedAt 
      };
      
      // Setup mocks
      dbPublishList.mockResolvedValue(mockPublishedList);
      getActiveList.mockReturnValue(mockActiveList);
      
      const result = await publishList(listId);
      
      // Verify database call
      expect(dbPublishList).toHaveBeenCalledWith(listId);
      
      // Verify loading state management
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', null);
      expect(listUIState.setKey).toHaveBeenCalledWith('isLoading', false);
      
      // Verify active list update
      expect(mockActiveList.isPublished).toBe(true);
      expect(mockActiveList.publishedAt).toBe(publishedAt);
      expect(result).toBe(true);
    });
    
    it('should handle errors when publishing list', async () => {
      const listId = 123;
      
      // Setup mocks for failure case
      dbPublishList.mockRejectedValue(new Error('Publishing failed'));
      
      const result = await publishList(listId);
      
      // Verify error handling
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to publish list. Please try again.');
      expect(result).toBe(false);
    });
    
    it('should not update active list if none is found', async () => {
      const listId = 123;
      const publishedAt = new Date().toISOString();
      const mockPublishedList = { 
        id: listId, 
        name: 'Test List', 
        isPublished: true, 
        publishedAt 
      };
      
      // Setup mocks
      dbPublishList.mockResolvedValue(mockPublishedList);
      getActiveList.mockReturnValue(null);
      
      const result = await publishList(listId);
      
      expect(result).toBe(true);
    });
  });

  describe('shareList', () => {
    // Need to mock browser APIs for this test
    const originalNavigator = global.navigator;
    
    beforeEach(() => {
      // Mock navigator for share/clipboard functionality
      global.navigator = {
        share: vi.fn(),
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined)
        }
      };
      
      // Mock window for URL construction
      global.window = {
        location: {
          origin: 'https://example.com'
        }
      };
    });
    
    afterEach(() => {
      global.navigator = originalNavigator;
      delete global.window;
    });
    
    it('should share list using Web Share API', async () => {
      const listId = 123;
      const customUrl = 'test-list';
      const mockActiveList = { 
        id: listId, 
        name: 'Test List', 
        customUrl,
        isPublished: false 
      };
      const mockPublishedList = { 
        id: listId, 
        name: 'Test List', 
        customUrl,
        isPublished: true, 
        publishedAt: new Date().toISOString() 
      };
      
      // Setup mocks
      dbPublishList.mockResolvedValue(mockPublishedList);
      getActiveList.mockReturnValue(mockActiveList);
      
      const result = await shareList(listId);
      
      // Verify publish call
      expect(dbPublishList).toHaveBeenCalledWith(listId);
      
      // Verify share API called with correct parameters
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'URL List: Test List',
        text: 'Check out my URL list: Test List',
        url: 'https://example.com/list/test-list'
      });
      
      expect(result).toBe(true);
    });
    
    it('should fallback to clipboard if Web Share API not available', async () => {
      const listId = 123;
      const customUrl = 'test-list';
      const mockActiveList = { 
        id: listId, 
        name: 'Test List', 
        customUrl,
        isPublished: false 
      };
      const mockPublishedList = { 
        id: listId, 
        name: 'Test List', 
        customUrl,
        isPublished: true, 
        publishedAt: new Date().toISOString() 
      };
      
      // Setup mocks
      delete navigator.share; // Remove share API
      dbPublishList.mockResolvedValue(mockPublishedList);
      getActiveList.mockReturnValue(mockActiveList);
      
      const result = await shareList(listId);
      
      // Verify clipboard API called with correct URL
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/list/test-list');
      expect(result).toBe(true);
    });
    
    it('should handle failed publishing', async () => {
      const listId = 123;
      
      // Setup mocks for failure case
      dbPublishList.mockRejectedValue(new Error('Publishing failed'));
      
      const result = await shareList(listId);
      
      // Verify error handling
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to share list. Please try again.');
      expect(result).toBe(false);
    });
    
    it('should handle case when no active list is found', async () => {
      const listId = 123;
      const mockPublishedList = { 
        id: listId, 
        isPublished: true 
      };
      
      // Setup mocks
      dbPublishList.mockResolvedValue(mockPublishedList);
      getActiveList.mockReturnValue(null); // No active list
      
      const result = await shareList(listId);
      
      expect(result).toBe(false);
      expect(listUIState.setKey).toHaveBeenCalledWith('error', 'Failed to share list. Please try again.');
    });
  });

  describe('getShareableUrl', () => {
    beforeEach(() => {
      // Mock window for URL construction
      global.window = {
        location: {
          origin: 'https://example.com'
        }
      };
    });
    
    afterEach(() => {
      delete global.window;
    });
    
    it('should return shareable URL with custom URL when available', () => {
      const list = {
        id: 123,
        name: 'Test List',
        customUrl: 'test-list'
      };
      
      const shareableUrl = getShareableUrl(list);
      expect(shareableUrl).toBe('https://example.com/list/test-list');
    });
    
    it('should return shareable URL with ID when no custom URL is available', () => {
      const list = {
        id: 123,
        name: 'Test List'
      };
      
      const shareableUrl = getShareableUrl(list);
      expect(shareableUrl).toBe('https://example.com/list/123');
    });
    
    it('should return empty string when list is not defined', () => {
      const shareableUrl = getShareableUrl(null);
      expect(shareableUrl).toBe('');
    });
    
    it('should work without window object (SSR context)', () => {
      delete global.window;
      
      const list = {
        id: 123,
        name: 'Test List',
        customUrl: 'test-list'
      };
      
      const shareableUrl = getShareableUrl(list);
      expect(shareableUrl).toBe('/list/test-list');
    });
  });
});