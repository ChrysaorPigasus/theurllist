// Main URL List Management Component
import React, { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, initializeStore, setActiveList, fetchListDetails, fetchLists } from '@stores/lists';

// Import feature-specific components from their respective directories
import { ViewUrlsInList, AddUrlsToList } from '@features/url-management';
import { CustomizeListUrl } from '@features/sharing';

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

    // Log om te debuggen
    console.log('UrlList component received listId:', listId);

    // Initialiseer de store als dat nog niet is gebeurd
    if (listStore.get().lists.length === 0) {
      console.log('Initializing store...');
      initializeStore();
    }

    if (listId) {
      // Probeer eerst numeriek te maken voor consistentie
      const numericId = parseInt(listId, 10);
      
      // Log om te debuggen
      console.log('Parsed numericId:', numericId, 'isNaN check:', isNaN(numericId));

      if (!isNaN(numericId)) {
        // Als het een geldige numerieke ID is
        console.log('Setting active list with numeric ID:', numericId);
        setActiveList(numericId);
        
        // Laad de details direct
        refreshListData(numericId)
          .then(() => {
            // Controleer of de lijst correct is geladen
            const { lists, activeListId } = listStore.get();
            console.log('After refresh - lists:', lists, 'activeListId:', activeListId);
            
            // Controleer of de activeList correct is ingesteld
            const foundList = lists.find(list => list.id === numericId);
            if (!foundList) {
              console.warn('List not found after refresh with ID:', numericId);
            }
          });
      } else {
        // Het is waarschijnlijk een slug
        console.log('Looking up list by slug:', listId);
        
        // Haal alle lijsten op en zoek op slug
        fetchLists()
          .then(lists => {
            if (!isMounted.current) return;
            
            console.log('Fetched all lists:', lists);
            
            // Zoek met case-insensitive vergelijking voor meer robuustheid
            const listBySlug = lists.find(list => 
              list.slug && list.slug.toLowerCase() === listId.toLowerCase()
            );
            
            if (listBySlug) {
              console.log('Found list by slug:', listBySlug);
              setActiveList(listBySlug.id);
              refreshListData(listBySlug.id);
            } else {
              console.error('List with slug not found:', listId);
              listUIState.setKey('error', 'List not found');
            }
          })
          .catch(err => {
            console.error('Failed to fetch lists for slug lookup:', err);
            listUIState.setKey('error', 'Failed to load list data');
          });
      }

      // Event handler setup
      const handleRefreshEvent = (event) => {
        if (isMounted.current) {
          const refreshId = event.detail.listId;
          console.log('Refresh event received for list ID:', refreshId);
          refreshListData(refreshId);
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
        {/* URL Management Section */}
        <ConsolidatedUrlManagementSection listId={listId} />
        
        {/* Customization Section */}
        {activeList && <CustomizationSection listId={listId} />}
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
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  // Find the active list with improved fallback strategy
  let activeList = lists.find(list => list.id === activeListId);
  if (!activeList && listId) {
    const numericListId = parseInt(listId, 10);
    activeList = lists.find(list => 
      list.id === numericListId || 
      list.id === listId || 
      (list.slug && list.slug.toLowerCase() === String(listId).toLowerCase())
    );
  }
  
  // Check if list is published
  const isPublished = activeList?.published === true;
  
  // Generate shareable URL for the list
  const getShareableUrl = (list) => {
    if (!list) return '';
    const identifier = list.slug || list.id;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${baseUrl}/list/${identifier}`;
  };
  
  const shareableUrl = getShareableUrl(activeList);
  
  // Publishing handlers
  const handlePublish = async () => {
    if (!activeList) return;
    
    const success = await publishList(listId);
    if (success) {
      showSuccess('List published successfully!');
      
      // Dispatch refresh event to update the UI
      window.dispatchEvent(new CustomEvent('refresh-list-data', { 
        detail: { listId: parseInt(listId) } 
      }));
    } else if (error) {
      showError(`Failed to publish list: ${error}`);
    }
  };

  const handleUnpublish = async () => {
    if (!activeList) return;
    
    const success = await unpublishList(listId);
    if (success) {
      showSuccess('List is now private.');
      
      // Dispatch refresh event to update the UI
      window.dispatchEvent(new CustomEvent('refresh-list-data', { 
        detail: { listId: parseInt(listId) } 
      }));
    } else if (error) {
      showError(`Failed to make list private: ${error}`);
    }
  };
  
  // Handle copy URL function
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      showSuccess('URL copied to clipboard! You can now share this link with others.');
    } catch (err) {
      showError('Failed to copy URL. Please try again.');
    }
  };
  
  // Handle social sharing function
  const handleShare = async (platform) => {
    if (!activeList) return;
    
    const title = `Check out my URL list: ${activeList.name}`;
    const text = `I've shared a collection of URLs with you on The Urlist`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`);
        showInfo('Opened Twitter sharing in a new window');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`);
        showInfo('Opened LinkedIn sharing in a new window');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareableUrl}`)}`;
        showInfo('Opened email client');
        break;
      default:
        // Native sharing if available
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text,
              url: shareableUrl
            });
            showSuccess('Shared successfully!');
          } catch (err) {
            if (err.name !== 'AbortError') {
              showError('Failed to share. Please try again.');
            }
          }
        }
    }
  };
  
  return (
    <section aria-labelledby="url-management-section">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 id="url-management-section" className="text-lg font-medium text-gray-900 mb-4">
            Manage URLs
          </h2>

          {/* Combined Publish & Share Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Publish &amp; Share This List</h3>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              {/* Publishing Section */}
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="text-sm text-gray-500 mr-4 w-full">
                  <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200 mx-auto">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="inline-flex justify-between items-center w-full">
                        <div className="mt-1 relative flex px-4 py-5 sm:px-6">
                          <p className="max-w-2xl text-sm text-gray-500" id="card-description">
                            Control the public visibility of your list
                          </p>
                        </div>
                        <div className="inline-flex">
                          {isPublished && (
                            <p className="text-sm text-gray-500 mr-3">Published</p>
                          )}
                        </div>
                        <div className="inline-flex space-y-4">
                          {isPublished ? (
                            <button
                              type="button"
                              onClick={handleUnpublish}
                              disabled={isLoading}
                              className="inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-brand-500 px-4 py-2 text-sm"
                            >
                              <span className="mr-2">
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </span>
                              Make Private
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handlePublish}
                              disabled={isLoading}
                              className="inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 px-4 py-2 text-sm"
                            >
                              <span className="mr-2">
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              Publish List
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sharing Section */}
              <div className="flex flex-row items-center justify-between">
                <div className="text-sm text-gray-500 mr-4 w-full">
                  <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200 mx-auto">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-6">
                          <div className="inline-flex justify-between items-center">
                            {/* URL Share Input and Description */}
                            <div>
                              <div>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500" id="card-description">
                                  Share your list with others via URL or social media
                                </p>
                                <div className="mt-1 relative flex items-center">
                                  <input 
                                    type="text" 
                                    id="share-url" 
                                    readOnly 
                                    className="block w-full rounded-md shadow-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed border-gray-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-base leading-6" 
                                    aria-invalid="false" 
                                    value={shareableUrl}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Social Share Buttons */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Share via:</h4>
                              <div className="mt-2 flex space-x-2">
                                <button 
                                  type="button" 
                                  onClick={() => handleShare('twitter')} 
                                  className="inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-brand-500 px-3 py-2 text-sm leading-4"
                                >
                                  <span className="mr-2">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                  </span>
                                  Twitter
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleShare('linkedin')}
                                  className="inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-brand-500 px-3 py-2 text-sm leading-4"
                                >
                                  <span className="mr-2">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm-1.743 13.019h3.486V9H3.594v11.452z"/>
                                    </svg>
                                  </span>
                                  LinkedIn
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleShare('email')}
                                  className="inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-brand-500 px-3 py-2 text-sm leading-4"
                                >
                                  <span className="mr-2">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </span>
                                  Email
                                </button>
                                <button 
                                  type="button" 
                                  onClick={handleCopy}
                                  className="inline-flex items-center justify-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-brand-500 px-3 py-2 text-sm leading-4"
                                >
                                  Copy URL
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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