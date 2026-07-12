"use client";

import { RouteGuard } from "../../components/auth/route-guard";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import "./layout.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-container">
            {children}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
