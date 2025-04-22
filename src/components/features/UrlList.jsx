// Main URL List Management Component
import React, { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, initializeStore, setActiveList, fetchListDetails } from '@stores/lists';

// Import feature-specific components from their respective directories
import { ViewUrlsInList, AddUrlsToList } from '@features/url-management';
import { CustomizeListUrl, ShareList, PublishList } from '@features/sharing';

export default function UrlList({ listId }) {
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  const isMounted = useRef(true);

  const refreshListData = useCallback((id) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!isNaN(numericId) && isMounted.current) {
      return fetchListDetails(numericId).catch(err => {
        if (isMounted.current) {
          console.error(`Error fetching list details for list ${numericId}:`, err);
        }
      });
    }
    return Promise.resolve();
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (listStore.get().lists.length === 0) {
      initializeStore();
    }

    if (listId) {
      setActiveList(typeof listId === 'string' ? parseInt(listId) : listId);
      let fetchPromise = refreshListData(listId);

      const handleRefreshEvent = (event) => {
        if (isMounted.current) {
          fetchPromise = refreshListData(event.detail.listId);
        }
      };

      window.addEventListener('refresh-list-data', handleRefreshEvent);

      return () => {
        isMounted.current = false;
        window.removeEventListener('refresh-list-data', handleRefreshEvent);
      };
    }

    return () => {
      isMounted.current = false;
    };
  }, [listId, refreshListData]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!listId) {
    return <EmptyState />;
  }

  const activeList = lists.find(list => list.id === activeListId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeList && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{activeList.name}</h1>
          {activeList.description && (
            <p className="mt-2 text-lg text-gray-600">{activeList.description}</p>
          )}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>Created: {new Date(activeList.created_at).toLocaleDateString()}</span>
            {activeList.slug && (
              <span className="ml-4">Custom URL: /{activeList.slug}</span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <ConsolidatedUrlManagementSection listId={listId} />
        {activeList && <CustomizationSection listId={listId} />}
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

// Consolidated URL management section that combines view and add functionality only
function ConsolidatedUrlManagementSection({ listId }) {
  return (
    <section aria-labelledby="url-management-section">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 id="url-management-section" className="text-lg font-medium text-gray-900 mb-4">
            Manage URLs
          </h2>

          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Your URLs</h3>
            <ViewUrlsInList listId={listId} />
          </div>

          {/* Hide the input field but still show the URL list */}
          <AddUrlsToList listId={listId} hideInput={true} />
        </div>
      </div>
    </section>
  );
}

// Separate URL Customization section
function CustomizationSection({ listId }) {
  return (
    <section aria-labelledby="customization-section">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CustomizeListUrl listId={listId} />
        </div>
      </div>
    </section>
  );
}

function PublishingSection({ listId }) {
  const { lists, activeListId } = useStore(listStore);
  const activeList = lists.find(list => list.id === activeListId);
  const hasUrls = activeList?.urls && activeList.urls.length > 0;

  return (
    <section aria-labelledby="publishing-sharing-section">
      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200 max-w-2xl mx-auto">
        <div className="px-4 py-5 sm:p-6">
          <h2 id="publishing-sharing-section" className="text-lg font-medium text-gray-900 mb-4">
            Publish & Share
          </h2>
          
          {/* If the list has URLs, show both components in a grid */}
          {hasUrls ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PublishList listId={listId} />
              <ShareList listId={listId} />
            </div>
          ) : (
            /* Otherwise, only show the PublishList component */
            <div>
              <PublishList listId={listId} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}