"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  PlusCircle,
  Search,
  Ticket,
  X,
} from "lucide-react";

import api from "@/lib/api/axios";

type MeUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
};

type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  reply?: string | null;
};

type SupportTicketResponse = SupportTicket & {
  customerName?: string;
  customerEmail?: string;
  userRole?: string;
};

function normalizeStatus(status?: string | null) {
  const value = String(status ?? "").toUpperCase();
  if (value === "CLOSED" || value === "RESOLVED") return "CLOSED";
  if (value === "IN_PROGRESS") return "IN_PROGRESS";
  return "OPEN";
}

function statusLabel(status?: string | null) {
  const value = normalizeStatus(status);
  if (value === "CLOSED") return "Closed";
  if (value === "IN_PROGRESS") return "In Progress";
  return "Open";
}

function statusTone(status?: string | null) {
  const value = normalizeStatus(status);
  if (value === "CLOSED") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }
  if (value === "IN_PROGRESS") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
  return "border-blue-500/20 bg-blue-500/10 text-blue-300";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getDisplayName(user: MeUser) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email || "Unnamed User";
}

function normalizeTicket(raw: any): SupportTicket {
  return {
    id: String(raw?.id ?? raw?.ticketId ?? raw?.code ?? ""),
    userId: String(
      raw?.userId ??
        raw?.user?.id ??
        raw?.createdBy?.id ??
        raw?.createdBy ??
        raw?.requester?.id ??
        ""
    ),
    subject: String(
      raw?.subject ?? raw?.title ?? raw?.issueTitle ?? "Untitled ticket"
    ),
    message: String(raw?.message ?? raw?.issue ?? raw?.description ?? ""),
    status: String(raw?.status ?? "OPEN"),
    createdAt: String(raw?.createdAt ?? raw?.created_at ?? raw?.time ?? ""),
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? undefined,
    reply: raw?.reply ?? raw?.response ?? null,
  };
}

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<MeUser | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const loadSupport = async () => {
    try {
      setError("");
      setRefreshing(true);

      const meResponse = await api.get("/users/me");
      const me = meResponse.data as MeUser;
      setUser(me);

      const ticketsResponse = await api.get(`/support/user/${me.id}`);
      const payload = ticketsResponse.data?.tickets ?? ticketsResponse.data ?? [];
      const normalized = Array.isArray(payload)
        ? payload.map(normalizeTicket).filter((ticket) => ticket.id)
        : [];

      normalized.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTickets(normalized);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load support tickets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSupport();
  }, []);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      return [ticket.id, ticket.subject, ticket.message, ticket.reply, ticket.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tickets, search]);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(
    (ticket) => normalizeStatus(ticket.status) === "OPEN"
  ).length;
  const inProgressTickets = tickets.filter(
    (ticket) => normalizeStatus(ticket.status) === "IN_PROGRESS"
  ).length;
  const closedTickets = tickets.filter(
    (ticket) => normalizeStatus(ticket.status) === "CLOSED"
  ).length;

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("Your profile could not be loaded.");
      return;
    }

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanSubject || !cleanMessage) {
      setError("Subject and message are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/support/create", {
        userId: user.id,
        subject: cleanSubject,
        message: cleanMessage,
      });

      setSubject("");
      setMessage("");
      await loadSupport();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create ticket."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Support</h1>
        <p className="mt-2 max-w-2xl text-[var(--foreground-muted)]">
          Raise support requests, track replies, and follow the status of every ticket in one place.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Total Tickets
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {totalTickets}
              </p>
            </div>
            <Ticket className="text-slate-400" size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Open Tickets
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {openTickets}
              </p>
            </div>
            <MessageSquare className="text-blue-400" size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                In Progress
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {inProgressTickets}
              </p>
            </div>
            <Loader2 className="text-amber-400" size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Closed
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {closedTickets}
              </p>
            </div>
            <CheckCircle2 className="text-emerald-400" size={22} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">Create Ticket</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Send a request to the support team.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTicket} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe your issue"
                className="w-full rounded-xl border border-[var(--border)] bg-[#020d1b] px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the issue in detail"
                className="min-h-[170px] w-full rounded-xl border border-[var(--border)] bg-[#020d1b] px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                The support team will reply inside the same ticket thread.
              </p>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Sending...
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Open Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">My Tickets</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Track status and replies from support.
              </p>
            </div>

            {refreshing ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="animate-spin" size={16} />
                Refreshing
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#020d1b] px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[#020d1b] p-6 text-[var(--foreground-muted)]">
                <Loader2 className="animate-spin" size={18} />
                Loading tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[#020d1b] p-6 text-[var(--foreground-muted)]">
                No tickets found.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const hasReply = Boolean(ticket.reply?.trim());

                return (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {ticket.subject}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${statusTone(
                                ticket.status
                              )}`}
                            >
                              {statusLabel(ticket.status)}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm text-[var(--foreground-muted)]">
                            {ticket.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                        <span>{formatRelativeTime(ticket.createdAt)}</span>
                        <span>{hasReply ? "Reply available" : "Waiting for support"}</span>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setDrawerOpen(true);
                          }}
                          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-white transition hover:bg-white/5"
                        >
                          View Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {drawerOpen && selectedTicket && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-full max-w-[640px] overflow-y-auto border-l border-[var(--border)] bg-[#08172b] p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Ticket Details
                </p>

                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {selectedTicket.subject}
                </h2>

                <p className="mt-2 text-slate-400">
                  Ticket ID: {selectedTicket.id.slice(0, 8)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${statusTone(
                      selectedTicket.status
                    )}`}
                  >
                    {statusLabel(selectedTicket.status)}
                  </span>

                  <span className="text-sm text-slate-500">
                    Created {formatDateTime(selectedTicket.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setSelectedTicket(null);
                }}
                className="rounded-xl border border-slate-700 px-3 py-3 text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
              >
                <X size={18} />
              </button>
            </div>

            <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Your Message
              </p>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">
                {selectedTicket.message}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Support Reply
              </p>

              {selectedTicket.reply?.trim() ? (
                <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">
                  {selectedTicket.reply}
                </p>
              ) : (
                <p className="mt-4 text-slate-500">
                  No reply yet. Support will answer here once they respond.
                </p>
              )}
            </section>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setSelectedTicket(null);
                }}
                className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}