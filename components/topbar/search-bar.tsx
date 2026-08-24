"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div
      className="
      hidden md:flex
      items-center
      gap-2
      w-[320px]
      h-11
      px-4
      bg-[var(--surface)]
      border
      border-[var(--border)]
      rounded-lg
      "
    >
      <Search size={18} className="text-gray-400" />

      <input
        placeholder="Search logs, IDs..."
        className="
          bg-transparent
          outline-none
          w-full
          text-sm
        "
      />
    </div>
  );
}