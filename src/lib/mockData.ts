export type LeadScore = "hot" | "warm" | "cold";
export type LeadSource =
  | "Website"
  | "LinkedIn"
  | "Referral"
  | "Cold Call"
  | "Trade Show"
  | "Google Ads"
  | "Email Campaign";

export interface Lead {
  id: number;
  name: string;
  emails: string[];
  phones: string[];
  company: string;
  title: string;
  sourceId?: number;
  source?: { id: number; name: string };
  scoreCategoryId?: number;
  scoreCategory?: { id: number; name: string; color: string };
  stageId?: number;
  stage?: { id: number; name: string; color: string };
  priorityId?: number;
  priority?: { id: number; name: string; color: string };
  qualificationStageId?: number;
  qualificationStage?: { id: number; name: string };
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
  nextFollowUp?: string;
  isConverted?: boolean;
  convertedAt?: string;
  convertedAccountId?: number;
  convertedContactId?: number;
  attachments?: { url: string; name: string; type: string; uploadedAt: string }[];
}

export type DealStage = "qualification" | "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

export interface Deal {
  id: number;
  name: string;
  company: string;
  value: number;
  contact: string;
  probability: number;
  daysInStage: number;
  stage: DealStage;
}

export type AccountType = "customer" | "partner" | "prospect" | "competitor";
export type AccountStatus = "active" | "inactive" | "churned";
export type AccountTier = "enterprise" | "mid-market" | "smb";

export interface Account {
  id: number;
  name: string;
  website: string;
  industry: string;
  type: AccountType;
  status: AccountStatus;
  tier: AccountTier;
  annualRevenue: number;
  employeeCount: number;
  phone: string;
  email: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  description: string;
  notes: string;
  created: string;
  lastActivity: string;
  avatar: string;
  dealsCount: number;
  contactsCount: number;
}

export type ContactStatus = "active" | "inactive" | "churned";
export type ContactTier = "enterprise" | "professional" | "starter";

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: ContactStatus;
  tier: ContactTier;
  dealValue: number;
  lastContact: string;
  created: string;
  location: string;
  industry: string;
  website: string;
  notes: string;
  dealsWon: number;
  dealsTotal: number;
  revenueTotal: number;
  avatar: string;
}

export const mockLeads: Lead[] = [
  {
    id: 1,
    name: "Sarah Chen",
    emails: ["sarah.chen@techcorp.io"],
    phones: ["+1 (555) 123-4567"],
    company: "TechCorp",
    title: "VP of Engineering",
    sourceId: 1,
    source: { id: 1, name: "Website" },
    scoreCategoryId: 1,
    scoreCategory: { id: 1, name: "hot", color: "#ef4444" },
    stageId: 3,
    stage: { id: 3, name: "qualified", color: "#22c55e" },
    status: "active",
    ownerId: 1,
    value: 75000,
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
    lastActivity: "2 hours ago",
    notes: "Interested in enterprise plan. Requested demo.",
    location: "San Francisco, CA",
    industry: "Technology",
    website: "https://techcorp.io",
    tags: ["enterprise", "hot-lead"],
  },
  {
    id: 2,
    name: "Michael Torres",
    emails: ["m.torres@innovate.co"],
    phones: ["+1 (555) 234-5678"],
    company: "Innovate Co",
    title: "CTO",
    sourceId: 2,
    source: { id: 2, name: "LinkedIn" },
    scoreCategoryId: 2,
    scoreCategory: { id: 2, name: "warm", color: "#f59e0b" },
    stageId: 2,
    stage: { id: 2, name: "contacted", color: "#3b82f6" },
    status: "active",
    ownerId: 1,
    value: 45000,
    createdAt: "2026-02-20",
    updatedAt: "2026-02-20",
    lastActivity: "1 day ago",
    notes: "Looking for scaling solutions",
    location: "Austin, TX",
    industry: "SaaS",
    website: "https://innovate.co",
    tags: ["saas", "scaling"],
  },
  {
    id: 3,
    name: "Emily Johnson",
    emails: ["emily.j@globalinc.com"],
    phones: ["+1 (555) 345-6789"],
    company: "Global Inc",
    title: "Director of Operations",
    sourceId: 3,
    source: { id: 3, name: "Referral" },
    scoreCategoryId: 1,
    scoreCategory: { id: 1, name: "hot", color: "#ef4444" },
    stageId: 1,
    stage: { id: 1, name: "new", color: "#6b7280" },
    status: "active",
    ownerId: 1,
    value: 120000,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
    lastActivity: "3 hours ago",
    notes: "Referred by John Smith",
    location: "New York, NY",
    industry: "Consulting",
    website: "https://globalinc.com",
    tags: ["referral", "enterprise"],
  },
];

