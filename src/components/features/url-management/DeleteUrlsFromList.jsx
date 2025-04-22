// Feature: Deleting URLs from a List (FR005)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, deleteUrl } from '@stores/lists';
import Button from '@ui/Button';
import EmptyState from '@ui/EmptyState';
import Spinner from '@ui/Spinner';

// For testability - allows tests to mock the confirmation dialog
export const confirmDelete = (message) => {
  // In a test environment, window.confirm might not be available
  try {
    // Check if window exists and confirm is a function
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      console.warn('window.confirm is not available in this environment');
      return true; // Always return true in test environments
    }
    return window.confirm(message);
  } catch (e) {
    // Default to true in environments where window.confirm is not available
    console.warn('window.confirm error:', e);
    return true;
  }
};

export default function DeleteUrlsFromList({ listId }) {
  const [feedback, setFeedback] = useState('');
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const activeList = lists.find(list => list.id === activeListId);
  const urls = activeList?.urls || [];

  const handleDelete = async (urlItem) => {
    const confirmed = confirmDelete(`Are you sure you want to delete "${urlItem.url}"?`);
    if (!confirmed) return;
    
    const success = await deleteUrl(urlItem.id);
    if (success) {
      setFeedback(`URL "${urlItem.url}" deleted successfully!`);
      window.dispatchEvent(new CustomEvent('urlsUpdated'));
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  if (!activeList) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!urls.length) {
    return (
      <EmptyState
        title="No URLs to Delete"
        description="Add some URLs to your list first"
        icon={() => (
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Delete URLs</h2>
      <ul className="divide-y divide-gray-200">
        {urls.map((urlItem) => (
          <li key={urlItem.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <a
                  href={urlItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {urlItem.url}
                </a>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => handleDelete(urlItem)}
                  disabled={isLoading}
                  variant="danger"
                  size="sm"
                  icon={
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {feedback && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
          {feedback}
        </p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}