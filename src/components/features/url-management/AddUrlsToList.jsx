// Feature: Adding URLs to a List (FR002)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, addUrlToList } from '../../../stores';

import Button from '../../ui/Button';
import Input from '../../ui/Input';

export default function AddUrlsToList({ listId }) {
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const activeList = lists.find(list => list.id === activeListId);
  const urls = activeList?.urls || [];

  const handleAddUrl = async () => {
    if (!url.trim()) {
      setFeedback('URL cannot be empty.');
      return;
    }

    const result = await addUrlToList(listId, url);
    if (result) {
      setFeedback(`URL "${url}" added successfully!`);
      setUrl('');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  if (!activeList) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Input
          id="url"
          label="Add URL to List"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          success={feedback.includes('successfully') ? feedback : undefined}
          error={(error || feedback.includes('empty')) ? (error || feedback) : undefined}
        />
      </div>

      <Button
        onClick={handleAddUrl}
        disabled={isLoading || !url.trim()}
        loading={isLoading}
        variant="primary"
        size="md"
        icon={
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        Add URL
      </Button>

      <UrlList urls={urls} />
    </div>
  );
}

function UrlList({ urls }) {
  if (urls.length === 0) {
    return (
      <p className="text-sm text-gray-500">No URLs added yet</p>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900">URLs in List</h3>
      <ul className="mt-3 divide-y divide-gray-200">
        {urls.map((urlItem) => (
          <li key={urlItem.id} className="py-3">
            <a
              href={urlItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all"
            >
              {urlItem.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}