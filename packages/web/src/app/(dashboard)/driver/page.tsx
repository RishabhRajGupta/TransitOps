"use client";

import { RouteGuard } from "../../../components/auth/route-guard";

export default function DriverDashboard() {
  return (
    <RouteGuard allowedRoles={["driver"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Driver Dashboard</h1>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Trips</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Welcome to the Driver dashboard. View your active trips, complete trips, and log fuel.</p>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
