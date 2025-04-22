import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationStore, showSuccess, showError, showInfo, showWarning, removeNotification, clearAllNotifications } from '@stores/notificationStore';

// Mock ApplicationInsights
vi.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: vi.fn().mockImplementation(() => ({
    loadAppInsights: vi.fn(),
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
    trackException: vi.fn()
  }))
}));

describe('notificationStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    notificationStore.set({ notifications: [], lastId: 0 });
  });

  it('should add a success notification', () => {
    const id = showSuccess('Test success notification');
    const notifications = notificationStore.get().notifications;
    
    expect(id).toBe(1);
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Test success notification');
    expect(notifications[0].type).toBe('success');
  });

  it('should add an error notification', () => {
    const id = showError('Test error notification');
    const notifications = notificationStore.get().notifications;
    
    expect(id).toBe(1);
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Test error notification');
    expect(notifications[0].type).toBe('error');
  });

  it('should add an info notification', () => {
    const id = showInfo('Test info notification');
    const notifications = notificationStore.get().notifications;
    
    expect(id).toBe(1);
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Test info notification');
    expect(notifications[0].type).toBe('info');
  });

  it('should add a warning notification', () => {
    const id = showWarning('Test warning notification');
    const notifications = notificationStore.get().notifications;
    
    expect(id).toBe(1);
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Test warning notification');
    expect(notifications[0].type).toBe('warning');
  });

  it('should remove a notification', () => {
    const id = showSuccess('Test notification to remove');
    
    expect(notificationStore.get().notifications.length).toBe(1);
    
    removeNotification(id);
    
    expect(notificationStore.get().notifications.length).toBe(0);
  });

  it('should clear all notifications', () => {
    showSuccess('Notification 1');
    showSuccess('Notification 2');
    showSuccess('Notification 3');
    
    expect(notificationStore.get().notifications.length).toBe(3);
    
    clearAllNotifications();
    
    expect(notificationStore.get().notifications.length).toBe(0);
  });

  it('should increment lastId for each notification', () => {
    const id1 = showSuccess('First notification');
    const id2 = showError('Second notification');
    const id3 = showInfo('Third notification');
    
    expect(id1).toBe(1);
    expect(id2).toBe(2);
    expect(id3).toBe(3);
    expect(notificationStore.get().lastId).toBe(3);
  });

  it('should set custom duration for a notification', () => {
    const id = showSuccess('Success with custom duration', { duration: 5000 });
    const notification = notificationStore.get().notifications[0];
    
    expect(notification.duration).toBe(5000);
  });
});