import { create } from 'zustand';

import { initialNotifications } from '@/utils/mockData';

const useNotificationStore = create((set) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((item) => !item.readAt).length,
  addNotification: (notification) =>
    set((state) => {
      const notifications = [
        {
          id: `notification-${Date.now()}`,
          ...notification
        },
        ...state.notifications
      ];
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.readAt).length
      };
    }),
  markRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((item) =>
        item.id === notificationId && !item.readAt
          ? { ...item, readAt: new Date().toISOString() }
          : item
      );
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.readAt).length
      };
    }),
  markAllRead: () =>
    set((state) => {
      const readAt = new Date().toISOString();
      const notifications = state.notifications.map((item) => ({
        ...item,
        readAt: item.readAt || readAt
      }));
      return { notifications, unreadCount: 0 };
    })
}));

export default useNotificationStore;
