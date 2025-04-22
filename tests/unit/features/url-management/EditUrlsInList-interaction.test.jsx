import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the imported modules
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn()
}));

// Create mock data
const mockLists = [
  {
    id: '123',
    name: 'Test List',
    urls: [
      { id: '1', title: 'Example 1', url: 'https://example.com/1' },
      { id: '2', title: 'Example 2', url: 'https://example.com/2' }
    ]
  }
];
let mockIsLoading = false;
let mockError = null;
let mockActiveListId = '123';

// Mock updateUrl function
const mockUpdateUrl = vi.fn();

// Mock the stores
vi.mock('@stores/lists', () => ({
  listStore: { 
    toString: () => 'listStore',
    get: vi.fn(() => ({ lists: mockLists, activeListId: mockActiveListId })),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  },
  listUIState: { 
    toString: () => 'listUIState',
    get: vi.fn(() => ({ isLoading: mockIsLoading, error: mockError })),
    set: vi.fn(),
    setKey: vi.fn(),
    subscribe: vi.fn()
  },
  updateUrl: (...args) => mockUpdateUrl(...args)
}));

// Import useStore after mocking
import { useStore } from '@nanostores/react';
// Import component after all mocks are set up
import EditUrlsInList from '@components/features/url-management/EditUrlsInList';

describe('EditUrlsInList - Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset test values
    mockIsLoading = false;
    mockError = null;
    mockActiveListId = '123';
    
    // Default successful update
    mockUpdateUrl.mockResolvedValue(true);
    
    // Set up useStore to return different values based on which store is passed
    useStore.mockImplementation((store) => {
      if (store.toString() === 'listStore') {
        return { 
          lists: mockLists, 
          activeListId: mockActiveListId 
        };
      } else if (store.toString() === 'listUIState') {
        return { 
          isLoading: mockIsLoading, 
          error: mockError 
        };
      }
      return {};
    });
  });
  
  it('shows edit form when Edit button is clicked', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Click edit on the first URL
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Now the form should be visible with input fields
    const urlInput = screen.getByDisplayValue('https://example.com/1');
    const titleInput = screen.getByDisplayValue('Example 1');
    
    expect(urlInput).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
    
    // Save and Cancel buttons should be visible
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  it('updates URL data when form fields change', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Click edit on the first URL
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Now the form should be visible
    const urlInput = screen.getByDisplayValue('https://example.com/1');
    const titleInput = screen.getByDisplayValue('Example 1');
    
    // Change the values
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(urlInput, { target: { value: 'https://updated.com' } });
    
    // Check that inputs reflect the new values
    expect(titleInput).toHaveValue('Updated Title');
    expect(urlInput).toHaveValue('https://updated.com');
  });
  
  it('submits updated URLs when Save button is clicked', async () => {
    render(<EditUrlsInList listId="123" />);
    
    // Click edit on the first URL
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Now the form should be visible
    const urlInput = screen.getByDisplayValue('https://example.com/1');
    const titleInput = screen.getByDisplayValue('Example 1');
    
    // Change the values
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(urlInput, { target: { value: 'https://updated.com' } });
    
    // Click save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check that updateUrl was called with the correct data
    await waitFor(() => {
      expect(mockUpdateUrl).toHaveBeenCalledWith('1', 'https://updated.com', 'Updated Title');
    });
  });
  
  it('cancels editing when Cancel button is clicked', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Click edit on the first URL
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Now the form should be visible
    const urlInput = screen.getByDisplayValue('https://example.com/1');
    const titleInput = screen.getByDisplayValue('Example 1');
    
    // Change the values
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(urlInput, { target: { value: 'https://updated.com' } });
    
    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Form should be hidden and text display should be back
    expect(screen.getByText('https://example.com/1')).toBeInTheDocument();
    expect(screen.getByText('Example 1')).toBeInTheDocument();
    
    // Edit buttons should be visible again
    const newEditButtons = screen.getAllByText('Edit');
    expect(newEditButtons.length).toBe(2);
  });

  it('allows editing multiple URLs one after another', async () => {
    render(<EditUrlsInList listId="123" />);
    
    // Click edit on the first URL
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Edit and save first URL
    const urlInput1 = screen.getByDisplayValue('https://example.com/1');
    fireEvent.change(urlInput1, { target: { value: 'https://updated1.com' } });
    
    // Save first URL
    const saveButton1 = screen.getByText('Save');
    fireEvent.click(saveButton1);
    
    // Wait for the first update to complete and for the UI to go back to its initial state
    await waitFor(() => {
      expect(mockUpdateUrl).toHaveBeenCalledWith('1', 'https://updated1.com', 'Example 1');
      // Make sure the edit form is no longer visible
      expect(screen.queryByDisplayValue('https://updated1.com')).not.toBeInTheDocument();
    });
    
    // Now edit the second URL
    const newEditButtons = screen.getAllByText('Edit');
    fireEvent.click(newEditButtons[1]); // Click on the second URL's edit button
    
    // Wait for the edit form to appear for the second URL
    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/2')).toBeInTheDocument();
    });

    // Edit and save second URL
    const urlInput2 = screen.getByDisplayValue('https://example.com/2');
    fireEvent.change(urlInput2, { target: { value: 'https://updated2.com' } });

    // Save second URL
    const saveButton2 = screen.getByText('Save');
    fireEvent.click(saveButton2);

    // Check that updateUrl was called for the second URL too
    await waitFor(() => {
      expect(mockUpdateUrl).toHaveBeenCalledWith('2', 'https://updated2.com', 'Example 2');
    });

    // Verify updateUrl was called twice
    expect(mockUpdateUrl).toHaveBeenCalledTimes(2);
  });
});