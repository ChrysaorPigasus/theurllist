import { map } from 'nanostores';
import { updateCustomUrl as dbUpdateCustomUrl, publishList as dbPublishList } from '../../utils/database';
import { listUIState, getActiveList } from './listStore';

// Sharing-specific actions
export async function updateCustomUrl(listId, customUrl) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    const updatedList = await dbUpdateCustomUrl(listId, customUrl);
    const activeList = getActiveList();
    if (activeList) {
      activeList.customUrl = updatedList.customUrl;
    }
    return true;
  } catch (err) {
    console.error('Failed to update custom URL:', err);
    listUIState.setKey('error', 'Failed to update custom URL. This URL might already be taken.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function publishList(listId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    const publishedList = await dbPublishList(listId);
    const activeList = getActiveList();
    if (activeList) {
      activeList.isPublished = true;
      activeList.publishedAt = publishedList.publishedAt;
    }
    return true;
  } catch (err) {
    console.error('Failed to publish list:', err);
    listUIState.setKey('error', 'Failed to publish list. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function shareList(listId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    // First ensure the list is published
    const published = await publishList(listId);
    if (!published) {
      throw new Error('Failed to publish list');
    }
    
    const list = getActiveList();
    if (!list) {
      throw new Error('List not found');
    }
    
    // Get the shareable URL
    const shareUrl = getShareableUrl(list);
    
    // If available, use the Web Share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: `URL List: ${list.name}`,
        text: `Check out my URL list: ${list.name}`,
        url: shareUrl
      });
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(shareUrl);
    }
    
    return true;
  } catch (err) {
    console.error('Failed to share list:', err);
    listUIState.setKey('error', 'Failed to share list. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Helper functions
export function getShareableUrl(list) {
  if (!list) return '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/list/${list.customUrl || list.id}`;
}