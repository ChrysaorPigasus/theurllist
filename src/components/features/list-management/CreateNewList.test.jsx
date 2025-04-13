import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateNewList from './CreateNewList';
import { listStore, listUIState } from '../../../stores/lists';

// Mock the database utility
vi.mock('../../../utils/database', () => ({
  createList: vi.fn().mockResolvedValue({ id: '123', name: 'Test List' }),
  getLists: vi.fn().mockResolvedValue([])
}));

describe('CreateNewList', () => {
  beforeEach(() => {
    // Reset store state
    listStore.set({ lists: [], activeListId: null });
    listUIState.set({ isLoading: false, error: null });
  });

  it('renders the create list form', () => {
    render(<CreateNewList />);
    expect(screen.getByLabelText(/list name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create list/i })).toBeInTheDocument();
  });

  it('handles list creation successfully', async () => {
    render(<CreateNewList />);
    
    const input = screen.getByLabelText(/list name/i);
    const button = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'Test List' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/list created successfully/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty list name', async () => {
    render(<CreateNewList />);
    
    const button = screen.getByRole('button', { name: /create list/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/list name is required/i)).toBeInTheDocument();
    });
  });

  it('handles server errors gracefully', async () => {
    // Mock database error for this test
    const { createList } = await import('../../../utils/database');
    vi.mocked(createList).mockRejectedValueOnce(new Error('Server error'));

    render(<CreateNewList />);
    
    const input = screen.getByLabelText(/list name/i);
    const button = screen.getByRole('button', { name: /create list/i });

    fireEvent.change(input, { target: { value: 'Test List' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to create list/i)).toBeInTheDocument();
    });
  });
});