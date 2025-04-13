import { map } from 'nanostores';

// UI State
export const urlListUIState = map({
  isLoading: false,
  error: null
});

// Domain data
export const urlListStore = map({
  lists: [],
  activeListId: null
});

// Actions
export async function initializeUrlListStore() {
  urlListUIState.setKey('isLoading', true);
  urlListUIState.setKey('error', null);

  try {
    const response = await fetch('/api/lists');
    const lists = await response.json();
    urlListStore.set({ lists, activeListId: null });
  } catch (err) {
    console.error('Failed to initialize URL list store:', err);
    urlListUIState.setKey('error', 'Failed to load URL lists. Please try again.');
  } finally {
    urlListUIState.setKey('isLoading', false);
  }
}

export async function createUrlList(name, customUrl = null) {
  urlListUIState.setKey('isLoading', true);
  urlListUIState.setKey('error', null);

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
    console.error('Failed to create URL list:', err);
    urlListUIState.setKey('error', 'Failed to create URL list. Please try again.');
    return null;
  } finally {
    urlListUIState.setKey('isLoading', false);
  }
}

export async function deleteUrlList(listId) {
  urlListUIState.setKey('isLoading', true);
  urlListUIState.setKey('error', null);

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
    console.error('Failed to delete URL list:', err);
    urlListUIState.setKey('error', 'Failed to delete URL list. Please try again.');
    return false;
  } finally {
    urlListUIState.setKey('isLoading', false);
  }
}

export function setActiveUrlList(listId) {
  urlListStore.setKey('activeListId', listId);
}

export function getActiveUrlList() {
  const { lists, activeListId } = urlListStore.get();
  return lists.find(list => list.id === activeListId);
}