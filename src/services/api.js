// src/services/api.js
import axios from "axios";
import { useAuthStore } from "@/store/auth";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Thay bằng URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();

    if (error.response && error.response.status === 401) {
      console.log("Token hết hạn hoặc không hợp lệ. Đang đăng xuất...");
      authStore.logout();
    }
    return Promise.reject(error);
  }
);
export default api;