export const mockDeals: Deal[] = [
  {
    id: 1,
    name: "TechCorp Enterprise Deal",
    company: "TechCorp",
    value: 75000,
    contact: "Sarah Chen",
    probability: 70,
    daysInStage: 12,
    stage: "proposal",
  },
  {
    id: 2,
    name: "Innovate SaaS Subscription",
    company: "Innovate Co",
    value: 45000,
    contact: "Michael Torres",
    probability: 50,
    daysInStage: 8,
    stage: "discovery",
  },
  {
    id: 3,
    name: "Global Inc Consulting",
    company: "Global Inc",
    value: 120000,
    contact: "Emily Johnson",
    probability: 90,
    daysInStage: 3,
    stage: "negotiation",
  },
  {
    id: 4,
    name: "StartupX Starter Plan",
    company: "StartupX",
    value: 15000,
    contact: "David Kim",
    probability: 20,
    daysInStage: 5,
    stage: "qualification",
  },
  {
    id: 5,
    name: "Enterprise Solutions Platform",
    company: "Enterprise Solutions",
    value: 85000,
    contact: "Lisa Anderson",
    probability: 60,
    daysInStage: 15,
    stage: "proposal",
  },
  {
    id: 6,
    name: "Acme Corp Expansion",
    company: "Acme Corp",
    value: 200000,
    contact: "John Doe",
    probability: 100,
    daysInStage: 0,
    stage: "closed_won",
  },
];

export const mockAccounts: Account[] = [
  {
    id: 1,
    name: "TechCorp",
    website: "https://techcorp.io",
    industry: "Technology",
    type: "customer",
    status: "active",
    tier: "enterprise",
    annualRevenue: 5000000,
    employeeCount: 250,
    phone: "+1 (555) 123-4000",
    email: "contact@techcorp.io",
    location: "San Francisco, CA",
    address: "100 Tech Boulevard",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94105",
    description: "Leading technology company specializing in cloud solutions",
    notes: "Key enterprise client",
    created: "2025-06-15",
    lastActivity: "2 hours ago",
    avatar: "TC",
    dealsCount: 3,
    contactsCount: 12,
  },
  {
    id: 2,
    name: "Innovate Co",
    website: "https://innovate.co",
    industry: "SaaS",
    type: "customer",
    status: "active",
    tier: "mid-market",
    annualRevenue: 1500000,
    employeeCount: 75,
    phone: "+1 (555) 234-5000",
    email: "hello@innovate.co",
    location: "Austin, TX",
    address: "200 Innovation Way",
    city: "Austin",
    state: "TX",
    country: "USA",
    zipCode: "78701",
    description: "Fast-growing SaaS startup",
    notes: "Looking to expand",
    created: "2025-09-20",
    lastActivity: "1 day ago",
    avatar: "IC",
    dealsCount: 2,
    contactsCount: 5,
  },
  {
    id: 3,
    name: "Global Inc",
    website: "https://globalinc.com",
    industry: "Consulting",
    type: "prospect",
    status: "active",
    tier: "enterprise",
    annualRevenue: 10000000,
    employeeCount: 500,
    phone: "+1 (555) 345-6000",
    email: "info@globalinc.com",
    location: "New York, NY",
    address: "500 Business Ave",
    city: "New York",
    state: "NY",
    country: "USA",
    zipCode: "10001",
    description: "Global consulting firm",
    notes: "High value prospect",
    created: "2026-01-10",
    lastActivity: "3 hours ago",
    avatar: "GI",
    dealsCount: 1,
    contactsCount: 8,
  },
];

