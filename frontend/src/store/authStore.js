
import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,

  // Login user
  login: async (email, password) => {
    set({ loading: true });

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed",
      };
    }
  },

  // Register user
  register: async (formData) => {
    set({ loading: true });

    try {
      const response = await api.post("/auth/register", formData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message:
          error.response?.data?.message || "Registration failed",
      };
    }
  },

  // Get logged-in user
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");

      set({
        user: response.data.user,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem("token");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
