"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api/axios";
import { getStoredUser, type AuthUser } from "@/lib/auth/auth";
import type { StaffPermission } from "@/config/staff-permissions";



type StaffAccess = {
  loading: boolean;
  error: string;
  user: AuthUser | null;
  permissions: string[];
  hasPermission: (permission: StaffPermission | string) => boolean;
};

export function useStaffAccess(enabled = true): StaffAccess {
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const meResponse = await api.get("/users/me");
        const me = meResponse.data as AuthUser;

        if (cancelled) return;

        setUser(me);

        const role = String(me.role).toUpperCase();

if (String(me.role).toUpperCase() !== "STAFF") {
  setPermissions([]);
  return;
}

const currentPermissions = Array.isArray((me as any).permissions)
  ? ((me as any).permissions as string[])
  : Array.isArray((me as any).staffPermissions)
    ? (me as any).staffPermissions
        .map((p: any) => p?.permission?.name)
        .filter(Boolean)
    : [];

setPermissions(Array.from(new Set(currentPermissions)));
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load access information.",
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
  }, [enabled]);

  const permissionSet = useMemo(
    () => new Set(permissions),
    [permissions],
  );

  const hasPermission = (permission: StaffPermission | string) =>
    permissionSet.has(permission);

  return {
    loading,
    error,
    user,
    permissions,
    hasPermission,
  };
}