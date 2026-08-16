import axios from "axios";
import { tokenStore } from "./token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status as number | undefined;
    const url = String(error.config?.url ?? "");
    const isAuthAttempt = url.includes("/api/auth/login") || url.includes("/api/auth/register");
    if (status === 401 && !isAuthAttempt && typeof window !== "undefined") {
      tokenStore.clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export const AI_BUSY_MESSAGE = "The AI is busy right now — please try again in a minute.";

export function apiErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as { message?: string } | undefined;
    if (status === 429) return data?.message || AI_BUSY_MESSAGE;
    return data?.message ?? err.message;
  }
  return "Something went wrong";
}
