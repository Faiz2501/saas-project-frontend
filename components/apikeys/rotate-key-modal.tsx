"use client";

import { useState } from "react";

interface RotateKeyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function RotateKeyModal({
  open,
  onClose,
  onConfirm,
}: RotateKeyModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      fixed inset-0
      bg-black/50
      backdrop-blur-md
      flex items-center justify-center
      z-50
      "
    >
      <div
        className="
        w-[520px]
        rounded-xl
        border border-slate-800
        bg-[#081a2e]
        p-6
        "
      >
        <h2 className="text-2xl font-semibold text-white">
          Rotate API Key
        </h2>

        <p className="mt-3 text-slate-400">
          Rotating this key will permanently invalidate
          the current key.
        </p>

        <div
          className="
          mt-5
          rounded-lg
          border border-amber-500/20
          bg-amber-500/10
          p-4
          text-sm
          text-amber-300
          "
        >
          Applications using the current key will stop
          working immediately after rotation.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
            rounded-sm
            border border-slate-700
            px-4 py-2
            "
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="
            rounded-sm
            bg-blue-600
            px-4 py-2
            text-white
            hover:bg-blue-500
            disabled:opacity-60
            "
          >
            {loading ? "Rotating..." : "Rotate Key"}
          </button>
        </div>
      </div>
    </div>
  );
}