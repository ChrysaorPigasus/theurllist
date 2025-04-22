// Feature: Delete a URL List (FR003)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, deleteList } from '@stores/lists';
import { showSuccess, showError } from '@stores/notificationStore';
import Button from '@ui/Button';
import Dialog from '@ui/Dialog';

export default function DeleteList({ listId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { lists } = useStore(listStore);
  const { isLoading = false, error } = useStore(listUIState);
  
  const list = lists.find(l => l.id === listId);

  const handleDelete = async () => {
    const success = await deleteList(listId);
    if (success) {
      showSuccess('List deleted successfully');
      setIsOpen(false);
    } else if (error) {
      showError(`Failed to delete list: ${error}`);
    }
  };

  if (!list) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="danger"
        size="md"
        icon={
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
      >
        Delete List
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Delete List"
        description={`Are you sure you want to delete "${list.name}"? This action cannot be undone.`}
        actions={
          <>
            <Button
              onClick={() => setIsOpen(false)}
              variant="secondary"
              size="md"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              size="md"
              loading={isLoading}
            >
              Delete
            </Button>
          </>
        }
      >
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}