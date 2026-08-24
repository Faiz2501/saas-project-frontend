import api from "@/lib/api/axios";
import type { Notification, UnreadCountResponse } from "@/types/notifications";

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const res = await api.get<Notification[]>("/notifications");
    return res.data;
  },

  getUnread: async (): Promise<Notification[]> => {
    const res = await api.get<Notification[]>("/notifications/unread");
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<UnreadCountResponse>("/notifications/unread/count");
    return res.data.count;
  },

  markOneRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },

  deleteOne: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await api.delete("/notifications");
  },
};
