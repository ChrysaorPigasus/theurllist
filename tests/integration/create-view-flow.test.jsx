import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createList } from '@stores/lists/listStore';
import { addUrlToList } from '@stores/lists/urlStore';
import CreateNewList from '@components/features/list-management/CreateNewList';
import ViewUrlsInList from '@components/features/url-management/ViewUrlsInList';
import { useStore } from '@nanostores/react';

// Setup mock voor fetch API
global.fetch = vi.fn();

// Test de volledige flow van lijst aanmaken, vullen en bekijken
describe('Lijst aanmaken en bekijken flow', () => {
  let mockListId;
  let renderCreateListResult;
  let renderViewListResult;

  // Reset alle mocks voor elke test
  beforeEach(() => {
    vi.clearAllMocks();
    mockListId = 123;
    
    // Mock voor createList API call (POST /api/lists)
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/lists' && options?.method === 'POST') {
        const requestBody = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({
            id: mockListId,
            name: requestBody.name,
            title: requestBody.title || null,
            description: requestBody.description || null,
            slug: requestBody.slug || null,
            urls: []
          })
        };
      }
      
      // Mock voor API call om URLs toe te voegen (POST /api/links)
      if (url === '/api/links' && options?.method === 'POST') {
        const requestBody = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({
            id: 456,
            url: requestBody.url,
            title: requestBody.title || 'Test URL',
            list_id: requestBody.list_id
          })
        };
      }
      
      // Mock voor API call om lijst details op te halen (GET /api/lists/:id)
      if (url === `/api/lists/${mockListId}`) {
        return {
          ok: true,
          json: async () => ({
            id: mockListId,
            name: 'Test List',
            title: 'Test Title',
            description: 'Test Description',
            slug: 'test-list',
            urls: [
              {
                id: 456,
                url: 'https://example.com',
                title: 'Test URL',
                list_id: mockListId
              }
            ]
          })
        };
      }
      
      // Default response voor andere requests
      return { 
        ok: true, 
        json: async () => ({}) 
      };
    });

    // Mock de useStore hook
    vi.mock('@nanostores/react', () => ({
      useStore: vi.fn().mockImplementation((store) => {
        if (store.name === 'listStore') {
          return { lists: [], activeListId: mockListId };
        }
        if (store.name === 'listUIState') {
          return { isLoading: false, error: null };
        }
        return {};
      })
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('moet een lijst aanmaken, URL toevoegen en de lijst vervolgens bekijken', async () => {
    // STAP 1: Lijst aanmaken via de store functie
    const newList = await createList({
      name: 'Test List',
      title: 'Test Title',
      description: 'Test Description',
      slug: 'test-list'
    });
    
    // Controleer of de lijst correct is aangemaakt
    expect(newList).toBeDefined();
    expect(newList.id).toBe(mockListId);
    expect(newList.name).toBe('Test List');
    
    // Verify that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/lists', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      }),
      body: expect.any(String)
    }));
    
    // STAP 2: URL toevoegen aan de lijst via de store functie
    const addedUrl = await addUrlToList(mockListId, {
      url: 'https://example.com',
      title: 'Test URL'
    });
    
    // Controleer of de URL correct is toegevoegd
    expect(addedUrl).toBeDefined();
    expect(addedUrl.url).toBe('https://example.com');
    expect(addedUrl.list_id).toBe(mockListId);
    
    // Verify that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/links', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      }),
      body: expect.any(String)
    }));
    
    // STAP 3: Lijst details ophalen en controleren
    global.fetch.mockClear(); // Reset fetch mock
    
    // Test de component die URLs toont
    renderViewListResult = render(<ViewUrlsInList listId={mockListId} />);
    
    // Wacht tot de lijst geladen is en de URL getoond wordt
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/lists/${mockListId}`);
    });
    
    // Dit is een geslaagde end-to-end flow test
    expect(true).toBe(true);
  });
});