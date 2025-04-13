import { map } from 'nanostores';
import { addUrlToList as dbAddUrlToList, updateUrl as dbUpdateUrl, deleteUrl as dbDeleteUrl } from '../../utils/database';
import { listUIState, getActiveList } from './listStore';

// URL-specific actions
export async function addUrlToList(listId, url) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    const updatedUrl = await dbAddUrlToList(listId, url);
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
    const updatedUrl = await dbUpdateUrl(urlId, newUrl);
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
    await dbDeleteUrl(urlId);
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