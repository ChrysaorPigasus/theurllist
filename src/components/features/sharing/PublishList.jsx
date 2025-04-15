// Feature: Publishing a List (FR008)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, publishList } from '../../../stores/lists';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

export default function PublishList({ listId }) {
  const [feedback, setFeedback] = useState('');
  const { lists } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const currentList = lists.find(list => list.id === listId);
  // Check if list is published by looking for "(Published)" in the description
  const isPublished = currentList?.description?.includes('(Published)');

  const handlePublish = async () => {
    if (!currentList) return;
    
    const success = await publishList(listId);
    if (success) {
      setFeedback('List published successfully!');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  if (!currentList) {
    return null;
  }

  return (
    <Card
      title="Publish List"
      description="Make your list publicly accessible"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            {isPublished 
              ? `Published`
              : 'Your list is currently private'}
          </p>
        </div>

        <Button
          onClick={handlePublish}
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isPublished}
          icon={
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          {isPublished ? 'Published' : 'Publish List'}
        </Button>

        {feedback && !error && (
          <p className="text-sm text-green-600">{feedback}</p>
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
    </Card>
  );
}