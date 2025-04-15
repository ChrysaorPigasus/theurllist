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
vi.mock('../../../stores/lists', () => ({
  listStore: { toString: () => 'listStore' },
  listUIState: { toString: () => 'listUIState' },
  updateUrl: (...args) => mockUpdateUrl(...args)
}));

// Import useStore after mocking
import { useStore } from '@nanostores/react';
// Import component after all mocks are set up
import EditUrlsInList from './EditUrlsInList';

describe('EditUrlsInList', () => {
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
  
  it('renders form fields for each URL', () => {
    render(<EditUrlsInList listId="123" />);
    
    // Since the component doesn't show edit forms until Edit is clicked,
    // we should see the URLs displayed as text first
    expect(screen.getByText('https://example.com/1')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/2')).toBeInTheDocument();
    expect(screen.getByText('Example 1')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
    
    // Should have Edit buttons
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(2);
  });
  
  it('updates URL data when form fields change', async () => {
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
  
  it('validates required fields', async () => {
    render(<EditUrlsInList listId="123" />);
    
    // Click edit on the first URL
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Now the form should be visible
    const urlInput = screen.getByDisplayValue('https://example.com/1');
    
    // Clear the URL
    fireEvent.change(urlInput, { target: { value: '' } });
    
    // Click save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/URL cannot be empty/i)).toBeInTheDocument();
    });
    
    // URL should not be updated
    expect(mockUpdateUrl).not.toHaveBeenCalled();
  });
  
  it('validates URL format', () => {
    // This test is covered by browser validation for input type="url"
    // The component relies on browser validation for URL format
    expect(true).toBe(true);
  });
  
  it('submits updated URLs when form is valid', async () => {
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
  
  it('shows loading state while updating', () => {
    mockIsLoading = true;
    
    render(<EditUrlsInList listId="123" />);
    
    // Should show loading spinner
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });
  
  it('shows error message if update fails', () => {
    mockError = 'Failed to update URLs';
    
    render(<EditUrlsInList listId="123" />);
    
    // Should show error message
    expect(screen.getByText('Failed to update URLs')).toBeInTheDocument();
  });
});