"use client";

import { Search } from "lucide-react";
import type { ReactElement } from "react";

export default function ServicesToolbar({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}): ReactElement {
    
  return (
    
    
    <div
      className="
      flex
      items-center
      justify-between
      mb-8
      pb-6
      border-b
      border-[#273647]
      "
    >
      <div>
        <h1
          className="
          text-5xl
          font-semibold
          tracking-[-0.04em]
          text-white
          "
        >
          Endpoint Directory
        </h1>

        <p
          className="
          mt-3
          text-slate-400
          max-w-3xl
          "
        >
          Integrate secure, compliant verification services
          into your workflow.
        </p>
      </div>

      <div
        className="
        flex
        items-center
        gap-3

        h-12
        w-[320px]

        rounded-lg
        border
        border-[#273647]

        bg-[#0D1C2D]

        px-4
        "
      >
        <Search size={18} />

        <input
  value={search}
  onChange={(e) =>
    onSearch(e.target.value)
  }
          placeholder="Search services..."
          className="
          flex-1
          bg-transparent
          outline-none
          text-sm
          "
        />
      </div>
    </div>
  );
}