// Main URL List Management Component
import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, initializeStore, setActiveList } from '../../stores/lists';

// Import feature-specific components from their respective directories
import { AddUrlsToList, ViewUrlsInList, EditUrlsInList, DeleteUrlsFromList } from './url-management';
import { CustomizeListUrl, ShareList, PublishList, AutomaticUrlGeneration } from './sharing';

export default function UrlList({ listId }) {
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);

  useEffect(() => {
    initializeStore();
    if (listId) {
      setActiveList(listId);
    }
  }, [listId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!listId) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* URL Management Sections */}
        <UrlManagementSection listId={listId} />
        
        {/* URL Customization Section */}
        <CustomizationSection listId={listId} />
        
        {/* Publishing and Sharing Section */}
        <PublishingSection listId={listId} />
      </div>
    </div>
  );
}

// Component sections
function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Select a List</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a list to view or create a new one
        </p>
      </div>
    </div>
  );
}

function UrlManagementSection({ listId }) {
  return (
    <>
      <section aria-labelledby="urls-section">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <ViewUrlsInList listId={listId} />
          </div>
        </div>
      </section>

      <section aria-labelledby="add-urls-section">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <AddUrlsToList listId={listId} />
          </div>
        </div>
      </section>

      <section aria-labelledby="edit-urls-section">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <EditUrlsInList listId={listId} />
          </div>
        </div>
      </section>

      <section aria-labelledby="delete-urls-section">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <DeleteUrlsFromList listId={listId} />
          </div>
        </div>
      </section>
    </>
  );
}

function CustomizationSection({ listId }) {
  return (
    <section aria-labelledby="url-customization-section">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomizeListUrl listId={listId} />
            <AutomaticUrlGeneration listId={listId} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PublishingSection({ listId }) {
  return (
    <section aria-labelledby="publishing-sharing-section">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PublishList listId={listId} />
            <ShareList listId={listId} />
          </div>
        </div>
      </div>
    </section>
  );
}