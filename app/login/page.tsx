"use client";

import LoginForm from "@/components/auth/login-form";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div
          className="
          hidden
          lg:flex
          flex-col
          justify-center
          px-24
          bg-gradient-to-br
          from-[#06101f]
          via-[#030d1c]
          to-black
        "
        >
          <div className="max-w-[460px]">
            <h1
              className="
              text-7xl
              font-semibold
              tracking-tight
              text-white
              "
            >
              <img
                src="/logo-white.png"
                alt="IDProofPro"
                className="w-[680px]"
              />
            </h1>

            <p
              className="
              mt-10
              text-3xl
              font-medium
              leading-tight
              text-white
              "
            >
              Enterprise Identity
              <br />
              Verification
            </p>

            <p
              className="
              mt-8
              max-w-md
              text-lg
              leading-9
              text-slate-400
              "
            >
              Verify people, businesses and financial records through a single
              compliance infrastructure.
            </p>

            <br />

            <p className="text-sm text-slate-500">
              A Product by{" "}
              <a
                href="https://techgencybersolution.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-white"
              >
                Techgen Cyber Solution Pvt. Ltd.
              </a>
            </p>

            <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
              <a
                href="https://idproofpro.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-white"
              >
                Privacy Policy
              </a>
              <span>•</span>
              <a
                href="https://idproofpro.com/terms-condition/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-white"
              >
                Terms &amp; Conditions
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="
          flex
          items-center
          justify-center
          px-6
          bg-[#030d1c]
        "
        >
          <div
            className="
            w-full
            max-w-[340px]
            rounded-[24px]
            border
            border-slate-800
            bg-[#071427]
            p-4
          "
          >
            <div className="text-center">
              <div
                className="
                mx-auto
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-800
                bg-[#0b1d31]
              "
              >
                <Shield size={24} />
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Sign In
              </h2>

              <p className="mt-3 text-slate-400">
                Secure access to your verification console.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}