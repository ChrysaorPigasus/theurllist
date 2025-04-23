// Feature: Adding URLs to a List (FR002)
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, addUrlToList } from '@stores/lists';

import Button from '@ui/Button';
import Input from '@ui/Input';

export function UrlList({ urls }) {
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

export default function AddUrlsToList({ listId, hideInput = false }) {
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  // Track if component is mounted for async operations
  const isMounted = useRef(true);
  
  // Find the active list in the store
  const numericListId = parseInt(listId, 10);
  const activeList = lists.find(list => list.id === numericListId || list.id === activeListId);
  const urls = activeList?.urls || [];

  // Debug logging
  useEffect(() => {
    console.log('AddUrlsToList component received listId:', listId);
    console.log('AddUrlsToList parsed numericListId:', numericListId);
    console.log('AddUrlsToList active list found:', activeList);
    console.log('AddUrlsToList URLs count:', urls.length);
    console.log('AddUrlsToList hideInput:', hideInput);
    
    // Cleanup when component unmounts
    return () => {
      console.log('AddUrlsToList component unmounting - cleaning up');
      isMounted.current = false;
    };
  }, [listId, numericListId, activeList, urls.length, hideInput]);

  // Clear feedback messages after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        // Only update state if component is still mounted
        if (isMounted.current) {
          setFeedback('');
        }
      }, 3000);
      
      // Cleanup timeout to prevent memory leaks
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleAddUrl = async () => {
    // Don't proceed if component unmounted
    if (!isMounted.current) return;
    
    if (!url.trim()) {
      setFeedback('URL cannot be empty.');
      return;
    }

    // Ensure URL has http/https prefix
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      // Log for debugging
      console.log('AddUrlsToList - Adding URL to list with ID:', numericListId);
      console.log('AddUrlsToList - URL being added:', formattedUrl);
      
      const result = await addUrlToList(numericListId, formattedUrl);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        if (result) {
          console.log('AddUrlsToList - URL added successfully:', result);
          setFeedback(`URL "${formattedUrl}" added successfully!`);
          setUrl('');
          
          // Dispatch refresh event safely
          try {
            window.dispatchEvent(new CustomEvent('urlsUpdated'));
          } catch (err) {
            console.error('Error dispatching urlsUpdated event:', err);
          }
        } else {
          console.error('AddUrlsToList - Failed to add URL, no result returned');
          setFeedback('Failed to add URL. Please try again.');
        }
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMounted.current) {
        console.error('AddUrlsToList - Error adding URL:', err);
        setFeedback('Error adding URL. Please try again.');
      }
    }
  };

  if (!activeList) {
    console.log('AddUrlsToList - No active list found, showing loading state');
    return <div className="text-gray-500">Loading list...</div>;
  }

  return (
    <div className="space-y-6">
      {!hideInput && (
        <>
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
        </>
      )}

      <UrlList urls={urls} />
    </div>
  );
}