import { map } from 'nanostores';
import { listUIState, getActiveList } from './listStore';

// URL-specific actions
export async function addUrlToList(listId, url) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    // Use API endpoint instead of direct database access
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...url,
        list_id: listId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add URL');
    }
    
    const updatedUrl = await response.json();
    const activeList = getActiveList();
    if (activeList) {
      activeList.urls = [...(activeList.urls || []), updatedUrl];
    }
    return updatedUrl;
  } catch (err) {
    console.error('Failed to add URL:', err);
    listUIState.setKey('error', 'Failed to add URL. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function updateUrl(urlId, newUrl) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    // Use API endpoint instead of direct database access
    const response = await fetch('/api/links', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: urlId,
        ...newUrl
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update URL');
    }
    
    const updatedUrl = await response.json();
    const activeList = getActiveList();
    if (activeList) {
      activeList.urls = activeList.urls.map(url => 
        url.id === urlId ? updatedUrl : url
      );
    }
    return true;
  } catch (err) {
    console.error('Failed to update URL:', err);
    listUIState.setKey('error', 'Failed to update URL. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function deleteUrl(urlId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    // Use API endpoint instead of direct database access
    const response = await fetch(`/api/links?id=${urlId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete URL');
    }
    
    const activeList = getActiveList();
    if (activeList) {
      activeList.urls = activeList.urls.filter(url => url.id !== urlId);
    }
    return true;
  } catch (err) {
    console.error('Failed to delete URL:', err);
    listUIState.setKey('error', 'Failed to delete URL. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}