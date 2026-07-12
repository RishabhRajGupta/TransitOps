import axios, { AxiosResponse } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { useAuthStore } from "../stores/auth-store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Need this to send the HTTP-only refresh cookie
});

// Request interceptor to add the access token
api.interceptors.request.use((request) => {
  const token = useAuthStore.getState().token;
  if (token && request.headers) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// Function that will be called to refresh authorization
const refreshAuthLogic = (failedRequest: any) =>
  axios
    .post<any>(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    .then((tokenRefreshResponse: AxiosResponse<any>) => {
      const { accessToken } = tokenRefreshResponse.data.data;
      
      // Keep user as is, just update token
      const store = useAuthStore.getState();
      store.setAuth(accessToken, store.user);
      
      failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;
      return Promise.resolve();
    })
    .catch((err) => {
      useAuthStore.getState().clearAuth();
      return Promise.reject(err);
    });

// Instantiate the interceptor for 498 status code
createAuthRefreshInterceptor(api, refreshAuthLogic, {
  statusCodes: [498],
});

export default api;
