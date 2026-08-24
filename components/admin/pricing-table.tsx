"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/axios";
import EditPricingModal from "./edit-pricing-modal";

type PricingService = {
  id: string;
  serviceName: string;
  displayName: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function getCategory(serviceName: string) {
  const name = serviceName.toLowerCase();

  if (
    name.includes("pan") ||
    name.includes("aadhaar") ||
    name.includes("passport") ||
    name.includes("voter") ||
    name.includes("driving")
  ) {
    return "Identity Verification";
  }

  if (
    name.includes("gst") ||
    name.includes("udyam") ||
    name.includes("cin")
  ) {
    return "Business Verification";
  }

  if (name.includes("face")) {
    return "Face Intelligence";
  }

  if (name.includes("vehicle")) {
    return "Vehicle Intelligence";
  }

  if (name.includes("number")) {
    return "Telecom Intelligence";
  }

  if (name.includes("penny")) {
    return "Banking Verification";
  }

  return "Verification";
}

export default function PricingTable() {
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedService, setSelectedService] =
    useState<PricingService | null>(null);

  const loadPricing = async () => {
    try {
      setLoading(true);

      const response = await api.get("/pricing");

      setServices(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPricing();
  }, []);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Pricing Management
        </h1>

        <p className="mt-2 text-[var(--foreground-muted)]">
          Configure service pricing.
        </p>
      </div>

      <div className="max-w-md">
        <input
          placeholder="Search services..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
          w-full
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-4
          py-3
          outline-none
        "
        />
      </div>

      <div
        className="
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--surface)]
      "
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="p-5 text-left">
                Service
              </th>

              <th className="p-5 text-left">
                Category
              </th>

              <th className="p-5 text-left">
                Price
              </th>

              <th className="p-5 text-left">
                Status
              </th>

              <th className="p-5 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-5"
                >
                  Loading...
                </td>
              </tr>
            ) : (
              services
                .filter((service) =>
                  (
                    service.displayName ||
                    service.serviceName
                  )
                    .toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )
                )
                .map((service) => (
                  <tr
                    key={service.id}
                    className="
                    border-b
                    border-[var(--border)]
                  "
                  >
                    <td className="p-5">
                      {service.displayName ||
                        service.serviceName}
                    </td>

                    <td className="p-5">
                      {getCategory(
                        service.serviceName
                      )}
                    </td>

                    <td className="p-5">
                      ₹
                      {Number(
                        service.price
                      ).toFixed(2)}
                    </td>

                    <td className="p-5">
                      {service.isActive
                        ? "Active"
                        : "Inactive"}
                    </td>

                    <td className="p-5">
                      <button
                        onClick={() => {
                          setSelectedService(
                            service
                          );

                          setEditOpen(true);
                        }}
                        className="text-blue-400"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <EditPricingModal
        open={editOpen}
        service={selectedService}
        onClose={() =>
          setEditOpen(false)
        }
        onSaved={loadPricing}
      />
    </section>
  );
}