"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getRole } from "@/lib/auth/auth";

export default function SettingsPage() {
  const [profileOpen, setProfileOpen] =
    useState(true);

  const [securityOpen, setSecurityOpen] =
    useState(false);

  const role =
    typeof window !== "undefined"
      ? getRole()
      : "developer";

  return (
    <div className="max-w-4xl mx-auto py-8">

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your account preferences.
        </p>
      </div>

      {/* PROFILE */}

      <div
        className="
        overflow-hidden

        rounded-3xl

        border
        border-[var(--border)]

        bg-[var(--surface)]

        mb-6
        "
      >
        <button
          onClick={() =>
            setProfileOpen(
              !profileOpen
            )
          }
          className="
          flex
          w-full
          items-center
          justify-between

          px-8
          py-6

          text-left
          "
        >
          <div>
            <h2 className="text-xl font-semibold">
              Profile
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Personal information
            </p>
          </div>

          <ChevronDown
            className={`transition-transform ${
              profileOpen
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div className="px-8 pb-8">

            <div className="grid grid-cols-2 gap-4">

              <input
                defaultValue="Current User"
                className="
                rounded-2xl
                bg-[#020d1b]
                border
                border-slate-800
                p-4
                "
              />

              <input
                defaultValue={`${role}@company.com`}
                className="
                rounded-2xl
                bg-[#020d1b]
                border
                border-slate-800
                p-4
                "
              />

            </div>

            <div
              className="
              mt-4

              rounded-2xl

              border
              border-slate-800

              bg-[#020d1b]

              p-4
              "
            >
              <p className="text-sm text-slate-400">
                Account Role
              </p>

              <p className="mt-1 capitalize">
                {role}
              </p>
            </div>

            <button
              className="
              mt-6

              rounded-xl

              bg-blue-600

              px-5
              py-3

              hover:bg-blue-500
              "
            >
              Save Changes
            </button>

          </div>
        )}
      </div>

      {/* SECURITY */}

      <div
        className="
        overflow-hidden

        rounded-3xl

        border
        border-[var(--border)]

        bg-[var(--surface)]
        "
      >
        <button
          onClick={() =>
            setSecurityOpen(
              !securityOpen
            )
          }
          className="
          flex
          w-full
          items-center
          justify-between

          px-8
          py-6

          text-left
          "
        >
          <div>
            <h2 className="text-xl font-semibold">
              Security
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Password and account access
            </p>
          </div>

          <ChevronDown
            className={`transition-transform ${
              securityOpen
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {securityOpen && (
          <div className="px-8 pb-8">

            <div className="space-y-4">

              <input
                type="password"
                placeholder="Current Password"
                className="
                w-full

                rounded-2xl

                border
                border-slate-800

                bg-[#020d1b]

                p-4
                "
              />

              <input
                type="password"
                placeholder="New Password"
                className="
                w-full

                rounded-2xl

                border
                border-slate-800

                bg-[#020d1b]

                p-4
                "
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="
                w-full

                rounded-2xl

                border
                border-slate-800

                bg-[#020d1b]

                p-4
                "
              />

            </div>

            <button
              className="
              mt-6

              rounded-xl

              bg-blue-600

              px-5
              py-3

              hover:bg-blue-500
              "
            >
              Update Password
            </button>

          </div>
        )}
      </div>

    </div>
  );
}