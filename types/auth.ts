// frontend/types/auth.ts  (replace entire empty file)

export type Role = "SUPER_ADMIN" | "STAFF" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardData {
  wallet: { id: string; userId: string; balance: number } | null;
  apiKeys: ApiKey[];
  totalVerifications: number;
  totalTransactions: number;
}