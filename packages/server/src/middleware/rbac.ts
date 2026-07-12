import { UserRole } from "@transitops/shared/schemas/auth.schema";
import { AuthUser } from "./auth";
import { AppError } from "../lib/errors";

export function requireRole(user: AuthUser, allowed: UserRole[]) {
  if (!allowed.includes(user.role)) {
    throw new AppError(
      "FORBIDDEN",
      `Requires one of: ${allowed.join(", ")}`,
      403
    );
  }
}
