"use client";

import { useEffect, useMemo, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onContinue?: (amount: number) => Promise<void> | void;
}

const amounts = [100, 500, 1000, 5000];

export default function AddFundsModal({
  open,
  onClose,
  onContinue,
}: Props) {
  const [selectedAmount, setSelectedAmount] =
    useState<number>(100);

  const [customAmount, setCustomAmount] =
    useState("");
   

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const amount = useMemo(() => {
  const value = Number(customAmount);

  if (!Number.isNaN(value) && value > 0) {
    return value;
  }

  return selectedAmount;
}, [customAmount, selectedAmount]);

useEffect(() => {
  if (!open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [open, onClose]);

  if (!open) return null;

  const handleContinue = async () => {
    if (amount < 100) {
      setError(
        "Minimum recharge amount is ₹100"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onContinue?.(amount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
  onClick={onClose}
>
  <div
    className="w-[520px] rounded-xl border border-slate-800 bg-[#081a2e] p-6"
    onClick={(e) => e.stopPropagation()}
  >
      <h2 className="text-2xl font-semibold">
          Add Funds
        </h2>

        <p className="mt-2 text-slate-400">
          Select a recharge amount.
        </p>

        <div
          className="
          mt-5
          rounded-xl
          border
          border-amber-500/20
          bg-amber-500/10
          px-4
          py-3
          text-sm
          text-amber-300
          "
        >
          Minimum recharge amount is ₹100
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {amounts.map((value) => (
            <button
              key={value}
              onClick={() => {
  setSelectedAmount(value);
  setCustomAmount(String(value));
  setError("");
}}
              className={`
                rounded-sm
                border
                p-4
                transition-all
                ${
                  selectedAmount === value &&
                  !customAmount.trim()
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-slate-700 hover:border-blue-500"
                }
              `}
            >
              ₹{value}
            </button>
          ))}
        </div>

        <input
          type="number"
          min="100"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(
              e.target.value
            );
            setError("");
          }}
          placeholder="Custom Amount (Minimum ₹100)"
          className="
            mt-5
            w-full
            rounded-sm
            border border-slate-700
            bg-[#061423]
            px-4
            py-3
          "
        />

        {error && (
          <div className="mt-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              rounded-sm
              border
              border-slate-700
              px-4
              py-2
            "
          >
            Cancel
          </button>

          <button
            onClick={handleContinue}
            disabled={loading}
            className="
              rounded-sm
              bg-blue-600
              px-4
              py-2
              text-white
              disabled:opacity-60
            "
          >
            {loading
              ? "Opening..."
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}