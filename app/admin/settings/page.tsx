"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import api from "@/lib/api/axios";

type MeUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
};

export default function SettingsPage() {
  const [profileOpen, setProfileOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [user, setUser] = useState<MeUser | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setProfileError("");
        setProfileSuccess("");
        setPasswordError("");
        setPasswordSuccess("");

        const response = await api.get("/users/me");
        const data = response.data as MeUser;

        setUser(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setEmail(data.email ?? "");
      } catch (err: any) {
        setProfileError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await api.patch("/users/me", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      const updated = response.data as MeUser;
      setUser(updated);
      setFirstName(updated.firstName ?? "");
      setLastName(updated.lastName ?? "");
      setEmail(updated.email ?? "");

      setProfileSuccess("Profile updated successfully.");
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    try {
      setSavingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      if (!currentPassword.trim()) {
        setPasswordError("Current password is required.");
        return;
      }

      if (!newPassword.trim()) {
        setPasswordError("New password is required.");
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("New password and confirm password do not match.");
        return;
      }

      const response = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(
        response.data?.message || "Password updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-slate-400">Manage your account preferences.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-slate-400">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={18} />
            Loading profile...
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex w-full items-center justify-between px-8 py-6 text-left"
            >
              <div>
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Personal information
                </p>
              </div>

              <ChevronDown
                className={`transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="px-8 pb-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                  />

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                  />

                  <div className="rounded-2xl border border-slate-800 bg-[#020d1b] p-4">
                    <p className="text-sm text-slate-400">Account Role</p>
                    <p className="mt-1 capitalize text-white">
                      {user?.role ?? "CUSTOMER"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>

                {(profileError || profileSuccess) && (
                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                      profileError
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {profileError || profileSuccess}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <button
              onClick={() => setSecurityOpen(!securityOpen)}
              className="flex w-full items-center justify-between px-8 py-6 text-left"
            >
              <div>
                <h2 className="text-xl font-semibold">Security</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Password and account access
                </p>
              </div>

              <ChevronDown
                className={`transition-transform ${
                  securityOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {securityOpen && (
              <div className="px-8 pb-8">
                <div className="space-y-4">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full rounded-2xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full rounded-2xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full rounded-2xl border border-slate-800 bg-[#020d1b] p-4 text-white outline-none transition focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handlePasswordSave}
                  disabled={savingPassword}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>

                {(passwordError || passwordSuccess) && (
                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                      passwordError
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {passwordError || passwordSuccess}
                  </div>
                )}

                <p className="mt-3 text-sm text-slate-500">
                  Use your current password to update this account.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}