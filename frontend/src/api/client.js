import axios from "axios";
import { getStoredAuth } from "../utils/authStorage";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5291/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  if (auth?.userId) {
    config.headers["X-User-Id"] = String(auth.userId);
  }

  return config;
});

export default apiClient;
