import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="
      min-h-screen

      flex
      flex-col

      items-center
      justify-center

      bg-black

      text-white
      "
    >
      <img
  src="/logo-gradient.png"
  alt="IDProofPro"
  className="w-[820px]"
/>

      <h1
        className="
        mt-8

        text-9xl

        font-bold
        "
      >
        IDProofPro
      </h1>

      <p
        className="
        mt-4

        text-slate-400
        "
      >
        Enterprise Identity Infrastructure
      </p>

      <Link
        href="/login"
        className="
        mt-10

        rounded-xl

        bg-blue-600

        px-8
        py-4

        font-medium

        hover:bg-blue-500
        "
      >
        Access Console
      </Link>
    </main>
  );
}