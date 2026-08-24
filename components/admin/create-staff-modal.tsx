"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateStaffModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      z-[100]

      flex
      items-center
      justify-center

      bg-black/70
      backdrop-blur-sm
      "
    >
      <div
        className="
        w-full
        max-w-xl

        rounded-3xl

        border
        border-slate-800

        bg-[#08172b]

        p-8
        "
      >
        <h2 className="text-2xl font-semibold">
          Create Staff
        </h2>

        <p className="mt-2 text-slate-400">
          Add a new staff member.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <input
            placeholder="First Name"
            className="rounded-xl bg-[#020d1b] p-4"
          />

          <input
            placeholder="Last Name"
            className="rounded-xl bg-[#020d1b] p-4"
          />

          <input
            placeholder="Email"
            className="col-span-2 rounded-xl bg-[#020d1b] p-4"
          />

          <input
            placeholder="Password"
            className="col-span-2 rounded-xl bg-[#020d1b] p-4"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
            rounded-xl
            border
            border-slate-700
            px-4
            py-3
            "
          >
            Cancel
          </button>

          <button
            className="
            rounded-xl
            bg-blue-600
            px-4
            py-3
            "
          >
            Create Staff
          </button>
        </div>
      </div>
    </div>
  );
}