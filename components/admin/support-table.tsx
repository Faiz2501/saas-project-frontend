"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import api from "@/lib/api/axios";
import TicketDrawer from "./ticket-drawer";

type Filter = "All" | "Open" | "Closed";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;

type TicketMessage = {
  id?: string;
  author?: string | null;
  role?: string | null;
  message?: string | null;
  createdAt?: string | null;
};

type TicketRecord = {
  id: string;
  userId: string;
  subject: string;
  issue: string;
  status: TicketStatus;
  createdAt?: string;
  updatedAt?: string;
  reply?: string | null;
  conversation?: TicketMessage[];

  customerName?: string;
  customerEmail?: string;

  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
};

const FILTERS: Filter[] = ["All", "Open", "Closed"];

function normalizeStatus(status?: string | null) {
  const value = (status ?? "").toUpperCase();
  if (value === "CLOSED" || value === "RESOLVED") return "CLOSED";
  return "OPEN";
}

function statusLabel(status?: string | null) {
  return normalizeStatus(status) === "CLOSED" ? "Closed" : "Open";
}

function statusTone(status?: string | null) {
  return normalizeStatus(status) === "CLOSED"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-blue-500/20 bg-blue-500/10 text-blue-300";
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

function formatRelativeTime(dateLike?: string) {
  if (!dateLike) return "Just now";

  const date = new Date(dateLike);
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

function normalizeTicket(raw: any): TicketRecord {
  const customerName =
    raw?.customerName ||
    [raw?.user?.firstName, raw?.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    raw?.user?.email ||
    "Unnamed User";

  const customerEmail = raw?.customerEmail || raw?.user?.email || "No email";

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

    updatedAt: raw?.updatedAt || raw?.updated_at,

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

export default function SupportTable() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/support/all");
      const payload = response.data?.tickets ?? response.data ?? [];
      const normalized = Array.isArray(payload)
        ? payload.map(normalizeTicket).filter((ticket) => ticket.id)
        : [];

      setTickets(normalized);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const status = ticket.status?.toUpperCase() ?? "";

      const matchesSearch = [
        ticket.id,
        ticket.subject,
        ticket.customerName,
        ticket.customerEmail,
        ticket.issue,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);

      const matchesFilter =
        filter === "All" ||
        (filter === "Open" &&
          (status === "OPEN" || status === "IN_PROGRESS")) ||
        (filter === "Closed" &&
          (status === "RESOLVED" || status === "CLOSED"));

      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Support Center</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Manage customer issues and escalations.
        </p>
      </div>

      <div className="max-w-md">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl border px-6 py-3 text-sm font-medium transition-all ${
              filter === item
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--foreground-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--foreground-muted)]">
            No tickets found.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--hover-surface)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-medium">{ticket.subject}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {ticket.id}
                  </p>
                  <p className="pt-2 text-sm text-white/90 line-clamp-2">
                    {ticket.issue}
                  </p>
                </div>

                <div className="flex items-end gap-4 md:flex-col md:items-end">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusTone(
                      ticket.status
                    )}`}
                  >
                    {statusLabel(ticket.status)}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setDrawerOpen(true);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Open Ticket →
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-[var(--foreground-muted)]">
                  {ticket.customerName ||
                    displayNameFromUser({ email: ticket.customerEmail })}
                </p>
                <p className="text-[var(--foreground-muted)]">
                  User ID: {ticket.userId || "—"}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {formatRelativeTime(ticket.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <TicketDrawer
        open={drawerOpen}
        ticketId={selectedTicketId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTicketId(null);
        }}
        onSaved={loadTickets}
      />
    </section>
  );
}