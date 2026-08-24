import { SearchX } from "lucide-react";

export default function EmptyState() {
  return (
    <div
      className="
      flex
      flex-col
      items-center
      justify-center

      py-24
      "
    >
      <SearchX
        size={48}
        className="text-slate-500 mb-4"
      />

      <h3 className="text-xl font-semibold">
        No Services Found
      </h3>

      <p className="text-slate-400 mt-2">
        Try another search term.
      </p>
    </div>
  );
}