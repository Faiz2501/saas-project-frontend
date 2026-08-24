type PricingService = {
  id?: string;
  serviceName: string;
  displayName?: string | null;
  price: number;
  isActive: boolean;
};

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}

export default function TopServices({
  services,
}: {
  services: PricingService[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h3 className="text-xl font-semibold">Top Services</h3>

      <div className="mt-6 space-y-5">
        {services.length === 0 ? (
          <div className="text-sm text-[var(--foreground-muted)]">
            No pricing records found.
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id ?? service.serviceName}
              className="flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {service.displayName || service.serviceName}
                </p>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                  {service.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--foreground-muted)]">
                {formatMoney(service.price)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}