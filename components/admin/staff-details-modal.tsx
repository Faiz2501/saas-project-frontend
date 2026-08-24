"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api/axios";
import { getRole } from "@/lib/auth/auth";

type Props = {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

type UserPermission = {
  permission: {
    id: string;
    name: string;
  };
};

type UserDetails = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  wallet?: { balance?: number };
  staffPermissions?: UserPermission[];
};

type PermissionRecord = {
  id: string;
  name: string;
  createdAt?: string;
};

const visiblePermissions = [
  "VIEW_USERS",
  "VIEW_TRANSACTIONS",
  "VIEW_VERIFICATIONS",
  "VIEW_SUPPORT",
];

const hiddenPermissions = [
  "MANAGE_API_KEYS",
  "MANAGE_PRICING",
  "MANAGE_STAFF",
  "REFUND_WALLET",
];

function normalizeRole(role?: string | null) {
  const value = (role ?? "").toUpperCase();
  if (value === "STAFF") return "STAFF";
  return "DEVELOPER";
}

function prettyRole(role?: string | null) {
  return normalizeRole(role) === "STAFF" ? "Staff" : "Developer";
}

export default function StaffDetailsModal({
  open,
  userId,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserDetails | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<
    PermissionRecord[]
  >([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    []
  );
  const [role, setRole] = useState<"DEVELOPER" | "STAFF">("DEVELOPER");
  const [walletBalanceInput, setWalletBalanceInput] = useState("");

  const currentUserRole = useMemo(() => {
    const role = getRole();
    return (role ?? "developer").toLowerCase();
  }, []);

  const canEditWallet = currentUserRole === "admin";

  const walletBalance = useMemo(() => {
    if (!user) return 0;
    return Number(user.wallet?.balance ?? 0);
  }, [user]);

  useEffect(() => {
    if (user) {
      setWalletBalanceInput(String(Number(user.wallet?.balance ?? 0)));
    }
  }, [user]);

  useEffect(() => {
    if (!open || !userId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const userRes = await api.get(`/users/${userId}`);
        const permissionsRes = await api.get("/permissions");

        const userData = userRes.data as UserDetails;
        const permissionsData = permissionsRes.data as PermissionRecord[];

        setUser(userData);
        setRole(normalizeRole(userData.role));
        setWalletBalanceInput(String(Number(userData.wallet?.balance ?? 0)));

        const filteredPermissions = (Array.isArray(permissionsData)
          ? permissionsData
          : []
        ).filter((permission) => !hiddenPermissions.includes(permission.name));

        setAvailablePermissions(filteredPermissions);

        const allowedIds = new Set(filteredPermissions.map((p) => p.id));

        const assignedIds =
          userData.staffPermissions?.map((sp) => sp.permission.id) ?? [];

        setSelectedPermissionIds(
          Array.from(new Set(assignedIds.filter((id) => allowedIds.has(id))))
        );
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load user access details."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, userId]);

  useEffect(() => {
  if (!open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [open, onClose]);

  if (!open) return null;

  const isStaff = role === "STAFF";

  const togglePermission = (permissionId: string) => {
    if (!isStaff) return;

    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((item) => item !== permissionId)
        : [...current, permissionId]
    );
  };

  const handleSaveAccess = async () => {
    if (!userId || !user) return;

    try {
      setSavingAccess(true);
      setError("");

      await api.patch(`/users/${userId}/role`, {
        role: isStaff ? "STAFF" : "CUSTOMER",
      });

      await api.post("/staff/set-permissions", {
        userId,
        permissionIds: isStaff ? selectedPermissionIds : [],
      });

      await onSaved?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save access changes."
      );
    } finally {
      setSavingAccess(false);
    }
  };

  const handleSaveWallet = async () => {
    if (!userId || !user) return;

    if (!canEditWallet) {
      setError("Only admin can edit wallet balance.");
      return;
    }

    const nextBalance = Number(walletBalanceInput);

    if (Number.isNaN(nextBalance) || nextBalance < 0) {
      setError("Please enter a valid wallet balance.");
      return;
    }

    const currentBalance = Number(user.wallet?.balance ?? 0);

    if (nextBalance === currentBalance) {
      setError("Wallet balance is already up to date.");
      return;
    }

    try {
      setSavingWallet(true);
      setError("");

      const difference = Math.abs(nextBalance - currentBalance);

      if (nextBalance > currentBalance) {
        await api.post("/wallet/credit", {
          userId,
          amount: difference,
          description: "Admin wallet refund / adjustment",
        });
      } else {
        await api.post("/wallet/debit", {
          userId,
          amount: difference,
          description: "Admin wallet adjustment",
        });
      }

      const updatedUserRes = await api.get(`/users/${userId}`);
      const updatedUser = updatedUserRes.data as UserDetails;
      setUser(updatedUser);
      setWalletBalanceInput(String(Number(updatedUser.wallet?.balance ?? 0)));

      await onSaved?.();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update wallet balance."
      );
    } finally {
      setSavingWallet(false);
    }
  };

  return (
    <div
  className="fixed inset-0 z-[100] bg-black/50"
  onClick={onClose}
>
  <div
    className="absolute right-0 top-0 h-full w-[500px] overflow-y-auto border-l border-slate-800 bg-[#08172b] p-8"
    onClick={(e) => e.stopPropagation()}
  >
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">User Access</h2>

          <button onClick={onClose} className="text-slate-400">
            Close
          </button>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-3 text-slate-300">
            <Loader2 className="animate-spin" size={18} />
            Loading user...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="mt-1 text-lg">
                {user?.firstName || user?.lastName
                  ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
                  : "Unnamed User"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Email</p>
              <p className="mt-1">{user?.email}</p>
            </div>

            <div>
              <p className="text-slate-500">Role</p>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setRole("DEVELOPER")}
                  className={`rounded-xl border px-4 py-3 transition-all ${
                    role === "DEVELOPER"
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-slate-800 text-slate-300"
                  }`}
                >
                  Developer
                </button>

                <button
                  onClick={() => setRole("STAFF")}
                  className={`rounded-xl border px-4 py-3 transition-all ${
                    role === "STAFF"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-800 text-slate-300"
                  }`}
                >
                  Staff
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Current access: {prettyRole(role)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Wallet Balance</p>
              <p className="mt-1 text-lg">
                ₹
                {new Intl.NumberFormat("en-IN").format(
                  Number(walletBalance || 0)
                )}
              </p>

              {canEditWallet ? (
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-500">
                      Update Wallet Balance
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={walletBalanceInput}
                      onChange={(e) => setWalletBalanceInput(e.target.value)}
                      placeholder="Enter wallet balance"
                      className="w-full rounded-xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                    />
                  </label>

                  <button
                    onClick={handleSaveWallet}
                    disabled={savingWallet}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingWallet ? "Updating..." : "Save Wallet"}
                  </button>

                  <p className="text-sm text-slate-500">
                    This will credit or debit the difference to match the exact
                    balance you enter.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Wallet editing is available for admin only.
                </p>
              )}
            </div>

            <div>
              <p className="mb-4 text-slate-500">Permissions</p>

              <div className="space-y-3">
                {(availablePermissions.length
                  ? availablePermissions
                  : visiblePermissions.map((name) => ({ id: name, name }))).map(
                  (permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
                    >
                      <span>{permission.name}</span>

                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        disabled={!isStaff}
                        className={
                          !isStaff ? "cursor-not-allowed opacity-50" : ""
                        }
                      />
                    </label>
                  )
                )}
              </div>

              {!isStaff && (
                <p className="text-sm text-slate-500">
                  Permissions can only be assigned when the user is Staff.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-3 text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveAccess}
                disabled={savingAccess}
                className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
              >
                {savingAccess ? "Saving..." : "Save Access"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}