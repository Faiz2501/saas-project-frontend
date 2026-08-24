"use client";

const filters = [
  "All",
  "Active",
  "Inactive",
];

export default function ServiceFilters({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 mb-8">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onSelect(filter)}
          className={`
            px-4
            py-2
            rounded-md
            text-sm
            transition-all

            ${
              selected === filter
                ? "bg-blue-600 text-white"
                : "bg-[#0D1C2D] border border-[#273647] text-slate-400 hover:text-white"
            }
          `}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}