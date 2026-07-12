import { SharedErrorResponse } from "./errors";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public data: SharedErrorResponse
  ) {
    super(data.error.message || `API request failed with status ${status}`);
  }
}

export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errorData: SharedErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: {
          code: "HTTP_ERROR",
          message: response.statusText,
        },
      };
    }
    throw new ApiClientError(response.status, errorData);
  }

  // Handle No Content / Empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
