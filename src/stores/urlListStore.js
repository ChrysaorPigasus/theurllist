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
    const lists = await response.json();
    urlListStore.set({ lists, activeListId: null });
  } catch (err) {
    console.error('Failed to load lists:', err);
    error.set('Failed to load lists. Please try again.');
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
  isLoading.set(true);
  error.set(null);

  try {
    await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
    const currentLists = urlListStore.get().lists;
    urlListStore.set({
      ...urlListStore.get(),
      lists: currentLists.filter(list => list.id !== listId),
      activeListId: urlListStore.get().activeListId === listId ? null : urlListStore.get().activeListId
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
  isLoading.set(true);
  error.set(null);

  try {
    const response = await fetch(`/api/lists/${listId}/custom-url`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customUrl })
    });
    
    const updatedList = await response.json();
    const currentLists = urlListStore.get().lists;
    const updatedLists = currentLists.map(list => 
      list.id === listId ? { ...list, customUrl } : list
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