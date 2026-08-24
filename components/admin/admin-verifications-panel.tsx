"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileCheck,
  Percent,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import api from "@/lib/api/axios";
import MetricCard from "@/components/dashboard/metric-card";
import VerificationHealth from "@/components/admin/verification-health";
import AdminUserDrawer from "./admin-user-drawer";

type VerificationSummary = {
  total: number;
  success: number;
  failed: number;
};

type AdminUserRecord = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  walletBalance?: number;
  apiKeyCount?: number;
  verificationCount?: number;
  transactionCount?: number;
  permissionCount?: number;
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

function getErrorMessage(err: any, fallback: string) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

function displayName(user: AdminUserRecord) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email || "Unnamed User";
}

function prettyRole(role?: string | null) {
  const value = (role ?? "").toUpperCase();

  if (value === "SUPER_ADMIN") return "Super Admin";
  if (value === "STAFF") return "Staff";
  if (value === "CUSTOMER") return "Customer";

  return role || "Developer";
}

export default function AdminVerificationsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    // The backend does not expose a flat verification feed yet, so this page
    // uses the user list as the inspection surface. The drawer pulls each user's
    // latest verification history from /admin/users/:id.
    const [summaryRes, usersRes] = await Promise.allSettled([
      api.get("/admin/verifications"),
      api.get("/admin/users"),
    ]);

    const errors: string[] = [];

    if (summaryRes.status === "fulfilled") {
      setSummary(summaryRes.value.data as VerificationSummary);
    } else {
      errors.push(getErrorMessage(summaryRes.reason, "verification summary"));
    }

    if (usersRes.status === "fulfilled") {
      const payload = usersRes.value.data as AdminUserRecord[];
      const normalized = Array.isArray(payload)
        ? payload
            .filter((user) => String(user.role).toUpperCase() !== "SUPER_ADMIN")
            .sort((a, b) => {
              const verificationDiff =
                (b.verificationCount ?? 0) - (a.verificationCount ?? 0);
              if (verificationDiff !== 0) return verificationDiff;

              return (
                new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
                new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
              );
            })
        : [];

      setUsers(normalized);
    } else {
      errors.push(getErrorMessage(usersRes.reason, "users"));
    }

    if (errors.length > 0) {
      setError(`Some verification data failed to load: ${errors.join(" • ")}`);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((user) => {
      if (!q) return true;

      return (
        displayName(user).toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        prettyRole(user.role).toLowerCase().includes(q) ||
        String(user.verificationCount ?? 0).includes(q)
      );
    });
  }, [search, users]);

  const total = summary?.total ?? 0;
  const success = summary?.success ?? 0;
  const failed = summary?.failed ?? 0;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  if (loading) {
    return (
      <section className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Verifications</h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Inspect user verification activity and history.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
          Loading verification analytics...
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Verifications</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Inspect user verification activity and history.
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
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricCard
            title="Total Verifications"
            value={String(total)}
            subtitle="All verification requests"
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
            subtitle="Derived from backend counts"
            icon={Percent}
          />
        </div>
      </div>

      <VerificationHealth total={total} success={success} failed={failed} />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">User Verification Inspection</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Click a user to inspect their latest verification history and account snapshot.
            </p>
          </div>

          <div className="max-w-md w-full">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--foreground-muted)]">
                <th className="p-5">Name</th>
                <th className="p-5">Email</th>
                <th className="p-5">Role</th>
                <th className="p-5">Verifications</th>
                <th className="p-5">Wallet Balance</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setDrawerOpen(true);
                    }}
                    className="cursor-pointer border-b border-[var(--border)] transition-all hover:bg-[var(--hover-surface)]"
                  >
                    <td className="p-5">
                      <p className="font-medium text-white">{displayName(user)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Joined {formatDate(user.createdAt)}
                      </p>
                    </td>

                    <td className="p-5 text-slate-300">{user.email}</td>

                    <td className="p-5 text-slate-300">{prettyRole(user.role)}</td>

                    <td className="p-5">
                      <span className="font-semibold text-white">
                        {user.verificationCount ?? 0}
                      </span>
                    </td>

                    <td className="p-5">
                      <span className="font-semibold text-white">
                        {formatMoney(user.walletBalance ?? 0)}
                      </span>
                    </td>

                    <td className="p-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserId(user.id);
                          setDrawerOpen(true);
                        }}
                        className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
                      >
                        Inspect
                      </button>
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
        mode="verifications"
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUserId(null);
        }}
      />
    </section>
  );
}