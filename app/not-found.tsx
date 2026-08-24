import Link from "next/link";

export default function NotFound() {
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
  className="w-[660px]"
/>

      <h1
        className="
        mt-8

        text-9xl

        font-bold
        "
      >
        404
      </h1>

      <p
        className="
        mt-4

        text-xl

        text-slate-400
        "
      >
        Even our KYC engine couldn't verify this page.
      </p>

      <Link
        href="/"
        className="
        mt-8

        rounded-xl

        bg-blue-600

        px-8
        py-4
        "
      >
        Return Home
      </Link>
    </main>
  );
}