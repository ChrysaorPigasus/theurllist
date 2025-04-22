import { map } from 'nanostores';
import { getActiveList } from '@stores/urlListStore';
import { showSuccess, showError } from '@stores/notificationStore';

// UI State for URL operations
export const listUIState = map({
  isLoading: false,
  error: null
});

// Add a URL to the current list
export async function addUrlToList(listId, urlData) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    // Convert listId to a number if it's a string
    const numericListId = parseInt(listId, 10);
    
    if (isNaN(numericListId)) {
      console.error('Invalid list ID:', listId);
      listUIState.setKey('error', 'Invalid list ID');
      showError('Invalid list ID');
      return null;
    }
    
    // Format the payload based on whether urlData is a string or object
    let payload;
    if (typeof urlData === 'string') {
      payload = { url: urlData, list_id: numericListId };
    } else {
      payload = { ...urlData, list_id: numericListId };
    }
    
    console.log('Sending payload to API:', payload);
    
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`Failed to add URL: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully added URL:', data);
    
    // Import and use the fetchListDetails from listStore
    const { fetchListDetails } = await import('./listStore');
    
    // Refresh the list data
    const refreshedData = await fetchListDetails(numericListId);
    console.log('Refreshed list data:', refreshedData);
    
    showSuccess('URL added successfully');
    return data;
  } catch (err) {
    console.error('Failed to add URL:', err);
    listUIState.setKey('error', 'Failed to add URL. Please try again.');
    showError('Failed to add URL. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Update a URL in the current list
export async function updateUrl(urlId, urlData) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const activeList = getActiveList();
    
    if (!activeList) {
      listUIState.setKey('error', 'No active list found.');
      showError('No active list found.');
      return false;
    }

    // Changed from `/api/links/${urlId}` to `/api/links` and include id in the body
    const response = await fetch(`/api/links`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...urlData, id: urlId })
    });

    if (!response.ok) {
      throw new Error('Failed to update URL');
    }

    // Import and use the fetchListDetails from listStore
    const { fetchListDetails } = await import('./listStore');
    
    // Refresh the list to get updated data
    await fetchListDetails(activeList.id);
    
    // Show success notification
    showSuccess('URL updated successfully');
    
    // Return success
    return true;
  } catch (err) {
    console.error('Failed to update URL:', err);
    listUIState.setKey('error', 'Failed to update URL. Please try again.');
    showError('Failed to update URL. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Delete a URL from the current list
export async function deleteUrl(urlId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const activeList = getActiveList();
    
    if (!activeList) {
      listUIState.setKey('error', 'No active list found.');
      showError('No active list found.');
      return false;
    }

    // Changed from `/api/links/${urlId}` to use query parameter instead
    const response = await fetch(`/api/links?id=${urlId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete URL');
    }

    // Import and use the fetchListDetails from listStore
    const { fetchListDetails } = await import('./listStore');
    
    // Refresh the list to get updated data
    await fetchListDetails(activeList.id);
    
    // Show success notification
    showSuccess('URL deleted successfully');
    
    // Return success
    return true;
  } catch (err) {
    console.error('Failed to delete URL:', err);
    listUIState.setKey('error', 'Failed to delete URL. Please try again.');
    showError('Failed to delete URL. Please try again.');
    return false;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}

// Fetch the details for a specific list
export async function fetchListDetails(listId) {
  listUIState.setKey('isLoading', true);
  listUIState.setKey('error', null);

  try {
    const response = await fetch(`/api/lists/${listId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch list details');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch list details:', err);
    listUIState.setKey('error', 'Failed to load list details. Please try again.');
    showError('Failed to load list details. Please try again.');
    return null;
  } finally {
    listUIState.setKey('isLoading', false);
  }
}