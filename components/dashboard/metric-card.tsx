import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  icon: LucideIcon;
  danger?: boolean;
  large?: boolean;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  progress,
  icon: Icon,
  danger,
  large,
}: MetricCardProps) {
  return (
    <div
      className="
        bg-[var(--surface)]
        border
        border-[var(--border)]

        rounded-md

        p-8

        cursor-pointer

        transition-all

        duration-200

        hover:bg-[var(--hover-surface)]

        hover:border-blue-500/30

        shadow-[0_24px_80px_rgba(15,23,42,0.08)]
        h-full
      "
    >
      <div className="flex items-start justify-between gap-4">
        <p
          className="
          uppercase
          tracking-wider
          text-sm font-medium
          text-[var(--foreground-muted)]
          "
        >
          {title}
        </p>

        <Icon
          size={20}
          className={
            danger
              ? "text-red-400"
              : "text-[var(--foreground-muted)]"
          }
        />
      </div>

      <div className="mt-6 space-y-4">
        <h3
          className={`text-5xl font-semibold ${
          large ? "text-7xl font-semibold tracking-tight text-white" : "text-4xl font-semibold text-white"
          } ${
            danger ? "text-red-400" : ""
          }`}
        >
          {value}
        </h3>

        {subtitle && (
          <p
            className="
            mt-2
            text-sm
            text-[var(--foreground-muted)]
            "
          >
            {subtitle}
          </p>
        )}
        {progress !== undefined && (
          <div
            className="
        w-full
        h-2.5
        bg-[var(--surface-hover)]
        rounded-full
        overflow-hidden
        mt-4
        "
          >
            <div
              className="h-full bg-blue-600"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}