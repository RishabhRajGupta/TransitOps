import { NextRequest, NextResponse } from "next/server";
import { toErrorResponse } from "../lib/errors";
import { logger } from "../lib/logger";
import { extractUser, AuthUser } from "./auth";

type ApiHandlerContext = {
  params: Record<string, string>;
  user?: AuthUser;
};

type ApiHandler = (
  req: NextRequest,
  context: ApiHandlerContext
) => Promise<NextResponse> | NextResponse;

interface ApiHandlerOptions {
  authenticate?: boolean;
}

export function withApiHandler(handler: ApiHandler, options?: ApiHandlerOptions) {
  return async (
    req: NextRequest,
    context: { params?: Promise<Record<string, string>> | Record<string, string> }
  ) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    let userId: string | undefined;
    let userRole: string | undefined;

    try {
      const resolvedParams = context.params
        ? context.params instanceof Promise
          ? await context.params
          : context.params
        : {};

      const handlerContext: ApiHandlerContext = {
        params: resolvedParams,
      };

      if (options?.authenticate) {
        const user = await extractUser(req);
        handlerContext.user = user;
        userId = user.id;
        userRole = user.role;
      }

      const response = await handler(req, handlerContext);

      const duration = Date.now() - startTime;
      logger.info("Request completed", {
        requestId,
        method: req.method,
        url: req.nextUrl.pathname,
        status: response.status,
        duration: `${duration}ms`,
        userId,
        userRole,
      });

      return response;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const errorResponse = toErrorResponse(err);
      
      // Log warning for business rules/auth, error for internal bugs
      const status = errorResponse.status;
      if (status >= 500) {
        logger.error("Request failed", {
          requestId,
          method: req.method,
          url: req.nextUrl.pathname,
          status,
          duration: `${duration}ms`,
          userId,
          userRole,
          error: err.message,
          stack: err.stack,
        });
      } else {
        logger.warn("Request rejected", {
          requestId,
          method: req.method,
          url: req.nextUrl.pathname,
          status,
          duration: `${duration}ms`,
          userId,
          userRole,
          error: err.message,
        });
      }

      return errorResponse;
    }
  };
}
