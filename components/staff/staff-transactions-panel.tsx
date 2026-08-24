"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, IndianRupee, Search, Wallet } from "lucide-react";
import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import RecentTransactions from "@/components/admin/recent-transactions";
import AccessDenied from "./access-denied";
import UserDetailsDrawer from "./user-details-drawer";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { displayName, formatDateTime, formatMoney, isToday } from "@/lib/staff/utils";

type RevenueSummary = {
  totalCredits: number;
  totalCreditTransactions: number;
  totalDebits: number;
  totalDebitTransactions: number;
  profit: number;
};

type OverviewSummary = {
  totalTransactions: number;
  totalRevenue: number;
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

export default function StaffTransactionsPanel() {
  const access = useStaffAccess(true);
  const canViewTransactions = access.hasPermission("VIEW_TRANSACTIONS");
  const canViewUsers = access.hasPermission("VIEW_USERS");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (access.loading) return;

    if (!canViewTransactions) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [revenueRes, transactionsRes, overviewRes] = await Promise.allSettled([
          api.get("/admin/revenue"),
          api.get("/admin/transactions"),
          canViewUsers ? api.get("/admin/overview") : Promise.resolve(null),
        ]);

        if (cancelled) return;

        if (revenueRes.status === "fulfilled") {
          setRevenue(revenueRes.value.data as RevenueSummary);
        }

        if (transactionsRes.status === "fulfilled") {
          const payload = transactionsRes.value.data;
          setTransactions(
            Array.isArray(payload)
              ? payload.map(normalizeTransaction)
              : Array.isArray(payload?.transactions)
              ? payload.transactions.map(normalizeTransaction)
              : [],
          );
        }

        if (overviewRes && "status" in overviewRes && overviewRes.status === "fulfilled") {
  if (overviewRes.value?.data) {
    setOverview(overviewRes.value.data as OverviewSummary);
  }
}
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load transaction analytics.",
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
  }, [access.loading, canViewTransactions, canViewUsers]);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const text = [
        item.id,
        item.userId,
        item.description,
        item.type,
        item.amount,
        item.createdAt,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [transactions, search]);

  if (access.loading || loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
        Loading transactions...
      </div>
    );
  }

  if (!canViewTransactions) {
    return (
      <AccessDenied
        title="Transactions are hidden"
        description="This staff account does not have VIEW_TRANSACTIONS permission, so transaction analytics are not loaded."
        backHref="/staff"
      />
    );
  }

  const todayCount = transactions.filter((tx) => isToday(tx.createdAt)).length;
  const totalTransactions = overview?.totalTransactions ?? transactions.length;
  const totalRevenue =
    overview?.totalRevenue ?? revenue?.profit ?? 0;
  const credits = revenue?.totalCredits ?? 0;
  const debits = revenue?.totalDebits ?? 0;
  const totalVolume = credits + debits;

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Transactions</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Revenue analytics and recent wallet activity.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <MetricCard
            title="Total Transactions"
            value={String(totalTransactions)}
            subtitle="From /admin/overview when allowed"
            icon={ArrowRightLeft}
          />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <MetricCard
            title="Total Revenue"
            value={formatMoney(totalRevenue)}
            subtitle="From /admin/overview and /admin/revenue"
            icon={IndianRupee}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Credits"
            value={formatMoney(credits)}
            subtitle={`${revenue?.totalCreditTransactions ?? 0} credit txs`}
            icon={ArrowUpRight}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Debits"
            value={formatMoney(debits)}
            subtitle={`${revenue?.totalDebitTransactions ?? 0} debit txs`}
            icon={ArrowDownLeft}
            danger
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Today's Transactions"
            value={String(todayCount)}
            subtitle="Derived from recent transaction timestamps"
            icon={Wallet}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Total Volume"
            value={formatMoney(totalVolume)}
            subtitle="Credit + debit volume"
            icon={ArrowRightLeft}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Recent Global Transactions</h3>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Click a row to inspect the user drawer when VIEW_USERS is granted.
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <Search size={18} className="text-slate-400" />
                  <input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--foreground-muted)]">
                    <th className="p-5">Transaction ID</th>
                    <th className="p-5">User</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Description</th>
                    <th className="p-5">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (canViewUsers) {
                            setSelectedUserId(item.userId);
                            setDrawerOpen(true);
                          }
                        }}
                        className={`border-b border-[var(--border)] transition-all ${
                          canViewUsers
                            ? "cursor-pointer hover:bg-[var(--hover-surface)]"
                            : "cursor-default"
                        }`}
                      >
                        <td className="p-5 font-mono text-sm text-slate-300">
                          {item.id.slice(0, 12)}
                        </td>

                        <td className="p-5 font-mono text-sm text-blue-300">
                          {item.userId.slice(0, 12)}
                        </td>

                        <td className="p-5">
                          <span
                            className={
                              item.type === "CREDIT"
                                ? "font-semibold text-emerald-400"
                                : "font-semibold text-red-400"
                            }
                          >
                            {item.type === "CREDIT" ? "+" : "-"}
                            {formatMoney(item.amount)}
                          </span>
                        </td>

                        <td className="p-5">
                          <span
                            className={
                              item.type === "CREDIT"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {item.type}
                          </span>
                        </td>

                        <td className="p-5 text-slate-300">
                          {item.description || item.type}
                        </td>

                        <td className="p-5 text-sm text-[var(--foreground-muted)]">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 h-full">
            <h3 className="text-xl font-semibold">Transaction Breakdown</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Derived directly from recent transaction records.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  Credit Transactions
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {revenue?.totalCreditTransactions ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  Debit Transactions
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {revenue?.totalDebitTransactions ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  Credit Amount
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {formatMoney(credits)}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  Debit Amount
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {formatMoney(debits)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 px-4 py-4 text-sm text-slate-400">
              {canViewUsers
                ? "Per-user drawer inspection is enabled."
                : "VIEW_USERS is required to open the per-user drawer."}
            </div>

            {canViewUsers ? (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                User history opens from each transaction row.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <UserDetailsDrawer
        open={drawerOpen}
        userId={selectedUserId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUserId(null);
        }}
      />
    </section>
  );
}