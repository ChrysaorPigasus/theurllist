// Feature: Sharing a List (FR009)
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { listStore, listUIState, shareList } from '../../../stores/lists';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

export default function ShareList({ listId }) {
  const [feedback, setFeedback] = useState('');
  const { lists, activeListId } = useStore(listStore);
  const { isLoading, error } = useStore(listUIState);
  
  const activeList = lists.find(list => list.id === activeListId);
  const shareableUrl = getShareableUrl(activeList);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setFeedback('URL copied to clipboard!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback('Failed to copy URL. Please try again.');
    }
  };

  const handleShare = async (platform) => {
    const title = `Check out my URL list: ${activeList?.name}`;
    const text = `I've shared a collection of URLs with you on The Urlist`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareableUrl}`)}`;
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text,
              url: shareableUrl
            });
            setFeedback('Shared successfully!');
          } catch (err) {
            if (err.name !== 'AbortError') {
              setFeedback('Failed to share. Please try again.');
            }
          }
        }
    }
  };

  if (!activeList) {
    return null;
  }

  return (
    <Card
      title="Share List"
      description="Share your list with others via URL or social media"
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-6">
        <div>
          <Input
            id="share-url"
            label="Shareable URL"
            value={shareableUrl}
            readOnly
            success={feedback === 'URL copied to clipboard!' ? feedback : undefined}
            error={feedback.includes('Failed') ? feedback : undefined}
          />
          <div className="mt-2">
            <Button onClick={handleCopy} variant="secondary" size="sm">
              Copy URL
            </Button>
          </div>
        </div>

        <SocialShareButtons onShare={handleShare} />

        {error && <ErrorMessage error={error} />}
      </div>
    </Card>
  );
}

function SocialShareButtons({ onShare }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900">Share via:</h4>
      <div className="mt-2 flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShare('twitter')}
          icon={<TwitterIcon />}
        >
          Twitter
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShare('linkedin')}
          icon={<LinkedInIcon />}
        >
          LinkedIn
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onShare('email')}
          icon={<EmailIcon />}
        >
          Email
        </Button>
      </div>
    </div>
  );
}

function ErrorMessage({ error }) {
  return (
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
  );
}

// Social Icons Components
function TwitterIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm-1.743 13.019h3.486V9H3.594v11.452z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}