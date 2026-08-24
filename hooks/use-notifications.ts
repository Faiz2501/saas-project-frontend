"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { notificationsApi } from "@/lib/api/notifications";
import type { Notification } from "@/types/notifications";

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [all, count] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(all);
      setUnreadCount(count);
    } catch {
      // silently fail — user may not be logged in yet
    } finally {
      setLoading(false);
    }
  }, []);

  // initial fetch + polling
  useEffect(() => {
    void fetchAll();

    intervalRef.current = setInterval(() => {
      void fetchAll();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  const markOneRead = useCallback(async (id: string) => {
    await notificationsApi.markOneRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    await notificationsApi.deleteOne(id);
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id);
      const next = prev.filter((n) => n.id !== id);
      if (removed && !removed.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return next;
    });
  }, []);

  const deleteAll = useCallback(async () => {
    await notificationsApi.deleteAll();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchAll,
    markOneRead,
    markAllRead,
    deleteOne,
    deleteAll,
  };
}
