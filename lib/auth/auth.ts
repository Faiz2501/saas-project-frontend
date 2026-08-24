"use client";

import api from "@/lib/api/axios";

export const TOKEN_KEY = "idproofpro_token";
export const ROLE_KEY = "idproofpro_role";
export const USER_KEY = "idproofpro_user";

export type UserRole = "admin" | "staff" | "developer";

type BackendRole = "SUPER_ADMIN" | "STAFF" | "CUSTOMER" | string;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt?: string;
};

function normalizeRole(role?: BackendRole | null): UserRole {
  switch ((role ?? "").toUpperCase()) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "admin";
    case "STAFF":
      return "staff";
    default:
      return "developer";
  }
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString();

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function setSession(token: string, user?: Partial<AuthUser> & { role?: string }) {
  if (typeof window === "undefined") return;

  const role = normalizeRole(user?.role);

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  setCookie("token", token);
  setCookie("role", role);

  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        ...user,
        role,
      })
    );
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);

  deleteCookie("token");
  deleteCookie("role");
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY) as UserRole | null;
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const token = response.data?.access_token || response.data?.token;

  if (!token) {
    throw new Error("Login failed: token not returned");
  }

  setSession(token, { role: "developer" });

  const profileResponse = await api.get("/users/me");
  const backendUser = profileResponse.data as {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: BackendRole;
    createdAt?: string;
  };

  const user: AuthUser = {
    ...backendUser,
    role: normalizeRole(backendUser.role),
  };

  setSession(token, user);

  return {
    token,
    user,
  };
}

export async function hydrateSession() {
  const token = getToken();
  if (!token) return null;

  const storedUser = getStoredUser();
  if (storedUser) return storedUser;

  const response = await api.get("/users/me");
  const backendUser = response.data as {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: BackendRole;
    createdAt?: string;
  };

  const user: AuthUser = {
    ...backendUser,
    role: normalizeRole(backendUser.role),
  };

  setSession(token, user);
  return user;
}

export function logout() {
  clearSession();
}