"use client";

import api from "@/lib/api/axios";
import Link from "next/link";
import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "details" | "otp";

export default function RegisterForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailOtp, setEmailOtp] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [step, setStep] = useState<Step>("details");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const response = await api.post("/auth/register/start", {
        firstName,
        lastName,
        email,
        password,
      });

      setRegistrationId(response.data.registrationId);
      setStep("otp");
      setSuccess("Email OTP sent. Enter it to continue.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!registrationId) {
        setError("Registration session not found. Please start again.");
        return;
      }

      await api.post("/auth/register/resend", {
        registrationId,
      });

      setSuccess("OTP resent successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!registrationId) {
        setError("Registration session not found. Please start again.");
        return;
      }

      await api.post("/auth/register", {
        registrationId,
        emailOtp,
      });

      router.push("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "details") {
      await sendOtp();
      return;
    }

    await completeRegistration();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={step === "otp"}
            className="w-full rounded-xl border border-slate-800 bg-[#020d1b] py-4 pl-10 pr-4 outline-none disabled:opacity-60"
          />
        </div>

        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={step === "otp"}
            className="w-full rounded-xl border border-slate-800 bg-[#020d1b] py-4 pl-10 pr-4 outline-none disabled:opacity-60"
          />
        </div>
      </div>

      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          size={18}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step === "otp"}
          className="w-full rounded-xl border border-slate-800 bg-[#020d1b] py-4 pl-10 pr-4 outline-none disabled:opacity-60"
        />
      </div>

      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          size={18}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={step === "otp"}
          className="w-full rounded-xl border border-slate-800 bg-[#020d1b] py-4 pl-10 pr-4 outline-none disabled:opacity-60"
        />
      </div>

      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          size={18}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={step === "otp"}
          className="w-full rounded-xl border border-slate-800 bg-[#020d1b] py-4 pl-10 pr-4 outline-none disabled:opacity-60"
        />
      </div>

      {step === "otp" && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#06111f] p-4">
          <p className="flex items-center gap-2 text-sm text-slate-300">
            <ShieldCheck size={16} />
            We sent an OTP to your email. Enter it below.
          </p>

          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Email OTP
            </label>
            <input
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              placeholder="123456"
              className="w-full rounded-xl border border-slate-800 bg-[#020d1b] p-4 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={resendOtp}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-blue-400 disabled:opacity-60"
          >
            <RefreshCw size={14} />
            Resend OTP
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300 whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 whitespace-pre-line">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-medium"
      >
        {loading
          ? "Please wait..."
          : step === "details"
          ? "Send OTP"
          : "Create Account"}
        <ArrowRight size={18} />
      </button>

      <div className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400">
          Sign In
        </Link>
      </div>
    </form>
  );
}