"use client";

type ServiceRow = {
  id: string;
  serviceName: string;
  amount: number;
  status?: "SUCCESS" | "FAILED";
  createdAt?: string;
};

function prettyServiceName(serviceName: string) {
  return serviceName
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ServiceChart({
  rows = [],
}: {
  rows?: ServiceRow[];
}) {
  const max = Math.max(1, ...rows.map((d) => d.amount));

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 h-[420px]">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          Top Services
        </h3>
      </div>

      <div className="h-[320px] rounded-[6px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[var(--foreground-muted)]">
            No service data yet
          </div>
        ) : (
          <div className="flex h-full flex-col gap-4 overflow-auto pr-1">
            {rows.map((item) => {
              const percent = Math.max(
                8,
                (item.amount / max) * 100
              );

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white">
                      {prettyServiceName(item.serviceName)}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      {item.amount}
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-[var(--border)]">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}