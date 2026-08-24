"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/topbar/topbar";
import { useAuth } from "@/hooks/use-auth";

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth();

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