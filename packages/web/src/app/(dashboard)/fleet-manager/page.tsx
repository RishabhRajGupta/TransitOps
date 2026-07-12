"use client";

import { RouteGuard } from "../../../components/auth/route-guard";

export default function FleetManagerDashboard() {
  return (
    <RouteGuard allowedRoles={["fleet_manager"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Fleet Manager Dashboard</h1>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Welcome to the Fleet Manager dashboard. Manage vehicles, drivers, trips, and overall fleet health.</p>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
