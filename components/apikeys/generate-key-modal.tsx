"use client";

import { useState } from "react";

interface GenerateKeyModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate?: (name: string) => Promise<void> | void;
}

export default function GenerateKeyModal({
  open,
  onClose,
  onGenerate,
}: GenerateKeyModalProps) {
  const [loading, setLoading] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleGenerate = async () => {
    const name = keyName.trim();

    if (!name) {
      setError("Key name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onGenerate?.(name);

      setKeyName("");
      onClose();
    } catch {
      // handled by parent page
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[500px] rounded-xl border border-slate-800 bg-[#081a2e] p-6">
        <h2 className="text-2xl font-semibold text-white">
          Generate API Key
        </h2>

        <p className="mt-2 text-slate-400">
          Create a new API key for your application.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-sm">
            Key Name
          </label>

          <input
            value={keyName}
            onChange={(e) =>
              setKeyName(e.target.value)
            }
            className="w-full rounded-sm border border-slate-700 bg-[#061423] px-4 py-3"
            placeholder="Production Key"
          />

          {error && (
            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-sm border border-slate-700 px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-sm bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading
              ? "Generating..."
              : "Generate Key"}
          </button>
        </div>
      </div>
    </div>
  );
}