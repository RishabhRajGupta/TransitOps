import swaggerJsdoc from "swagger-jsdoc";
import { vehicleSelectSchema, createVehicleSchema } from "@transitops/shared/schemas/vehicle.schema";
import { driverSelectSchema, createDriverSchema } from "@transitops/shared/schemas/driver.schema";
import { tripSelectSchema, createTripSchema } from "@transitops/shared/schemas/trip.schema";
import { maintenanceSelectSchema, createMaintenanceSchema } from "@transitops/shared/schemas/maintenance.schema";
import { fuelLogSelectSchema, createFuelLogSchema } from "@transitops/shared/schemas/fuel-log.schema";
import { expenseSelectSchema, createExpenseSchema } from "@transitops/shared/schemas/expense.schema";

// Simple mapping helper to mock the OpenAPI conversion of Zod schemas
function zodToOpenApiMock(schema: any) {
  // Return a mock OpenAPI structure based on schema description
  return {
    type: "object",
    properties: {},
  };
}

const generatedSchemas = {
  Vehicle: zodToOpenApiMock(vehicleSelectSchema),
  CreateVehicleInput: zodToOpenApiMock(createVehicleSchema),
  Driver: zodToOpenApiMock(driverSelectSchema),
  CreateDriverInput: zodToOpenApiMock(createDriverSchema),
  Trip: zodToOpenApiMock(tripSelectSchema),
  CreateTripInput: zodToOpenApiMock(createTripSchema),
  MaintenanceLog: zodToOpenApiMock(maintenanceSelectSchema),
  CreateMaintenanceInput: zodToOpenApiMock(createMaintenanceSchema),
  FuelLog: zodToOpenApiMock(fuelLogSelectSchema),
  CreateFuelLogInput: zodToOpenApiMock(createFuelLogSchema),
  Expense: zodToOpenApiMock(expenseSelectSchema),
  CreateExpenseInput: zodToOpenApiMock(createExpenseSchema),
};

export const openApiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "TransitOps API", version: "0.1.0" },
    components: {
      schemas: generatedSchemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/app/api/**/*.ts"],
});
