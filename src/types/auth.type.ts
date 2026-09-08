export type AdminRole = "SUPER_ADMIN" | "PRODUCT_MANAGER" | "CUSTOMER_SUPPORT";

export interface Admin {
  id: string;
  name: string;
  email: string;
  admin_role: AdminRole;
}

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: Admin;
  message: string;
}
