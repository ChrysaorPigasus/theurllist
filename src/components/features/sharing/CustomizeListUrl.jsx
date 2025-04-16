// Feature: Customizing the List URL (FR006)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, updateCustomUrl } from '@stores/lists';
import { validateCustomUrl } from '@utils/urlGeneration';
import Card from '@ui/Card';
import Button from '@ui/Button';
import Input from '@ui/Input';

export default function CustomizeListUrl({ listId }) {
  const [customUrl, setCustomUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const activeList = lists.find(list => list.id === activeListId);

  const handleSubmit = async () => {
    const validationError = validateCustomUrl(customUrl);
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    const success = await updateCustomUrl(listId, customUrl);
    if (success) {
      setFeedback('Custom URL updated successfully!');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  if (!activeList) {
    return null;
  }

  return (
    <Card
      title="Customize URL"
      description="Choose a memorable URL for your list"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-4">
        <div>
          <Input
            id="custom-url"
            label="Custom URL"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value.toLowerCase())}
            placeholder="my-awesome-list"
            prefix={`${window.location.origin}/list/`}
            success={feedback.includes('successfully') ? feedback : undefined}
            error={feedback.includes('must') || feedback.includes('only') ? feedback : undefined}
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-gray-500">
            Choose a memorable URL for your list. Only letters, numbers, and hyphens are allowed.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !customUrl}
          loading={isLoading}
          variant="primary"
          size="md"
          icon={
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          Update URL
        </Button>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
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
      </div>
    </Card>
  );
}