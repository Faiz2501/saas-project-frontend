"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  BadgeInfo,
  FileCheck,
  LifeBuoy,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import VerificationHealth from "@/components/admin/verification-health";
import RecentTransactions from "@/components/admin/recent-transactions";
import AccessDenied from "./access-denied";
import { useStaffAccess } from "@/hooks/use-staff-access";
import {
  displayName,
  formatMoney,
  isToday,
  roleLabel,
} from "@/lib/staff/utils";
import { staffNavigation } from "@/config/navigation";

type OverviewData = {
  totalUsers: number;
  totalStaff: number;
  totalVerifications: number;
  totalTransactions: number;
  activeApiKeys: number;
  totalRevenue: number;
};

type VerificationSummary = {
  total: number;
  success: number;
  failed: number;
};

type RevenueSummary = {
  totalCredits: number;
  totalCreditTransactions: number;
  totalDebits: number;
  totalDebitTransactions: number;
  profit: number;
};

type SupportTicket = {
  id: string;
  status: string;
  createdAt: string;
  reply?: string | null;
  subject?: string;
  customerName?: string;
  customerEmail?: string;
};

type TransactionRow = {
  id: string;
  userId: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | string;
  description?: string | null;
  createdAt: string;
};

function normalizeTransaction(raw: any): TransactionRow {
  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.userId ?? ""),
    amount: Number(raw?.amount ?? 0),
    type: String(raw?.type ?? "DEBIT").toUpperCase(),
    description: raw?.description ?? null,
    createdAt: String(raw?.createdAt ?? ""),
  };
}

function normalizeTicket(raw: any): SupportTicket {
  return {
    id: String(raw?.id ?? ""),
    status: String(raw?.status ?? "OPEN"),
    createdAt: String(raw?.createdAt ?? ""),
    reply: raw?.reply ?? null,
    subject: raw?.subject,
    customerName: raw?.customerName,
    customerEmail: raw?.customerEmail,
  };
}

