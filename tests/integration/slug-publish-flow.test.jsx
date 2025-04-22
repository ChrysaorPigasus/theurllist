import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createList } from '@stores/lists/listStore';
import { publishList, updateCustomUrl } from '@stores/lists/sharingStore';
import CustomizeListUrl from '@components/features/sharing/CustomizeListUrl';
import PublishList from '@components/features/sharing/PublishList';
import { useStore } from '@nanostores/react';

// Setup mock voor fetch API
global.fetch = vi.fn();

// Test de volledige flow van lijst aanmaken, slug customizen en publiceren
describe('Slug genereren en publiceren flow', () => {
  let mockListId;
  let mockList;

  // Reset alle mocks voor elke test
  beforeEach(() => {
    vi.clearAllMocks();
    mockListId = 123;
    mockList = {
      id: mockListId,
      name: 'Test Lijst',
      title: 'Test Titel',
      description: 'Test Beschrijving',
      slug: null, // Initieel geen slug
      urls: [],
      published: false
    };
    
    // Mock voor createList API call (POST /api/lists)
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/lists' && options?.method === 'POST') {
        const requestBody = JSON.parse(options.body);
        mockList = {
          id: mockListId,
          name: requestBody.name,
          title: requestBody.title || null,
          description: requestBody.description || null,
          slug: requestBody.slug || null,
          urls: [],
          published: false
        };
        return {
          ok: true,
          json: async () => mockList
        };
      }
      
      // Mock voor API call om custom URL in te stellen (PUT /api/lists/:id/custom-url)
      if (url === `/api/lists/${mockListId}/custom-url` && options?.method === 'PUT') {
        const requestBody = JSON.parse(options.body);
        mockList.slug = requestBody.customUrl;
        return {
          ok: true,
          json: async () => mockList
        };
      }
      
      // Mock voor API call om lijst te publiceren (POST /api/lists/:id/publish)
      if (url === `/api/lists/${mockListId}/publish` && options?.method === 'POST') {
        mockList.published = true;
        return {
          ok: true,
          json: async () => ({
            ...mockList,
            shareUrl: `http://localhost:3000/list/${mockList.slug || mockList.id}`
          })
        };
      }
      
      // Mock voor API call om lijst details op te halen (GET /api/lists/:id)
      if (url === `/api/lists/${mockListId}`) {
        return {
          ok: true,
          json: async () => mockList
        };
      }
      
      // Default response voor andere requests
      return { 
        ok: true, 
        json: async () => ({}) 
      };
    });

    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn();

    // Mock de useStore hook
    vi.mock('@nanostores/react', () => ({
      useStore: vi.fn().mockImplementation((store) => {
        if (store.name === 'listStore') {
          return { lists: [mockList], activeListId: mockListId };
        }
        if (store.name === 'listUIState') {
          return { isLoading: false, error: null };
        }
        if (store.name === 'sharingUIState') {
          return { isLoading: false, error: null, isPublished: mockList.published, shareUrl: null };
        }
        return {};
      })
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('moet een lijst maken, een custom URL genereren en de lijst publiceren', async () => {
    // STAP 1: Lijst aanmaken via de store functie
    const newList = await createList({
      name: 'Test Lijst',
      title: 'Test Titel',
      description: 'Test Beschrijving'
    });
    
    // Controleer of de lijst correct is aangemaakt
    expect(newList).toBeDefined();
    expect(newList.id).toBe(mockListId);
    expect(newList.name).toBe('Test Lijst');
    
    // STAP 2: Custom URL genereren en instellen
    const customUrl = 'mijn-test-lijst';
    const customUrlResult = await updateCustomUrl(mockListId, customUrl);
    
    // Controleer of de custom URL is ingesteld
    expect(customUrlResult).toBeDefined();
    expect(mockList.slug).toBe(customUrl);
    
    // STAP 3: Lijst publiceren
    const publishResult = await publishList(mockListId);
    
    // Controleer of de lijst gepubliceerd is
    expect(publishResult).toBeDefined();
    expect(mockList.published).toBe(true);
    
    // STAP 4: Controleer of de juiste API calls zijn gedaan
    expect(global.fetch).toHaveBeenCalledWith('/api/lists', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      body: expect.any(String)
    }));
    
    expect(global.fetch).toHaveBeenCalledWith(`/api/lists/${mockListId}/custom-url`, expect.objectContaining({
      method: 'PUT',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      body: expect.any(String)
    }));
    
    expect(global.fetch).toHaveBeenCalledWith(`/api/lists/${mockListId}/publish`, expect.objectContaining({
      method: 'POST'
    }));
    
    // Dit is een geslaagde end-to-end flow test waarbij meerdere API aanroepen elkaar opvolgen
  });
});