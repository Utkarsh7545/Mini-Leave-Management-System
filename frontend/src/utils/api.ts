import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "/api" // This will use the Vite proxy in development
      : "https://mini-leave-management-system-backend.onrender.com/api", // Production
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.errors) {
    return error.response.data.errors.join(", ");
  } else if (error.message) {
    return error.message;
  } else {
    return "An unexpected error occurred";
  }
};
