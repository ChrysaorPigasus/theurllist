import { map } from 'nanostores';
import { isLoading, error, urlListStore } from '@stores/urlListStore';
import { showSuccess, showError, showInfo } from '@stores/notificationStore';
import { listUIState as initialListUIState } from './initialStates';

// Create dedicated stores for the lists module
export const listStore = map({ lists: [] });
// Use the pre-configured state with consistent initialization
export const listUIState = initialListUIState;

// Initialize the list store with data from API
export async function initializeStore() {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const response = await fetch('/api/lists');
    if (!response.ok) {
      throw new Error('Failed to initialize lists');
    }
    
    const lists = await response.json();
    listStore.setKey('lists', lists);
    return lists;
  } catch (err) {
    console.error('Failed to initialize lists:', err);
    listUIState.setKey('error', 'Failed to load lists. Please try again.');
    showError('Failed to load lists. Please try again.');
    return [];
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Set the active list by ID
export function setActiveList(listId) {
  urlListStore.setKey('activeListId', listId);
}

// Get the currently active list
export function getActiveList() {
  const { lists, activeListId } = urlListStore.get();
  return lists.find(list => list.id === activeListId);
}

// Fetch all lists from the API
export async function fetchLists() {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const response = await fetch('/api/lists');
    if (!response.ok) {
      throw new Error('Failed to fetch lists');
    }
    
    const lists = await response.json();
    urlListStore.setKey('lists', lists);
    listStore.setKey('lists', lists);
    return lists;
  } catch (err) {
    console.error('Failed to fetch lists:', err);
    listUIState.setKey('error', 'Failed to fetch lists. Please try again.');
    showError('Failed to fetch lists. Please try again.');
    return [];
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Create a new list
export async function createList(listData) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    // Handle both simple string input and full object
    const payload = typeof listData === 'string' 
      ? { name: listData } 
      : listData;

    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to create list');
    }

    const newList = await response.json();
    
    // Update the lists in both stores
    const currentLists = urlListStore.get().lists;
    urlListStore.setKey('lists', [...currentLists, newList]);
    
    const currentListStoreData = listStore.get().lists;
    listStore.setKey('lists', [...currentListStoreData, newList]);
    
    showSuccess('List created successfully');
    return newList;
  } catch (err) {
    console.error('Failed to create list:', err);
    listUIState.setKey('error', 'Failed to create list. Please try again.');
    showError('Failed to create list. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Delete a list by ID
export async function deleteList(listId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const response = await fetch(`/api/lists/${listId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete list');
    }

    // Update the lists in both stores
    const currentLists = urlListStore.get().lists;
    urlListStore.setKey('lists', currentLists.filter(list => list.id !== listId));
    
    const currentListStoreData = listStore.get().lists;
    listStore.setKey('lists', currentListStoreData.filter(list => list.id !== listId));
    
    // Reset activeListId if the deleted list was active
    if (urlListStore.get().activeListId === listId) {
      urlListStore.setKey('activeListId', null);
    }
    
    showSuccess('List deleted successfully');
    return true;
  } catch (err) {
    console.error('Failed to delete list:', err);
    listUIState.setKey('error', 'Failed to delete list. Please try again.');
    showError('Failed to delete list. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Function to fetch details of a specific list
export async function fetchListDetails(listId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const response = await fetch(`/api/lists/${listId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch list details');
    }
    
    const listDetails = await response.json();
    
    // Update the list in the store with the fetched details, including URLs
    const currentLists = listStore.get().lists;
    const updatedLists = currentLists.map(list => 
      list.id === parseInt(listId) ? { ...list, ...listDetails } : list
    );
    
    // If the list doesn't exist in the store yet, add it
    if (!currentLists.some(list => list.id === parseInt(listId))) {
      updatedLists.push(listDetails);
    }
    
    // Update both stores
    listStore.setKey('lists', updatedLists);
    urlListStore.setKey('lists', updatedLists);
    
    showInfo('List details loaded');
    return listDetails;
  } catch (err) {
    console.error('Failed to fetch list details:', err);
    listUIState.setKey('error', 'Failed to fetch list details. Please try again.');
    showError('Failed to fetch list details. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}