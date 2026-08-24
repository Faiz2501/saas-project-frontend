"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  IndianRupee,
  Search,
  Wallet,
} from "lucide-react";
import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import RecentTransactions from "./recent-transactions";
import AdminUserDrawer from "./admin-user-drawer";

type AdminOverviewData = {
  totalUsers: number;
  totalStaff: number;
  totalVerifications: number;
  totalTransactions: number;
  activeApiKeys: number;
  totalRevenue: number;
};

type RevenueData = {
  totalCredits: number;
  totalCreditTransactions: number;
  totalDebits: number;
  totalDebitTransactions: number;
  profit: number;
};

type TransactionRow = {
  id: string;
  userId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description: string | null;
  createdAt: string;
};

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeTransaction(raw: any): TransactionRow {
  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.userId ?? ""),
    amount: Number(raw?.amount ?? 0),
    type: String(raw?.type ?? "DEBIT").toUpperCase() as TransactionRow["type"],
    description: raw?.description ?? null,
    createdAt: raw?.createdAt || raw?.created_at || "",
  };
}

function getErrorMessage(err: any, fallback: string) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

function SummaryStat({
  label,
  value,
  tone = "text-white",
  subtle,
}: {
  label: string;
  value: string;
  tone?: string;
  subtle?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</p>
      {subtle ? <p className="mt-2 text-sm text-slate-400">{subtle}</p> : null}
    </div>
  );
}

export default function AdminTransactionsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [overviewRes, revenueRes, transactionsRes] = await Promise.allSettled([
      api.get("/admin/overview"),
      api.get("/admin/revenue"),
      api.get("/admin/transactions"),
    ]);

    const errors: string[] = [];

    if (overviewRes.status === "fulfilled") {
      setOverview(overviewRes.value.data as AdminOverviewData);
    } else {
      errors.push(getErrorMessage(overviewRes.reason, "overview"));
    }

    if (revenueRes.status === "fulfilled") {
      setRevenue(revenueRes.value.data as RevenueData);
    } else {
      errors.push(getErrorMessage(revenueRes.reason, "revenue"));
    }

    if (transactionsRes.status === "fulfilled") {
      const payload = transactionsRes.value.data;
      setTransactions(
        Array.isArray(payload)
          ? payload.map(normalizeTransaction).filter((item) => item.id)
          : []
      );
    } else {
      errors.push(getErrorMessage(transactionsRes.reason, "transactions"));
    }

    if (errors.length > 0) {
      setError(`Some transaction data failed to load: ${errors.join(" • ")}`);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter((item) => {
      if (!q) return true;

      return (
        item.id.toLowerCase().includes(q) ||
        item.userId.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        String(item.amount).includes(q) ||
        formatDate(item.createdAt).toLowerCase().includes(q)
      );
    });
  }, [search, transactions]);

  const recentPreview = useMemo(() => transactions.slice(0, 5), [transactions]);

  const openDrawer = (userId: string) => {
    setSelectedUserId(userId);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <section className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Transactions</h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Review platform-wide wallet activity and revenue.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
          Loading transaction analytics...
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Transactions</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Review platform-wide wallet activity and revenue.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <div className="flex items-start justify-between gap-4">
            <p>{error}</p>
            <button
              onClick={() => void loadData()}
              className="rounded-lg border border-amber-500/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-100 transition-all hover:bg-amber-500/10"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-6">
          <MetricCard
            title="Total Transactions"
            value={String(overview?.totalTransactions ?? 0)}
            subtitle="All processed wallet transactions"
            icon={ArrowRightLeft}
          />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <MetricCard
            title="Total Revenue"
            value={formatMoney(overview?.totalRevenue ?? 0)}
            subtitle="Platform-wide revenue total"
            icon={IndianRupee}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <MetricCard
            title="Total Credits"
            value={formatMoney(revenue?.totalCredits ?? 0)}
            subtitle={`${revenue?.totalCreditTransactions ?? 0} credit transactions`}
            icon={ArrowUpRight}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <MetricCard
            title="Total Debits"
            value={formatMoney(revenue?.totalDebits ?? 0)}
            subtitle={`${revenue?.totalDebitTransactions ?? 0} debit transactions`}
            icon={ArrowDownLeft}
            danger
          />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <MetricCard
            title="Net Revenue"
            value={formatMoney(revenue?.profit ?? 0)}
            subtitle="Derived from backend revenue analytics"
            icon={Wallet}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-7">
          <RecentTransactions transactions={recentPreview} />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 h-full">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Transaction Analytics</h3>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Derived from /admin/revenue and /admin/overview.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <SummaryStat
                label="Credit Transactions"
                value={String(revenue?.totalCreditTransactions ?? 0)}
                subtle="Count of credit entries"
              />
              <SummaryStat
                label="Debit Transactions"
                value={String(revenue?.totalDebitTransactions ?? 0)}
                subtle="Count of debit entries"
              />
              <SummaryStat
                label="Credit Volume"
                value={formatMoney(revenue?.totalCredits ?? 0)}
                subtle="Total credited amount"
              />
              <SummaryStat
                label="Debit Volume"
                value={formatMoney(revenue?.totalDebits ?? 0)}
                subtle="Total debited amount"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Recent Global Transactions</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Click a transaction row to inspect the user wallet and verification history.
            </p>
          </div>

          <div className="max-w-md w-full">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Search transaction, user, amount, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--foreground-muted)]">
                <th className="p-5">Transaction ID</th>
                <th className="p-5">User ID</th>
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
                    onClick={() => openDrawer(item.userId)}
                    className="cursor-pointer border-b border-[var(--border)] transition-all hover:bg-[var(--hover-surface)]"
                  >
                    <td className="p-5 font-mono text-sm text-slate-300" title={item.id}>
                      {item.id.slice(0, 12)}
                    </td>

                    <td className="p-5 font-mono text-sm text-blue-300" title={item.userId}>
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
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminUserDrawer
        open={drawerOpen}
        userId={selectedUserId}
        mode="transactions"
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUserId(null);
        }}
      />
    </section>
  );
}