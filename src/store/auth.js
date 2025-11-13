// src/store/auth.js
import { defineStore } from "pinia";
import api from "@/services/api";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    console.log("🔧 AuthStore initialized:", {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + "..." : "none",
      user: user?.email || user?.username || "none",
    });

    return {
      token: token || null,
      user: user || null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post("/login", credentials);
        const { token, user } = response.data.data;

        this.token = token;
        this.user = user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("✅ Login successful:", user.email || user.username);

        router.push("/admin/dashboard");
      } catch (error) {
        console.error("❌ Login failed:", error.response?.data);
        throw error;
      }
    },

    logout() {
      console.log("🚪 Logging out...");
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    },

    // Thêm method để verify token
    async verifyToken() {
      if (!this.token) {
        console.warn("⚠️ No token to verify");
        return false;
      }

      try {
        // Gọi một endpoint đơn giản để verify token
        await api.get("/auth/verify"); // hoặc endpoint nào đó của bạn
        console.log("✅ Token is valid");
        return true;
      } catch (error) {
        console.error("❌ Token verification failed:", error.response?.status);
        if (error.response?.status === 401) {
          this.logout();
        }
        return false;
      }
    },
  },
});
