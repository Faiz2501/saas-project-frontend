"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Activity,
  Calendar,
  Download,
} from "lucide-react";
import api from "@/lib/api/axios";
import UsageChart from "./usage-chart";
import ServiceChart from "./service-chart";
import RecentRequests from "./recent-requests";
import MetricCard from "./metric-card";

type MeUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
};

type DashboardData = {
  wallet?: {
    id: string;
    userId: string;
    balance: number;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  walletBalance?: number;
  activeApiKey?: string | null;
  apiKeys?: Array<{
    id: string;
    apiKey: string;
    isActive: boolean;
    createdAt: string;
  }>;
  totalRequests?: number;
  successfulRequests?: number;
  failedRequests?: number;
  totalSpent?: number;
  totalVerifications?: number;
  totalTransactions?: number;
  recentVerifications?: Array<{
    id: string;
    serviceName: string;
    amount: number;
    status: string;
    createdAt: string;
    errorMessage?: string | null;
  }>;
};

type HistoryRow = {
  id: string;
  serviceName: string;
  amount: number;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
  errorMessage?: string | null;
};

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}

function prettyServiceName(serviceName: string) {
  return serviceName
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);

      const meResponse = await api.get("/users/me");
      const me = meResponse.data as MeUser;

      const [dashboardResponse, historyResponse] = await Promise.all([
        api.get(`/dashboard/${me.id}`),
        api.get(`/verifications/history/${me.id}`),
      ]);

      setDashboard(dashboardResponse.data as DashboardData);
      setHistory(historyResponse.data as HistoryRow[]);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => {
    const total = history.length;
    const success = history.filter((item) => item.status === "SUCCESS").length;
    const failed = history.filter((item) => item.status === "FAILED").length;

    const now = new Date();
    const today = history.filter((item) => {
      const created = new Date(item.createdAt);
      return created.toDateString() === now.toDateString();
    }).length;

    const thisMonth = history.filter((item) => {
      const created = new Date(item.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    const successRate =
      total > 0 ? Math.round((success / total) * 1000) / 10 : 0;

    const topServices = Object.entries(
      history.reduce<Record<string, number>>((acc, item) => {
        acc[item.serviceName] = (acc[item.serviceName] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([serviceName, count]) => ({
        serviceName,
        count,
      }));

    const recentRows = history.slice(0, 3).map((item) => ({
      timestamp: formatTimestamp(item.createdAt),
      service: prettyServiceName(item.serviceName),
      requestId: item.id.slice(0, 8),
      status: (item.status === "SUCCESS" ? "Success" : "Failed") as
        | "Success"
        | "Failed",
      latency: "—",
    }));

    const usageMap = new Map<string, number>();
    history.forEach((item) => {
      const d = new Date(item.createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      usageMap.set(key, (usageMap.get(key) || 0) + 1);
    });

    const usageData = Array.from(usageMap.entries())
      .slice(-7)
      .map(([label, count]) => ({ label, count }));

    return {
      total,
      success,
      failed,
      today,
      thisMonth,
      successRate,
      topServices,
      recentRows,
      usageData,
    };
  }, [history]);

  const walletBalance =
    dashboard?.walletBalance ?? dashboard?.wallet?.balance ?? 0;

  const activeApiKey =
    dashboard?.activeApiKey ??
    dashboard?.apiKeys?.find((k) => k.isActive)?.apiKey ??
    null;

  const totalRequests = dashboard?.totalRequests ?? summary.total;
  const successfulRequests = dashboard?.successfulRequests ?? summary.success;
  const failedRequests = dashboard?.failedRequests ?? summary.failed;
  const totalSpent = dashboard?.totalSpent ?? 0;

  return (
    <section className="mb-8">
        <div>
          <h1 className="text-4xl font-bold">Overview</h1>

          <p className="mt-2 mb-6 max-w-2xl text-[var(--foreground-muted)]">
            Monitor your API usage, wallet balance, and verification activity in one place.
          </p>
        </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-1.5 xl:col-span-6">
              <MetricCard
                title="Wallet Balance"
                value={formatMoney(walletBalance)}
                subtitle={
                  activeApiKey
                    ? `Active key: ${activeApiKey.slice(0, 12)}…`
                    : "No active key"
                }
                icon={Wallet}
                large
              />
            </div>

            <div className="col-span-1 sm:col-span-2 xl:col-span-3">
              <MetricCard
                title="Success Rate"
                value={`${summary.successRate}%`}
                subtitle={`${successfulRequests} successful requests`}
                icon={CheckCircle}
              />
            </div>

            <div className="col-span-1 sm:col-span-2 xl:col-span-3">
              <MetricCard
                title="Failed Requests"
                value={String(failedRequests)}
                subtitle="Requires attention"
                icon={AlertCircle}
                danger
              />
            </div>

            <div className="col-span-1 xl:col-span-6">
              <MetricCard
                title="API Calls Today"
                value={String(summary.today)}
                subtitle={`${totalRequests} total requests`}
                progress={Math.min(100, summary.today ? 100 : 0)}
                icon={Activity}
              />
            </div>

            <div className="col-span-1 xl:col-span-6">
              <MetricCard
                title="API Calls This Month"
                value={String(summary.thisMonth)}
                subtitle={`Spent ${formatMoney(totalSpent)}`}
                progress={Math.min(100, summary.thisMonth ? 100 : 0)}
                icon={Calendar}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <UsageChart data={summary.usageData} />

            <ServiceChart
              rows={summary.topServices.map((item) => ({
                id: item.serviceName,
                serviceName: item.serviceName,
                amount: item.count,
                status: "SUCCESS" as const,
                createdAt: new Date().toISOString(),
              }))}
            />
          </div>

          <div className="mt-6">
            <RecentRequests rows={summary.recentRows} />
          </div>
        </>
      )}
    </section>
  );
}