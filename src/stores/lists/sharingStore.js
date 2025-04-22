import { map } from 'nanostores';
import { getActiveList } from '@stores/urlListStore';
import { showSuccess, showError, showInfo } from '@stores/notificationStore';

// UI State for sharing operations
export const sharingUIState = map({
  isLoading: false,
  error: null,
  isPublished: false,
  shareUrl: null
});

// Get a shareable URL for a list
export function getShareableUrl(list) {
  if (!list) return null;
  
  const customUrl = list.customUrl;
  return customUrl 
    ? `${window.location.origin}/list/${customUrl}` 
    : `${window.location.origin}/list/${list.id}`;
}

// Update the custom URL for a list
export async function updateCustomUrl(listId, customUrl) {
  sharingUIState.setKey('isLoading', true);
  sharingUIState.setKey('error', null);
  
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
    showSuccess('Custom URL updated successfully');
    return data;
  } catch (err) {
    console.error('Failed to update custom URL:', err);
    sharingUIState.setKey('error', 'The custom URL is already taken. Please try another.');
    showError('The custom URL is already taken. Please try another.');
    return null;
  } finally {
    sharingUIState.setKey('isLoading', false);
  }
}

// Publish a list to make it publicly accessible
export async function publishList(listId) {
  sharingUIState.setKey('isLoading', true);
  sharingUIState.setKey('error', null);
  
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
    showSuccess('List published successfully');
    return data;
  } catch (err) {
    console.error('Failed to publish list:', err);
    sharingUIState.setKey('error', 'Failed to publish the list. Please try again.');
    showError('Failed to publish the list. Please try again.');
    return null;
  } finally {
    sharingUIState.setKey('isLoading', false);
  }
}

// Unpublish a list to make it private again
export async function unpublishList(listId) {
  sharingUIState.setKey('isLoading', true);
  sharingUIState.setKey('error', null);
  
  try {
    const response = await fetch(`/api/lists/${listId}/unpublish`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Unpublishing failed');
    }
    
    const data = await response.json();
    sharingUIState.setKey('isPublished', false);
    sharingUIState.setKey('shareUrl', null);
    showSuccess('List is now private');
    return data;
  } catch (err) {
    console.error('Failed to unpublish list:', err);
    sharingUIState.setKey('error', 'Failed to make the list private. Please try again.');
    showError('Failed to make the list private. Please try again.');
    return null;
  } finally {
    sharingUIState.setKey('isLoading', false);
  }
}

// Share a list with others
export async function shareList(customUrl) {
  sharingUIState.setKey('isLoading', true);
  sharingUIState.setKey('error', null);
  
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
    showSuccess('List shared successfully! Link ready to share.');
    return shareUrl;
  } catch (err) {
    console.error('Failed to share list:', err);
    sharingUIState.setKey('error', 'Failed to share list. ' + err.message);
    showError('Failed to share list. ' + err.message);
    return null;
  } finally {
    sharingUIState.setKey('isLoading', false);
  }
}