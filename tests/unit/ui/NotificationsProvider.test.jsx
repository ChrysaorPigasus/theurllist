import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotificationsProvider from '@components/ui/NotificationsProvider';
import { notificationStore, showSuccess, showError } from '@stores/notificationStore';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn(() => ({ notifications: [] }))
}));

vi.mock('react-toastify', () => ({
  ToastContainer: vi.fn(() => <div data-testid="toast-container" />),
  toast: {
    TYPE: {
      SUCCESS: 'success',
      ERROR: 'error',
      INFO: 'info',
      WARNING: 'warning',
      DEFAULT: 'default'
    },
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

describe('NotificationsProvider', () => {
  const useStoreMock = vi.spyOn(require('@nanostores/react'), 'useStore');
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the ToastContainer', () => {
    render(<NotificationsProvider />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('shows notifications when the store has notifications', () => {
    // Setup mock notifications in the store
    const mockNotifications = [
      { id: 1, message: 'Success message', type: 'success', displayed: false },
      { id: 2, message: 'Error message', type: 'error', displayed: false }
    ];
    
    // Mock the useStore hook to return our test notifications
    useStoreMock.mockImplementation(() => ({ notifications: mockNotifications }));
    
    render(<NotificationsProvider />);
    
    // Check that toast was called for each notification
    expect(toast).toHaveBeenCalledTimes(2);
    
    // The notifications should now be marked as displayed
    expect(mockNotifications[0].displayed).toBe(true);
    expect(mockNotifications[1].displayed).toBe(true);
  });

  it('skips already displayed notifications', () => {
    // Setup mock notifications with one already displayed
    const mockNotifications = [
      { id: 1, message: 'Already displayed', type: 'info', displayed: true },
      { id: 2, message: 'New notification', type: 'warning', displayed: false }
    ];
    
    useStoreMock.mockImplementation(() => ({ notifications: mockNotifications }));
    
    render(<NotificationsProvider />);
    
    // Check that toast was called only once (for the non-displayed notification)
    expect(toast).toHaveBeenCalledTimes(1);
  });
});