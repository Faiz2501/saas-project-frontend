"use client";

type Props = {
  service: string;
  result: any;
};

type Row = {
  label: string;
  value: any;
};

function flattenObject(
  obj: any,
  prefix = ""
): Row[] {
  const ignored = [
    "code",
    "responseTime",
    "executionTime",
    "success",
    "statusCode",
    "status",
    "message",
    "requestId",
    "request_id",
    "timestamp",
  ];

  let rows: Row[] = [];

  if (!obj || typeof obj !== "object") {
    return rows;
  }

  for (const key in obj) {
    if (ignored.includes(key)) continue;

    const value = obj[key];

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const label = prefix
      ? `${prefix} ${key}`
      : key;

    // Ignore empty objects like {}
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      rows.push({
        label,
        value: value
          .map((item) =>
            typeof item === "object"
              ? JSON.stringify(item)
              : item
          )
          .join("\n")
      });
    } else if (typeof value === "object") {
      rows = rows.concat(
        flattenObject(value, label)
      );
    } else {
      rows.push({
        label,
        value:
          typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : value,
      });
    }
  }

  return rows;
}

function formatLabel(label: string) {
  return label
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\bresponse\b/gi, "")
    .replace(/\bdata\b/gi, "")
    .replace(/\bresult\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getValueColor(value: any) {
  const text = String(value).toUpperCase();

  if (
    text.includes("VALID") ||
    text.includes("SUCCESS") ||
    text.includes("ACTIVE") ||
    text.includes("VERIFIED") ||
    text === "YES"
  ) {
    return "text-green-400";
  }

  if (
    text.includes("FAILED") ||
    text.includes("INVALID") ||
    text.includes("INACTIVE") ||
    text.includes("EXPIRED") ||
    text === "NO"
  ) {
    return "text-red-400";
  }

  return "text-white";
}

function copyJson(data: any) {
  navigator.clipboard.writeText(
    JSON.stringify(data, null, 2)
  );
}

export default function VerificationResult({
  service,
  result,
}: Props) {
  const fields = flattenObject(result);

  return (
    <div className="mt-6 rounded-2xl border border-slate-700 bg-[#08111d] p-6">

      <div className="mb-6 border-b border-slate-700 pb-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-emerald-400">
          ✅ Verification Successful
        </h2>

        <div className="mt-1">
          <p className="text-slate-300">
            {service}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Verified on {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

        {fields.length === 0 ? (
          <p className="text-slate-400">
            No verification data found.
          </p>
        ) : (
          fields.map((field) => (
            <div
              key={`${field.label}-${field.value}`}
              className="flex items-start justify-between rounded-xl border border-slate-700 bg-[#0c1726] px-4 py-3"
            >
              <span className="w-2/5 text-sm text-slate-400">
                {formatLabel(field.label)}
              </span>

              <span className={`w-3/5 whitespace-pre-wrap break-words text-right text-sm ${getValueColor(field.value)}`}
              >
                {typeof field.value === "string"
                  ? field.value
                  : JSON.stringify(field.value, null, 2)}
              </span>
            </div>
          ))
        )}

      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => copyJson(result)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
        >
          Copy JSON
        </button>
      </div>

      <details className="mt-8">

        <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
          View Complete Response
        </summary>

        <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl border border-slate-700 bg-[#020817] p-4 text-xs text-green-300 whitespace-pre-wrap break-all">
{JSON.stringify(result, null, 2)}
        </pre>

      </details>

    </div>
  );
}