"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ElementType;
}

export default function SidebarItem({
  title,
  href,
  icon: Icon,
}: SidebarItemProps) {
  const pathname = usePathname();

  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3
        px-3 py-2
        rounded-sm
        ${
          active
            ? "bg-blue-600/90 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            : "text-[var(--foreground-muted)] hover:text-white hover:bg-[var(--surface-hover)]"
        }
      `}
    >
      <Icon size={18} />

      <span className="text-sm font-medium">
        {title}
      </span>
    </Link>
  );
}