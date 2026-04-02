import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const API_BASE = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const responseData = error.response?.data;
    
    if (error.response?.status === 401) {
      toast.info("Session expired. Attempting to refresh...");
      
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        try {
          toast.info("Refreshing session...");
          const resp = await axiosInstance.post("/api/v1/auth/refresh", { refreshToken });
          const data = resp.data;
          const newToken = data?.accessToken;
          if (newToken) {
            Cookies.set("token", newToken, { expires: 7 });
            if (data.refreshToken) {
              Cookies.set("refreshToken", data.refreshToken, { expires: 14 });
            }
            error.config.headers.Authorization = `Bearer ${newToken}`;
            toast.success("Session refreshed");
            return axiosInstance.request(error.config);
          }
        } catch {
          // fall through to logout
        }
      }
      Cookies.remove("token");
      Cookies.remove("refreshToken");
      localStorage.removeItem("user");
      toast.info("Please log in again");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    
    if (responseData && typeof responseData === 'object' && responseData.error) {
      toast.error(responseData.error);
    } else if (responseData && typeof responseData === 'string') {
      toast.error(responseData);
    }
    
    return Promise.reject(error);
  }
);

function normalizeResponse(val: any) {
  if (val === "null" || val === null) return [];
  if (Array.isArray(val)) return val;
  return val || [];
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await axiosInstance.post("/api/v1/auth/login", { email, password });
      const data = normalizeResponse(res.data);
      if (data.accessToken) {
        Cookies.set("token", data.accessToken, { expires: 7 });
        Cookies.set("refreshToken", data.refreshToken, { expires: 14 });
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    register: async (data: { email: string; password: string; name: string; phone?: string }) => {
      const res = await axiosInstance.post("/api/v1/auth/register", data);
      return normalizeResponse(res.data);
    },
    profile: async () => {
      const res = await axiosInstance.get("/api/v1/auth/profile");
      return normalizeResponse(res.data);
    },
    refresh: async (refreshToken: string) => {
      const res = await axiosInstance.post("/api/v1/auth/refresh", { refreshToken });
      return normalizeResponse(res.data);
    },
  },

  leads: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/leads");
      return normalizeResponse(res.data);
    },
    getOne: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/leads/${id}`);
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/leads", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/leads/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/leads/${id}`);
      return normalizeResponse(res.data);
    },
  },

  deals: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/deals");
      return normalizeResponse(res.data);
    },
    getOne: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/deals/${id}`);
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/deals", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/deals/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/deals/${id}`);
      return normalizeResponse(res.data);
    },
  },

  accounts: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/accounts");
      return normalizeResponse(res.data);
    },
    getOne: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/accounts/${id}`);
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/accounts", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/accounts/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/accounts/${id}`);
      return normalizeResponse(res.data);
    },
  },

  contacts: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/contacts");
      return normalizeResponse(res.data);
    },
    getOne: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/contacts/${id}`);
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/contacts", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/contacts/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/contacts/${id}`);
      return normalizeResponse(res.data);
    },
  },
};

export default api;