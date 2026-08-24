"use client";

import { login, type UserRole } from "@/lib/auth/auth";
import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

function routeByRole(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/developer";
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("idproofpro_token");
    const role = localStorage.getItem("idproofpro_role") as UserRole | null;

    if (!token || !role) return;

    router.replace(routeByRole(role));
  }, [router]);

  const validate = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }

    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      router.replace(routeByRole(result.user?.role || "developer"));
      return;
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
    >
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">
          Work Email
        </label>

        <div
          className={`
            flex items-center gap-3 rounded-xl border px-4 py-4 bg-[#020d1b]
            ${
              error ? "border-red-500" : "border-slate-800"
            }
          `}
        >
          <Mail
            size={18}
            className="text-slate-500"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="name@company.com"
            className="w-full bg-transparent outline-none placeholder:text-slate-600 text-white"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between">
          <label className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Password
          </label>

          <button
            type="button"
            className="text-sm text-blue-400"
          >
            Forgot Password?
          </button>
        </div>

        <div
  className={`
    flex items-center gap-3 rounded-xl border px-4 py-4 bg-[#020d1b]
    ${
      error ? "border-red-500" : "border-slate-800"
    }
  `}
>
  <Lock
    size={18}
    className="text-slate-500"
  />

  <input
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    className="w-full bg-transparent outline-none placeholder:text-slate-600 text-white"
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="text-slate-500 hover:text-slate-300"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        disabled={loading}
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] py-4 text-lg font-medium shadow-[0_10px_40px_rgba(37,99,235,0.25)] transition-all hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            Sign in to Console
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="text-center">
        <div className="text-center space-y-3">

  <button
    type="button"
    className="
    text-sm
    text-slate-500
    hover:text-slate-300
    "
  >
    Need access? Contact administrator
  </button>

  <div>
    <a
      href="/register"
      className="
      text-sm
      text-blue-400
      hover:text-blue-300
      "
    >
      New user? Register here
    </a>
  </div>

</div>
      </div>
    </form>
  );
}