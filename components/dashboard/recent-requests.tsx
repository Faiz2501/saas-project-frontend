"use client";

type RecentRequestRow = {
  timestamp: string;
  service: string;
  requestId: string;
  status: "Success" | "Failed";
  latency: string;
};

export default function RecentRequests({
  rows,
}: {
  rows: RecentRequestRow[];
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          Recent Requests
        </h3>
        <button className="text-blue-500 text-sm hover:text-blue-400 transition-all">
          VIEW ALL LOGS
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-gray-400">No recent requests.</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Service</th>
              <th className="p-4">Request ID</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Latency</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] hover:bg-[var(--hover-surface)] transition-all"
              >
                <td className="p-4 text-gray-400">{row.timestamp}</td>
                <td className="p-4">{row.service}</td>
                <td className="p-4 text-gray-500">{row.requestId}</td>
                <td className="p-4">
                  <span
                    className={
                      row.status === "Success"
                        ? "px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20"
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-4 text-right">{row.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}