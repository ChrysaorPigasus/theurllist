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
    await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
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