export default function StaffDashboard() {
  const access = useStaffAccess(true);

  const canViewUsers = access.hasPermission("VIEW_USERS");
  const canViewVerifications = access.hasPermission("VIEW_VERIFICATIONS");
  const canViewTransactions = access.hasPermission("VIEW_TRANSACTIONS");
  const canViewSupport = access.hasPermission("VIEW_SUPPORT");

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [verifications, setVerifications] = useState<VerificationSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [sectionError, setSectionError] = useState("");

  useEffect(() => {
    if (access.loading) return;

    let cancelled = false;

    const load = async () => {
      try {
        setSectionError("");

        if (canViewUsers) {
          const response = await api.get("/admin/overview");
          if (!cancelled) {
            setOverview(response.data as OverviewData);
          }
        } else {
          setOverview(null);
        }

        if (canViewVerifications) {
          const response = await api.get("/admin/verifications");
          if (!cancelled) {
            setVerifications(response.data as VerificationSummary);
          }
        } else {
          setVerifications(null);
        }

        if (canViewTransactions) {
          const [revenueRes, transactionsRes] = await Promise.all([
            api.get("/admin/revenue"),
            api.get("/admin/transactions"),
          ]);

          if (!cancelled) {
            setRevenue(revenueRes.data as RevenueSummary);
            const payload = transactionsRes.data;
            setTransactions(
              Array.isArray(payload)
                ? payload.map(normalizeTransaction)
                : Array.isArray(payload?.transactions)
                ? payload.transactions.map(normalizeTransaction)
                : [],
            );
          }
        } else {
          setRevenue(null);
          setTransactions([]);
        }

        if (canViewSupport) {
          const response = await api.get("/support/all");
          const payload = response.data?.tickets ?? response.data ?? [];
          if (!cancelled) {
            setSupportTickets(
              Array.isArray(payload)
                ? payload.map(normalizeTicket).filter((item) => item.id)
                : [],
            );
          }
        } else {
          setSupportTickets([]);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setSectionError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load staff dashboard.",
          );
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    access.loading,
    canViewUsers,
    canViewVerifications,
    canViewTransactions,
    canViewSupport,
  ]);

  if (access.loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
        Loading staff dashboard...
      </div>
    );
  }

  const permissionCount = access.permissions.length;
  const quickNav = staffNavigation.filter(
    (item) =>
      item.href !== "/staff" &&
      (!item.requiredPermission || access.permissions.includes(item.requiredPermission)),
  );

  const verificationTotal = verifications?.total ?? 0;
  const verificationSuccess = verifications?.success ?? 0;
  const verificationFailed = verifications?.failed ?? 0;
  const verificationSuccessRate =
    verificationTotal > 0 ? Math.round((verificationSuccess / verificationTotal) * 100) : 0;
  const verificationPending = Math.max(
    verificationTotal - verificationSuccess - verificationFailed,
    0,
  );

  const totalTransactions = overview?.totalTransactions ?? transactions.length;
  const totalRevenue = overview?.totalRevenue ?? revenue?.profit ?? 0;
  const todayTransactions = transactions.filter((item) => isToday(item.createdAt)).length;
  const creditTransactions = revenue?.totalCreditTransactions ?? 0;
  const debitTransactions = revenue?.totalDebitTransactions ?? 0;

  const openTickets = supportTickets.filter((ticket) => {
    const status = String(ticket.status ?? "").toUpperCase();
    return status === "OPEN" || status === "IN_PROGRESS";
  }).length;

  const closedTickets = supportTickets.filter((ticket) => {
    const status = String(ticket.status ?? "").toUpperCase();
    return status === "CLOSED" || status === "RESOLVED";
  }).length;

  const pendingReplies = supportTickets.filter((ticket) => {
    const status = String(ticket.status ?? "").toUpperCase();
    return (status === "OPEN" || status === "IN_PROGRESS") && !ticket.reply?.trim();
  }).length;

  const resolvedToday = supportTickets.filter((ticket) => {
    const status = String(ticket.status ?? "").toUpperCase();
    return status === "RESOLVED" && isToday(ticket.createdAt);
  }).length;

  if (permissionCount === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Staff Dashboard</h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
  {access.user && displayName(access.user)
    ? `Welcome back, ${displayName(access.user)}.`
    : "Welcome back."}
</p>
        </div>

        <AccessDenied
          title="No staff permissions assigned"
          description="This account can sign in, but no VIEW_* permissions are currently assigned. Ask an admin to grant access before the console sections become visible."
          backHref="/staff/settings"
        />
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Staff Dashboard</h1>
            <p className="mt-2 max-w-2xl text-[var(--foreground-muted)]">
  {access.user && displayName(access.user)
    ? `Welcome back, ${displayName(access.user)}.`
    : "Permission-based staff workspace for verification, transactions and support."}
</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                {roleLabel(access.user?.role)}
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                {permissionCount} permissions
              </span>
            </div>
          </div>

          <div className="max-w-2xl flex-1">
            <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                Enabled Access
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {access.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {sectionError ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {sectionError}
        </div>
      ) : null}

      {canViewUsers ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <MetricCard
              title="Total Users"
              value={String(overview?.totalUsers ?? 0)}
              subtitle="From /admin/overview"
              icon={Users}
            />
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <MetricCard
              title="Total Staff"
              value={String(overview?.totalStaff ?? 0)}
              subtitle="From /admin/overview"
              icon={BadgeInfo}
            />
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <MetricCard
              title="Active API Keys"
              value={String(overview?.activeApiKeys ?? 0)}
              subtitle="From /admin/overview"
              icon={ShieldCheck}
            />
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <MetricCard
              title="Total Revenue"
              value={formatMoney(totalRevenue)}
              subtitle="From /admin/overview"
              icon={ArrowRightLeft}
            />
          </div>
        </div>
      ) : null}

      {canViewVerifications ? (
        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Verification Operations</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Aggregate verification analytics from the current backend.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Total Requests"
                value={String(verificationTotal)}
                subtitle="Verification aggregates"
                icon={FileCheck}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Successful"
                value={String(verificationSuccess)}
                subtitle="Completed successfully"
                icon={ShieldCheck}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Failed"
                value={String(verificationFailed)}
                subtitle="Failed requests"
                icon={ArrowDownLeft}
                danger
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Success Rate"
                value={`${verificationSuccessRate}%`}
                subtitle={`${verificationPending} pending / other`}
                icon={ShieldCheck}
              />
            </div>
          </div>

          <VerificationHealth
            total={verificationTotal}
            success={verificationSuccess}
            failed={verificationFailed}
          />
        </div>
      ) : null}

      {canViewTransactions ? (
        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Transaction Operations</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Volume and wallet activity shown from approved transaction endpoints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Transactions"
                value={String(totalTransactions)}
                subtitle={`${todayTransactions} today`}
                icon={ArrowRightLeft}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Credits"
                value={formatMoney(revenue?.totalCredits ?? 0)}
                subtitle={`${creditTransactions} credit txs`}
                icon={ArrowUpRight}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Debits"
                value={formatMoney(revenue?.totalDebits ?? 0)}
                subtitle={`${debitTransactions} debit txs`}
                icon={ArrowDownLeft}
                danger
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Total Volume"
                value={formatMoney((revenue?.totalCredits ?? 0) + (revenue?.totalDebits ?? 0))}
                subtitle="Credit + debit volume"
                icon={Wallet}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-7">
  <RecentTransactions
  transactions={transactions.slice(0, 5).map(tx => ({
    ...tx,
    type: tx.type.toUpperCase() === "CREDIT" ? "CREDIT" : "DEBIT",
    description: tx.description ?? null,   // ✅ ensures no undefined
  }))}
/>

</div>



            <div className="col-span-12 xl:col-span-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-6 h-full">
                <h3 className="text-xl font-semibold">Quick Quick Stats</h3>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Derived from the revenue summary endpoint.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-[#08172b] p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Credit Amount
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {formatMoney(revenue?.totalCredits ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#08172b] p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Debit Amount
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {formatMoney(revenue?.totalDebits ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {canViewSupport ? (
        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Support Operations</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Latest tickets and support health from the verified support endpoints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Open Tickets"
                value={String(openTickets)}
                subtitle="OPEN / IN_PROGRESS"
                icon={LifeBuoy}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <MetricCard
                title="Closed Tickets"
                value={String(closedTickets)}
                subtitle="CLOSED / RESOLVED"
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
                title="Resolved Today"
                value={String(resolvedToday)}
                subtitle="Derived from createdAt"
                icon={LifeBuoy}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
            <h3 className="text-lg font-semibold text-white">Latest Tickets</h3>
            <div className="mt-4 space-y-3">
              {supportTickets.slice(0, 5).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                  No support tickets found.
                </div>
              ) : (
                supportTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-slate-800 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {ticket.subject || "Untitled ticket"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {ticket.customerName || ticket.customerEmail || "Unnamed user"}
                        </p>
                      </div>

                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                        {String(ticket.status).replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-2xl font-semibold">Quick Access</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Visible routes are filtered by the assigned staff permissions.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-[var(--border)]
              bg-[#020d1b]
              p-5
              transition-all
              hover:bg-[var(--hover-surface)]
              "
            >
              <item.icon size={18} className="text-blue-400" />
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  Open section
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}