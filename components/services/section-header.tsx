"use client";

import {
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type Props = {
  title: string;
  count: number;
  icon: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
};

export default function SectionHeader({
  title,
  count,
  icon,
  collapsed,
  onToggle,
}: Props) {
  return (
    <button
      onClick={onToggle}
      className="
      w-full

      flex
      items-center
      justify-between

      py-3

      group
      "
    >
      <div className="flex items-center gap-4">
        <div
          className="
          flex
          h-10
          w-10
          items-center
          justify-center

          rounded-md

          bg-[#122131]
          border border-[#273647]

          text-[#B4C5FF]
          "
        >
          {icon}
        </div>

        <div className="text-left">
          <h2
            className="
            text-3xl
            font-semibold
            tracking-[-0.03em]
            "
          >
            {title}
          </h2>

          <p
            className="
            text-sm
            text-slate-500
            mt-1
            "
          >
            {count} endpoints available
          </p>
        </div>
      </div>

      <div
        className="
        text-slate-500
        group-hover:text-white
        transition-all
        "
      >
        {collapsed ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </div>
    </button>
  );
}