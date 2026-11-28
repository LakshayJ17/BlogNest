import axios from "axios";
import { BACKEND_URL } from "../config";
import { readToken } from "./session";

export const API_BASE = `${BACKEND_URL}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE,
  // The backend host can take a while to wake up.
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type SignOutReason = "expired" | "suspended";

let unauthorizedHandler: ((reason: SignOutReason) => void) | null = null;

/** Called when the API rejects the stored token (expired, revoked, or the account was suspended). */
export function onUnauthorized(handler: (reason: SignOutReason) => void) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && readToken()) {
      unauthorizedHandler?.(error.response.data?.code === "account_suspended" ? "suspended" : "expired");
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === "string" && message) return message;
    if (error.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
    if (!error.response) return "Can't reach the server. Check your connection and try again.";
  }
  return fallback;
}

export function isStatus(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}
