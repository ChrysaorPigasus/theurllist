// Feature: Accessing a Shared List
import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, initializeStore, setActiveList } from '../../../stores/lists';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import Spinner from '../../ui/Spinner';

export default function AccessSharedList({ listId }) {
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);

  useEffect(() => {
    initializeStore();
    if (listId) {
      setActiveList(listId);
    }
  }, [listId]);

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
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
      </Card>
    );
  }

  const activeList = lists.find(list => list.id === activeListId);
  if (!activeList) {
    return (
      <Card className="max-w-4xl mx-auto">
        <EmptyState
          title="List Not Found"
          description="The list you're looking for doesn't exist or has been removed"
          icon={() => (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
            </svg>
          )}
        />
      </Card>
    );
  }

  if (!activeList.isPublished) {
    return (
      <Card className="max-w-4xl mx-auto">
        <EmptyState
          title="Private List"
          description="This list has not been published and is not available for viewing"
          icon={() => (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        />
      </Card>
    );
  }

  return (
    <Card
      title={activeList.name}
      description={activeList.description}
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">URL</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {activeList.urls.map((urlItem) => (
                <tr key={urlItem.id} className="hover:bg-gray-50">
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <a
                      href={urlItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {urlItem.url}
                    </a>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {urlItem.title || '-'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(urlItem.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}