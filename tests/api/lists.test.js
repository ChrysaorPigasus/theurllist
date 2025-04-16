import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '@pages/api/lists';
import { getLists, createList, deleteList, updateList } from '@utils/database';
import { initialize } from '@utils/db-client';

// Mock dependencies
vi.mock('@utils/database', () => ({
  getLists: vi.fn(),
  createList: vi.fn(),
  deleteList: vi.fn(),
  updateList: vi.fn(),
}));

vi.mock('@utils/db-client', () => ({
  logger: {
    error: vi.fn(),
  },
  initialize: vi.fn(),
}));

describe('Lists API', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all lists', async () => {
      const mockLists = [
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' }
      ];
      
      getLists.mockResolvedValue(mockLists);
      
      const response = await GET();
      const data = await response.json();
      
      expect(initialize).toHaveBeenCalled();
      expect(getLists).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockLists);
    });
    
    it('should handle errors', async () => {
      getLists.mockRejectedValue(new Error('Database error'));
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch lists' });
    });
  });
  
  describe('POST', () => {
    const mockRequest = (body) => {
      return {
        request: {
          json: vi.fn().mockResolvedValue(body)
        }
      };
    };
    
    it('should create a new list', async () => {
      const listData = { 
        name: 'New List', 
        title: 'List Title', 
        description: 'List Description',
        slug: 'list-slug'
      };
      
      const createdList = { id: 3, ...listData };
      
      createList.mockResolvedValue(createdList);
      
      const response = await POST(mockRequest(listData));
      const data = await response.json();
      
      expect(initialize).toHaveBeenCalled();
      expect(createList).toHaveBeenCalledWith(listData);
      expect(response.status).toBe(201);
      expect(data).toEqual(createdList);
    });
    
    it('should handle missing name', async () => {
      const listData = { 
        title: 'List Title', 
        description: 'List Description',
        slug: 'list-slug'
      };
      
      const response = await POST(mockRequest(listData));
      const data = await response.json();
      
      expect(createList).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'List name is required.' });
    });
    
    it('should handle null fields', async () => {
      const listData = { name: 'New List' };
      const createdList = { id: 3, name: 'New List' };
      
      createList.mockResolvedValue(createdList);
      
      const response = await POST(mockRequest(listData));
      await response.json();
      
      expect(createList).toHaveBeenCalledWith({ 
        name: 'New List', 
        title: null, 
        description: null, 
        slug: null 
      });
    });
    
    it('should handle errors', async () => {
      const listData = { name: 'New List' };
      
      createList.mockRejectedValue(new Error('Database error'));
      
      const response = await POST(mockRequest(listData));
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to process list operation' });
    });
  });
  
  describe('PUT', () => {
    const mockRequest = (body) => {
      return {
        request: {
          json: vi.fn().mockResolvedValue(body)
        }
      };
    };
    
    it('should update a list', async () => {
      const listData = { 
        id: 1,
        name: 'Updated List', 
        title: 'Updated Title', 
        description: 'Updated Description',
        slug: 'updated-slug'
      };
      
      const updatedList = { ...listData };
      
      updateList.mockResolvedValue(updatedList);
      
      const response = await PUT(mockRequest(listData));
      const data = await response.json();
      
      expect(initialize).toHaveBeenCalled();
      expect(updateList).toHaveBeenCalledWith(1, { 
        name: 'Updated List', 
        title: 'Updated Title', 
        description: 'Updated Description',
        slug: 'updated-slug'
      });
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedList);
    });
    
    it('should handle missing ID', async () => {
      const listData = { 
        name: 'Updated List'
      };
      
      const response = await PUT(mockRequest(listData));
      const data = await response.json();
      
      expect(updateList).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'List ID is required.' });
    });
    
    it('should handle errors', async () => {
      const listData = { 
        id: 1,
        name: 'Updated List'
      };
      
      updateList.mockRejectedValue(new Error('Database error'));
      
      const response = await PUT(mockRequest(listData));
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update list. Please try again later.' });
    });
  });
  
  describe('DELETE', () => {
    const mockRequest = (id) => {
      const url = new URL(`https://example.com/api/lists?id=${id}`);
      return {
        request: {
          url: url.toString()
        }
      };
    };
    
    it('should delete a list', async () => {
      const listId = 1;
      
      deleteList.mockResolvedValue();
      
      const response = await DELETE(mockRequest(listId));
      
      expect(initialize).toHaveBeenCalled();
      expect(deleteList).toHaveBeenCalledWith('1');
      expect(response.status).toBe(204);
    });
    
    it('should handle missing ID', async () => {
      const response = await DELETE(mockRequest(''));
      const data = await response.json();
      
      expect(deleteList).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'List ID is required.' });
    });
    
    it('should handle errors', async () => {
      const listId = 1;
      
      deleteList.mockRejectedValue(new Error('Database error'));
      
      const response = await DELETE(mockRequest(listId));
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete list. Please try again later.' });
    });
  });
});