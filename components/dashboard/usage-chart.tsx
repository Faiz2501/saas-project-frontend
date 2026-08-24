export default function UsageChart({
  data = [],
}: {
  data?: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div
      className="
        bg-white/[0.03]
        backdrop-blur-xl
        border
        border-blue-500/15
        rounded-[8px]
        p-6
        h-[420px]
        shadow-[0_12px_40px_rgba(0,0,0,.25)]
      "
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          API Usage (Daily Volume)
        </h3>
      </div>

      <div
        className="
          relative
          h-[300px]
          rounded-[6px]
          border
          border-blue-500/10
          bg-gradient-to-b
          from-blue-500/5
          via-transparent
          to-transparent
          p-4
          overflow-hidden
        "
      >
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--foreground-muted)]">
            No usage data yet
          </div>
        ) : (
          <>
            {/* Y-Axis Label */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] tracking-wide text-slate-500 origin-left">
              Requests
            </div>

            {/* Bars Wrapper Container */}
            <div className="pl-8 pr-2 h-full flex items-end gap-3 justify-between">
              {data.map((item) => (
                <div
                  key={item.label}
                  className="relative flex-1 flex flex-col justify-end h-full items-center"
                >
                  {/* Chart Bar (Hover scale and brightness states removed) */}
                  <div
                    className="
                      w-full
                      rounded-t-md
                      bg-gradient-to-t
                      from-blue-700
                      via-blue-500
                      to-cyan-300
                      origin-bottom
                    "
                    style={{
                      height: `${Math.max(8, (item.count / max) * 100)}%`,
                      transition: "height .6s ease",
                    }}
                  />

                  {/* X-Axis Label */}
                  <div className="mt-2 text-[11px] text-slate-400 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* X-Axis Global Label */}
      <div className="mt-3 text-center text-xs tracking-wide text-slate-500">
        Days
      </div>
    </div>
  );
}