interface WalletStatsProps {
  todaySpend: number;
  monthlySpend: number;
  averageDaily: number;
}

export default function WalletStats({
  todaySpend,
  monthlySpend,
  averageDaily,
}: WalletStatsProps) {
  const fmt = (value: number) =>
    `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-[#0b1d31] p-5">
        <p className="text-xs uppercase tracking-wider text-slate-500">Today Spend</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">{fmt(todaySpend)}</h3>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0b1d31] p-5">
        <p className="text-xs uppercase tracking-wider text-slate-500">Monthly Spend</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">{fmt(monthlySpend)}</h3>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0b1d31] p-5">
        <p className="text-xs uppercase tracking-wider text-slate-500">Average Daily</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">{fmt(averageDaily)}</h3>
      </div>
    </div>
  );
}