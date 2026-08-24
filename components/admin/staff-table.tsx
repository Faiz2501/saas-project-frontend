"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import api from "@/lib/api/axios";
import StaffDetailsModal from "./staff-details-modal";

type UserRecord = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  role: string;
  createdAt?: string;
  walletBalance?: number;
  wallet?: { balance?: number };
};

type RoleFilter = "All" | "User" | "Staff";

function normalizeRole(role?: string | null) {
  const value = (role ?? "").toUpperCase();
  if (value === "STAFF") return "STAFF";
  return "DEVELOPER";
}

function prettyRole(role?: string | null) {
  return normalizeRole(role) === "STAFF" ? "Staff" : "Developer";
}

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}
function getDisplayName(user: UserRecord) {
  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    user.name ||
    user.email ||
    "Unnamed User"
  );
}

export default function StaffTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      setUsers((response.data ?? []) as UserRecord[]);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
  const q = search.trim().toLowerCase();

  return users
    .filter((user) => String(user.role).toUpperCase() !== "SUPER_ADMIN")
    .filter((user) => {
      const role = normalizeRole(user.role);

      const matchesSearch =
        `${user.name ?? ""} ${user.email}`.toLowerCase().includes(q);

      const matchesFilter =
        filter === "All" ||
        (filter === "User" && role === "DEVELOPER") ||
        (filter === "Staff" && role === "STAFF");

      return matchesSearch && matchesFilter;
    });
}, [users, search, filter]);

  

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">User Access</h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Manage users, promote staff, and assign permissions.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="max-w-md">
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

        <div className="flex gap-3">
  {(["All", "User", "Staff"] as RoleFilter[]).map((item) => (
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
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="p-5 text-left">Name</th>
              <th className="p-5 text-left">Email</th>
              <th className="p-5 text-left">Role</th>
              <th className="p-5 text-left">Wallet Balance</th>
              <th className="p-5 text-left">Access</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-5 text-[var(--foreground-muted)]" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td className="p-5 text-[var(--foreground-muted)]" colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const role = normalizeRole(user.role);
                const walletBalance =
                  user.walletBalance ?? user.wallet?.balance ?? 0;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--hover-surface)]"
                  >
                    <td className="p-5">
  {getDisplayName(user)}
</td>

                    <td className="p-5 text-[var(--foreground-muted)]">
                      {user.email}
                    </td>

                    <td className="p-5">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          role === "STAFF"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-700 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {prettyRole(user.role)}
                      </span>
                    </td>

                    <td className="p-5 text-[var(--foreground-muted)]">
                      {formatMoney(walletBalance)}
                    </td>

                    <td className="p-5">
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setDetailsOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Manage Access
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <StaffDetailsModal
        open={detailsOpen}
        userId={selectedUserId}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedUserId(null);
        }}
        onSaved={loadUsers}
      />
    </section>
  );
}