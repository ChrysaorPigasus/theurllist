// Feature: Automatic URL Generation (FR007)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, updateCustomUrl } from '../../../stores/lists';
import { generateUrlSlug, validateCustomUrl } from '../../../utils/urlGeneration';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

export default function AutomaticUrlGeneration({ listId }) {
  const [customUrl, setCustomUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const activeList = lists.find(list => list.id === activeListId);

  const handleGenerate = () => {
    const newUrl = generateUrlSlug(activeList?.name);
    setCustomUrl(newUrl);
    setFeedback('URL generated! Click "Save" to apply it.');
  };

  const handleSave = async () => {
    if (!customUrl) {
      setFeedback('Please generate a URL first.');
      return;
    }

    const validationError = validateCustomUrl(customUrl);
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    const success = await updateCustomUrl(listId, customUrl);
    if (success) {
      setFeedback('Custom URL saved successfully!');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleCustomUrlChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setCustomUrl(value);
    setFeedback('');
  };

  if (!activeList) {
    return null;
  }

  return (
    <Card
      title="Custom URL"
      description="Generate or customize a unique URL for your list"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              id="custom-url"
              label="Custom URL"
              value={customUrl}
              onChange={handleCustomUrlChange}
              placeholder="your-custom-url"
              prefix={`${window.location.origin}/list/`}
              success={feedback.includes('success') ? feedback : undefined}
              error={feedback.includes('Failed') || feedback.includes('Please') || feedback.includes('must') ? feedback : undefined}
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button
              onClick={handleGenerate}
              variant="secondary"
              size="md"
              loading={isLoading}
              icon={
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Generate
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="md"
              loading={isLoading}
              disabled={!customUrl}
              icon={
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Save
            </Button>
          </div>
        </div>

        {feedback && !feedback.includes('success') && !feedback.includes('Failed') && !feedback.includes('Please') && !feedback.includes('must') && (
          <p className="text-sm text-gray-600">{feedback}</p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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