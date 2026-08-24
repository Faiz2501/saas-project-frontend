"use client";

type TransactionRow = {
  type: "Recharge" | "Usage" | "Refund";
  date: string;
  description: string;
  amount: string;
  status: "Completed" | "Charged" | "Refunded";
};

interface Props {
  rows: TransactionRow[];
}

export default function TransactionsTable({ rows }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {status}
          </span>
        );
      case "Charged":
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {status}
          </span>
        );
      case "Refunded":
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">Recent Transactions</h3>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-gray-400">No transactions found.</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((t, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] hover:bg-[var(--hover-surface)] transition-all"
              >
                <td className="p-4 text-gray-400">{t.date}</td>
                <td className="p-4">{t.description}</td>
                <td className="p-4">{t.amount}</td>
                <td className="p-4">{getStatusBadge(t.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}