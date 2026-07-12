"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setAuth, clearAuth, token } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      try {
        // Attempt to fetch current user (restores session if token is valid or silently refreshes)
        const response = await api.get<any>("/auth/me");
        const { user } = response.data.data;
        // Keep existing token if any (it might have been refreshed by the interceptor)
        setAuth(useAuthStore.getState().token, user);
      } catch (error) {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    }

    initAuth();
  }, [setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
