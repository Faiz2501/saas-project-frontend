"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api/axios";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;

type TicketMessage = {
  id?: string;
  author?: string | null;
  role?: string | null;
  message?: string | null;
  createdAt?: string | null;
};

type TicketDetail = {
  id: string;
  userId: string;

  subject: string;
  issue: string;

  status: TicketStatus;

  createdAt?: string;

  reply?: string | null;

  customerName?: string;
  customerEmail?: string;

  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };

  conversation?: TicketMessage[];
};

interface Props {
  open: boolean;
  onClose: () => void;
  ticketId: string | null;
  onSaved?: () => void;
}

function normalizeStatus(status?: string | null) {
  const value = (status ?? "").toUpperCase();
  if (value === "CLOSED" || value === "RESOLVED") return "CLOSED";
  return "OPEN";
}
function statusLabel(status?: string | null) {
  return normalizeStatus(status) === "CLOSED" ? "Closed" : "Open";
}

function statusButtonClass(status: string, current: string) {
  const active = normalizeStatus(status) === normalizeStatus(current);

  if (active) {
    return "border-blue-500 bg-blue-600 text-white";
  }

  return "border-slate-700 bg-transparent text-slate-300 hover:border-slate-500";
}

function displayNameFromUser(user: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
}) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.displayName || user.name || user.email || "Unnamed User";
}

