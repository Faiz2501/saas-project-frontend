"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import SidebarItem from "./sidebar-item";
import {
  developerNavigation,
  adminNavigation,
  staffNavigation,
} from "@/config/navigation";
import { useStaffAccess } from "@/hooks/use-staff-access";

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const isAdminRoute = pathname.startsWith("/admin");
  const isStaffRoute = pathname.startsWith("/staff");

  const { permissions, loading } = useStaffAccess(isStaffRoute);

  const navigation = useMemo(() => {
    if (isAdminRoute) return adminNavigation;
    if (isStaffRoute) {
      return staffNavigation.filter(
        (item) =>
          !item.requiredPermission ||
          permissions.includes(item.requiredPermission),
      );
    }

    return developerNavigation;
  }, [isAdminRoute, isStaffRoute, permissions]);

  const portalName = isAdminRoute
    ? "Admin Portal"
    : isStaffRoute
    ? "Staff Portal"
    : "Customer Portal";

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="px-6 py-8">
        <div className="mb-8 px-4">
          <img
            src="/logo-white.png"
            alt="IDProofPro"
            className="w-[180px]"
          />
        </div>

        <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[var(--foreground-muted)]">
          VERIFY. TRUST. TRANSFORM.
        </p>
      </div>

      <div className="flex-1 space-y-1 px-3">
        {navigation.map((item) => (
          <SidebarItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <div className="text-sm text-[var(--foreground-muted)]">
          {portalName}
        </div>

        {isStaffRoute && loading ? (
          <div className="mt-2 text-xs text-slate-500">
            Loading permissions...
          </div>
        ) : null}
      </div>
    </aside>
  );
}