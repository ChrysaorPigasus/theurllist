import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { env } from '@tests/utils/environment';

// Mock data
const mockLists = [
  { id: 1, name: 'Work Links', description: 'Important work resources', created_at: '2025-04-01T10:00:00Z' },
  { id: 2, name: 'Learning Resources', description: 'Study materials', created_at: '2025-04-02T14:30:00Z' },
  { id: 3, name: 'Entertainment', description: 'Fun stuff', created_at: '2025-04-03T18:45:00Z' }
];

const mockLinks = [
  { id: 1, list_id: 1, url: 'https://example.com/docs', title: 'Documentation', created_at: '2025-04-01T10:05:00Z' },
  { id: 2, list_id: 1, url: 'https://example.com/work', title: 'Work Portal', created_at: '2025-04-01T10:10:00Z' },
  { id: 3, list_id: 2, url: 'https://example.com/learn', title: 'Learning Platform', created_at: '2025-04-02T14:35:00Z' }
];

// Define handlers for mock API endpoints
export const handlers = [
  // GET /api/lists - Get all lists
  http.get(`${env.baseUrl}/api/lists`, () => {
    return HttpResponse.json({ items: mockLists });
  }),
  
  // GET /api/lists/:id - Get a specific list
  http.get(`${env.baseUrl}/api/lists/:id`, ({ params }) => {
    const { id } = params;
    const list = mockLists.find(l => l.id === Number(id));
    
    if (!list) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(list);
  }),
  
  // POST /api/lists - Create a new list
  http.post(`${env.baseUrl}/api/lists`, async ({ request }) => {
    const data = await request.json();
    const newList = {
      id: mockLists.length + 1,
      name: data.name,
      description: data.description || '',
      created_at: new Date().toISOString()
    };
    
    mockLists.push(newList);
    return HttpResponse.json(newList, { status: 201 });
  }),
  
  // PUT /api/lists/:id - Update a list
  http.put(`${env.baseUrl}/api/lists/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();
    const listIndex = mockLists.findIndex(l => l.id === Number(id));
    
    if (listIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockLists[listIndex] = {
      ...mockLists[listIndex],
      name: data.name || mockLists[listIndex].name,
      description: data.description || mockLists[listIndex].description
    };
    
    return HttpResponse.json(mockLists[listIndex]);
  }),
  
  // DELETE /api/lists/:id - Delete a list
  http.delete(`${env.baseUrl}/api/lists/:id`, ({ params }) => {
    const { id } = params;
    const listIndex = mockLists.findIndex(l => l.id === Number(id));
    
    if (listIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockLists.splice(listIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  
  // GET /api/links - Get all links
  http.get(`${env.baseUrl}/api/links`, () => {
    return HttpResponse.json({ items: mockLinks });
  }),
  
  // GET /api/links/:id - Get a specific link
  http.get(`${env.baseUrl}/api/links/:id`, ({ params }) => {
    const { id } = params;
    const link = mockLinks.find(l => l.id === Number(id));
    
    if (!link) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(link);
  }),
  
  // POST /api/links - Create a new link
  http.post(`${env.baseUrl}/api/links`, async ({ request }) => {
    const data = await request.json();
    const newLink = {
      id: mockLinks.length + 1,
      list_id: data.list_id,
      url: data.url,
      title: data.title || '',
      created_at: new Date().toISOString()
    };
    
    mockLinks.push(newLink);
    return HttpResponse.json(newLink, { status: 201 });
  })
];

// Create the mock server
export const server = setupServer(...handlers);

// Export functions to start/stop the mock server
export const startMockServer = () => server.listen();
export const stopMockServer = () => server.close();
export const resetMockServer = () => server.resetHandlers();