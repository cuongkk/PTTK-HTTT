import { apiClient } from "./apiClient";

export interface AppNotification { notificationId: string; title: string; content: string; notificationType: string; createdAt: string; isRead: boolean; readAt: string | null; }
export interface NotificationList { unreadCount: number; items: AppNotification[]; }

export const notificationService = {
  getMine: () => apiClient.get<NotificationList>("/notifications/mine"),
  markRead: (notificationId: string) => apiClient.put<void>(`/notifications/${notificationId}/read`),
  markAllRead: () => apiClient.put<void>("/notifications/read-all"),
};
