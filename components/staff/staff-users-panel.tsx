"use client";

import UsersTable from "./users-table";

export default function StaffUsersPanel() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Users</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Read-only user directory for staff members with VIEW_USERS permission.
        </p>
      </div>

      <UsersTable mode="users" />
    </section>
  );
}