export const mockContacts: Contact[] = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.io",
    phone: "+1 (555) 123-4567",
    company: "TechCorp",
    title: "VP of Engineering",
    status: "active",
    tier: "enterprise",
    dealValue: 75000,
    lastContact: "2 hours ago",
    created: "2025-06-20",
    location: "San Francisco, CA",
    industry: "Technology",
    website: "https://techcorp.io",
    notes: "Key decision maker",
    dealsWon: 2,
    dealsTotal: 3,
    revenueTotal: 125000,
    avatar: "SC",
  },
  {
    id: 2,
    name: "Michael Torres",
    email: "m.torres@innovate.co",
    phone: "+1 (555) 234-5678",
    company: "Innovate Co",
    title: "CTO",
    status: "active",
    tier: "professional",
    dealValue: 45000,
    lastContact: "1 day ago",
    created: "2025-09-25",
    location: "Austin, TX",
    industry: "SaaS",
    website: "https://innovate.co",
    notes: "Technical decision maker",
    dealsWon: 1,
    dealsTotal: 2,
    revenueTotal: 45000,
    avatar: "MT",
  },
  {
    id: 3,
    name: "Emily Johnson",
    email: "emily.j@globalinc.com",
    phone: "+1 (555) 345-6789",
    company: "Global Inc",
    title: "Director of Operations",
    status: "active",
    tier: "enterprise",
    dealValue: 120000,
    lastContact: "3 hours ago",
    created: "2026-01-15",
    location: "New York, NY",
    industry: "Consulting",
    website: "https://globalinc.com",
    notes: "Operations lead",
    dealsWon: 0,
    dealsTotal: 1,
    revenueTotal: 0,
    avatar: "EJ",
  },
];

let leadIdCounter = 6;
let dealIdCounter = 7;
let accountIdCounter = 4;
let contactIdCounter = 4;

