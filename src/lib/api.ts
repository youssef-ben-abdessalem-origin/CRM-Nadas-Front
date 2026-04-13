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
  (error) => { throw error; },
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
      globalThis.location.href = "/login";
      throw error;
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

    throw error;
  },
);

function normalizeResponse(val: any) {
  if (val === "null" || val === null) return [];
  if (Array.isArray(val)) return val;
  return val || [];
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  color: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  roleId: string;
  enabled: boolean;
  phone?: string;
  avatar?: string;
  language?: string;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  representativeId?: number;
  representative?: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  content: string;
  title?: string;
  entityType: string;
  entityId: number;
  createdBy?: User;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  title?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  representativeId?: number;
  representative?: User;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  name: string;
  emails: string[];
  phones: string[];
  company: string;
  title: string;
  sourceId: number;
  source: { id: number; name: string };
  scoreCategoryId: number;
  scoreCategory: { id: number; name: string; color: string };
  stageId: number;
  stage: { id: number; name: string; color: string };
  priorityId: number;
  priority: { id: number; name: string; color: string };
  qualificationStageId: number;
  qualificationStage: { id: number; name: string };
  status: string;
  ownerId: number;
  owner?: { id: number; name: string; email: string };
  value: number;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  notes: string;
  location: string;
  industry: string;
  website: string;
  tags: string[];
  nextFollowUp: string;
  isConverted: boolean;
  convertedAt: string;
  convertedAccountId: number;
  convertedContactId: number;
  attachments: { url: string; name: string; type: string; uploadedAt: string }[];
  lossReason?: string;
  lossNotes?: string;
  lostAt?: string;
  reengagementDate?: string;
}

