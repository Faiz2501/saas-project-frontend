"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/axios";

interface Props {
  open: boolean;
  service: any;
  onClose: () => void;
  onSaved?: () => void;
}

export default function EditPricingModal({
  open,
  service,
  onClose,
  onSaved,
}: Props) {
  const [price, setPrice] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (service) {
      setPrice(
        String(service.price)
      );
    }
  }, [service]);

  if (!open) return null;

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.patch(
        `/pricing/${service.id}`,
        {
          price: Number(price),
        }
      );

      await onSaved?.();

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      bg-black/60
    "
    >
      <div
        className="
        w-full
        max-w-lg
        rounded-3xl
        border
        border-slate-800
        bg-[#08172b]
        p-8
      "
      >
        <h2 className="text-2xl font-semibold">
          Edit Pricing
        </h2>

        <div className="mt-8 space-y-4">
          <input
            value={
              service?.displayName ||
              service?.serviceName ||
              ""
            }
            disabled
            className="
            w-full
            rounded-xl
            bg-[#020d1b]
            p-4
          "
          />

          <input
            value={price}
            onChange={(e) =>
              setPrice(
                e.target.value
              )
            }
            className="
            w-full
            rounded-xl
            bg-[#020d1b]
            p-4
          "
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
            onClick={handleSave}
            disabled={saving}
            className="
            rounded-xl
            bg-blue-600
            px-4
            py-3
          "
          >
            {saving
              ? "Saving..."
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}