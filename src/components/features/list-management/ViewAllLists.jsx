// Feature: View All URL Lists
import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, fetchLists } from '@stores/lists';
import Card from '@ui/Card';
import Button from '@ui/Button';
import EmptyState from '@ui/EmptyState';
import Spinner from '@ui/Spinner';
import DeleteList from '@features/list-management/DeleteList';
import UpdateList from '@features/list-management/UpdateList';

// Icons component for better organization
const ListIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

export default function ViewAllLists() {
  const { lists } = useStore(listStore);
  const { isLoading = false, error } = useStore(listUIState);
  const [editingListId, setEditingListId] = useState(null);
  // Track mounted state for async operations
  const isMounted = useRef(true);
  // Performance tracking
  const fetchStartTime = useRef(null);

  // Component lifecycle and fetch logging
  useEffect(() => {
    // Start timestamp for performance measurement
    const mountTime = performance.now();
    console.log('ViewAllLists component mounted', {
      timestamp: new Date().toISOString(),
      mountTimeMs: mountTime.toFixed(2)
    });
    
    // Track mounted state
    isMounted.current = true;
    
    // Track fetch performance
    fetchStartTime.current = performance.now();
    console.log('ViewAllLists - Fetching lists', {
      timestamp: new Date().toISOString(),
      fetchStartTimeMs: fetchStartTime.current.toFixed(2)
    });

    // Fetch lists
    fetchLists()
      .then(fetchedLists => {
        if (isMounted.current) {
          const fetchDuration = performance.now() - fetchStartTime.current;
          console.log('ViewAllLists - Lists fetched successfully', {
            timestamp: new Date().toISOString(),
            fetchDurationMs: fetchDuration.toFixed(2),
            listsCount: fetchedLists.length,
            hasPublishedLists: fetchedLists.some(list => list.published)
          });
        }
      })
      .catch(err => {
        if (isMounted.current) {
          const fetchDuration = performance.now() - fetchStartTime.current;
          console.error('ViewAllLists - Error fetching lists', {
            timestamp: new Date().toISOString(),
            fetchDurationMs: fetchDuration.toFixed(2),
            error: err.message
          });
        }
      });

    // Cleanup when unmounting
    return () => {
      console.log('ViewAllLists component unmounting', {
        timestamp: new Date().toISOString(),
        componentLifetimeMs: (performance.now() - mountTime).toFixed(2)
      });
      isMounted.current = false;
    };
  }, []);

  // Log when lists state changes
  useEffect(() => {
    console.log('ViewAllLists - Lists state updated', {
      timestamp: new Date().toISOString(),
      listsCount: lists.length,
      listIds: lists.map(list => list.id)
    });
  }, [lists]);

  // Log loading and error state changes
  useEffect(() => {
    console.log('ViewAllLists - Loading state changed', {
      timestamp: new Date().toISOString(),
      isLoading,
      hasError: !!error,
      error: error || null
    });
  }, [isLoading, error]);

  const handleEditClick = (listId) => {
    console.log('ViewAllLists - Edit list clicked', {
      timestamp: new Date().toISOString(),
      listId
    });
    setEditingListId(listId);
  };

  const handleUpdateSuccess = (updatedList) => {
    console.log('ViewAllLists - List updated successfully', {
      timestamp: new Date().toISOString(),
      listId: updatedList.id,
      listName: updatedList.name
    });
    
    // Refresh the lists after successful update
    fetchStartTime.current = performance.now();
    console.log('ViewAllLists - Refreshing lists after update', {
      timestamp: new Date().toISOString(),
      refreshStartTimeMs: fetchStartTime.current.toFixed(2)
    });
    
    fetchLists()
      .then(fetchedLists => {
        if (isMounted.current) {
          const fetchDuration = performance.now() - fetchStartTime.current;
          console.log('ViewAllLists - Lists refreshed successfully', {
            timestamp: new Date().toISOString(),
            refreshDurationMs: fetchDuration.toFixed(2),
            listsCount: fetchedLists.length
          });
        }
      })
      .catch(err => {
        if (isMounted.current) {
          console.error('ViewAllLists - Error refreshing lists', {
            timestamp: new Date().toISOString(),
            error: err.message
          });
        }
      });
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (!lists?.length) {
    return (
      <Card className="max-w-4xl mx-auto">
        <EmptyState
          title="No Lists Found"
          description="Create your first URL list to get started"
          icon={ListIcon}
        />
      </Card>
    );
  }

  return (
    <Card
      title="Your URL Lists"
      description="Manage and organize your collections of URLs"
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <ul className="divide-y divide-gray-200">
          {lists.map((list) => (
            <li key={list.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                  {list.title && (
                    <p className="mt-1 text-sm text-gray-600">{list.title}</p>
                  )}
                  {list.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Created {new Date(list.created_at).toLocaleDateString()}
                    </span>
                    {list.slug && (
                      <>
                        <span>•</span>
                        <span className="text-gray-400">/{list.slug}</span>
                      </>
                    )}
                    <span>
                      Exposed: {new Boolean(list.published).toString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    href={`/list/${list.slug || list.id}`}
                    icon={
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(list.id)}
                    icon={
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  >
                    Edit
                  </Button>
                  <DeleteList listId={list.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>

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

      {/* Edit List Modal */}
      <UpdateList
        listId={editingListId}
        isOpen={!!editingListId}
        onClose={() => setEditingListId(null)}
        onSuccess={handleUpdateSuccess}
      />
    </Card>
  );
}