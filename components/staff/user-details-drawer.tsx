"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import api from "@/lib/api/axios";
import {
  displayName,
  formatDateTime,
  formatMoney,
  roleLabel,
} from "@/lib/staff/utils";

type Props = {
  open: boolean;
  userId: string | null;
  onClose: () => void;
};

type UserDetail = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  walletBalance?: number;
  totalApiKeys?: number;
  activeApiKeys?: number;
  totalVerifications?: number;
  totalTransactions?: number;
  permissions?: string[];
  apiKeys?: Array<{
    id: string;
    name?: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  verifications?: Array<{
    id: string;
    serviceName: string;
    amount: number;
    status: string;
    createdAt: string;
    errorMessage?: string | null;
    referenceId?: string | null;
    transactionId?: string | null;
  }>;
  transactions?: Array<{
    id: string;
    amount: number;
    type: "CREDIT" | "DEBIT" | string;
    description?: string | null;
    createdAt: string;
  }>;
  wallet?: {
    balance?: number;
  };
};

function permissionTone(permission: string) {
  if (permission.includes("VIEW_")) {
    return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  return "border-slate-500/20 bg-slate-500/10 text-slate-300";
}

export default function UserDetailsDrawer({
  open,
  userId,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserDetail | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [apiKeys, setApiKeys] = useState<
    Array<{
      id: string;
      name?: string | null;
      isActive: boolean;
      createdAt: string;
    }>
  >([]);
  const [verificationHistory, setVerificationHistory] = useState<
    Array<{
      id: string;
      serviceName: string;
      amount: number;
      status: string;
      createdAt: string;
      errorMessage?: string | null;
      referenceId?: string | null;
      transactionId?: string | null;
    }>
  >([]);
  const [walletTransactions, setWalletTransactions] = useState<
    Array<{
      id: string;
      amount: number;
      type: "CREDIT" | "DEBIT" | string;
      description?: string | null;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    if (!open || !userId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          api.get(`/admin/users/${userId}`),
          api.get(`/wallet/${userId}`),
          api.get(`/wallet/summary/${userId}`),
          api.get(`/wallet/transactions/${userId}`),
          api.get(`/api-keys/${userId}`),
          api.get(`/verifications/history/${userId}`),
        ]);

        if (cancelled) return;

        const [userRes, walletRes, walletSummaryRes, walletTxRes, apiKeysRes, verificationRes] =
          results;

        if (userRes.status === "fulfilled") {
          const payload = userRes.value.data as UserDetail;
          setUser(payload);
        }

        if (walletSummaryRes.status === "fulfilled") {
          const payload = walletSummaryRes.value.data as {
            balance?: number;
          };
          setWalletBalance(Number(payload?.balance ?? 0));
        } else if (walletRes.status === "fulfilled") {
          const payload = walletRes.value.data as { balance?: number };
          setWalletBalance(Number(payload?.balance ?? 0));
        }

        if (walletTxRes.status === "fulfilled") {
          const payload = walletTxRes.value.data;
          setWalletTransactions(Array.isArray(payload) ? payload : []);
        }

        if (apiKeysRes.status === "fulfilled") {
          const payload = apiKeysRes.value.data;
          setApiKeys(Array.isArray(payload) ? payload : []);
        }

        if (verificationRes.status === "fulfilled") {
          const payload = verificationRes.value.data;
          setVerificationHistory(Array.isArray(payload) ? payload : []);
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load user details.",
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
  }, [open, userId]);

  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  useEffect(() => {
  if (!open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [open, onClose]);

  if (!open) return null;

  return (
    <div
  className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm"
  onClick={onClose}
>
  <div
    className="absolute right-0 top-0 h-full w-full max-w-[680px] overflow-y-auto border-l border-[var(--border)] bg-[#08172b] p-8"
    onClick={(e) => e.stopPropagation()}
  >
      <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              User Details
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-white">
  {displayName(user ?? undefined)}
</h2>

            <p className="mt-2 text-slate-400">{user?.email ?? "Loading..."}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                {roleLabel(user?.role)}
              </span>

              <span className="text-sm text-slate-500">
                ID {user?.id ? user.id.slice(0, 8) : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-3 py-3 text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Joined {formatDateTime(user?.createdAt)}
          {user?.updatedAt ? ` • Updated ${formatDateTime(user.updatedAt)}` : ""}
        </p>

        {loading ? (
          <div className="mt-10 flex items-center gap-3 text-slate-300">
            <Loader2 className="animate-spin" size={18} />
            Loading user details...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#020d1b] p-5 text-center">  <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-5">
                  Wallet Balance
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {formatMoney(walletBalance || user?.wallet?.balance || 0)}
                </p>
              </div>

              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#020d1b] p-5 text-center">  <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-5">
                  API Keys
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {user?.totalApiKeys ?? apiKeys.length ?? 0}
                </p>
              </div>

              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#020d1b] p-5 text-center">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-5">    
              Verifications
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {user?.totalVerifications ?? verificationHistory.length ?? 0}
                </p>
              </div>

              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#020d1b] p-5 text-center">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-5">
                      Transactions
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {user?.totalTransactions ?? walletTransactions.length ?? 0}
                </p>
              </div>

              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#020d1b] p-5 text-center">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-5">
                      Permissions
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {permissions.length}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Permissions</h3>
                <span className="text-sm text-slate-400">
                  Read-only staff access
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <span
                      key={permission}
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${permissionTone(
                        permission,
                      )}`}
                    >
                      {permission}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No staff permissions have been assigned yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">API Keys</h3>
                <span className="text-sm text-slate-400">
                  {apiKeys.length} records
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {apiKeys.length > 0 ? (
                  apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="rounded-xl border border-slate-800 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">
                            {key.name || "Unnamed Key"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {key.id.slice(0, 12)} · {formatDateTime(key.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${
                            key.isActive
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-700 bg-slate-900 text-slate-400"
                          }`}
                        >
                          {key.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                    No API keys found for this user.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  Recent Verifications
                </h3>
                <span className="text-sm text-slate-400">
                  Latest {verificationHistory.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {verificationHistory.length > 0 ? (
                  verificationHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {item.serviceName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.id.slice(0, 12)} · {formatDateTime(item.createdAt)}
                          </p>
                          {item.referenceId ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Reference {item.referenceId}
                            </p>
                          ) : null}
                          {item.transactionId ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Transaction {item.transactionId}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatMoney(item.amount)}
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${
                              item.status.toUpperCase().includes("SUCCESS") ||
                              item.status.toUpperCase().includes("VERIFIED")
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : item.status.toUpperCase().includes("FAILED")
                                ? "border-red-500/20 bg-red-500/10 text-red-300"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {item.errorMessage ? (
                        <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                          {item.errorMessage}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                    No verification history available.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  Recent Wallet Transactions
                </h3>
                <span className="text-sm text-slate-400">
                  Latest {walletTransactions.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {walletTransactions.length > 0 ? (
                  walletTransactions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {item.description || `${item.type} transaction`}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.id.slice(0, 12)} · {formatDateTime(item.createdAt)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={
                              item.type === "CREDIT"
                                ? "font-semibold text-emerald-400"
                                : "font-semibold text-red-400"
                            }
                          >
                            {item.type === "CREDIT" ? "+" : "-"}
                            {formatMoney(item.amount)}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${
                              item.type === "CREDIT"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border-red-500/20 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                    No wallet transactions found.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}