"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useState } from "react";
import SearchBar from "./search-bar";
import UserMenu from "./user-menu";
import NotificationsMenu from "./notifications-menu";

type OpenDropdown = "notifications" | "avatar" | null;

export default function Topbar() {
  const pathname = usePathname() ?? "";
  const portalTitle = pathname.startsWith("/admin")
    ? "Admin Portal"
    : pathname.startsWith("/staff")
    ? "Staff Portal"
    : "Customer Portal";

  const topbarDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleOutsideClick = (event: MouseEvent) => {
    if (
      topbarDropdownRef.current &&
      !topbarDropdownRef.current.contains(event.target as Node)
    ) {
      closeDropdowns();
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  };
}, []);

  // 1. Initialize the state hook
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  // 2. Define the close handler function
  const closeDropdowns = () => setOpenDropdown(null);

  return (
    <header
      className="
      sticky
      top-0
      z-40
      h-16
      border-b
      border-[var(--border)]
      bg-[rgba(5,20,36,0.75)]
      backdrop-blur-xl
      "
    >
      <div
        className="
        h-full
        px-6
        flex
        items-center
        justify-between
        "
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            
            <h2 className="font-semibold text-lg">
              {portalTitle}
            </h2>
          </div>
          {/* <SearchBar /> */}
        </div>

        <div className="flex items-center gap-3">
          {/* This segment will now work perfectly */}
          <NotificationsMenu
            open={openDropdown === "notifications"}
            onOpen={() => setOpenDropdown("notifications")}
            onClose={closeDropdowns}
          />

          <UserMenu
            open={openDropdown === "avatar"}
            onOpen={() => setOpenDropdown("avatar")}
            onClose={closeDropdowns}
          />
        </div>
      </div>
    </header>
  );
}