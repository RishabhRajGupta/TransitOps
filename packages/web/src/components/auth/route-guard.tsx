"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { UserRole } from "@transitops/shared/schemas/auth.schema";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their respective dashboard
      switch (user.role) {
        case "fleet_manager":
          router.push("/fleet-manager");
          break;
        case "driver":
          router.push("/driver");
          break;
        case "safety_officer":
          router.push("/safety-officer");
          break;
        case "financial_analyst":
          router.push("/financial-analyst");
          break;
        default:
          router.push("/");
      }
      return;
    }

    setAuthorized(true);
  }, [user, allowedRoles, router, pathname]);

  if (!authorized) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
