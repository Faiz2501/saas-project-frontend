"use client";

import { useEffect, useState } from "react";
import { getRole, getToken, type UserRole } from "@/lib/auth/auth";

export function useAuth() {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setRole(getRole());
    setIsAuthenticated(!!getToken());
    setReady(true);
  }, []);

  return {
    ready,
    role,
    isAuthenticated,
  };
}