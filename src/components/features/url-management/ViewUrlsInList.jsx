// Feature: Viewing URLs in a List (FR003)
import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, setActiveList } from '../../../stores/lists/listStore';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import EmptyState from '../../ui/EmptyState';
import Spinner from '../../ui/Spinner';

export default function ViewUrlsInList({ listId }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const activeList = lists.find(list => list.id === activeListId);
  const urls = activeList?.urls || [];

  useEffect(() => {
    setActiveList(listId);
  }, [listId]);

  const filteredAndSortedUrls = React.useMemo(() => {
    let result = [...urls];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(url => 
        url.url.toLowerCase().includes(searchLower) ||
        url.title?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort urls
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'url':
          comparison = a.url.localeCompare(b.url);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'dateAdded':
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return result;
  }, [urls, search, sortBy, sortOrder]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (columnName) => {
    if (sortBy !== columnName) {
      return null;
    }
    
    return sortOrder === 'desc' ? (
      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
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

  return (
    <Card 
      title={activeList?.name || 'URL List'} 
      description={activeList?.description}
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {filteredAndSortedUrls.length > 0 ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('url')}
                  >
                    <div className="group inline-flex items-center">
                      URL
                      {getSortIcon('url')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('title')}
                  >
                    <div className="group inline-flex items-center">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('dateAdded')}
                  >
                    <div className="group inline-flex items-center">
                      Added
                      {getSortIcon('dateAdded')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSortedUrls.map((urlItem) => (
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
        ) : (
          <EmptyState
            title={search ? "No matching URLs found" : "No URLs in this list yet"}
            description={search ? "Try adjusting your search term" : "Add some URLs to get started"}
            icon={() => (
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          />
        )}

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