"use client";

import { Search } from "lucide-react";

export default function ServiceSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="
      sticky
      top-20
      z-20

      mb-10

      backdrop-blur-xl
      "
    >
      <div
        className="
        flex
        items-center
        gap-3

        px-5
        py-4

        rounded-xl

        bg-[#122131]
        border border-[#273647]
        "
      >
        <Search size={18} />

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder="Search services..."
          className="
          bg-transparent
          outline-none
          w-full
          "
        />
      </div>
    </div>
  );
}