function normalizeTicket(raw: any): TicketDetail {
  const customerName =
    raw?.customerName ||
    [raw?.user?.firstName, raw?.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    raw?.user?.email ||
    "Unnamed User";

  const customerEmail =
    raw?.customerEmail ||
    raw?.user?.email ||
    "No email";

  return {
    id: String(raw?.id ?? raw?.ticketId ?? ""),

    userId: String(
      raw?.userId ??
        raw?.user?.id ??
        raw?.createdBy?.id ??
        raw?.createdBy ??
        raw?.requester?.id ??
        ""
    ),

    subject:
      raw?.subject ||
      raw?.title ||
      raw?.issueTitle ||
      raw?.topic ||
      "Untitled ticket",

    issue:
      raw?.issue ||
      raw?.message ||
      raw?.description ||
      raw?.details ||
      "",

    status: normalizeStatus(raw?.status),

    createdAt: raw?.createdAt || raw?.created_at || raw?.time,

    reply: raw?.reply ?? raw?.response ?? null,

    customerName,
    customerEmail,

    user: raw.user,

    conversation: Array.isArray(raw?.conversation)
      ? raw.conversation
      : Array.isArray(raw?.messages)
      ? raw.messages
      : undefined,
  };
}

export default function TicketDrawer({
  open,
  onClose,
  ticketId,
  onSaved,
}: Props) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !ticketId) return;

    const loadTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/admin/support/${ticketId}`);
        const payload = response.data?.ticket ?? response.data ?? null;

        if (!payload) {
          setTicket(null);
          return;
        }

        const normalized = normalizeTicket(payload);
        setTicket(normalized);
        setReply(normalized.reply ?? "");
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load ticket details."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTicket();
  }, [open, ticketId]);

  const conversation = useMemo(() => {
    if (!ticket) return [];

    if (ticket.conversation && ticket.conversation.length > 0) {
      return ticket.conversation.map((item, index) => ({
        id: item.id || `${ticket.id}-msg-${index}`,
        author: item.author || item.role || "Support",
        message: item.message || "",
        tone:
          (item.role ?? item.author ?? "").toLowerCase().includes("support")
            ? "support"
            : "customer",
      }));
    }

    const fallback: {
      id: string;
      author: string;
      message: string;
      tone: "customer" | "support";
    }[] = [
      {
        id: `${ticket.id}-issue`,
        author: "Customer",
        message: ticket.issue || "No issue message provided.",
        tone: "customer",
      },
    ];

    if (ticket.reply) {
      fallback.push({
        id: `${ticket.id}-reply`,
        author: "Support",
        message: ticket.reply,
        tone: "support",
      });
    }

    return fallback;
  }, [ticket]);

  const updateStatus = async (nextStatus: string) => {
    if (!ticketId) return;

    try {
      setSavingStatus(true);
      setError("");

      await api.patch(`/admin/support/${ticketId}/status`, {
        status: nextStatus,
      });

      setTicket((prev) =>
        prev ? { ...prev, status: nextStatus } : prev
      );

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

      await api.patch(`/admin/support/${ticketId}/reply`, {
  reply: cleanReply,
});

      setTicket((prev) =>
        prev ? { ...prev, reply: cleanReply } : prev
      );
      setReply("");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50">
      <div
        className="
          absolute
          right-0
          top-0

          h-full
          w-[550px]

          overflow-y-auto
          border-l
          border-slate-800

          bg-[#08172b]

          p-8
        "
      >
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-2xl font-semibold">Ticket Details</h2>

          <button
            onClick={onClose}
            className="text-sm text-white/90 hover:text-white"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-slate-500">Ticket ID</p>
            <p className="mt-1 text-lg text-white">
              {loading ? "Loading..." : ticket?.id || "—"}
            </p>
          </div>

          <div>
            <p className="text-slate-500">User</p>

            <p className="mt-2 text-white font-medium">
              {loading
                ? "Loading..."
                : ticket?.customerName ||
                  (ticket?.user
                    ? [ticket.user.firstName, ticket.user.lastName]
                        .filter(Boolean)
                        .join(" ")
                    : "") ||
                  ticket?.user?.email ||
                  "Unnamed User"}
            </p>

            <p className="text-sm text-slate-400">
              {loading
                ? ""
                : ticket?.customerEmail ||
                  ticket?.user?.email ||
                  "No email"}
            </p>
          </div>

          <div className="space-y-8">
  <div>
    <p className="text-slate-500">User ID</p>
    <p className="mt-2 text-white">
      {loading ? "Loading..." : ticket?.userId || "—"}
    </p>
  </div>

  <div>
    <p className="text-slate-500">Created At</p>
    <p className="mt-2 text-white">
      {loading
        ? "Loading..."
        : ticket?.createdAt
        ? new Date(ticket.createdAt).toLocaleString()
        : "—"}
    </p>
  </div>

  <div>
    <p className="text-slate-500">Issue</p>
    <p className="mt-2 leading-8 text-white/95">
      {loading ? "Loading..." : ticket?.issue || "—"}
    </p>
  </div>

            <div>
              <p className="mb-4 text-slate-500">Conversation</p>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-[#020d1b] p-4 text-sm text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading conversation...
                  </div>
                ) : conversation.length > 0 ? (
                  conversation.map((item) => (
                    <div
                      key={item.id}
                      className={
                        item.tone === "support"
                          ? "rounded-2xl bg-blue-600/10 p-4 text-white"
                          : "rounded-2xl bg-[#020d1b] p-4 text-white"
                      }
                    >
                      {item.message}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#020d1b] p-4 text-slate-300">
                    No conversation available.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-slate-500">Reply</p>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here..."
              className="
                min-h-[120px]
                w-full
                rounded-2xl
                border
                border-slate-700
                bg-[#020d1b]
                p-4
                text-white
                outline-none
                placeholder:text-slate-500
              "
            />

            <div className="mt-3 flex justify-end">
              <button
                onClick={sendReply}
                disabled={sendingReply || loading}
                className="
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {sendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-slate-500">Status</p>

            <div className="grid grid-cols-2 gap-3">
  {[
    { value: "OPEN", label: "Open" },
    { value: "CLOSED", label: "Closed" },
  ].map((status) => (
    <button
      key={status.value}
      onClick={() => updateStatus(status.value)}
      disabled={savingStatus || sendingReply || loading}
      className={`rounded-xl border p-3 transition ${
        ticket
          ? statusButtonClass(status.value, ticket.status)
          : "border-slate-700 bg-transparent text-slate-300"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {savingStatus && normalizeStatus(ticket?.status) === status.value
        ? "Saving..."
        : status.label}
    </button>
  ))}
</div>

            {ticket?.status && (
              <p className="mt-4 text-sm text-slate-400">
                Current status: {statusLabel(ticket.status)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}