export const api = {
  leads: {
    getAll: async () => {
      return mockLeads;
    },
    getOne: async (id: number) => {
      return mockLeads.find((l) => l.id === id) || null;
    },
    create: async (data: Partial<Lead>) => {
      const newLead: Lead = {
        id: leadIdCounter++,
        name: data.name || "",
        emails: data.emails || [],
        phones: data.phones || [],
        company: data.company || "",
        title: data.title || "",
        sourceId: data.sourceId,
        scoreCategoryId: data.scoreCategoryId,
        status: "active",
        ownerId: data.ownerId || 1,
        value: data.value || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivity: "Just now",
        notes: data.notes || "",
        location: data.location || "",
        industry: data.industry || "",
        website: data.website || "",
        tags: data.tags || [],
      };
      mockLeads.push(newLead);
      return newLead;
    },
    update: async (id: number, data: Partial<Lead>) => {
      const index = mockLeads.findIndex((l) => l.id === id);
      if (index !== -1) {
        mockLeads[index] = { ...mockLeads[index], ...data };
        return mockLeads[index];
      }
      return null;
    },
    delete: async (id: number) => {
      const index = mockLeads.findIndex((l) => l.id === id);
      if (index !== -1) {
        mockLeads.splice(index, 1);
      }
      return true;
    },
    stats: async () => {
      return {
        total: mockLeads.length,
        new: mockLeads.filter((l) => l.status === "new").length,
        hot: mockLeads.filter((l) => l.score === "hot").length,
        conversionRate: Math.round(
          (mockLeads.filter((l) => l.status === "qualified").length / mockLeads.length) * 100
        ),
      };
    },
  },

  deals: {
    getAll: async () => {
      return mockDeals;
    },
    getOne: async (id: number) => {
      return mockDeals.find((d) => d.id === id) || null;
    },
    create: async (data: Partial<Deal>) => {
      const newDeal: Deal = {
        id: dealIdCounter++,
        name: data.name || "New Deal",
        company: data.company || "Unknown",
        value: data.value || 0,
        contact: data.contact || "",
        probability: data.probability || 10,
        daysInStage: 0,
        stage: data.stage || "qualification",
      };
      mockDeals.push(newDeal);
      return newDeal;
    },
    update: async (id: number, data: Partial<Deal>) => {
      const index = mockDeals.findIndex((d) => d.id === id);
      if (index !== -1) {
        mockDeals[index] = { ...mockDeals[index], ...data };
        return mockDeals[index];
      }
      return null;
    },
    delete: async (id: number) => {
      const index = mockDeals.findIndex((d) => d.id === id);
      if (index !== -1) {
        mockDeals.splice(index, 1);
      }
      return true;
    },
    stats: async () => {
      return {
        total: mockDeals.length,
        value: mockDeals.reduce((sum, d) => sum + d.value, 0),
        won: mockDeals.filter((d) => d.stage === "closed_won").length,
      };
    },
  },

  accounts: {
    getAll: async () => {
      return mockAccounts;
    },
    getOne: async (id: number) => {
      return mockAccounts.find((a) => a.id === id) || null;
    },
    create: async (data: Partial<Account>) => {
      const newAccount: Account = {
        id: accountIdCounter++,
        name: data.name || "",
        website: data.website || "",
        industry: data.industry || "",
        type: data.type || "prospect",
        status: "active",
        tier: data.tier || "smb",
        annualRevenue: data.annualRevenue || 0,
        employeeCount: data.employeeCount || 0,
        phone: data.phone || "",
        email: data.email || "",
        location: data.location || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        zipCode: data.zipCode || "",
        description: data.description || "",
        notes: data.notes || "",
        created: new Date().toISOString().split("T")[0],
        lastActivity: "Just now",
        avatar: data.name?.slice(0, 2).toUpperCase() || "XX",
        dealsCount: 0,
        contactsCount: 0,
      };
      mockAccounts.push(newAccount);
      return newAccount;
    },
    update: async (id: number, data: Partial<Account>) => {
      const index = mockAccounts.findIndex((a) => a.id === id);
      if (index !== -1) {
        mockAccounts[index] = { ...mockAccounts[index], ...data };
        return mockAccounts[index];
      }
      return null;
    },
    delete: async (id: number) => {
      const index = mockAccounts.findIndex((a) => a.id === id);
      if (index !== -1) {
        mockAccounts.splice(index, 1);
      }
      return true;
    },
    stats: async () => {
      return {
        total: mockAccounts.length,
        active: mockAccounts.filter((a) => a.status === "active").length,
      };
    },
  },

  contacts: {
    getAll: async () => {
      return mockContacts;
    },
    getOne: async (id: number) => {
      return mockContacts.find((c) => c.id === id) || null;
    },
    create: async (data: Partial<Contact>) => {
      const newContact: Contact = {
        id: contactIdCounter++,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        company: data.company || "",
        title: data.title || "",
        status: "active",
        tier: data.tier || "starter",
        dealValue: data.dealValue || 0,
        lastContact: "Just now",
        created: new Date().toISOString().split("T")[0],
        location: data.location || "",
        industry: data.industry || "",
        website: data.website || "",
        notes: data.notes || "",
        dealsWon: 0,
        dealsTotal: 0,
        revenueTotal: 0,
        avatar: data.name?.split(" ").map((n) => n[0]).join("") || "XX",
      };
      mockContacts.push(newContact);
      return newContact;
    },
    update: async (id: number, data: Partial<Contact>) => {
      const index = mockContacts.findIndex((c) => c.id === id);
      if (index !== -1) {
        mockContacts[index] = { ...mockContacts[index], ...data };
        return mockContacts[index];
      }
      return null;
    },
    delete: async (id: number) => {
      const index = mockContacts.findIndex((c) => c.id === id);
      if (index !== -1) {
        mockContacts.splice(index, 1);
      }
      return true;
    },
    stats: async () => {
      return {
        total: mockContacts.length,
        active: mockContacts.filter((c) => c.status === "active").length,
      };
    },
  },

  auth: {
    login: async () => {
      return { id: 1, name: "Demo User", email: "demo@example.com" };
    },
    register: async () => {
      return { id: 1, name: "Demo User", email: "demo@example.com" };
    },
    profile: async () => {
      return { id: 1, name: "Demo User", email: "demo@example.com" };
    },
  },
};

export default api;