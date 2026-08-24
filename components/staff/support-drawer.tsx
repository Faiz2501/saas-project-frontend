"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import api from "@/lib/api/axios";
import { useStaffAccess } from "@/hooks/use-staff-access";
import {
  formatDateTime,
  normalizeSupportStatus,
  supportStatusLabel,
} from "@/lib/staff/utils";

type Props = {
  open: boolean;
  ticketId: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

type Ticket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  reply?: string | null;
  customerName?: string;
  customerEmail?: string;
  userRole?: string;
};

const STATUS_OPTIONS = ["OPEN", "CLOSED"] as const;

function compactSupportStatus(status?: string | null) {
  const value = String(status ?? "").toUpperCase();
  return value === "CLOSED" || value === "RESOLVED" ? "CLOSED" : "OPEN";
}

function compactSupportStatusLabel(status?: string | null) {
  return compactSupportStatus(status) === "CLOSED" ? "Closed" : "Open";
}

function compactSupportStatusTone(status?: string | null) {
  return compactSupportStatus(status) === "CLOSED"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-blue-500/20 bg-blue-500/10 text-blue-300";
}

export default function SupportDrawer({
  open,
  ticketId,
  onClose,
  onSaved,
}: Props) {
  const access = useStaffAccess(true);

  const canManageSupport =
    access.hasPermission("VIEW_SUPPORT") ||
    access.hasPermission("MANAGE_SUPPORT");

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !ticketId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/support/${ticketId}`);
        const payload = response.data?.ticket ?? response.data ?? null;

        if (cancelled) return;

        if (!payload) {
          setTicket(null);
          return;
        }

        setTicket({
          id: String(payload.id),
          userId: String(payload.userId),
          subject: String(payload.subject ?? "Untitled Ticket"),
          message: String(payload.message ?? ""),
          status: String(payload.status ?? "OPEN"),
          createdAt: String(payload.createdAt ?? ""),
          reply: payload.reply ?? null,
          customerName:
            payload.customerName ||
            [payload?.user?.firstName, payload?.user?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            payload?.user?.email ||
            "Unnamed User",
          customerEmail: payload.customerEmail || payload?.user?.email || "No email",
          userRole: payload.userRole,
        });

        setReply(String(payload.reply ?? ""));
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load ticket details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, ticketId]);

  const conversation = useMemo(() => {
    if (!ticket) return [];

    const items = [
      {
        author: ticket.customerName || "Customer",
        role: "customer",
        message: ticket.message || "No message provided.",
      },
    ];

    if (ticket.reply) {
      items.push({
        author: "Staff",
        role: "staff",
        message: ticket.reply,
      });
    }

    return items;
  }, [ticket]);

  const updateStatus = async (status: string) => {
    if (!ticketId) return;

    try {
      setSavingStatus(true);
      setError("");

      await api.patch(`/support/${ticketId}/status`, { status });

      setTicket((prev) => (prev ? { ...prev, status } : prev));
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update ticket status."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const sendReply = async () => {
    if (!ticketId) return;

    const cleanReply = reply.trim();
    if (!cleanReply) {
      setError("Please write a reply before sending.");
      return;
    }

    try {
      setSendingReply(true);
      setError("");

      await api.patch(`/support/${ticketId}/reply`, {
        reply: cleanReply,
        status: "CLOSED",
      });

      setTicket((prev) =>
        prev ? { ...prev, reply: cleanReply, status: "CLOSED" } : prev
      );

      setReply(cleanReply);
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send reply."
      );
    } finally {
      setSendingReply(false);
    }
  };

  const deleteTicket = async () => {
    if (!ticketId) return;

    if (!window.confirm("Delete this ticket? This cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/support/${ticketId}`);
      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete ticket."
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
  if (!open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [open, onClose]);

  if (!open) return null;

  return (
    <div
  className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm"
  onClick={onClose}
>
  <div
    className="absolute right-0 top-0 h-full w-full max-w-[680px] overflow-y-auto border-l border-[var(--border)] bg-[#08172b] p-8"
    onClick={(e) => e.stopPropagation()}
  >
      <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Support Ticket
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-white">
              {ticket?.subject || "Loading..."}
            </h2>

            <p className="mt-2 text-slate-400">
              {ticket?.customerName || ticket?.customerEmail || "Customer"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${compactSupportStatusTone(
                  ticket?.status
                )}`}
              >
                {compactSupportStatusLabel(ticket?.status)}
              </span>

              <span className="text-sm text-slate-500">
                ID {ticket?.id ? ticket.id.slice(0, 8) : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-3 py-3 text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Created {formatDateTime(ticket?.createdAt)}
          {ticket?.userRole ? ` • Role ${ticket.userRole}` : ""}
        </p>

        {loading ? (
          <div className="mt-10 flex items-center gap-3 text-slate-300">
            <Loader2 className="animate-spin" size={18} />
            Loading ticket details...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Original Message
              </p>

              <p className="mt-4 leading-8 text-slate-200">
                {ticket?.message || "No message provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Conversation
              </p>

              <div className="mt-4 space-y-4">
                {conversation.map((item, index) => (
                  <div
                    key={`${ticket?.id ?? "ticket"}-${index}`}
                    className={`rounded-2xl px-4 py-4 ${
                      item.role === "staff"
                        ? "ml-8 border border-emerald-500/20 bg-emerald-500/5"
                        : "mr-8 border border-slate-800 bg-[#08172b]"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {item.author}
                    </p>
                    <p className="mt-2 leading-7 text-slate-200">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Status</h3>
                <span className="text-sm text-slate-400">
                  Update ticket state
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      if (!canManageSupport) return;
                      void updateStatus(status);
                    }}
                    disabled={savingStatus || !canManageSupport}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      !canManageSupport
                        ? "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500"
                        : normalizeSupportStatus(ticket?.status) === status
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-700 text-slate-300 hover:bg-[var(--hover-surface)]"
                    }`}
                  >
                    {supportStatusLabel(status)}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Reply</h3>
                <span className="text-sm text-slate-400">
                  Visible to the customer
                </span>
              </div>

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a support reply..."
                disabled={!canManageSupport}
                className={`
                  mt-4
                  min-h-[150px]
                  w-full
                  rounded-2xl
                  border
                  p-4
                  outline-none
                  ${
                    canManageSupport
                      ? "border-slate-800 bg-[#020d1b] text-white"
                      : "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500"
                  }
                `}
              />

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (!canManageSupport) return;
                    void deleteTicket();
                  }}
                  disabled={deleting || !canManageSupport}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    canManageSupport
                      ? "border-red-500/20 bg-red-500/5 text-red-300 hover:border-red-500/40 hover:bg-red-500/15"
                      : "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500"
                  }`}
                >
                  <Trash2 size={16} />
                  Delete
                </button>

                <button
                  onClick={() => {
                    if (!canManageSupport) return;
                    void sendReply();
                  }}
                  disabled={sendingReply || !canManageSupport}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                    canManageSupport
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "cursor-not-allowed bg-slate-700 text-slate-400"
                  }`}
                >
                  {sendingReply ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </section>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}