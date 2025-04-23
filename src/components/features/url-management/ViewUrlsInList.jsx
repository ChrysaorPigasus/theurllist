// Feature: Viewing URLs in a List (FR003)
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, addUrlToList, updateUrl, deleteUrl } from '@stores/lists';
import Card from '@ui/Card';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Dialog from '@ui/Dialog';
import EmptyState from '@ui/EmptyState';
import Spinner from '@ui/Spinner';

export default function ViewUrlsInList({ listId }) {
  // Use ref to track mounted state for async operations
  const isMounted = useRef(true);
  
  // State for URL list management
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for URL CRUD operations
  const [newUrlData, setNewUrlData] = useState({
    url: '',
    name: '',
    title: '',
    description: '',
    image: ''
  });
  const [editingUrl, setEditingUrl] = useState(null);
  const [urlToDelete, setUrlToDelete] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [advancedFormVisible, setAdvancedFormVisible] = useState(false);
  
  // Get data from stores
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  // Find the active list and extract URLs
  const activeList = lists.find(list => list.id === parseInt(listId));
  
  // Ensure we have a urls array, even if empty
  const urls = activeList?.urls || [];

  // Function to reload list data - we'll use a local refreshing mechanism
  // to avoid triggering an infinite loop
  const refreshList = useCallback(() => {
    // Only dispatch events if the component is mounted
    if (isMounted.current) {
      try {
        // Instead of directly calling fetchListDetails, dispatch an event
        // that the parent can listen to if needed
        window.dispatchEvent(new CustomEvent('refresh-list-data', { 
          detail: { listId: parseInt(listId) } 
        }));
      } catch (err) {
        // Safely handle any errors that might occur during event dispatch
        console.error('ViewUrlsInList - Error dispatching refresh event:', err);
      }
    }
  }, [listId]);

  // Add cleanup effect when component unmounts
  useEffect(() => {
    isMounted.current = true;
    
    // Add debug logging
    console.log('ViewUrlsInList component received listId:', listId);
    console.log('ViewUrlsInList initial lists state:', lists);
    console.log('ViewUrlsInList found activeList:', activeList);
    console.log('ViewUrlsInList urls count:', urls.length);
    
    // Return cleanup function
    return () => {
      console.log('ViewUrlsInList component unmounting - cleaning up');
      isMounted.current = false;
    };
  }, [listId, lists, activeList, urls.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUrlData(prev => ({ ...prev, [name]: value }));
  };

  // Add URL handler with improved async handling
  const handleAddUrl = async () => {
    if (!isMounted.current) return; // Safety check before starting async operation
    
    if (!newUrlData.url.trim()) {
      setFeedback('URL cannot be empty.');
      return;
    }

    try {
      // Use listId from props instead of activeListId
      console.log('ViewUrlsInList - Adding URL to list:', listId, newUrlData);
      
      // Create a local promise that will be cancelled if component unmounts
      const addPromise = addUrlToList(listId, newUrlData);
      
      // Track if the component is still mounted after the async operation
      const result = await addPromise;
      
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        console.log('ViewUrlsInList - URL added successfully:', result);
        setNewUrlData({ url: '', name: '', title: '', description: '', image: '' });
        setFeedback('URL added successfully!');
        setAdvancedFormVisible(false);
        
        // Use a safe timeout that won't cause issues if component unmounts
        const feedbackTimeout = setTimeout(() => {
          if (isMounted.current) {
            setFeedback('');
          }
        }, 3000);
        
        // Refresh the list data to show the new URL
        refreshList();
        
        // Cleanup function to avoid memory leaks
        return () => clearTimeout(feedbackTimeout);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('ViewUrlsInList - Error adding URL:', err);
        setFeedback('Failed to add URL. Please try again.');
      }
    }
  };

  // Edit URL handlers
  const handleStartEdit = (urlItem) => {
    console.log('ViewUrlsInList - Starting to edit URL:', urlItem);
    setEditingUrl({
      id: urlItem.id,
      url: urlItem.url,
      name: urlItem.name || '',
      title: urlItem.title || '',
      description: urlItem.description || '',
      image: urlItem.image || '',
      list_id: urlItem.list_id || urlItem.listId
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUrl(prev => ({ ...prev, [name]: value }));
  };

  // Edit URL handlers with improved async handling
  const handleUpdateUrl = async () => {
    if (!editingUrl?.url.trim()) {
      setFeedback('URL cannot be empty.');
      return;
    }

    try {
      console.log('ViewUrlsInList - Updating URL:', editingUrl);
      await updateUrl(editingUrl.id, editingUrl);
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        console.log('ViewUrlsInList - URL updated successfully');
        setEditingUrl(null);
        setFeedback('URL updated successfully!');
        setTimeout(() => {
          if (isMounted.current) {
            setFeedback('');
          }
        }, 3000);
        
        // Refresh list to show updated URL
        refreshList();
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('ViewUrlsInList - Error updating URL:', err);
        setFeedback('Failed to update URL. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingUrl(null);
  };

  // Delete URL handlers
  const handleStartDelete = (urlItem) => {
    console.log('ViewUrlsInList - Starting to delete URL:', urlItem);
    setUrlToDelete(urlItem);
  };

  // Delete URL handlers with improved async handling
  const handleConfirmDelete = async () => {
    try {
      console.log('ViewUrlsInList - Confirming delete for URL ID:', urlToDelete.id);
      await deleteUrl(urlToDelete.id);
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        console.log('ViewUrlsInList - URL deleted successfully');
        setUrlToDelete(null);
        setFeedback('URL deleted successfully!');
        setTimeout(() => {
          if (isMounted.current) {
            setFeedback('');
          }
        }, 3000);
        
        // Refresh to show the deletion
        refreshList();
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('ViewUrlsInList - Error deleting URL:', err);
        setFeedback('Failed to delete URL. Please try again.');
      }
    }
  };

  const handleCancelDelete = () => {
    setUrlToDelete(null);
  };

  const toggleAdvancedForm = () => {
    setAdvancedFormVisible(!advancedFormVisible);
  };

  const filteredAndSortedUrls = React.useMemo(() => {
    let result = [...urls];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(url => 
        url.url.toLowerCase().includes(searchLower) ||
        (url.name && url.name.toLowerCase().includes(searchLower)) ||
        (url.title && url.title.toLowerCase().includes(searchLower)) ||
        (url.description && url.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort urls
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'url':
          comparison = a.url.localeCompare(b.url);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'dateAdded':
        default:
          comparison = new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt);
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
        <div className="flex justify-center py-12" role="status" aria-label="Loading">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (!activeList) {
    return (
      <Card className="max-w-full mx-auto">
        <EmptyState
          title="No list selected"
          description="Please select a list to view URLs."
          icon={() => (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2zm0 2v10l4.5-3 3 2.5 4.5-3.5 4 4V6H4z" />
            </svg>
          )}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="URLs in List" 
      description="View and manage the URLs in this list"
      className="max-w-full mx-auto"
    >
      <div className="space-y-6">
        {/* Add URL section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New URL</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  id="newUrl"
                  name="url"
                  type="url"
                  placeholder="https://example.com"
                  value={newUrlData.url}
                  onChange={handleInputChange}
                />
              </div>
              <Button 
                variant="primary" 
                onClick={handleAddUrl}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add URL
              </Button>
            </div>
            
            <div>
              <button 
                type="button" 
                onClick={toggleAdvancedForm} 
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                {advancedFormVisible ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide additional fields
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show additional fields
                  </>
                )}
              </button>
            </div>
            
            {advancedFormVisible && (
              <div className="space-y-3 pt-2">
                <Input
                  label="Name"
                  name="name"
                  placeholder="Name for this link"
                  value={newUrlData.name}
                  onChange={handleInputChange}
                />
                <Input
                  label="Title"
                  name="title"
                  placeholder="Title for this link"
                  value={newUrlData.title}
                  onChange={handleInputChange}
                />
                <Input
                  label="Description"
                  name="description"
                  placeholder="Brief description"
                  value={newUrlData.description}
                  onChange={handleInputChange}
                />
                <Input
                  label="Image URL"
                  name="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newUrlData.image}
                  onChange={handleInputChange}
                />
              </div>
            )}
            
            {feedback && (
              <p className={`text-sm ${feedback.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {feedback}
              </p>
            )}
          </div>
        </div>

        {/* Search and filter section */}
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

        {/* URL count display */}
        <div className="py-2 text-gray-500 text-sm">
          {filteredAndSortedUrls.length === 0 ? (
            search ? "No URLs match your search" : "No URLs in this list yet"
          ) : (
            <>Displaying {filteredAndSortedUrls.length} URL{filteredAndSortedUrls.length !== 1 && 's'}</>
          )}
        </div>

        {/* URL list table */}
        {filteredAndSortedUrls.length > 0 ? (
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {/* Image column if present */}
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <span className="sr-only">Image</span>
                  </th>
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
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="group inline-flex items-center">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('title')}
                  >
                    <div className="group inline-flex items-center">
                      Title & Description
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
                  <th scope="col" className="relative px-3 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSortedUrls.map((urlItem) => (
                  <tr key={urlItem.id} className="hover:bg-gray-50">
                    <td className="w-20 py-4 pl-4 pr-3 text-sm sm:pl-6">
                      {urlItem.image ? (
                        <img 
                          src={urlItem.image} 
                          alt="" 
                          className="h-12 w-12 object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48' fill='%23CBD5E0'%3E%3Cpath d='M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2zm0 2v10l4.5-3 3 2.5 4.5-3.5 4 4V6H4z'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
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
                      {urlItem.name || '-'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {urlItem.title && (
                        <div className="font-medium text-gray-900">{urlItem.title}</div>
                      )}
                      {urlItem.description && (
                        <div className="mt-1 line-clamp-2 text-gray-500">{urlItem.description}</div>
                      )}
                      {!urlItem.title && !urlItem.description && '-'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(urlItem.created_at || urlItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4 text-sm text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleStartEdit(urlItem)}
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleStartDelete(urlItem)}
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      >
                        Delete
                      </Button>
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

        {/* Error display */}
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

      {/* Edit URL Dialog */}
      <Dialog
        isOpen={!!editingUrl}
        onClose={handleCancelEdit}
        title="Edit URL"
        description="Update details for this URL"
        actions={
          <>
            <Button 
              variant="secondary" 
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateUrl}
            >
              Save
            </Button>
          </>
        }
      >
        {editingUrl && (
          <div className="mt-4 space-y-4">
            <Input
              label="URL"
              name="url"
              type="url"
              value={editingUrl.url}
              onChange={handleEditInputChange}
              placeholder="https://example.com"
            />
            <Input
              label="Name"
              name="name"
              value={editingUrl.name}
              onChange={handleEditInputChange}
              placeholder="Name for this link"
            />
            <Input
              label="Title"
              name="title"
              value={editingUrl.title}
              onChange={handleEditInputChange}
              placeholder="Title for this link"
            />
            <Input
              label="Description"
              name="description"
              value={editingUrl.description}
              onChange={handleEditInputChange}
              placeholder="Brief description"
            />
            <Input
              label="Image URL"
              name="image"
              type="url"
              value={editingUrl.image}
              onChange={handleEditInputChange}
              placeholder="https://example.com/image.jpg"
            />
            {editingUrl.image && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Image Preview</p>
                <img 
                  src={editingUrl.image} 
                  alt="Preview" 
                  className="h-24 w-24 object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48' fill='%23CBD5E0'%3E%3Cpath d='M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2zm0 2v10l4.5-3 3 2.5 4.5-3.5 4 4V6H4z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!urlToDelete}
        onClose={handleCancelDelete}
        title="Delete URL"
        description={`Are you sure you want to delete "${urlToDelete?.url}"? This action cannot be undone.`}
        actions={
          <>
            <Button 
              variant="secondary" 
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </>
        }
      />
    </Card>
  );
}