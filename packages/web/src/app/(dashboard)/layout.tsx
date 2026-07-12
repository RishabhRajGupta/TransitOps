"use client";

import { useAuthStore } from "../../stores/auth-store";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { api } from "../../lib/api";
import { RouteGuard } from "../../components/auth/route-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <RouteGuard>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
            <h1 className="text-xl font-bold text-gray-900 truncate">TransitOps Dashboard</h1>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-white space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md bg-gray-100">
                Dashboard Overview
              </div>
            </nav>
          </div>
          <div className="flex items-center p-4 border-t border-gray-200">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500 truncate capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
