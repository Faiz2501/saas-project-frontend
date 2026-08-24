export default function VerificationHealth({
  total,
  success,
  failed,
}: {
  total: number;
  success: number;
  failed: number;
}) {
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
  const failedRate = total > 0 ? Math.round((failed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h3 className="text-xl font-semibold">Verification Health</h3>

      <div className="mt-2 text-sm text-[var(--foreground-muted)]">
        {total} total verifications
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <div className="flex justify-between">
            <span>Success Rate</span>
            <span>{successRate}%</span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${successRate}%` }}
            />
          </div>

          <div className="mt-2 text-sm text-[var(--foreground-muted)]">
            {success} successful requests
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <span>Failed Requests</span>
            <span>{failedRate}%</span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-red-500"
              style={{ width: `${failedRate}%` }}
            />
          </div>

          <div className="mt-2 text-sm text-[var(--foreground-muted)]">
            {failed} failed requests
          </div>
        </div>
      </div>
    </div>
  );
}