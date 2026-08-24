"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/topbar/topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-[260px]">
        <Topbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}