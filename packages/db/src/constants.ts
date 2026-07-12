export const USER_ROLES = ["fleet_manager", "driver", "safety_officer", "financial_analyst"] as const;
export const VEHICLE_STATUS = ["available", "on_trip", "in_shop", "retired"] as const;
export const VEHICLE_TYPES = ["truck", "van", "pickup", "trailer"] as const;
export const DRIVER_STATUS = ["available", "on_trip", "off_duty", "suspended"] as const;
export const TRIP_STATUS = ["draft", "dispatched", "completed", "cancelled"] as const;
export const MAINTENANCE_STATUS = ["active", "closed"] as const;
export const EXPENSE_CATEGORY = ["toll", "fine", "parking", "other"] as const;
