"use client";

interface Props {
  show: boolean;
  message: string;
}

export default function Toast({
  show,
  message,
}: Props) {
  if (!show) return null;

  return (
    <div
      className="
      fixed
      bottom-6
      right-6
      z-50

      rounded-sm

      bg-emerald-600

      px-5
      py-3

      text-white

      shadow-lg
      "
    >
      {message}
    </div>
  );
}