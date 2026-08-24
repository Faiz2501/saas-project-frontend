"use client";

import { useEffect, useMemo, useState } from "react";
import { LifeBuoy, Loader2, Search } from "lucide-react";
import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import AccessDenied from "./access-denied";
import SupportDrawer from "./support-drawer";
import { useStaffAccess } from "@/hooks/use-staff-access";
import {
  displayName,
  formatDateTime,
  isToday,
} from "@/lib/staff/utils";

type SupportTicket = {
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

const FILTERS = ["All", "Open", "Closed"] as const;

function normalizeTicket(raw: any): SupportTicket {
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
    id: String(raw?.id ?? ""),
    userId: String(raw?.userId ?? raw?.user?.id ?? ""),
    subject: String(raw?.subject ?? raw?.title ?? "Untitled Ticket"),
    message: String(raw?.message ?? raw?.issue ?? raw?.description ?? ""),
    status: String(raw?.status ?? "OPEN"),
    createdAt: String(raw?.createdAt ?? ""),
    reply: raw?.reply ?? null,
    customerName,
    customerEmail,
    userRole: raw?.userRole,
  };
}

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

export default function StaffSupportPanel() {
  const access = useStaffAccess(true);
  const canViewSupport = access.hasPermission("VIEW_SUPPORT");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/support/all");
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
          "Failed to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access.loading) return;

    if (!canViewSupport) {
      setLoading(false);
      return;
    }

    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access.loading, canViewSupport]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const status = compactSupportStatus(ticket.status);

      const searchMatch = [
        ticket.id,
        ticket.customerName,
        ticket.customerEmail,
        ticket.subject,
        ticket.message,
        ticket.reply,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);

      const filterMatch =
        filter === "All" ||
        (filter === "Open" && status === "OPEN") ||
        (filter === "Closed" && status === "CLOSED");

      return searchMatch && filterMatch;
    });
  }, [tickets, search, filter]);

  if (access.loading || loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
        Loading support queue...
      </div>
    );
  }

  if (!canViewSupport) {
    return (
      <AccessDenied
        title="Support is hidden"
        description="This staff account does not have VIEW_SUPPORT permission, so support data is not requested."
        backHref="/staff"
      />
    );
  }

  const openCount = tickets.filter(
    (ticket) => compactSupportStatus(ticket.status) === "OPEN"
  ).length;

  const closedCount = tickets.filter(
    (ticket) => compactSupportStatus(ticket.status) === "CLOSED"
  ).length;

  const pendingReplies = tickets.filter((ticket) => {
    return compactSupportStatus(ticket.status) === "OPEN" && !ticket.reply?.trim();
  }).length;

  const closedToday = tickets.filter((ticket) => {
    return compactSupportStatus(ticket.status) === "CLOSED" && isToday(ticket.createdAt);
  }).length;

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Support</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Status changes and replies are handled directly in the drawer.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Open Tickets"
            value={String(openCount)}
            subtitle="OPEN / IN_PROGRESS"
            icon={LifeBuoy}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Closed Tickets"
            value={String(closedCount)}
            subtitle="CLOSED"
            icon={LifeBuoy}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Pending Replies"
            value={String(pendingReplies)}
            subtitle="Need staff response"
            icon={LifeBuoy}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Closed Today"
            value={String(closedToday)}
            subtitle="Derived from createdAt"
            icon={LifeBuoy}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Support Tickets</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Use the drawer to update status, send a reply, or delete a ticket.
            </p>
          </div>

          <div className="w-full max-w-md">
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
        </div>

        <div className="flex flex-wrap gap-3 px-6 pt-6">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${
                filter === item
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto px-6 pb-6">
          <table className="min-w-[1050px] w-full">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--foreground-muted)]">
                <th className="p-5">Ticket ID</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Subject</th>
                <th className="p-5">Status</th>
                <th className="p-5">Created At</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-[var(--foreground-muted)]"
                  >
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setDrawerOpen(true);
                    }}
                    className="cursor-pointer border-b border-[var(--border)] transition-all hover:bg-[var(--hover-surface)]"
                  >
                    <td className="p-5 font-mono text-sm text-slate-300">
                      {ticket.id.slice(0, 12)}
                    </td>

                    <td className="p-5">
                      <p className="font-medium text-white">
                        {ticket.customerName ||
                          displayName({ email: ticket.customerEmail })}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.customerEmail || "No email"}
                      </p>
                    </td>

                    <td className="p-5 text-slate-300">{ticket.subject}</td>

                    <td className="p-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${compactSupportStatusTone(
                          ticket.status
                        )}`}
                      >
                        {compactSupportStatusLabel(ticket.status)}
                      </span>
                    </td>

                    <td className="p-5 text-sm text-[var(--foreground-muted)]">
                      {formatDateTime(ticket.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupportDrawer
        open={drawerOpen}
        ticketId={selectedTicketId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTicketId(null);
        }}
        onSaved={() => void loadTickets()}
      />
    </section>
  );
}