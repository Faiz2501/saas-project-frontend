"use client";

import { useState } from "react";
import VerifyModal from "./verify-modal";
import ComingSoonModal from "./coming-soon-modal";

type ServiceCardProps = {
  name: string;
  description: string;
  status: "active" | "live" | "beta";
  price: number;
  icon: React.ReactNode;
  available: boolean;
  mode:
    | "single"
    | "driving-license"
    | "bank"
    | "passport"
    | "digilocker"
    | "face-match"
    | "face-liveness"
    | "name-match"
    | "reverse-geocode"
    | "employment-360"
    | "coming-soon";
  endpoint?: string;
  requestKey?: string;
  inputLabel?: string;
  placeholder?: string;
  comingSoonCopy?: string;
  activeApiKey?: string;
};

export default function ServiceCard({
  name,
  description,
  status,
  price,
  icon,
  available,
  mode,
  endpoint,
  requestKey,
  inputLabel,
  placeholder,
  comingSoonCopy,
  activeApiKey,
}: ServiceCardProps) {
  const [openVerify, setOpenVerify] = useState(false);
  const [openSoon, setOpenSoon] = useState(false);

  return (
    <div
  className={`group flex flex-col rounded-lg border p-5 transition-all duration-200 ${
    available
      ? "border-[#273647] bg-[#0D1C2D] hover:border-[#3B82F6] hover:shadow-[0_0_20px_rgba(59,130,246,0.12)] hover:-translate-y-[2px] hover:bg-[#122131]"
      : "cursor-default border-[#243447] bg-[#0B1828] saturate-[0.75] opacity-[0.88]"
  }`}
>
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#273647] bg-[#122131] text-[#B4C5FF]">
          {icon}
        </div>

        <div
          className={`flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] uppercase tracking-wider ${
            available
              ? "border-emerald-500/20 text-emerald-400"
              : "border-slate-600 text-slate-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              available ? "bg-emerald-500" : "bg-slate-500"
            }`}
          />

          {available ? "ACTIVE" : "INACTIVE"}
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">
        {name}
      </h3>

      <p className="mb-6 line-clamp-3 text-sm text-slate-400">
        {description}
      </p>

      <div className="mt-auto">
        {available ? (
  <div className="mb-4 text-xs text-slate-400">
    ₹{price} / request
  </div>
) : null}

        <button
  onClick={() =>
    available
      ? setOpenVerify(true)
      : setOpenSoon(true)
  }
  className={`w-full rounded-md py-2 text-sm font-medium transition-all ${
    available
      ? "bg-[#0061FF] text-white hover:brightness-110 hover:shadow-[0_0_18px_rgba(37,99,235,0.25)]"
      : "border border-slate-700 bg-slate-800/70 text-slate-400"
  }`}
>
  {available ? "Use" : "Coming Soon"}
</button>
      </div>

      <VerifyModal
        open={openVerify}
        onClose={() => setOpenVerify(false)}
        serviceName={name}
        mode={mode}
        endpoint={endpoint}
        requestKey={requestKey}
        inputLabel={inputLabel}
        placeholder={placeholder}
        defaultApiKey={activeApiKey}
      />

      <ComingSoonModal
        open={openSoon}
        onClose={() => setOpenSoon(false)}
        serviceName={name}
        copy={comingSoonCopy}
      />
    </div>
  );
}