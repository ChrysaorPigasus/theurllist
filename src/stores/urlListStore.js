import { map } from 'nanostores';

// UI State store for list operations
export const isLoading = map(false);
export const error = map(null);

// Main store for URL lists data
export const urlListStore = map({
  lists: [],
  activeListId: null
});

// Initialize store - load lists from database
export async function initializeStore() {
  isLoading.set(true);
  error.set(null);

  try {
    const response = await fetch('/api/lists');
    if (!response.ok) {
      throw new Error(`Failed to load lists: ${response.statusText}`);
    }
    const lists = await response.json();
    urlListStore.set({ lists, activeListId: null });
    return true;
  } catch (err) {
    console.error('Failed to load lists:', err);
    error.set('Failed to load lists. Please try again.');
    return false;
  } finally {
    isLoading.set(false);
  }
}

// Create a new list
export async function createList(name, customUrl = null) {
  isLoading.set(true);
  error.set(null);

  try {
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, customUrl })
    });
    const newList = await response.json();
    const currentLists = urlListStore.get().lists;
    urlListStore.set({ ...urlListStore.get(), lists: [...currentLists, newList] });
    return newList;
  } catch (err) {
    console.error('Failed to create list:', err);
    error.set('Failed to create list. Please try again.');
    return null;
  } finally {
    isLoading.set(false);
  }
}

// Delete a list
export async function deleteList(listId) {
  // Input validation
  if (!listId) {
    error.set('List ID is required');
    return false;
  }

  // Type coercion to handle both string and number IDs
  const numericListId = typeof listId === 'string' ? parseInt(listId, 10) : listId;
  
  if (isNaN(numericListId)) {
    error.set('Invalid list ID format');
    return false;
  }

  // Check if the list exists
  const currentLists = urlListStore.get().lists;
  const listToDelete = currentLists.find(list => 
    list.id === numericListId || list.id === listId.toString()
  );
  
  if (!listToDelete) {
    error.set('List not found');
    return false;
  }

  isLoading.set(true);
  error.set(null);

  try {
    const response = await fetch(`/api/lists/${numericListId}`, { method: 'DELETE' });
    
    if (!response.ok) {
      throw new Error(`Failed to delete list: ${response.statusText}`);
    }
    
    urlListStore.set({
      ...urlListStore.get(),
      lists: currentLists.filter(list => list.id !== numericListId && list.id !== listId.toString()),
      activeListId: urlListStore.get().activeListId === numericListId ? null : urlListStore.get().activeListId
    });
    return true;
  } catch (err) {
    console.error('Failed to delete list:', err);
    error.set('Failed to delete list. Please try again.');
    return false;
  } finally {
    isLoading.set(false);
  }
}

// Update a list's custom URL
export async function updateCustomUrl(listId, customUrl) {
  // Input validation
  if (!listId) {
    error.set('List ID is required');
    return false;
  }
  
  // Type coercion to handle both string and number IDs
  const numericListId = typeof listId === 'string' ? parseInt(listId, 10) : listId;
  
  if (isNaN(numericListId)) {
    error.set('Invalid list ID format');
    return false;
  }

  if (!customUrl || customUrl === '') {
    error.set('Custom URL is required');
    return false;
  }

  // Check if the list exists
  const currentLists = urlListStore.get().lists;
  const listToUpdate = currentLists.find(list => 
    list.id === numericListId || list.id === listId.toString()
  );
  
  if (!listToUpdate) {
    error.set('List not found');
    return false;
  }

  // Validate custom URL format
  const validUrlPattern = /^[a-zA-Z0-9-_]+$/;
  if (!validUrlPattern.test(customUrl)) {
    error.set('Custom URL cannot contain spaces or special characters');
    return false;
  }

  isLoading.set(true);
  error.set(null);

  try {
    const response = await fetch(`/api/lists/${numericListId}/custom-url`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customUrl })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update custom URL: ${response.statusText}`);
    }
    
    const updatedList = await response.json();
    const updatedLists = currentLists.map(list => 
      (list.id === numericListId || list.id === listId.toString()) 
        ? { ...list, customUrl } 
        : list
    );
    
    urlListStore.set({ ...urlListStore.get(), lists: updatedLists });
    return true;
  } catch (err) {
    console.error('Failed to update custom URL:', err);
    error.set('Failed to update custom URL. This URL might already be taken.');
    return false;
  } finally {
    isLoading.set(false);
  }
}

// Set active list
export function setActiveList(listId) {
  urlListStore.setKey('activeListId', listId);
}

// Get active list
export function getActiveList() {
  const { lists, activeListId } = urlListStore.get();
  return lists.find(list => list.id === activeListId);
}