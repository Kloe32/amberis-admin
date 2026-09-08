import { createContext, useContext, useState } from "react";
import type { ReactNode, FC } from "react";
import {
  getItemFromLocalStorage,
  removeItemFromLocalStorage,
  setItemInLocalStorage,
} from "../helper/helper";
import type { Admin, AuthState } from "../types/auth.type";
import { STORAGE_KEY } from "../config/config";

interface AuthContextType extends AuthState {
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = getItemFromLocalStorage(STORAGE_KEY.ADMIN_AUTH);
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return getItemFromLocalStorage(STORAGE_KEY.ADMIN_TOKEN);
  });

  const login = (token: string, admin: Admin): void => {
    setItemInLocalStorage(STORAGE_KEY.ADMIN_TOKEN, token);
    setItemInLocalStorage(STORAGE_KEY.ADMIN_AUTH, admin);
    setToken(token);
    setAdmin(admin);
  };

  const logout = (): void => {
    removeItemFromLocalStorage(STORAGE_KEY.ADMIN_TOKEN);
    removeItemFromLocalStorage(STORAGE_KEY.ADMIN_AUTH);
    setToken(null);
    setAdmin(null);
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
