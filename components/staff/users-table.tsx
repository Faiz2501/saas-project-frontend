"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ShieldCheck, Wallet } from "lucide-react";
import api from "@/lib/api/axios";
import { useStaffAccess } from "@/hooks/use-staff-access";
import AccessDenied from "./access-denied";
import UserDetailsDrawer from "./user-details-drawer";
import {
  displayName,
  formatDateTime,
  formatMoney,
  roleLabel,
} from "@/lib/staff/utils";

type Mode = "users" | "verifications";

type UserRow = {
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

function sortUsers(rows: UserRow[], mode: Mode) {
  const copy = [...rows];

  if (mode === "verifications") {
    return copy.sort((a, b) => {
      const aCount = Number(a.verificationCount ?? 0);
      const bCount = Number(b.verificationCount ?? 0);

      if (bCount !== aCount) return bCount - aCount;

      return (
        new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
      );
    });
  }

  return copy.sort((a, b) => {
    return (
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
    );
  });
}

export default function UsersTable({
  mode,
}: {
  mode: Mode;
}) {
  const access = useStaffAccess(true);
  const canViewUsers = access.permissions.includes("VIEW_USERS");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (access.loading) return;

    if (!canViewUsers) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users");
        const payload = response.data;
        const normalized = Array.isArray(payload) ? (payload as UserRow[]) : [];

if (cancelled) return;

setRows(
  normalized.filter(
    (row) => String(row.role).toUpperCase() !== "SUPER_ADMIN",
  ),
);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load users.",
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
  }, [access.loading, canViewUsers]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sortUsers(rows, mode)
  .filter((row) => String(row.role).toUpperCase() !== "SUPER_ADMIN")
  .filter((row) => {
    const label = [
      displayName(row),
      row.email,
      row.role,
      String(row.walletBalance ?? 0),
      String(row.verificationCount ?? 0),
      String(row.transactionCount ?? 0),
    ]
      .join(" ")
      .toLowerCase();

    return label.includes(q);
  });
  }, [rows, search, mode]);

  if (access.loading || loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--foreground-muted)]">
        Loading users...
      </div>
    );
  }

  if (!canViewUsers) {
    if (mode === "verifications") {
      return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Verification history by user
            </h3>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--foreground-muted)]">
            The backend does not expose a dedicated global verification-request list yet.
            This view is ready for that flow, but the user inspection drawer is only enabled
            when <span className="text-white">VIEW_USERS</span> is assigned.
          </p>
        </div>
      );
    }

    return (
      <AccessDenied
        title="Users are restricted"
        description="This section requires VIEW_USERS permission. The page is read-only and intentionally hides the backend call when that permission is not present."
        backHref="/staff"
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {mode === "verifications"
              ? "User Verification Inspection"
              : "Users"}
          </h3>

          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {mode === "verifications"
              ? "Open a user to inspect their latest verification history, API keys, wallet and transactions."
              : "Read-only user directory with wallet, API key and verification snapshots."}
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder={
                mode === "verifications"
                  ? "Search verification users..."
                  : "Search users..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--foreground-muted)]">
                <th className="p-5">Name</th>
                <th className="p-5">Email</th>
                <th className="p-5">Role</th>
                <th className="p-5">
                  {mode === "verifications" ? "Verifications" : "Wallet"}
                </th>
                {mode === "verifications" ? (
                  <th className="p-5">Wallet</th>
                ) : null}
                <th className="p-5">Created At</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={mode === "verifications" ? 7 : 6} className="p-8 text-center text-[var(--foreground-muted)]">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border)] transition-all hover:bg-[var(--hover-surface)]"
                  >
                    <td className="p-5">
                      <p className="font-medium text-white">
                        {displayName(user)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {mode === "verifications"
                          ? "Verification inspection row"
                          : "Read only"}
                      </p>
                    </td>

                    <td className="p-5 text-slate-300">{user.email}</td>

                    <td className="p-5">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    <td className="p-5">
                      {mode === "verifications" ? (
                        <span className="font-semibold text-white">
                          {user.verificationCount ?? 0}
                        </span>
                      ) : (
                        <span className="font-semibold text-white">
                          {formatMoney(user.walletBalance ?? 0)}
                        </span>
                      )}
                    </td>

                    {mode === "verifications" ? (
                      <td className="p-5">
                        <span className="font-semibold text-white">
                          {formatMoney(user.walletBalance ?? 0)}
                        </span>
                      </td>
                    ) : null}

                    <td className="p-5 text-sm text-[var(--foreground-muted)]">
                      {formatDateTime(user.createdAt)}
                    </td>

                    <td className="p-5">
                      <button
                        onClick={() => {
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