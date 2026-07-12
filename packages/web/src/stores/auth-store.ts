import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@transitops/shared/schemas/auth.schema";

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  } | null;
  setAuth: (
    token: string | null,
    user: AuthState["user"] | null
  ) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
