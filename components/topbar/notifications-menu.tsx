"use client";

import { useEffect, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { getNotificationMeta, formatRelativeTime } from "@/lib/notifications-meta";

export default function NotificationsMenu({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    markOneRead,
    markAllRead,
    deleteOne,
    deleteAll,
  } = useNotifications();

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const handleItemClick = async (id: string, isRead: boolean) => {
    if (!isRead) await markOneRead(id);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => (open ? onClose() : onOpen())}
        className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:bg-[var(--surface-hover)]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-14 z-50 flex w-[380px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllRead()}
                  title="Mark all as read"
                  className="rounded-lg p-1.5 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                >
                  <Check size={15} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => void deleteAll()}
                  title="Clear all"
                  className="rounded-lg p-1.5 text-[var(--foreground-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={() => onClose()}
                className="rounded-lg p-1.5 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: "420px" }}>
            {loading ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--surface-hover)]" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-1/2 rounded bg-[var(--surface-hover)]" />
                      <div className="h-3 w-3/4 rounded bg-[var(--surface-hover)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-[var(--foreground-muted)]">
                <Bell size={32} className="opacity-30" />
                <p className="text-sm">You're all caught up</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map((n) => {
                  const meta = getNotificationMeta(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => void handleItemClick(n.id, n.isRead)}
                      className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] ${
                        !n.isRead ? "bg-blue-500/5" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
              >
                <meta.icon size={17} strokeWidth={1.75} />
              </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium leading-snug ${
                              !n.isRead
                                ? "text-[var(--foreground)]"
                                : "text-[var(--foreground-muted)]"
                            }`}
                          >
                            {n.title}
                          </p>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {!n.isRead && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void deleteOne(n.id);
                              }}
                              className="hidden rounded p-0.5 text-[var(--foreground-muted)] hover:text-red-400 group-hover:flex"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--foreground-muted)] leading-snug">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--foreground-muted)] opacity-60">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}