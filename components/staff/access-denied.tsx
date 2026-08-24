"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

export default function AccessDenied({
  title = "Access restricted",
  description = "You do not have permission to view this section.",
  backHref = "/staff",
}: {
  title?: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
      <div className="inline-flex rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-300">
        <Lock size={18} />
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2>

      <p className="mt-3 max-w-2xl text-[var(--foreground-muted)]">
        {description}
      </p>

      <div className="mt-6">
        <Link
          href={backHref}
          className="
          inline-flex
          rounded-xl
          bg-blue-600
          px-5
          py-3
          font-medium
          text-white
          hover:bg-blue-500
          "
        >
          Back to Staff Dashboard
        </Link>
      </div>
    </div>
  );
}