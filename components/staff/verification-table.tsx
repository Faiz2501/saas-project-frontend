const rows = [
  {
    id: "VRF-001",
    service: "GSTIN Verification",
    customer: "Rahul Sharma",
    status: "Success",
  },
  {
    id: "VRF-002",
    service: "PAN Verification",
    customer: "Ananya Roy",
    status: "Pending",
  },
  {
    id: "VRF-003",
    service: "Penny Drop",
    customer: "Amit Verma",
    status: "Failed",
  },
];

export default function VerificationTable() {
  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="p-5 text-left">
              Verification ID
            </th>
            <th className="p-5 text-left">
              Service
            </th>
            <th className="p-5 text-left">
              Customer
            </th>
            <th className="p-5 text-left">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--border)]"
            >
              <td className="p-5">
                {row.id}
              </td>

              <td className="p-5">
                {row.service}
              </td>

              <td className="p-5">
                {row.customer}
              </td>

              <td className="p-5">
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}