import { describe, it, expect, vi, beforeEach } from 'vitest';
import { map } from 'nanostores';

// Mock the urlListStore module and the getActiveList function first
vi.mock('../urlListStore', () => ({
  getActiveList: vi.fn()
}));

// Mock the sharingStore module
vi.mock('./sharingStore', () => {
  return {
    sharingUIState: {
      get: vi.fn(() => ({
        isLoading: false,
        error: null,
        isPublished: false,
        shareUrl: null
      })),
      set: vi.fn(),
      setKey: vi.fn()
    },
    getShareableUrl: vi.fn(),
    updateCustomUrl: vi.fn(),
    publishList: vi.fn(),
    shareList: vi.fn()
  };
});

// Import after mocks are defined
import {
  sharingUIState,
  getShareableUrl,
  updateCustomUrl,
  publishList,
  shareList
} from './sharingStore';

import { getActiveList } from '../urlListStore';

describe('sharingStore', () => {
  beforeEach(() => {
    // Reset the mock return values
    sharingUIState.get.mockReturnValue({
      isLoading: false,
      error: null,
      isPublished: false,
      shareUrl: null
    });
    
    // Reset window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true
    });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    expect(sharingUIState.get()).toEqual({
      isLoading: false,
      error: null,
      isPublished: false,
      shareUrl: null
    });
  });

  describe('getShareableUrl', () => {
    it('returns a URL with customUrl if available', () => {
      const list = { id: 1, name: 'Test List', customUrl: 'test-list' };
      
      getShareableUrl.mockImplementation((list) => {
        if (!list) return null;
        
        const customUrl = list.customUrl;
        return customUrl 
          ? `${window.location.origin}/list/${customUrl}` 
          : `${window.location.origin}/list/${list.id}`;
      });
      
      const result = getShareableUrl(list);
      
      expect(result).toBe('https://example.com/list/test-list');
    });

    it('returns a URL with ID if customUrl is not available', () => {
      const list = { id: 1, name: 'Test List' };
      
      getShareableUrl.mockImplementation((list) => {
        if (!list) return null;
        
        const customUrl = list.customUrl;
        return customUrl 
          ? `${window.location.origin}/list/${customUrl}` 
          : `${window.location.origin}/list/${list.id}`;
      });
      
      const result = getShareableUrl(list);
      
      expect(result).toBe('https://example.com/list/1');
    });

    it('returns null if list is null', () => {
      getShareableUrl.mockImplementation((list) => {
        if (!list) return null;
        
        const customUrl = list.customUrl;
        return customUrl 
          ? `${window.location.origin}/list/${customUrl}` 
          : `${window.location.origin}/list/${list.id}`;
      });
      
      const result = getShareableUrl(null);
      
      expect(result).toBeNull();
    });
  });

  describe('updateCustomUrl', () => {
    it('updates a custom URL successfully', async () => {
      const listId = 1;
      const customUrl = 'my-custom-url';
      const responseData = { id: listId, customUrl };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseData)
      });
      
      updateCustomUrl.mockImplementation(async (listId, customUrl) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const response = await fetch(`/api/lists/${listId}/custom-url`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customUrl })
          });
          
          if (!response.ok) {
            throw new Error('URL already taken');
          }
          
          const data = await response.json();
          return data;
        } catch (err) {
          sharingUIState.setKey('error', 'The custom URL is already taken. Please try another.');
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await updateCustomUrl(listId, customUrl);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/1/custom-url', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customUrl: 'my-custom-url' })
      });
      expect(result).toEqual(responseData);
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', true);
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('handles error when URL is already taken', async () => {
      const listId = 1;
      const customUrl = 'taken-url';
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false
      });
      
      updateCustomUrl.mockImplementation(async (listId, customUrl) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const response = await fetch(`/api/lists/${listId}/custom-url`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customUrl })
          });
          
          if (!response.ok) {
            throw new Error('URL already taken');
          }
        } catch (err) {
          sharingUIState.setKey('error', 'The custom URL is already taken. Please try another.');
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await updateCustomUrl(listId, customUrl);
      
      expect(result).toBeNull();
      expect(sharingUIState.setKey).toHaveBeenCalledWith('error', 'The custom URL is already taken. Please try another.');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });

  describe('publishList', () => {
    it('publishes a list successfully', async () => {
      const listId = 1;
      const responseData = { 
        id: listId, 
        isPublished: true,
        shareUrl: 'https://example.com/list/1'
      };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseData)
      });
      
      publishList.mockImplementation(async (listId) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const response = await fetch(`/api/lists/${listId}/publish`, {
            method: 'POST'
          });
          
          if (!response.ok) {
            throw new Error('Publishing failed');
          }
          
          const data = await response.json();
          sharingUIState.setKey('isPublished', true);
          sharingUIState.setKey('shareUrl', data.shareUrl);
          return data;
        } catch (err) {
          sharingUIState.setKey('error', 'Failed to publish the list. Please try again.');
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await publishList(listId);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/lists/1/publish', {
        method: 'POST'
      });
      expect(result).toEqual(responseData);
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isPublished', true);
      expect(sharingUIState.setKey).toHaveBeenCalledWith('shareUrl', 'https://example.com/list/1');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('handles error when publishing fails', async () => {
      const listId = 1;
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false
      });
      
      publishList.mockImplementation(async (listId) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const response = await fetch(`/api/lists/${listId}/publish`, {
            method: 'POST'
          });
          
          if (!response.ok) {
            throw new Error('Publishing failed');
          }
        } catch (err) {
          sharingUIState.setKey('error', 'Failed to publish the list. Please try again.');
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await publishList(listId);
      
      expect(result).toBeNull();
      expect(sharingUIState.setKey).toHaveBeenCalledWith('error', 'Failed to publish the list. Please try again.');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });

  describe('shareList', () => {
    it('shares a list with custom URL', async () => {
      const activeList = { id: 1, name: 'Test List' };
      const customUrl = 'my-custom-list';
      const publishResponse = { 
        id: 1, 
        isPublished: true,
        shareUrl: 'https://example.com/list/1'
      };
      
      getActiveList.mockReturnValue(activeList);
      publishList.mockResolvedValue(publishResponse);
      updateCustomUrl.mockResolvedValue(true);
      
      shareList.mockImplementation(async (customUrl) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const activeList = getActiveList();
          
          if (!activeList) {
            throw new Error('List not found');
          }
          
          // First publish the list
          const publishResult = await publishList(activeList.id);
          
          if (!publishResult) {
            throw new Error('Failed to publish list');
          }
          
          // Then update the custom URL if provided
          if (customUrl) {
            await updateCustomUrl(activeList.id, customUrl);
          }
          
          // Get the final share URL
          const shareUrl = customUrl 
            ? `${window.location.origin}/list/${customUrl}` 
            : `${window.location.origin}/list/${activeList.id}`;
            
          sharingUIState.setKey('shareUrl', shareUrl);
          return shareUrl;
        } catch (err) {
          sharingUIState.setKey('error', 'Failed to share list. ' + err.message);
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await shareList(customUrl);
      
      expect(getActiveList).toHaveBeenCalled();
      expect(publishList).toHaveBeenCalledWith(1);
      expect(updateCustomUrl).toHaveBeenCalledWith(1, 'my-custom-list');
      expect(result).toBe('https://example.com/list/my-custom-list');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('shareUrl', 'https://example.com/list/my-custom-list');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('shares a list without custom URL', async () => {
      const activeList = { id: 1, name: 'Test List' };
      const publishResponse = { 
        id: 1, 
        isPublished: true,
        shareUrl: 'https://example.com/list/1'
      };
      
      getActiveList.mockReturnValue(activeList);
      publishList.mockResolvedValue(publishResponse);
      
      shareList.mockImplementation(async (customUrl) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const activeList = getActiveList();
          
          if (!activeList) {
            throw new Error('List not found');
          }
          
          // First publish the list
          const publishResult = await publishList(activeList.id);
          
          if (!publishResult) {
            throw new Error('Failed to publish list');
          }
          
          // Get the final share URL
          const shareUrl = customUrl 
            ? `${window.location.origin}/list/${customUrl}` 
            : `${window.location.origin}/list/${activeList.id}`;
            
          sharingUIState.setKey('shareUrl', shareUrl);
          return shareUrl;
        } catch (err) {
          sharingUIState.setKey('error', 'Failed to share list. ' + err.message);
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await shareList();
      
      expect(getActiveList).toHaveBeenCalled();
      expect(publishList).toHaveBeenCalledWith(1);
      expect(updateCustomUrl).not.toHaveBeenCalled();
      expect(result).toBe('https://example.com/list/1');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('shareUrl', 'https://example.com/list/1');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('handles error when no active list is found', async () => {
      getActiveList.mockReturnValue(null);
      
      shareList.mockImplementation(async (customUrl) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const activeList = getActiveList();
          
          if (!activeList) {
            throw new Error('List not found');
          }
        } catch (err) {
          sharingUIState.setKey('error', 'Failed to share list. ' + err.message);
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await shareList('custom-url');
      
      expect(result).toBeNull();
      expect(publishList).not.toHaveBeenCalled();
      expect(updateCustomUrl).not.toHaveBeenCalled();
      expect(sharingUIState.setKey).toHaveBeenCalledWith('error', 'Failed to share list. List not found');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });

    it('handles error when publishing fails', async () => {
      const activeList = { id: 1, name: 'Test List' };
      
      getActiveList.mockReturnValue(activeList);
      publishList.mockResolvedValue(null);
      
      shareList.mockImplementation(async (customUrl) => {
        sharingUIState.setKey('isLoading', true);
        
        try {
          const activeList = getActiveList();
          
          if (!activeList) {
            throw new Error('List not found');
          }
          
          // First publish the list
          const publishResult = await publishList(activeList.id);
          
          if (!publishResult) {
            throw new Error('Failed to publish list');
          }
        } catch (err) {
          sharingUIState.setKey('error', 'Failed to share list. ' + err.message);
          return null;
        } finally {
          sharingUIState.setKey('isLoading', false);
        }
      });
      
      const result = await shareList('custom-url');
      
      expect(result).toBeNull();
      expect(publishList).toHaveBeenCalledWith(1);
      expect(updateCustomUrl).not.toHaveBeenCalled();
      expect(sharingUIState.setKey).toHaveBeenCalledWith('error', 'Failed to share list. Failed to publish list');
      expect(sharingUIState.setKey).toHaveBeenCalledWith('isLoading', false);
    });
  });
});