"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCog,
  FileCheck,
  IndianRupee,
  Key,
  ArrowRightLeft,
} from "lucide-react";

import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import RecentTransactions from "./recent-transactions";
import TopServices from "./top-services";
import VerificationHealth from "./verification-health";

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

type VerificationData = {
  total: number;
  success: number;
  failed: number;
};

type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description: string | null;
  createdAt: string;
};

type PricingService = {
  id?: string;
  serviceName: string;
  displayName?: string | null;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [verifications, setVerifications] = useState<VerificationData | null>(
    null
  );
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pricing, setPricing] = useState<PricingService[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          overviewRes,
          revenueRes,
          verificationsRes,
          transactionsRes,
          pricingRes,
        ] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/revenue"),
          api.get("/admin/verifications"),
          api.get("/admin/transactions"),
          api.get("/pricing"),
        ]);

        setOverview(overviewRes.data as AdminOverviewData);
        setRevenue(revenueRes.data as RevenueData);
        setVerifications(verificationsRes.data as VerificationData);
        setTransactions(transactionsRes.data as WalletTransaction[]);
        setPricing(pricingRes.data as PricingService[]);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const topServices = useMemo(() => {
    return [...pricing]
      .sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return Number(b.isActive) - Number(a.isActive);
        }
        return Number(b.price) - Number(a.price);
      })
      .slice(0, 5);
  }, [pricing]);

  const recentTx = useMemo(() => transactions.slice(0, 5), [transactions]);

  if (loading) {
    return (
      <section className="space-y-10">
        <div>
          <h1 className="text-4xl font-bold">Admin Console</h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Platform operations, staff management and business analytics.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
          Loading admin dashboard...
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Admin Console</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Platform operations, staff management and business analytics.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-6">
          <MetricCard
            title="Total Users"
            value={String(overview?.totalUsers ?? 0)}
            subtitle="Platform customers"
            icon={Users}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title="Total Staff"
            value={String(overview?.totalStaff ?? 0)}
            subtitle="Active staff"
            icon={UserCog}
          />
        </div>

        <div className="col-span-3">
          <MetricCard
            title="API Keys"
            value={String(overview?.activeApiKeys ?? 0)}
            subtitle="Active keys"
            icon={Key}
          />
        </div>

        <div className="col-span-4">
          <MetricCard
            title="Verifications"
            value={String(overview?.totalVerifications ?? 0)}
            subtitle="All time"
            icon={FileCheck}
          />
        </div>

        <div className="col-span-4">
          <MetricCard
            title="Transactions"
            value={String(overview?.totalTransactions ?? 0)}
            subtitle="Processed"
            icon={ArrowRightLeft}
          />
        </div>

        <div className="col-span-4">
          <MetricCard
            title="Revenue"
            value={formatMoney(overview?.totalRevenue ?? 0)}
            subtitle="Total revenue"
            icon={IndianRupee}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-7">
          <RecentTransactions transactions={recentTx} />
        </div>

        <div className="col-span-5">
          <TopServices services={topServices} />
        </div>
      </div>

      <div className="mt-6">
        <VerificationHealth
          total={verifications?.total ?? 0}
          success={verifications?.success ?? 0}
          failed={verifications?.failed ?? 0}
        />
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch mt-6">
        <div className="col-span-4">
          <MetricCard
            title="Credits"
            value={formatMoney(revenue?.totalCredits ?? 0)}
            subtitle={`${revenue?.totalCreditTransactions ?? 0} credit txns`}
            icon={IndianRupee}
          />
        </div>

        <div className="col-span-4">
          <MetricCard
            title="Debits"
            value={formatMoney(revenue?.totalDebits ?? 0)}
            subtitle={`${revenue?.totalDebitTransactions ?? 0} debit txns`}
            icon={IndianRupee}
          />
        </div>

        <div className="col-span-4">
          <MetricCard
            title="Profit"
            value={formatMoney(revenue?.profit ?? 0)}
            subtitle="From backend revenue analytics"
            icon={IndianRupee}
          />
        </div>
      </div>
    </section>
  );
}