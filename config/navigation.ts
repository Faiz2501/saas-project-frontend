import {
  LayoutDashboard,
  ShieldCheck,
  KeyRound,
  Settings,
  FileText,
  CreditCard,
  Users,
  BadgeIndianRupee,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";

import { STAFF_PERMISSIONS } from "./staff-permissions";

export const developerNavigation = [
  {
    title: "Dashboard",
    href: "/developer",
    icon: LayoutDashboard,
  },
  {
    title: "Verification Services",
    href: "/developer/services",
    icon: ShieldCheck,
  },
  {
    title: "API Keys & Wallet",
    href: "/developer/api-keys",
    icon: KeyRound,
  },
  {
    title: "Support",
    href: "/developer/support",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/developer/settings",
    icon: Settings,
  },
];

export const adminNavigation = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Staff Management",
    href: "/admin/staff",
    icon: Users,
  },
  {
    title: "API Keys",
    href: "/admin/api-keys",
    icon: KeyRound,
  },
  {
    title: "Pricing",
    href: "/admin/pricing",
    icon: BadgeIndianRupee,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "Verifications",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    title: "Support Tickets",
    href: "/admin/support",
    icon: LifeBuoy,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const staffNavigation = [
  {
    title: "Dashboard",
    href: "/staff",
    icon: LayoutDashboard,
  },
  {
    title: "Verifications",
    href: "/staff/verifications",
    icon: ShieldCheck,
    requiredPermission: STAFF_PERMISSIONS.VIEW_VERIFICATIONS,
  },
  {
    title: "Transactions",
    href: "/staff/transactions",
    icon: CreditCard,
    requiredPermission: STAFF_PERMISSIONS.VIEW_TRANSACTIONS,
  },
  {
    title: "Support",
    href: "/staff/support",
    icon: LifeBuoy,
    requiredPermission: STAFF_PERMISSIONS.VIEW_SUPPORT,
  },
  {
    title: "Users",
    href: "/staff/users",
    icon: Users,
    requiredPermission: STAFF_PERMISSIONS.VIEW_USERS,
  },
  {
    title: "Settings",
    href: "/staff/settings",
    icon: Settings,
  },
];