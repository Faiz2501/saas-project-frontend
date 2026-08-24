"use client";

import { useEffect, useState } from "react";
import { FileCheck, Percent, ShieldCheck, XCircle } from "lucide-react";
import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import VerificationHealth from "@/components/admin/verification-health";
import AccessDenied from "./access-denied";
import UsersTable from "./users-table";
import { useStaffAccess } from "@/hooks/use-staff-access";

type VerificationSummary = {
  total: number;
  success: number;
  failed: number;
};

export default function StaffVerificationsPanel() {
  const access = useStaffAccess(true);
  const canViewVerifications = access.hasPermission("VIEW_VERIFICATIONS");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<VerificationSummary | null>(null);

  useEffect(() => {
    if (access.loading) return;

    if (!canViewVerifications) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/verifications");
        const payload = response.data as VerificationSummary;

        if (cancelled) return;

        setSummary(payload);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load verification analytics.",
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
  }, [access.loading, canViewVerifications]);

  if (access.loading || loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
        Loading verification workspace...
      </div>
    );
  }

  if (!canViewVerifications) {
    return (
      <AccessDenied
        title="Verifications are hidden"
        description="This staff account does not have VIEW_VERIFICATIONS permission, so the backend is not called and the page stays read-only."
        backHref="/staff"
      />
    );
  }

  const total = summary?.total ?? 0;
  const success = summary?.success ?? 0;
  const failed = summary?.failed ?? 0;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
  const pending = Math.max(total - success - failed, 0); // Derived because the backend exposes only total/success/failed.

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Verifications</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Aggregate verification stats and user-level inspection.
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
            title="Total Requests"
            value={String(total)}
            subtitle="Verification aggregates"
            icon={FileCheck}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Successful"
            value={String(success)}
            subtitle="Completed successfully"
            icon={ShieldCheck}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Failed"
            value={String(failed)}
            subtitle="Failed requests"
            icon={XCircle}
            danger
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Success Rate"
            value={`${successRate}%`}
            subtitle={`${pending} pending / other`}
            icon={Percent}
          />
        </div>
      </div>

      <VerificationHealth
        total={total}
        success={success}
        failed={failed}
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">User Inspection</h3>
            <p className="mt-1 max-w-3xl text-sm text-[var(--foreground-muted)]">
              There is no verified global verification-request list endpoint in the current backend.
              This page is built around aggregate stats and per-user drawer history.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <UsersTable mode="verifications" />
        </div>
      </div>
    </section>
  );
}