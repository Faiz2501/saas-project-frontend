export function formatMoney(value?: number | null) {
  return `₹${new Intl.NumberFormat("en-IN").format(
    Number(value || 0),
  )}`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function isToday(value?: string | null) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function displayName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  name?: string | null;
  displayName?: string | null;
}) {
  if (!user) return "Unnamed User";

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.displayName || user.name || user.email || "Unnamed User";
}

export function roleLabel(role?: string | null) {
  const value = (role ?? "").toUpperCase();

  if (value === "SUPER_ADMIN") return "Super Admin";
  if (value === "STAFF") return "Staff";
  if (value === "CUSTOMER") return "Customer";

  return "Developer";
}

export function normalizeSupportStatus(status?: string | null) {
  const value = (status ?? "").toUpperCase();

  if (value === "IN_PROGRESS") return "IN_PROGRESS";
  if (value === "RESOLVED") return "RESOLVED";
  if (value === "CLOSED") return "CLOSED";

  return "OPEN";
}

export function supportStatusLabel(status?: string | null) {
  const value = normalizeSupportStatus(status);

  if (value === "IN_PROGRESS") return "In Progress";
  if (value === "RESOLVED") return "Resolved";
  if (value === "CLOSED") return "Closed";

  return "Open";
}

export function supportStatusTone(status?: string | null) {
  const value = normalizeSupportStatus(status);

  if (value === "RESOLVED") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (value === "CLOSED") {
    return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }

  if (value === "IN_PROGRESS") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border-blue-500/20 bg-blue-500/10 text-blue-300";
}

export function verificationTone(status?: string | null) {
  const value = (status ?? "").toUpperCase();

  if (value.includes("SUCCESS") || value.includes("VERIFIED") || value.includes("COMPLETED")) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (value.includes("FAILED") || value.includes("ERROR") || value.includes("REJECTED")) {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}