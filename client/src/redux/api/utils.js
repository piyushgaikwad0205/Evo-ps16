import axios from "axios";

const RAW_BASE = process.env.REACT_APP_API_URL;
const BASE_URL = RAW_BASE && RAW_BASE.trim().length > 0 ? RAW_BASE : "";
const ADMIN_URL = BASE_URL ? `${BASE_URL}/admin` : "/admin";
const MESSAGES_URL = BASE_URL ? `${BASE_URL}/messages` : "/messages";

const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const authInterceptor = (req) => {
  const accessToken = safeParse("profile")?.accessToken;
  if (accessToken) {
    req.headers.Authorization = `Bearer ${accessToken}`;
  }
  return req;
};

const adminAuthInterceptor = (req) => {
  const accessToken = safeParse("admin")?.accessToken;
  if (accessToken) {
    req.headers.Authorization = `Bearer ${accessToken}`;
  }
  return req;
};

export const API = axios.create({
  baseURL: BASE_URL,
});

export const ADMIN_API = axios.create({
  baseURL: ADMIN_URL,
});

export const COMMUNITY_API = axios.create({
  baseURL: BASE_URL,
});

export const MESSAGES_API = axios.create({
  baseURL: MESSAGES_URL,
});

export const FACULTY_API = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/faculty` : "/faculty",
});

API.interceptors.request.use((req) => {
  // Don't set Content-Type for FormData - let axios handle it automatically
  if (!(req.data instanceof FormData)) {
    req.headers["Content-Type"] = req.headers["Content-Type"] || "application/json";
  }
  return authInterceptor(req);
});
ADMIN_API.interceptors.request.use((req) => {
  // Don't set Content-Type for FormData - let axios handle it automatically
  if (!(req.data instanceof FormData)) {
    req.headers["Content-Type"] = req.headers["Content-Type"] || "application/json";
  }
  return adminAuthInterceptor(req);
});
COMMUNITY_API.interceptors.request.use((req) => {
  // Don't set Content-Type for FormData - let axios handle it automatically
  if (!(req.data instanceof FormData)) {
    req.headers["Content-Type"] = req.headers["Content-Type"] || "application/json";
  }
  return authInterceptor(req);
});
MESSAGES_API.interceptors.request.use((req) => {
  req.headers["Content-Type"] = req.headers["Content-Type"] || "application/json";
  return authInterceptor(req);
});
FACULTY_API.interceptors.request.use((req) => {
  const token = localStorage.getItem("facultyToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  req.headers["Content-Type"] = "application/json";
  return req;
});

// Response interceptor for token refresh
const setupResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const profile = safeParse("profile");
          const refreshToken = profile?.refreshToken;

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const { data } = await axios.post(`${BASE_URL}/users/refresh-token`, {
            refreshToken,
          });

          const newProfile = { ...profile, ...data };
          localStorage.setItem("profile", JSON.stringify(newProfile));

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem("profile");
          window.location.href = "/signin";
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

setupResponseInterceptor(API);
setupResponseInterceptor(COMMUNITY_API);
setupResponseInterceptor(MESSAGES_API);
// Admin API might need separate handling or same if using same token structure

export const handleApiError = async (error) => {
  try {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred.";
    const data = null;
    return { error: errorMessage, data };
  } catch (err) {
    throw new Error("An unexpected error occurred.");
  }
};