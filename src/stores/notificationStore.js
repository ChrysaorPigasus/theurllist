import { map } from 'nanostores';

// Create the notification store
export const notificationStore = map({
  notifications: [],
  lastId: 0
});

// Create Azure ApplicationInsights instance if we're in the browser AND a connection string is available
let appInsights = null;

// Defer initialization to client-side only
const initializeAppInsights = () => {
  if (typeof window !== 'undefined' && !appInsights) {
    import('@microsoft/applicationinsights-web').then(({ ApplicationInsights }) => {
      const connectionString = import.meta.env.PUBLIC_AZURE_CONNECTION_STRING;
      
      // Only initialize Application Insights if a connection string is provided
      if (connectionString) {
        try {
          appInsights = new ApplicationInsights({
            config: {
              connectionString,
              /* Uncomment if you need to disable some features */
              // disableFetchTracking: false,
              // disableExceptionTracking: false,
            }
          });
          appInsights.loadAppInsights();
          appInsights.trackPageView(); // Track the initial page view
          console.log('Azure Application Insights initialized successfully');
        } catch (error) {
          console.warn('Failed to initialize Azure Application Insights:', error);
          appInsights = null;
        }
      } else {
        console.info('Azure Application Insights not initialized: No connection string provided');
      }
    }).catch(error => {
      console.warn('Error loading ApplicationInsights:', error);
    });
  }
};

// Delay initialization to avoid SSR issues
if (typeof window !== 'undefined') {
  // Wait for the document to be ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeAppInsights, 0);
  } else {
    window.addEventListener('DOMContentLoaded', initializeAppInsights);
  }
}

// Notification types with their corresponding colors
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Function to add a notification
export function addNotification(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
  // Get current state
  const state = notificationStore.get();
  const id = state.lastId + 1;
  
  // Create notification object
  const notification = {
    id,
    message,
    type,
    timestamp: new Date(),
    duration: options.duration || 3000, // Default duration: 3 seconds
    ...options
  };
  
  // Add to store
  notificationStore.set({
    notifications: [...state.notifications, notification],
    lastId: id
  });
  
  // Log to Azure ApplicationInsights
  if (appInsights) {
    appInsights.trackEvent({
      name: 'Notification',
      properties: {
        message,
        type,
        ...options
      }
    });
  }
  
  // Return the notification ID so it can be removed if needed
  return id;
}

// Helper functions for different notification types
export function showSuccess(message, options = {}) {
  return addNotification(message, NOTIFICATION_TYPES.SUCCESS, options);
}

export function showError(message, options = {}) {
  // Also log to Azure as an exception
  if (appInsights && typeof window !== 'undefined') {
    appInsights.trackException({
      exception: new Error(message),
      properties: options
    });
  }
  return addNotification(message, NOTIFICATION_TYPES.ERROR, { duration: 5000, ...options });
}

export function showInfo(message, options = {}) {
  return addNotification(message, NOTIFICATION_TYPES.INFO, options);
}

export function showWarning(message, options = {}) {
  return addNotification(message, NOTIFICATION_TYPES.WARNING, { duration: 4000, ...options });
}

// Function to remove a notification by ID
export function removeNotification(id) {
  const state = notificationStore.get();
  notificationStore.set({
    ...state,
    notifications: state.notifications.filter(notification => notification.id !== id)
  });
}

// Function to clear all notifications
export function clearAllNotifications() {
  notificationStore.set({
    ...notificationStore.get(),
    notifications: []
  });
}