export interface DynamicOption {
  id: number;
  name: string;
  color?: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  brandId: string | null;
  brand: { id: string; name: string } | null;
  status: string;
  isActive: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  productCode?: string;
  vendorName?: string;
  manufacturer?: string;
  salesStartDate?: string;
  salesEndDate?: string;
  supportStartDate?: string;
  supportEndDate?: string;
  unitPrice: number;
  tax: number;
  commissionRate: number;
  taxable: boolean;
  usageUnit?: string;
  quantityInStock: number;
  handler?: string;
  qtyOrdered: number;
  reorderLevel: number;
  quantityInDemand: number;
  ownerId?: number;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  image?: string;
  ownerId: number;
  owner?: User;
  phone?: string;
  website?: string;
  category?: string;
  email?: string;
  glAccount?: string;
  emailOptOut: boolean;
  country?: string;
  flatNo?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  coordinates?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: number;
  name: string;
  entityType: "lead" | "deal";
  eventType: "created" | "updated";
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  actionType: "assign_owner" | "create_task" | "send_notification" | "send_email";
  actionPayload?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  subject: string;
  dueDate: string;
  priority: string;
  status: string;
  ownerId: number;
  entityType?: string;
  entityId?: number;
  description?: string;
  hasReminder?: boolean;
  hasRepeat?: boolean;
  reminder?: any;
  repeat?: any;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  tasks: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/tasks");
      return res.data;
    },
    getByEntity: async (entityType: string, entityId: number) => {
      const res = await axiosInstance.get(`/api/v1/tasks/entity/${entityType}/${entityId}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/tasks", data);
      return res.data;
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/tasks/${id}`, data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/tasks/${id}`);
      return res.data;
    },
  },
  roles: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/roles");
      return normalizeResponse(res.data);
    },
    getPaginated: async (
      params: {
        page?: number;
        limit?: number;
        search?: string;
      } = {},
    ) => {
      const { page = 1, limit = 10, search } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      if (search) queryParams.append("search", search);
      const res = await axiosInstance.get(
        `/api/v1/roles/paginated?${queryParams.toString()}`,
      );
      return res.data;
    },
    getOne: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/roles/${id}`);
      return res.data;
    },
    getPermissionsByRole: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/roles/${id}/permissions`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/roles", data);
      return res.data;
    },
    update: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/roles/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/roles/${id}`);
      return res.data;
    },
  },

  permissions: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/permissions");
      return normalizeResponse(res.data);
    },
  },

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
    convert: async (id: number, data?: any) => {
      const res = await axiosInstance.post(`/api/v1/leads/${id}/convert`, data);
      return normalizeResponse(res.data);
    },
    convertToDeal: async (id: number, data?: any) => {
      const res = await axiosInstance.post(`/api/v1/leads/${id}/convert-to-deal`, data);
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
      callType?: string;
      durationMinutes?: string;
      durationSeconds?: string;
      voiceRecording?: string;
      reminder?: string;
      status?: string;
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
    findAllPaginated: async (
      page: number = 1,
      limit: number = 5,
      search?: string,
      categoryId?: string,
      status?: string,
      type?: string
    ) => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      if (search) queryParams.append("search", search);
      if (categoryId) queryParams.append("categoryId", categoryId);
      if (status) queryParams.append("status", status);
      if (type) queryParams.append("type", type);
      const res = await axiosInstance.get(
        `/api/v1/products/paginated?${queryParams.toString()}`
      );
      return res.data;
    },
    archive: async (id: string) => {
      const res = await axiosInstance.post(`/api/v1/products/${id}/archive`);
      return res.data;
    },
    duplicate: async (id: string) => {
      const res = await axiosInstance.post(`/api/v1/products/${id}/duplicate`);
      return res.data;
    },
    getOne: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/products/${id}`);
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/products", data);
      return normalizeResponse(res.data);
    },
    update: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/${id}`);
      return res.data;
    },
    getBrands: async () => {
      const res = await axiosInstance.get("/api/v1/products/brands");
      return normalizeResponse(res.data);
    },
    createBrand: async (data: { name: string; logo?: string }) => {
      const res = await axiosInstance.post("/api/v1/products/brands", data);
      return res.data;
    },
    updateBrand: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/brands/${id}`, data);
      return res.data;
    },
    deleteBrand: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/brands/${id}`);
      return res.data;
    },
    getTaxClasses: async () => {
      const res = await axiosInstance.get("/api/v1/products/tax-classes");
      return normalizeResponse(res.data);
    },
    createTaxClass: async (data: { name: string; rate: number }) => {
      const res = await axiosInstance.post("/api/v1/products/tax-classes", data);
      return res.data;
    },
    updateTaxClass: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/tax-classes/${id}`, data);
      return res.data;
    },
    deleteTaxClass: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/tax-classes/${id}`);
      return res.data;
    },
    getPriceBooks: async () => {
      const res = await axiosInstance.get("/api/v1/products/price-books");
      return normalizeResponse(res.data);
    },
    createPriceBook: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/products/price-books", data);
      return res.data;
    },
    updatePriceBook: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/price-books/${id}`, data);
      return res.data;
    },
    deletePriceBook: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/price-books/${id}`);
      return res.data;
    },
    getCategories: async () => {
      const res = await axiosInstance.get("/api/v1/products/categories");
      return normalizeResponse(res.data);
    },
    createCategory: async (data: { name: string; parentId?: string }) => {
      const res = await axiosInstance.post("/api/v1/products/categories", data);
      return res.data;
    },
    updateCategory: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/categories/${id}`, data);
      return res.data;
    },
    deleteCategory: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/categories/${id}`);
      return res.data;
    },
    getUnits: async () => {
      const res = await axiosInstance.get("/api/v1/products/units");
      return normalizeResponse(res.data);
    },
    createUnit: async (name: string) => {
      const res = await axiosInstance.post("/api/v1/products/units", { name });
      return res.data;
    },
    updateUnit: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/units/${id}`, data);
      return res.data;
    },
    deleteUnit: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/units/${id}`);
      return res.data;
    },
    getPricingModels: async () => {
      const res = await axiosInstance.get("/api/v1/products/pricing-models");
      return normalizeResponse(res.data);
    },
    createPricingModel: async (name: string) => {
      const res = await axiosInstance.post("/api/v1/products/pricing-models", { name });
      return res.data;
    },
    updatePricingModel: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/pricing-models/${id}`, data);
      return res.data;
    },
    deletePricingModel: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/pricing-models/${id}`);
      return res.data;
    },
    // Variant & Pricing Specifics
    createVariant: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/products/variants", data);
      return res.data;
    },
    updateVariant: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/variants/${id}`, data);
      return res.data;
    },
    deleteVariant: async (id: string) => {
       const res = await axiosInstance.delete(`/api/v1/products/variants/${id}`);
       return res.data;
    },
    upsertPricing: async (variantId: string, priceBookId: string, price: number) => {
       const res = await axiosInstance.post(`/api/v1/products/variants/${variantId}/pricing`, { priceBookId, price });
       return res.data;
    },
    setPrimaryPrice: async (variantId: string, priceId: string) => {
       const res = await axiosInstance.post(`/api/v1/products/variants/${variantId}/primary/${priceId}`);
       return res.data;
    },
    getTypes: async () => {
      const res = await axiosInstance.get("/api/v1/products/types");
      return normalizeResponse(res.data);
    },
    createType: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/products/types", data);
      return normalizeResponse(res.data);
    },
    updateType: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/products/types/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteType: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/products/types/${id}`);
      return normalizeResponse(res.data);
    }
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
      revise: async (id: number) => {
        const res = await axiosInstance.post(`/api/v1/billing/quotes/${id}/revise`);
        return normalizeResponse(res.data);
      },
      duplicate: async (id: number) => {
        const res = await axiosInstance.post(`/api/v1/billing/quotes/${id}/duplicate`);
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
    getPaginated: async (
      params: {
        page?: number;
        limit?: number;
        search?: string;
      } = {},
    ) => {
      const { page = 1, limit = 10, search } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      if (search) queryParams.append("search", search);
      const res = await axiosInstance.get(
        `/api/v1/users/paginated?${queryParams.toString()}`,
      );
      return res.data;
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
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/users", data);
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
  departments: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/departments");
      return normalizeResponse(res.data);
    },
    getPaginated: async (
      params: {
        page?: number;
        limit?: number;
        search?: string;
      } = {},
    ) => {
      const { page = 1, limit = 10, search } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      if (search) queryParams.append("search", search);
      const res = await axiosInstance.get(
        `/api/v1/departments/paginated?${queryParams.toString()}`,
      );
      return res.data;
    },
    create: async (data: {
      name: string;
      description?: string;
      representativeId?: number;
      memberIds?: number[];
    }) => {
      const res = await axiosInstance.post("/api/v1/departments", data);
      return res.data;
    },
    update: async (
      id: number,
      data: {
        name?: string;
        description?: string;
        representativeId?: number | null;
        memberIds?: number[];
      },
    ) => {
      const res = await axiosInstance.put(`/api/v1/departments/${id}`, data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/departments/${id}`);
      return res.data;
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
    getAuditLogsPaginated: async (
      params: {
        page?: number;
        limit?: number;
        search?: string;
        entityType?: string;
        entityId?: number;
      } = {},
    ) => {
      const { page = 1, limit = 10, search, entityType, entityId } = params;
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      if (search) queryParams.append("search", search);
      if (entityType) queryParams.append("entityType", entityType);
      if (entityId) queryParams.append("entityId", String(entityId));
      const res = await axiosInstance.get(
        `/api/v1/settings/audit-logs/paginated?${queryParams.toString()}`,
      );
      return res.data;
    },
    createAuditLog: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/audit-logs", data);
      return normalizeResponse(res.data);
    },
    getCarriers: async () => {
      const res = await axiosInstance.get("/api/v1/settings/carriers");
      return normalizeResponse(res.data);
    },
    createCarrier: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/settings/carriers", data);
      return normalizeResponse(res.data);
    },
    updateCarrier: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/settings/carriers/${id}`, data);
      return normalizeResponse(res.data);
    },
    deleteCarrier: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/settings/carriers/${id}`);
      return res.data;
    },
    getCompany: async () => {
      const res = await axiosInstance.get("/api/v1/settings/company");
      return res.data;
    },
    updateCompany: async (data: any) => {
      const res = await axiosInstance.put("/api/v1/settings/company", data);
      return res.data;
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
    uploadLogo: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/api/v1/uploads/logo", formData, {
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
    getMessages: async (maxResults?: number, pageToken?: string, label?: string) => {
      const params = new URLSearchParams();
      if (maxResults) params.append("maxResults", String(maxResults));
      if (pageToken) params.append("pageToken", pageToken);
      if (label) params.append("label", label);
      const res = await axiosInstance.get(
        `/api/v1/gmail/messages?${params.toString()}`,
      );
      return res.data;
    },
    getMessage: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/gmail/messages/${id}`);
      return res.data;
    },
    getThread: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/gmail/threads/${id}`);
      return res.data;
    },
    send: async (to: string, subject: string, body: string, threadId?: string) => {
      const params = new URLSearchParams({ to, subject, body });
      if (threadId) params.append('threadId', threadId);
      const res = await axiosInstance.post(`/api/v1/gmail/send?${params.toString()}`);
      return res.data;
    },
  },

  notes: {
    getByEntity: async (entityType: string, entityId: number) => {
      const res = await axiosInstance.get(`/api/v1/notes/entity/${entityType}/${entityId}`);
      return normalizeResponse(res.data);
    },
    create: async (data: { entityType: string; entityId: number; content: string; title?: string }) => {
      const res = await axiosInstance.post("/api/v1/notes", data);
      return normalizeResponse(res.data);
    },
    update: async (id: number, data: { content?: string; title?: string }) => {
      const res = await axiosInstance.put(`/api/v1/notes/${id}`, data);
      return normalizeResponse(res.data);
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/notes/${id}`);
      return res.data;
    },
  },
  workdrive: {
    getTeam: async () => {
      const res = await axiosInstance.get("/api/v1/workdrive/team");
      return res.data;
    },
    createTeam: async (name: string) => {
      const res = await axiosInstance.post("/api/v1/workdrive/team", { name });
      return res.data;
    },
    getFolders: async (params: { teamId: number, isTeamFolder: boolean, parentId?: number }) => {
      const queryParams = new URLSearchParams();
      queryParams.append("teamId", String(params.teamId));
      queryParams.append("isTeamFolder", String(params.isTeamFolder));
      if (params.parentId) queryParams.append("parentId", String(params.parentId));
      const res = await axiosInstance.get(`/api/v1/workdrive/folders?${queryParams.toString()}`);
      return normalizeResponse(res.data);
    },
    createFolder: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/workdrive/folders", data);
      return res.data;
    },
    getPermissions: async (folderId: number) => {
      const res = await axiosInstance.get(`/api/v1/workdrive/folders/${folderId}/permissions`);
      return normalizeResponse(res.data);
    },
    updatePermissions: async (folderId: number, permissions: any[]) => {
      const res = await axiosInstance.post(`/api/v1/workdrive/folders/${folderId}/permissions`, { permissions });
      return res.data;
    },
    getFiles: async (folderId: number) => {
      const res = await axiosInstance.get(`/api/v1/workdrive/files?folderId=${folderId}`);
      return normalizeResponse(res.data);
    },
    createFile: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/workdrive/files", data);
      return res.data;
    },
  },

  forecast: {
    getDashboard: async (periodId: number, userId?: number) => {
      const params = new URLSearchParams();
      params.append("periodId", String(periodId));
      if (userId) params.append("userId", String(userId));
      const res = await axiosInstance.get(`/api/v1/forecast/dashboard?${params.toString()}`);
      return normalizeResponse(res.data);
    },
    getMyForecast: async (periodId?: number) => {
      const params = new URLSearchParams();
      if (periodId) params.append("periodId", String(periodId));
      const res = await axiosInstance.get(`/api/v1/forecast/my?${params.toString()}`);
      return normalizeResponse(res.data);
    },
    adjust: async (data: { userId: number, periodId: number, commitOverride?: number, bestCaseOverride?: number, note?: string }) => {
      const res = await axiosInstance.post("/api/v1/forecast/adjust", data);
      return res.data;
    },
    getContributions: async (userId: number, periodId: number, category: string) => {
      const params = new URLSearchParams();
      params.append("userId", String(userId));
      params.append("periodId", String(periodId));
      params.append("category", category);
      const res = await axiosInstance.get(`/api/v1/forecast/contributions?${params.toString()}`);
      return normalizeResponse(res.data);
    },
    getPeriods: async () => {
      const res = await axiosInstance.get("/api/v1/forecast/periods");
      return normalizeResponse(res.data);
    },
    createPeriod: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/forecast/periods", data);
      return res.data;
    },
    updatePeriod: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/forecast/periods/${id}`, data);
      return res.data;
    },
    getMappings: async () => {
      const res = await axiosInstance.get("/api/v1/forecast/mappings");
      return normalizeResponse(res.data);
    },
    updateMapping: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/forecast/mappings/${id}`, data);
      return res.data;
    },
    getTargets: async (periodId: number) => {
      const res = await axiosInstance.get(`/api/v1/forecast/targets?periodId=${periodId}`);
      return normalizeResponse(res.data);
    },
    setTarget: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/forecast/targets", data);
      return res.data;
    },
  },
  dashboard: {
    getStats: async () => {
      const res = await axiosInstance.get("/api/v1/dashboard/stats");
      return res.data;
    },
  },
  campaigns: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/campaigns");
      return normalizeResponse(res.data);
    },
    getTypes: async () => {
      const res = await axiosInstance.get("/api/v1/campaigns/types");
      return normalizeResponse(res.data);
    },
    getStatuses: async () => {
      const res = await axiosInstance.get("/api/v1/campaigns/statuses");
      return normalizeResponse(res.data);
    },
    getOne: async (id: number) => {
      const res = await axiosInstance.get(`/api/v1/campaigns/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/campaigns", data);
      return res.data;
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/campaigns/${id}`, data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/campaigns/${id}`);
      return res.data;
    },
  },
  automations: {
    getAll: async () => {
      const res = await axiosInstance.get("/api/v1/automations");
      return normalizeResponse(res.data);
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/automations", data);
      return res.data;
    },
    update: async (id: number, data: any) => {
      const res = await axiosInstance.put(`/api/v1/automations/${id}`, data);
      return res.data;
    },
    toggle: async (id: number) => {
      const res = await axiosInstance.patch(`/api/v1/automations/${id}/toggle`);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await axiosInstance.delete(`/api/v1/automations/${id}`);
      return res.data;
    },
    test: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/automations/test", data);
      return res.data;
    },
  },
  vendors: {
    getAll: async (search?: string, category?: string) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const res = await axiosInstance.get(`/api/v1/vendors?${params.toString()}`);
      return normalizeResponse(res.data);
    },
    getOne: async (id: string) => {
      const res = await axiosInstance.get(`/api/v1/vendors/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await axiosInstance.post("/api/v1/vendors", data);
      return res.data;
    },
    update: async (id: string, data: any) => {
      const res = await axiosInstance.put(`/api/v1/vendors/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/vendors/${id}`);
      return res.data;
    },
  },
  profile: {
    getCurrencyInfo: async () => {
      const res = await axiosInstance.get("/api/v1/profile/currency");
      return res.data;
    },
    updateLanguage: async (language: string) => {
      const res = await axiosInstance.patch("/api/v1/profile/language", { language });
      return res.data;
    },
  },
};

export default api;
