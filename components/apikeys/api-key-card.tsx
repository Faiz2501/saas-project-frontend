"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, RefreshCw, Trash2 } from "lucide-react";

interface ApiKeyCardProps {
  name: string;
  keyValue: string;
  createdAt: string;
  variant?: "active" | "revoked";
  onDelete?: () => void;
  onCopy?: () => void;
  onRotate?: () => void;
}

export default function ApiKeyCard({
  name,
  keyValue,
  createdAt,
  variant = "active",
  onDelete,
  onCopy,
  onRotate,
}: ApiKeyCardProps) {
  const [visible, setVisible] = useState(false);
  const isRevoked = variant === "revoked";

  const cardClass = isRevoked
    ? "rounded-xl border border-slate-700 bg-[#0A1624] p-5 transition-all duration-200 opacity-85"
    : "rounded-xl border border-slate-800 bg-[#081a2e] p-5 transition-all duration-200 hover:border-blue-500/40 hover:bg-[#0b1f36]";

  const buttonBase =
    "h-14 w-14 rounded-xl border flex items-center justify-center transition-all";

  const mutedButton =
    "border-slate-700 text-slate-500 opacity-60 cursor-not-allowed";

  const liveButton =
    "border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white";

  return (
    <div className={cardClass}>
      <div className="flex justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{name}</h3>

          <div className="mt-2 inline-flex">
            <span
              className={`rounded-full border px-3 py-1 text-xs uppercase ${
                isRevoked
                  ? "border-slate-500/20 bg-slate-500/10 text-slate-400"
                  : "border-green-500/20 bg-green-500/10 text-green-400"
              }`}
            >
              {isRevoked ? "REVOKED" : "ACTIVE"}
            </span>
          </div>

          <div className="mt-3 text-sm text-slate-400">
            <p>Created: {createdAt}</p>
          </div>

          <div className="mt-4 rounded-md bg-[#061423] px-3 py-2 font-mono text-sm text-slate-300">
            {visible ? keyValue : "••••••••••••••••••••••"}
          </div>

          
        </div>

        <div className="flex gap-3">
          <button
            disabled={isRevoked}
            onClick={() => !isRevoked && setVisible(!visible)}
            className={`${buttonBase} ${isRevoked ? mutedButton : liveButton}`}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          <button
            disabled={isRevoked}
            onClick={() => {
              if (isRevoked) return;
              navigator.clipboard.writeText(keyValue);
              onCopy?.();
            }}
            className={`${buttonBase} ${isRevoked ? mutedButton : liveButton}`}
          >
            <Copy size={18} />
          </button>

          <button
            disabled={isRevoked}
            onClick={() => !isRevoked && onRotate?.()}
            className={`${buttonBase} ${isRevoked ? mutedButton : liveButton}`}
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={onDelete}
            className={`${buttonBase} ${
              isRevoked
                ? "border-red-700 text-red-400 hover:bg-red-500/10"
                : "border-red-700 text-red-400 hover:bg-red-500/10"
            }`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}