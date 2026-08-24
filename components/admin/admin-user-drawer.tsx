"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  FileCheck,
  KeyRound,
  Loader2,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import api from "@/lib/api/axios";

type DrawerMode = "transactions" | "verifications";

type Props = {
  open: boolean;
  userId: string | null;
  mode: DrawerMode;
  onClose: () => void;
};

type WalletSummary = {
  balance: number;
  totalCredits: number;
  totalDebits: number;
  creditTransactions: number;
  debitTransactions: number;
  totalTransactions: number;
  totalRechargeAmount?: number;
  latestRecharge?: {
    amount: number;
    description?: string | null;
    createdAt: string;
  } | null;
};

type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | string;
  description?: string | null;
  createdAt: string;
};

type VerificationRecord = {
  id: string;
  serviceName: string;
  amount: number;
  status: string;
  createdAt: string;
  errorMessage?: string | null;
  transactionId?: string | null;
  referenceId?: string | null;
};

type ApiKeyRecord = {
  id: string;
  name?: string | null;
  isActive: boolean;
  createdAt: string;
};

type UserDetails = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  walletBalance?: number;
  activeApiKeys?: number;
  totalApiKeys?: number;
  totalVerifications?: number;
  totalTransactions?: number;
  permissions?: string[];
  apiKeys?: ApiKeyRecord[];
  verifications?: VerificationRecord[];
  transactions?: WalletTransaction[];
  wallet?: { balance?: number };
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

