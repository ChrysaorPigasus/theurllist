// Feature: Sharing a List (FR009)
import React from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, shareList } from '@stores/lists';
import { showSuccess, showError, showInfo } from '@stores/notificationStore';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Card from '@ui/Card';
import EmptyState from '@ui/EmptyState';
import Spinner from '@ui/Spinner';

// Function to create a shareable URL for a list
function getShareableUrl(list) {
  if (!list) return '';
  
  // Use the slug if available, otherwise use the ID
  const identifier = list.slug || list.id;
  
  // Create the full URL using window.location.origin if available (client-side)
  // or a fallback domain for server-side rendering
  let baseUrl = 'http://localhost:3000';
  
  try {
    // Use window.location.origin if available
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      baseUrl = window.location.origin;
    }
  } catch (err) {
    console.error('Error accessing window.location.origin:', err);
  }
  
  return `${baseUrl}/list/${identifier}`;
}

export default function ShareList({ listId }) {
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  // Verbeterde logica voor het vinden van de actieve lijst
  // Zoek eerst via activeListId, en als fallback via de listId parameter
  let activeList = lists.find(list => list.id === activeListId);
  
  // Als geen lijst gevonden via activeListId, probeer direct via listId parameter
  if (!activeList && listId) {
    const numericListId = parseInt(listId, 10);
    activeList = lists.find(list => 
      list.id === numericListId || 
      list.id === listId || 
      (list.slug && list.slug.toLowerCase() === String(listId).toLowerCase())
    );
  }
  
  const shareableUrl = getShareableUrl(activeList);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      showSuccess('URL copied to clipboard! You can now share this link with others.');
    } catch (err) {
      showError('Failed to copy URL. Please try again.');
    }
  };

  const handleShare = async (platform) => {
    const title = `Check out my URL list: ${activeList?.name}`;
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

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto" aria-live="polite">
        <div 
          className="flex justify-center py-12" 
          role="status" 
          aria-label="Loading" 
          data-testid="spinner"
        >
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (!activeList) {
    return (
      <Card
        title="Share List"
        description="Share this list with others"
        className="max-w-2xl mx-auto"
        aria-live="polite"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500" data-testid="no-list-message">No active list found. Please select a valid list.</p>
          </div>
        </div>
      </Card>
    );
  }

  // Controle of de lijst gepubliceerd is
  const isPublished = activeList.published || activeList.isPublished;
  
  return (
    <Card
      title="Share List"
      description="Share your list with others via URL or social media"
      className="max-w-2xl mx-auto"
      aria-live="polite"
      data-testid="share-section"
    >
      <div className="space-y-6">
        {!isPublished && (
          <div className="rounded-md bg-amber-50 p-4" data-testid="unpublished-warning">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-amber-800">
                  This list is not published yet. You need to publish it first to share it with others.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Input
            id="share-url"
            label="Shareable URL"
            value={shareableUrl}
            readOnly
            data-testid="share-url-input"
            aria-label="Shareable URL"
          />
          <div className="mt-2">
            <Button 
              onClick={handleCopy} 
              variant="secondary" 
              size="sm" 
              data-testid="copy-url-button"
              aria-label="Copy URL to clipboard"
            >
              Copy URL
            </Button>
          </div>
          {(!activeList.urls || activeList.urls.length === 0) && (
            <p className="mt-2 text-sm text-amber-500" data-testid="empty-list-warning">
              Note: This list is empty. Consider adding URLs before sharing.
            </p>
          )}
        </div>

        <SocialShareButtons onShare={handleShare} />

        {error && <ErrorMessage error={error} />}
      </div>
    </Card>
  );
}

function SocialShareButtons({ onShare }) {
  return (
    <div data-testid="social-share-buttons">
      <h4 className="text-sm font-medium text-gray-900">Share via:</h4>
      <div className="mt-2 flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShare('twitter')}
          icon={<TwitterIcon />}
          data-testid="share-twitter-button"
          aria-label="Share on Twitter"
        >
          Twitter
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShare('linkedin')}
          icon={<LinkedInIcon />}
          data-testid="share-linkedin-button"
          aria-label="Share on LinkedIn"
        >
          LinkedIn
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShare('email')}
          icon={<EmailIcon />}
          data-testid="share-email-button"
          aria-label="Share via Email"
        >
          Email
        </Button>
      </div>
    </div>
  );
}

function ErrorMessage({ error }) {
  return (
    <div className="rounded-md bg-red-50 p-4" data-testid="share-error-message" aria-live="assertive">
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
  );
}

// Social Icons Components
function TwitterIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}