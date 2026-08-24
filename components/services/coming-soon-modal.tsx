"use client";

import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  copy?: string;
};

export default function ComingSoonModal({
  open,
  onClose,
  serviceName,
  copy,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[560px] rounded-xl border border-[#273647] bg-[#0D1C2D] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Coming Soon
          </h2>
          <button onClick={onClose} className="text-slate-300">
            <X />
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300">
            <Sparkles size={34} />
          </div>

          <h3 className="mt-6 text-2xl font-semibold text-white">
            {serviceName}
          </h3>

          <p className="mt-3 max-w-md text-slate-400">
            This feature is not live yet.
          </p>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {copy ||
              "Still in the oven. The backend is giving it one last coffee break before launch."}
          </div>

          <button
            onClick={onClose}
            className="mt-8 rounded-xl bg-blue-600 px-5 py-3 text-white"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}