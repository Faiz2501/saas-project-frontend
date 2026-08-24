type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description: string | null;
  createdAt: string;
};

function formatMoney(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RecentTransactions({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <span className="text-sm text-[var(--foreground-muted)]">
          Latest {transactions.length}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {transactions.length === 0 ? (
          <div className="text-sm text-[var(--foreground-muted)]">
            No transactions found.
          </div>
        ) : (
          transactions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {item.description || item.type}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  {item.id.slice(0, 12)} · {item.userId.slice(0, 8)} ·{" "}
                  {formatDate(item.createdAt)}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={
                    item.type === "CREDIT"
                      ? "font-semibold text-emerald-400"
                      : "font-semibold text-red-400"
                  }
                >
                  {item.type === "CREDIT" ? "+" : "-"}
                  {formatMoney(item.amount)}
                </p>

                <span
                  className={
                    item.type === "CREDIT"
                      ? "mt-1 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                      : "mt-1 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300"
                  }
                >
                  {item.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}