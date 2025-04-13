import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AccessSharedList from './AccessSharedList';
import { listStore, listUIState } from '../../../stores/lists';

// Mock the database utility
vi.mock('../../../utils/database', () => ({
  getList: vi.fn().mockResolvedValue({
    id: '123',
    name: 'Test List',
    urls: [
      { id: '1', url: 'https://example.com', title: 'Example', createdAt: new Date().toISOString() }
    ],
    isPublished: true,
    createdAt: new Date().toISOString()
  })
}));

describe('AccessSharedList', () => {
  beforeEach(() => {
    // Reset store state
    listStore.set({ lists: [], activeListId: null });
    listUIState.set({ isLoading: false, error: null });
  });

  it('renders loading state initially', () => {
    listUIState.set({ isLoading: true, error: null });
    render(<AccessSharedList listId="123" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    listUIState.set({ isLoading: false, error: 'Failed to load list' });
    render(<AccessSharedList listId="123" />);
    expect(screen.getByText(/Failed to load list/i)).toBeInTheDocument();
  });

  it('renders not found state when list does not exist', async () => {
    render(<AccessSharedList listId="nonexistent" />);
    await waitFor(() => {
      expect(screen.getByText(/list not found/i)).toBeInTheDocument();
    });
  });

  it('renders private state when list is not published', async () => {
    listStore.set({
      lists: [{
        id: '123',
        name: 'Private List',
        isPublished: false
      }],
      activeListId: '123'
    });

    render(<AccessSharedList listId="123" />);
    await waitFor(() => {
      expect(screen.getByText(/private list/i)).toBeInTheDocument();
      expect(screen.getByText(/not been published/i)).toBeInTheDocument();
    });
  });

  it('renders list content when list exists and is published', async () => {
    const testList = {
      id: '123',
      name: 'Test List',
      urls: [
        { id: '1', url: 'https://example.com', title: 'Example', createdAt: new Date().toISOString() }
      ],
      isPublished: true
    };

    listStore.set({
      lists: [testList],
      activeListId: '123'
    });

    render(<AccessSharedList listId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test List')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('Example')).toBeInTheDocument();
    });
  });
});