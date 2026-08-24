"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  KeyRound,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import api from "@/lib/api/axios";
import Toast from "@/components/ui/toast";

type AdminUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  createdAt?: string;
  wallet?: {
    balance?: number;
  };
};

type ApiKeyRecord = {
  id: string;
  name?: string | null;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
};

type ApiKeyRow = {
  keyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  keyName: string;
  keyValue: string;
  isActive: boolean;
  createdAt: string;
};

type StatusFilter = "All" | "Active" | "Inactive";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function prettyRole(role?: string | null) {
  const value = (role ?? "").toUpperCase();
  if (value === "SUPER_ADMIN") return "Super Admin";
  if (value === "STAFF") return "Staff";
  return "Customer";
}

function getDisplayName(user: AdminUser) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email || "Unnamed User";
}

function maskKey(value: string) {
  if (!value) return "—";
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default function AdminApiKeys() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);

  const [busyKeyId, setBusyKeyId] = useState<string | null>(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKeyRow | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Done");

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastOpen(false);
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const loadApiKeys = async () => {
    try {
      setError("");
      setRefreshing(true);

      const usersResponse = await api.get("/admin/users");
      const rawUsers = usersResponse.data?.users ?? usersResponse.data ?? [];
      const nextUsers = Array.isArray(rawUsers) ? (rawUsers as AdminUser[]) : [];

      setUsers(nextUsers);

      const settled = await Promise.allSettled(
        nextUsers.map(async (user) => {
          const response = await api.get(`/api-keys/${user.id}`);
          const keys = Array.isArray(response.data)
            ? (response.data as ApiKeyRecord[])
            : [];

          return {
            user,
            keys,
          };
        }),
      );

      const flattened: ApiKeyRow[] = [];

      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;

        const { user, keys } = result.value;

        keys.forEach((key) => {
          flattened.push({
            keyId: key.id,
            userId: user.id,
            userName: getDisplayName(user),
            userEmail: user.email,
            userRole: user.role,
            keyName: key.name?.trim() || "API Key",
            keyValue: key.apiKey,
            isActive: key.isActive,
            createdAt: key.createdAt,
          });
        });
      });

      flattened.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setApiKeys(flattened);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load API keys.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadApiKeys();
  }, []);

  const filteredKeys = useMemo(() => {
    const q = search.trim().toLowerCase();

    return apiKeys.filter((key) => {
      const matchesStatus =
        filter === "All" ||
        (filter === "Active" && key.isActive) ||
        (filter === "Inactive" && !key.isActive);

      const matchesSearch = [
        key.userName,
        key.userEmail,
        key.keyName,
        key.keyValue,
        key.userRole,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [apiKeys, search, filter]);

  const totalKeys = apiKeys.length;
  const activeKeys = apiKeys.filter((key) => key.isActive).length;
  const inactiveKeys = totalKeys - activeKeys;
  const owners = new Set(apiKeys.map((key) => key.userId)).size;

  const handleCopy = async (row: ApiKeyRow) => {
    try {
      await navigator.clipboard.writeText(row.keyValue);
      showToast("API key copied");
    } catch (err) {
      console.error(err);
      showToast("Failed to copy key");
    }
  };

  const handleDeactivate = (row: ApiKeyRow) => {
    if (!row.isActive) return;
  
    setSelectedKey(row);
    setConfirmOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedKey) return;

    try {
      setBusyKeyId(selectedKey.keyId);
      setError("");

      await api.patch(`/api-keys/deactivate/${selectedKey.keyId}`);

      showToast("API key revoked");

      setConfirmOpen(false);
      setSelectedKey(null);

      await loadApiKeys();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to revoke API key."
      );
    } finally {
      setBusyKeyId(null);
    }
  };  

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">API Keys</h1>
        <p className="mt-2 max-w-2xl text-[var(--foreground-muted)]">
          Monitor every user API key from one place and revoke compromised keys instantly.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Keys</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalKeys}</p>
            </div>
            <KeyRound className="text-slate-400" size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Active Keys</p>
              <p className="mt-2 text-3xl font-semibold text-white">{activeKeys}</p>
            </div>
            <ShieldCheck className="text-emerald-400" size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Inactive Keys</p>
              <p className="mt-2 text-3xl font-semibold text-white">{inactiveKeys}</p>
            </div>
            <Trash2 className="text-rose-400" size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Owners</p>
              <p className="mt-2 text-3xl font-semibold text-white">{owners}</p>
            </div>
            <Users className="text-blue-400" size={22} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder="Search by user, email, or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {(["All", "Active", "Inactive"] as StatusFilter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                filter === item
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={18} />
            Loading API keys...
          </div>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[var(--foreground-muted)]">
          No API keys found for the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKeys.map((row) => (
            <div
              key={row.keyId}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {row.keyName}
                    </h3>

                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                        row.isActive
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {row.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                    {row.userName} · {row.userEmail}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Role: {prettyRole(row.userRole)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Created: {formatDate(row.createdAt)}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[#061423] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    Key preview
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-200">
                    {maskKey(row.keyValue)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(row)}
                    className="flex h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-transparent px-4 text-sm text-[var(--foreground-muted)] transition hover:text-white"
                  >
                    <Copy size={16} />
                    Copy
                  </button>

                  <button
                    onClick={() => handleDeactivate(row)}
                    disabled={!row.isActive || busyKeyId === row.keyId}
                    className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-sm transition ${
                      row.isActive
                        ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
                        : "cursor-not-allowed border-[var(--border)] text-slate-500"
                    }`}
                  >
                    {busyKeyId === row.keyId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {row.isActive ? "Revoke" : "Revoked"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {confirmOpen && selectedKey && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">
        Revoke API Key
            </h2>

            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Are you sure you want to revoke
              <span className="font-semibold text-white">
                {" "}
                {selectedKey.keyName}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Owner: {selectedKey.userName}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              This action will immediately disable the API key.
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setSelectedKey(null);
                }}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeactivate}
                disabled={busyKeyId !== null}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {busyKeyId ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Revoke Key"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast show={toastOpen} message={toastMessage} />
    </section>
  );
}