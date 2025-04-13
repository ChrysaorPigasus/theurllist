import { atom, map } from 'nanostores';

// UI State
export const listUIState = map({
  isLoading: false,
  error: null
});

// Domain data
export const listStore = map({
  lists: [],
  activeListId: null
});

// Actions
export async function initializeStore() {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    const response = await fetch('/api/lists');
    const lists = await response.json();
    listStore.set({ lists, activeListId: null });
  } catch (err) {
    console.error('Failed to initialize store:', err);
    listUIState.setKey('error', 'Failed to load lists. Please try again.');
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function fetchLists() {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const response = await fetch('/api/lists');
    const lists = await response.json();
    listStore.set({ lists, activeListId: null });
  } catch (err) {
    console.error('Failed to fetch lists:', err);
    listUIState.setKey('error', 'Failed to load lists. Please try again.');
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function createList(name, customUrl = null) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, customUrl })
    });
    const newList = await response.json();
    const currentLists = listStore.get().lists;
    listStore.set({ ...listStore.get(), lists: [...currentLists, newList] });
    return newList;
  } catch (err) {
    console.error('Failed to create list:', err);
    listUIState.setKey('error', 'Failed to create list. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export async function deleteList(listId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    await fetch(`/api/lists?id=${listId}`, { method: 'DELETE' });
    const currentLists = listStore.get().lists;
    listStore.set({
      ...listStore.get(),
      lists: currentLists.filter(list => list.id !== listId),
      activeListId: listStore.get().activeListId === listId ? null : listStore.get().activeListId
    });
    return true;
  } catch (err) {
    console.error('Failed to delete list:', err);
    listUIState.setKey('error', 'Failed to delete list. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

export function setActiveList(listId) {
  listStore.setKey('activeListId', listId);
}

export function getActiveList() {
  const { lists, activeListId } = listStore.get();
  return lists.find(list => list.id === activeListId);
}

export async function fetchListDetails(listId) {
  if (!listId) return;
  
  // Ensure we have a valid numeric ID 
  const parsedId = parseInt(listId, 10);
  if (isNaN(parsedId)) {
    listUIState.setKey('error', 'Invalid list ID format');
    return null;
  }
  
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);
  
  try {
    console.log(`Fetching list details for list ID: ${parsedId}`);
    const response = await fetch(`/api/lists/${parsedId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch list details');
    }
    
    const listDetails = await response.json();
    console.log('Received list details:', listDetails);
    console.log('URLs in list:', listDetails.urls ? listDetails.urls.length : 0);
    
    const { lists } = listStore.get();
    
    // Find if we already have this list in our store
    const existingListIndex = lists.findIndex(list => list.id === parsedId);
    
    // Create a new lists array with the updated or new list
    let updatedLists;
    if (existingListIndex >= 0) {
      // Update existing list
      updatedLists = [...lists];
      updatedLists[existingListIndex] = {
        ...updatedLists[existingListIndex],
        ...listDetails,
        urls: Array.isArray(listDetails.urls) ? listDetails.urls : []
      };
    } else {
      // Add new list to the array
      updatedLists = [
        ...lists,
        {
          ...listDetails,
          urls: Array.isArray(listDetails.urls) ? listDetails.urls : []
        }
      ];
    }
    
    // Update the store with the new lists array and set active list
    listStore.set({
      lists: updatedLists,
      activeListId: parsedId
    });
    
    // Log the updated store state for debugging
    const updatedStore = listStore.get();
    const updatedList = updatedStore.lists.find(list => list.id === parsedId);
    console.log('Updated store with list:', updatedList);
    console.log('URLs in updated list:', updatedList?.urls ? updatedList.urls.length : 0);
    
    return listDetails;
  } catch (err) {
    console.error('Failed to fetch list details:', err);
    listUIState.setKey('error', err.message || 'Failed to load list details. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}