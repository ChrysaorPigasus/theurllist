import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { ToastContainer, toast } from 'react-toastify';
import { notificationStore, removeNotification, NOTIFICATION_TYPES } from '@stores/notificationStore';
import 'react-toastify/dist/ReactToastify.css';

export default function NotificationsProvider() {
  const { notifications } = useStore(notificationStore);
  
  useEffect(() => {
    // Process any new notifications
    notifications.forEach(notification => {
      // Skip if already displayed
      if (notification.displayed) return;
      
      // Mark as displayed to prevent duplicate toasts
      notification.displayed = true;
      
      // Map our notification types to react-toastify methods directly
      const showToast = (message, options) => {
        switch(notification.type) {
          case NOTIFICATION_TYPES.SUCCESS:
            return toast.success(message, options);
          case NOTIFICATION_TYPES.ERROR:
            return toast.error(message, options);
          case NOTIFICATION_TYPES.WARNING:
            return toast.warning(message, options);
          case NOTIFICATION_TYPES.INFO:
            return toast.info(message, options);
          default:
            return toast(message, options);
        }
      };
      
      // Show the toast
      showToast(notification.message, {
        position: "top-right",
        autoClose: notification.duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => {
          // Remove the notification from the store when it's closed
          removeNotification(notification.id);
        },
        // For accessibility (can be customized)
        role: "alert",
        // For BDD testing
        "data-testid": `notification-${notification.type}`, 
      });
    });
  }, [notifications]);
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      limit={5}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="notification-container"
    />
  );
}