function displayName(user?: UserDetails | null) {
  if (!user) return "Unnamed User";

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

function roleTone(role?: string | null) {
  const value = (role ?? "").toUpperCase();

  if (value === "SUPER_ADMIN") return "border-violet-500/20 bg-violet-500/10 text-violet-300";
  if (value === "STAFF") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (value === "CUSTOMER") return "border-blue-500/20 bg-blue-500/10 text-blue-300";

  return "border-slate-500/20 bg-slate-500/10 text-slate-300";
}

function transactionTone(type?: string | null) {
  const value = (type ?? "").toUpperCase();

  if (value === "CREDIT") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  return "border-red-500/20 bg-red-500/10 text-red-300";
}

function verificationTone(status?: string | null) {
  const value = (status ?? "").toUpperCase();

  if (value.includes("SUCCESS") || value.includes("VERIFIED") || value.includes("COMPLETED")) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (value.includes("FAILED") || value.includes("ERROR") || value.includes("REJECTED")) {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function normalizeTransaction(raw: any): WalletTransaction {
  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.userId ?? ""),
    amount: Number(raw?.amount ?? 0),
    type: String(raw?.type ?? "DEBIT").toUpperCase(),
    description: raw?.description ?? null,
    createdAt: raw?.createdAt || raw?.created_at || "",
  };
}

function normalizeVerification(raw: any): VerificationRecord {
  return {
    id: String(raw?.id ?? ""),
    serviceName: String(raw?.serviceName ?? raw?.service ?? "Unknown Service"),
    amount: Number(raw?.amount ?? 0),
    status: String(raw?.status ?? "UNKNOWN"),
    createdAt: raw?.createdAt || raw?.created_at || "",
    errorMessage: raw?.errorMessage ?? raw?.error_message ?? null,
    transactionId: raw?.transactionId ?? null,
    referenceId: raw?.referenceId ?? null,
  };
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

export default function AdminUserDrawer({
  open,
  userId,
  mode,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserDetails | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    if (!open || !userId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setUser(null);
        setWalletSummary(null);
        setWalletTransactions([]);

        const [userRes, summaryRes, txRes] = await Promise.allSettled([
          api.get(`/admin/users/${userId}`),
          api.get(`/wallet/summary/${userId}`),
          api.get(`/wallet/transactions/${userId}`),
        ]);

        if (userRes.status === "rejected") {
          throw userRes.reason;
        }

        const userPayload = userRes.value.data as UserDetails;
        setUser(userPayload);

        if (summaryRes.status === "fulfilled") {
          setWalletSummary(summaryRes.value.data as WalletSummary);
        }

        if (txRes.status === "fulfilled") {
          const payload = txRes.value.data;
          setWalletTransactions(Array.isArray(payload) ? payload.map(normalizeTransaction) : []);
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load user details."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, userId]);

  const permissions = useMemo(() => {
    return user?.permissions ?? [];
  }, [user]);

  const apiKeys = useMemo(() => {
    return user?.apiKeys ?? [];
  }, [user]);

  const verifications = useMemo(() => {
    return (user?.verifications ?? []).map(normalizeVerification);
  }, [user]);

  const transactions = useMemo(() => {
    return walletTransactions.length
      ? walletTransactions
      : (user?.transactions ?? []).map(normalizeTransaction);
  }, [walletTransactions, user]);

  const balance =
    walletSummary?.balance ??
    user?.walletBalance ??
    user?.wallet?.balance ??
    0;

  const walletCreditTotal =
    walletSummary?.totalCredits ??
    transactions
      .filter((item) => item.type === "CREDIT")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const walletDebitTotal =
    walletSummary?.totalDebits ??
    transactions
      .filter((item) => item.type === "DEBIT")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const walletCreditCount =
    walletSummary?.creditTransactions ??
    transactions.filter((item) => item.type === "CREDIT").length;

  const walletDebitCount =
    walletSummary?.debitTransactions ??
    transactions.filter((item) => item.type === "DEBIT").length;

  const walletTxnCount =
    walletSummary?.totalTransactions ??
    user?.totalTransactions ??
    transactions.length;

  const verificationTotal =
    user?.totalVerifications ?? verifications.length;

  const verificationSuccess = verifications.filter((item) =>
    (item.status ?? "").toUpperCase().includes("SUCCESS") ||
    (item.status ?? "").toUpperCase().includes("VERIFIED") ||
    (item.status ?? "").toUpperCase().includes("COMPLETED")
  ).length;

  const verificationFailed = verifications.filter((item) =>
    (item.status ?? "").toUpperCase().includes("FAILED") ||
    (item.status ?? "").toUpperCase().includes("ERROR") ||
    (item.status ?? "").toUpperCase().includes("REJECTED")
  ).length;

  const verificationSuccessRate =
    verificationTotal > 0
      ? Math.round((verificationSuccess / verificationTotal) * 100)
      : 0;

  const latestRecharge =
    walletSummary?.latestRecharge ??
    (transactions.find((item) => item.type === "CREDIT")
      ? {
          amount: transactions.find((item) => item.type === "CREDIT")?.amount ?? 0,
          description:
            transactions.find((item) => item.type === "CREDIT")?.description ?? "Wallet recharge",
          createdAt:
            transactions.find((item) => item.type === "CREDIT")?.createdAt ?? "",
        }
      : null);

  if (!open) return null;

  const primaryIsTransactions = mode === "transactions";

  return (
    <div className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-[640px] overflow-y-auto border-l border-[var(--border)] bg-[#08172b] p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              User Insight
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-white">
              {displayName(user)}
            </h2>

            <p className="mt-2 text-slate-400">{user?.email || "Loading..."}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${roleTone(
                  user?.role
                )}`}
              >
                {prettyRole(user?.role)}
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
          Joined {formatDate(user?.createdAt)}
          {user?.updatedAt ? ` • Updated ${formatDate(user.updatedAt)}` : ""}
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                title="Wallet Balance"
                value={formatMoney(balance)}
                hint={latestRecharge ? `Latest recharge ${formatMoney(latestRecharge.amount)}` : "No recharge data"}
              />
              <StatCard
                title="API Keys"
                value={`${user?.activeApiKeys ?? 0}/${user?.totalApiKeys ?? apiKeys.length}`}
                hint="Active / total"
              />
              <StatCard
                title="Permissions"
                value={String(permissions.length)}
                hint={permissions.length ? "Staff access" : "No staff permissions"}
              />
              <StatCard
                title={primaryIsTransactions ? "Wallet Transactions" : "Verifications"}
                value={String(primaryIsTransactions ? walletTxnCount : verificationTotal)}
                hint={primaryIsTransactions ? "Wallet history" : "Recent verification history"}
              />
            </div>

            {permissions.length > 0 ? (
              <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Permissions</h3>
                  <span className="text-sm text-slate-400">Staff access</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {apiKeys.length > 0 ? (
              <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">API Keys</h3>
                  <span className="text-sm text-slate-400">{apiKeys.length} keys</span>
                </div>

                <div className="mt-4 space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {key.name || "Unnamed Key"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {key.id.slice(0, 12)} · {formatDate(key.createdAt)}
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
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {primaryIsTransactions ? "Wallet Transactions" : "Verification History"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {primaryIsTransactions
                      ? "Latest wallet activity from the backend."
                      : "Latest verification requests from the backend."}
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  {primaryIsTransactions ? transactions.length : verifications.length} items
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {primaryIsTransactions ? (
                  transactions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                      No wallet transactions found.
                    </div>
                  ) : (
                    transactions.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 px-4 py-4 transition-all hover:bg-[var(--hover-surface)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-white">
                              {item.description || `${item.type} transaction`}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.id.slice(0, 12)} · {formatDate(item.createdAt)}
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
                              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${transactionTone(
                                item.type
                              )}`}
                            >
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : verifications.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                    No verification history found.
                  </div>
                ) : (
                  verifications.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 px-4 py-4 transition-all hover:bg-[var(--hover-surface)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-white">
                            {item.serviceName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.id.slice(0, 12)} · {formatDate(item.createdAt)}
                          </p>

                          {item.transactionId ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Transaction {item.transactionId.slice(0, 12)}
                            </p>
                          ) : null}

                          {item.referenceId ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Reference {item.referenceId}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatMoney(item.amount)}
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${verificationTone(
                              item.status
                            )}`}
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
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[#020d1b] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {primaryIsTransactions ? "Verification History" : "Wallet Transactions"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {primaryIsTransactions
                      ? "Recent verification activity for this user."
                      : "Recent wallet activity for this user."}
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  {primaryIsTransactions ? verificationTotal : walletTxnCount} items
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {primaryIsTransactions ? (
                  verifications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                      No verification history found.
                    </div>
                  ) : (
                    verifications.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 px-4 py-4 transition-all hover:bg-[var(--hover-surface)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-white">
                              {item.serviceName}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.id.slice(0, 12)} · {formatDate(item.createdAt)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-white">
                              {formatMoney(item.amount)}
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${verificationTone(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : transactions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                    No wallet transactions found.
                  </div>
                ) : (
                  transactions.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 px-4 py-4 transition-all hover:bg-[var(--hover-surface)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-white">
                            {item.description || `${item.type} transaction`}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.id.slice(0, 12)} · {formatDate(item.createdAt)}
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
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${transactionTone(
                              item.type
                            )}`}
                          >
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 transition-all hover:bg-[var(--hover-surface)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}