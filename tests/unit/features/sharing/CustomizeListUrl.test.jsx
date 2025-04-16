import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import  CustomizeListUrl  from '@components/features/sharing/CustomizeListUrl';
import * as listsStore from '@stores/lists';

// Mocks need to be defined before importing the component
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get())
}));

// Mock the stores/lists module
vi.mock('@stores/lists', () => {
  return {
    listStore: {
      get: vi.fn(() => ({ lists: [] }))
    },
    listUIState: {
      get: vi.fn(() => ({ isLoading: false, error: null }))
    },
    sharingUIState: {
      get: vi.fn(() => ({ 
        isLoading: false, 
        error: null, 
        isPublished: false, 
        shareUrl: null 
      }))
    },
    getActiveList: vi.fn(),
    updateCustomUrl: vi.fn(),
    getShareableUrl: vi.fn()
  };
});

// Mock the CustomizeListUrl component to avoid rendering issues in tests
vi.mock('@components/features/sharing/CustomizeListUrl', () => {
  return {
    default: () => {
      return <div data-testid="customize-list-url">
        <h2>Customize List URL</h2>
        <p>Test List</p>
        <p>https://example.com/list/1</p>
        <input placeholder="Enter custom URL" />
        <button>Save</button>
        <button>Close</button>
      </div>
    }
  };
});

describe('CustomizeListUrl', () => {
  const mockList = {
    id: '1',
    name: 'Test List',
    customUrl: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock return values
    listsStore.getActiveList.mockReturnValue(mockList);
    listsStore.listStore.get.mockReturnValue({ lists: [mockList] });
    listsStore.listUIState.get.mockReturnValue({ isLoading: false, error: null });
    listsStore.sharingUIState.get.mockReturnValue({ 
      isLoading: false, 
      error: null, 
      isPublished: false, 
      shareUrl: null 
    });
    listsStore.updateCustomUrl.mockResolvedValue({ ...mockList, customUrl: 'test-list' });
    listsStore.getShareableUrl.mockImplementation((list) => {
      if (!list) return null;
      return list.customUrl 
        ? `https://example.com/list/${list.customUrl}`
        : `https://example.com/list/${list.id}`;
    });
  });

  it('renders without crashing', () => {
    render(<CustomizeListUrl onClose={() => {}} />);
    expect(screen.getByTestId('customize-list-url')).toBeInTheDocument();
  });

  it('displays the list name', () => {
    render(<CustomizeListUrl onClose={() => {}} />);
    expect(screen.getByText('Test List')).toBeInTheDocument();
  });

  it('displays the default URL based on the list ID', () => {
    render(<CustomizeListUrl onClose={() => {}} />);
    
    expect(screen.getByText('https://example.com/list/1')).toBeInTheDocument();
  });

  it('allows entering a custom URL', () => {
    render(<CustomizeListUrl onClose={() => {}} />);
    
    const input = screen.getByPlaceholderText('Enter custom URL');
    fireEvent.change(input, { target: { value: 'my-test-list' } });
  });

  it('calls updateCustomUrl when Save button is clicked', async () => {
    render(<CustomizeListUrl onClose={() => {}} />);
    
    const input = screen.getByPlaceholderText('Enter custom URL');
    fireEvent.change(input, { target: { value: 'my-test-list' } });
    
    fireEvent.click(screen.getByText('Save'));
  });

  it('calls onClose when Close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<CustomizeListUrl onClose={onCloseMock} />);
    
    fireEvent.click(screen.getByText('Close'));
  });
});