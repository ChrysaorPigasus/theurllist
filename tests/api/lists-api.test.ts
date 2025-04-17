import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@pages/api/lists';
import { env } from '@tests/utils/environment';

// Mock de fetch functie
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

// Mock de database module
vi.mock('@utils/database', () => ({
  getLists: vi.fn().mockResolvedValue([
    { id: 1, name: 'Test List 1', title: 'Test Title 1', description: 'Description 1', slug: 'test-1' },
    { id: 2, name: 'Test List 2', title: 'Test Title 2', description: 'Description 2', slug: 'test-2' }
  ]),
  createList: vi.fn().mockImplementation(({ name, title, description, slug }) => {
    return Promise.resolve({ 
      id: 123, 
      name, 
      title, 
      description, 
      slug, 
      created_at: new Date().toISOString() 
    });
  })
}));

// Mock de db-client module
vi.mock('@utils/db-client', () => ({
  initialize: vi.fn().mockResolvedValue(true),
  logger: {
    error: vi.fn()
  }
}));

describe('Lists API Tests', () => {
  // Reset mocks voor elke test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/lists should return a list of items', async () => {
    // Simuleer een request/response
    const response = await GET();
    const data = await response.json();
    
    // Verwachtingen
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0]).toHaveProperty('id', 1);
    expect(data[0]).toHaveProperty('name', 'Test List 1');
  });

  it('POST /api/lists should create a new item', async () => {
    // Mock request data
    const requestData = { 
      name: 'New List', 
      title: 'New Title', 
      description: 'New Description', 
      slug: 'new-list' 
    };
    const mockRequest = {
      request: {
        json: vi.fn().mockResolvedValue(requestData)
      }
    };
    
    // Simuleer een request/response
    const response = await POST(mockRequest);
    const data = await response.json();
    
    // Verwachtingen
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id', 123);
    expect(data).toHaveProperty('name', 'New List');
    expect(data).toHaveProperty('title', 'New Title');
    expect(data).toHaveProperty('description', 'New Description');
    expect(data).toHaveProperty('slug', 'new-list');
  });
});