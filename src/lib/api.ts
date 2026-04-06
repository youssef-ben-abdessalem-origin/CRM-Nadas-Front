import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const API_BASE = "http://localhost:3001";

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
  (error) => Promise.reject(error),
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
          const resp = await axiosInstance.post("/api/v1/auth/refresh", {
            refreshToken,
          });
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

    if (
      responseData &&
      typeof responseData === "object" &&
      responseData.error
    ) {
      toast.error(responseData.error);
    } else if (responseData && typeof responseData === "string") {
      toast.error(responseData);
    }

    return Promise.reject(error);
  },
);

function normalizeResponse(val: any) {
  if (val === "null" || val === null) return [];
  if (Array.isArray(val)) return val;
  return val || [];
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });
      const data = normalizeResponse(res.data);
      if (data.accessToken) {
        Cookies.set("token", data.accessToken, { expires: 7 });
        Cookies.set("refreshToken", data.refreshToken, { expires: 14 });
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    register: async (data: {
      email: string;
      password: string;
      name: string;
      phone?: string;
    }) => {
      const res = await axiosInstance.post("/api/v1/auth/register", data);
      return normalizeResponse(res.data);
    },
    profile: async () => {
      const res = await axiosInstance.get("/api/v1/auth/profile");
      return normalizeResponse(res.data);
    },
    refresh: async (refreshToken: string) => {
      const res = await axiosInstance.post("/api/v1/auth/refresh", {
        refreshToken,
      });
      return normalizeResponse(res.data);
    },
  },

  leads: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/leads");
      return normalizeResponse(res.data);
    },
    getPaginated: async (
      params: {
        page?: number;
        limit?: number;
        search?: string;
        stageId?: number;
      } = {},
    ) => {
      const { page = 1, limit = 10, search, stageId } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      if (search) queryParams.append("search", search);
      if (stageId) queryParams.append("stageId", String(stageId));
      const res = await axiosInstance.get(
        `/api/v1/leads/paginated?${queryParams.toString()}`,
      );
      return res.data;
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
    bulkDelete: async (ids: number[]) => {
      const res = await axiosInstance.post("/api/v1/leads/bulk-delete", { ids });
      return normalizeResponse(res.data);
    },
    bulkUpdate: async (ids: number[], updates: any) => {
      const res = await axiosInstance.put("/api/v1/leads/bulk-update", { ids, updates });
      return normalizeResponse(res.data);
    },
    convert: async (id: number) => {
      const res = await axiosInstance.post(`/api/v1/leads/${id}/convert`);
      return normalizeResponse(res.data);
    },
    convertToDeal: async (id: number) => {
      const res = await axiosInstance.post(`/api/v1/leads/${id}/convert-to-deal`);
      return normalizeResponse(res.data);
    },
    getSources: async () => {
      const res = await axiosInstance.get("/api/v1/leads/sources");
      return normalizeResponse(res.data);
    },
    getStages: async () => {
      const res = await axiosInstance.get("/api/v1/leads/stages");
      return normalizeResponse(res.data);
    },
    getScores: async () => {
      const res = await axiosInstance.get("/api/v1/leads/scores");
      return normalizeResponse(res.data);
    },
    getPriorities: async () => {
      const res = await axiosInstance.get("/api/v1/leads/priorities");
      return normalizeResponse(res.data);
    },
    getQualifications: async () => {
      const res = await axiosInstance.get("/api/v1/leads/qualifications");
      return normalizeResponse(res.data);
    },
    createSource: async (data: { name: string }) => {
      const res = await axiosInstance.post("/api/v1/leads/sources", data);
      return normalizeResponse(res.data);
    },
    updateSource: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/leads/sources/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteSource: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/leads/sources/${id}`);
      return normalizeResponse(res.data);
    },
    createStage: async (data: {
      name: string;
      order?: number;
      color?: string;
    }) => {
      const res = await axiosInstance.post("/api/v1/leads/stages", data);
      return normalizeResponse(res.data);
    },
    updateStage: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/leads/stages/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteStage: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/leads/stages/${id}`);
      return normalizeResponse(res.data);
    },
    createScore: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/leads/scores", data);
      return normalizeResponse(res.data);
    },
    updateScore: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/leads/scores/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteScore: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/leads/scores/${id}`);
      return normalizeResponse(res.data);
    },
    createPriority: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/leads/priorities", data);
      return normalizeResponse(res.data);
    },
    updatePriority: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/leads/priorities/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deletePriority: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/leads/priorities/${id}`);
      return normalizeResponse(res.data);
    },
    createQualification: async (data: { name: string }) => {
      const res = await axiosInstance.post(
        "/api/v1/leads/qualifications",
        data,
      );
      return normalizeResponse(res.data);
    },
    updateQualification: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/leads/qualifications/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteQualification: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/leads/qualifications/${id}`,
      );
      return normalizeResponse(res.data);
    },
  },

  deals: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/deals");
      return normalizeResponse(res.data);
    },
    getByContact: async (contactId: number) => {
      const res = await axiosInstance.get(`/api/v1/deals/contact/${contactId}`);
      return normalizeResponse(res.data);
    },
    getByAccount: async (accountId: number) => {
      const res = await axiosInstance.get(`/api/v1/deals/account/${accountId}`);
      return normalizeResponse(res.data);
    },
    getByLead: async (leadId: number) => {
      const res = await axiosInstance.get(`/api/v1/deals/lead/${leadId}`);
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
    getStages: async () => {
      const res = await axiosInstance.get("/api/v1/deals/stages");
      return normalizeResponse(res.data);
    },
    createStage: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/deals/stages", data);
      return normalizeResponse(res.data);
    },
    updateStage: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/deals/stages/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteStage: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/deals/stages/${id}`);
      return normalizeResponse(res.data);
    },
    getReasons: async (type?: string) => {
      const params = type ? `?type=${type}` : "";
      const res = await axiosInstance.get(`/api/v1/deals/reasons${params}`);
      return normalizeResponse(res.data);
    },
    createReason: async (data: {
      name: string;
      color?: string;
      type?: string;
    }) => {
      const res = await axiosInstance.post("/api/v1/deals/reasons", data);
      return normalizeResponse(res.data);
    },
    updateReason: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/deals/reasons/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteReason: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/deals/reasons/${id}`);
      return normalizeResponse(res.data);
    },
  },

  activities: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/activities");
      return normalizeResponse(res.data);
    },
    getTypes: async () => {
      const res = await axiosInstance.get("/api/v1/activities/types");
      return normalizeResponse(res.data);
    },
    getByEntity: async (entityType: string, entityId: number) => {
      const res = await axiosInstance.get(`/api/v1/activities/entity?entityType=${entityType}&entityId=${entityId}`);
      return normalizeResponse(res.data);
    },
    create: async (data: {
      entityType: string;
      entityId: number;
      typeId: number;
      subject?: string;
      description?: string;
      dueDate?: string;
      assignedToId?: number;
    }) => {
      const res = await axiosInstance.post("/api/v1/activities", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/activities/${id}`, data);
      return normalizeResponse(res.data);
    },
    complete: async (id: number) => {
      const res = await axiosInstance.put(`/api/v1/activities/${id}/complete`);
      return normalizeResponse(res.data);
    },
    reassign: async (id: number, assignedToId: number) => {
      const res = await axiosInstance.put(`/api/v1/activities/${id}/reassign`, { assignedToId });
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/activities/${id}`);
      return normalizeResponse(res.data);
    },
  },

  products: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/products");
      return normalizeResponse(res.data);
    },
    getOne: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/products/${id}`);
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/products", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/products/${id}`);
      return normalizeResponse(res.data);
    },
  },

  billing: {
    quotes: {
      getAll: async () => {
        const res = await axiosInstance.get("/api/v1/billing/quotes");
        return normalizeResponse(res.data);
      },
      getOne: async (id: number) => {
        const res = await axiosInstance.get(`/api/v1/billing/quotes/${id}`);
        return normalizeResponse(res.data);
      },
      create: async (data: any) => {
        const res = await axiosInstance.post("/api/v1/billing/quotes", data);
        return normalizeResponse(res.data);
      },
      update: async (id: number, data: any) => {
        const res = await axiosInstance.put(`/api/v1/billing/quotes/${id}`, data);
        return normalizeResponse(res.data);
      },
      delete: async (id: number) => {
        const res = await axiosInstance.delete(`/api/v1/billing/quotes/${id}`);
        return normalizeResponse(res.data);
      },
      createInvoice: async (id: number) => {
        const res = await axiosInstance.post(`/api/v1/billing/quotes/${id}/create-invoice`);
        return normalizeResponse(res.data);
      },
    },
    invoices: {
      getAll: async () => {
        const res = await axiosInstance.get("/api/v1/billing/invoices");
        return normalizeResponse(res.data);
      },
      getOne: async (id: number) => {
        const res = await axiosInstance.get(`/api/v1/billing/invoices/${id}`);
        return normalizeResponse(res.data);
      },
      create: async (data: any) => {
        const res = await axiosInstance.post("/api/v1/billing/invoices", data);
        return normalizeResponse(res.data);
      },
      update: async (id: number, data: any) => {
        const res = await axiosInstance.put(`/api/v1/billing/invoices/${id}`, data);
        return normalizeResponse(res.data);
      },
      delete: async (id: number) => {
        const res = await axiosInstance.delete(`/api/v1/billing/invoices/${id}`);
        return normalizeResponse(res.data);
      },
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
    bulkDelete: async (ids: number[]) => {
      const res = await axiosInstance.post("/api/v1/accounts/bulk-delete", { ids });
      return normalizeResponse(res.data);
    },
    bulkUpdate: async (ids: number[], updates: any) => {
      const res = await axiosInstance.put("/api/v1/accounts/bulk-update", { ids, updates });
      return normalizeResponse(res.data);
    },
    getTypes: async () => {
      const res = await axiosInstance.get("/api/v1/accounts/types");
      return normalizeResponse(res.data);
    },
    createType: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/accounts/types", data);
      return normalizeResponse(res.data);
    },
    updateType: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/accounts/types/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteType: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/accounts/types/${id}`);
      return normalizeResponse(res.data);
    },
    getStatuses: async () => {
      const res = await axiosInstance.get("/api/v1/accounts/statuses");
      return normalizeResponse(res.data);
    },
    createStatus: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/accounts/statuses", data);
      return normalizeResponse(res.data);
    },
    updateStatus: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/accounts/statuses/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteStatus: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/accounts/statuses/${id}`);
      return normalizeResponse(res.data);
    },
    getTiers: async () => {
      const res = await axiosInstance.get("/api/v1/accounts/tiers");
      return normalizeResponse(res.data);
    },
    createTier: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/accounts/tiers", data);
      return normalizeResponse(res.data);
    },
    updateTier: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/accounts/tiers/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteTier: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/accounts/tiers/${id}`);
      return normalizeResponse(res.data);
    },
  },

  contacts: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/contacts");
      return normalizeResponse(res.data);
    },
    getAllRaw: async () => {
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
    bulkDelete: async (ids: number[]) => {
      const res = await axiosInstance.post("/api/v1/contacts/bulk-delete", { ids });
      return normalizeResponse(res.data);
    },
    bulkUpdate: async (ids: number[], updates: any) => {
      const res = await axiosInstance.put("/api/v1/contacts/bulk-update", { ids, updates });
      return normalizeResponse(res.data);
    },
    getStatuses: async () => {
      const res = await axiosInstance.get("/api/v1/contacts/statuses");
      return normalizeResponse(res.data);
    },
    createStatus: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/contacts/statuses", data);
      return normalizeResponse(res.data);
    },
    updateStatus: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/contacts/statuses/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteStatus: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/contacts/statuses/${id}`);
      return normalizeResponse(res.data);
    },
    getTiers: async () => {
      const res = await axiosInstance.get("/api/v1/contacts/tiers");
      return normalizeResponse(res.data);
    },
    createTier: async (data: { name: string; color?: string }) => {
      const res = await axiosInstance.post("/api/v1/contacts/tiers", data);
      return normalizeResponse(res.data);
    },
    updateTier: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/contacts/tiers/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteTier: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/contacts/tiers/${id}`);
      return normalizeResponse(res.data);
    },
  },

  users: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/users");
      return normalizeResponse(res.data);
    },
    getProfile: async () => {
      const res = await axiosInstance.get("/api/v1/users/profile");
      return normalizeResponse(res.data);
    },
    updateProfile: async (data: any) => {
      const res = await axiosInstance.put("/api/v1/users/profile", data);
      return normalizeResponse(res.data);
    },
    getById: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/users/${id}`);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/users/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/users/${id}`);
      return normalizeResponse(res.data);
    },
  },

  settings: {
    getCurrencies: async () => {
      const res = await axiosInstance.get("/api/v1/settings/currencies");
      return normalizeResponse(res.data);
    },
    createCurrency: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/currencies", data);
      return normalizeResponse(res.data);
    },
    updateCurrency: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/settings/currencies/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteCurrency: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/settings/currencies/${id}`,
      );
      return normalizeResponse(res.data);
    },
    getCountries: async () => {
      const res = await axiosInstance.get("/api/v1/settings/countries");
      return normalizeResponse(res.data);
    },
    createCountry: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/countries", data);
      return normalizeResponse(res.data);
    },
    updateCountry: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/settings/countries/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteCountry: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/settings/countries/${id}`,
      );
      return normalizeResponse(res.data);
    },
    getIndustries: async () => {
      const res = await axiosInstance.get("/api/v1/settings/industries");
      return normalizeResponse(res.data);
    },
    createIndustry: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/industries", data);
      return normalizeResponse(res.data);
    },
    updateIndustry: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/settings/industries/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteIndustry: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/settings/industries/${id}`,
      );
      return normalizeResponse(res.data);
    },
    getTags: async () => {
      const res = await axiosInstance.get("/api/v1/settings/tags");
      return normalizeResponse(res.data);
    },
    createTag: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/tags", data);
      return normalizeResponse(res.data);
    },
    updateTag: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/settings/tags/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteTag: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/settings/tags/${id}`);
      return normalizeResponse(res.data);
    },
    getActivityTypes: async () => {
      const res = await axiosInstance.get("/api/v1/settings/activity-types");
      return normalizeResponse(res.data);
    },
    createActivityType: async (data: any) => {
      const res = await axiosInstance.post(
        "/api/v1/settings/activity-types",
        data,
      );
      return normalizeResponse(res.data);
    },
    updateActivityType: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/settings/activity-types/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteActivityType: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/settings/activity-types/${id}`,
      );
      return normalizeResponse(res.data);
    },
    getEmailTemplates: async () => {
      const res = await axiosInstance.get("/api/v1/settings/email-templates");
      return normalizeResponse(res.data);
    },
    createEmailTemplate: async (data: any) => {
      const res = await axiosInstance.post(
        "/api/v1/settings/email-templates",
        data,
      );
      return normalizeResponse(res.data);
    },
    updateEmailTemplate: async (id: number, data: any) => {
      const res = await axiosInstance.put(
        `/api/v1/settings/email-templates/${id}`,
        data,
      );
      return normalizeResponse(res.data);
    },
    deleteEmailTemplate: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/settings/email-templates/${id}`,
      );
      return normalizeResponse(res.data);
    },
    getNotifications: async (userId?: number) => {
      const res = await axiosInstance.get("/api/v1/settings/notifications", {
        params: { userId },
      });
      return normalizeResponse(res.data);
    },
    getUnreadNotificationCount: async (userId: number) => {
      const res = await axiosInstance.get(
        "/api/v1/settings/notifications/unread-count",
        { params: { userId } },
      );
      return normalizeResponse(res.data);
    },
    createNotification: async (data: any) => {
      const res = await axiosInstance.post(
        "/api/v1/settings/notifications",
        data,
      );
      return normalizeResponse(res.data);
    },
    markNotificationAsRead: async (id: number) => {
      const res = await axiosInstance.put(
        `/api/v1/settings/notifications/${id}/read`,
      );
      return normalizeResponse(res.data);
    },
    markAllNotificationsAsRead: async (userId: number) => {
      const res = await axiosInstance.put(
        "/api/v1/settings/notifications/read-all",
        {},
        { params: { userId } },
      );
      return normalizeResponse(res.data);
    },
    deleteNotification: async (id: number) => {
      const res = await axiosInstance.delete(
        `/api/v1/settings/notifications/${id}`,
      );
      return normalizeResponse(res.data);
    },
    getAuditLogs: async (entityType?: string, entityId?: number) => {
      const res = await axiosInstance.get("/api/v1/settings/audit-logs", {
        params: { entityType, entityId },
      });
      return normalizeResponse(res.data);
    },
    createAuditLog: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/audit-logs", data);
      return normalizeResponse(res.data);
    },
  },
  uploads: {
    uploadAvatar: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/api/v1/uploads/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    uploadDocument: async (
      file: File,
      entityType: "lead" | "contact" | "account",
      entityId: number,
    ) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", entityType);
      formData.append("entityId", String(entityId));
      const res = await axiosInstance.post(
        "/api/v1/uploads/document",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return res.data;
    },
  },
  gmail: {
    getStatus: async () => {
      const res = await axiosInstance.get("/api/v1/gmail/status");
      return res.data;
    },
    getAuthUrl: async () => {
      const res = await axiosInstance.get("/api/v1/gmail/auth-url");
      return res.data;
    },
    connect: async (code: string) => {
      const res = await axiosInstance.post(
        `/api/v1/gmail/connect?code=${code}`,
      );
      return res.data;
    },
    disconnect: async () => {
      const res = await axiosInstance.post("/api/v1/gmail/disconnect");
      return res.data;
    },
    getMessages: async (maxResults?: number, pageToken?: string) => {
      const params = new URLSearchParams();
      if (maxResults) params.append("maxResults", String(maxResults));
      if (pageToken) params.append("pageToken", pageToken);
      const res = await axiosInstance.get(
        `/api/v1/gmail/messages?${params.toString()}`,
      );
      return res.data;
    },
    getMessage: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/gmail/messages/${id}`);
      return res.data;
    },
    send: async (to: string, subject: string, body: string, threadId?: string) => {
      const params = new URLSearchParams({ to, subject, body });
      if (threadId) params.append('threadId', threadId);
      const res = await axiosInstance.post(`/api/v1/gmail/send?${params.toString()}`);
      return res.data;
    },
  },
};

export default api;
