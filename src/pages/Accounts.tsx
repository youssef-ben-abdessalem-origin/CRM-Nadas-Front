import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Handshake,
  Calendar,
  Edit,
  Trash2,
  Copy,
  ArrowUpRight,
  Minus,
  ArrowDownRight,
  Phone,
  Mail,
  Layers,
  Briefcase,
  Hash,
  Check,
  FileText,
  Eye,
  Tag,
  Phone as PhoneIcon,
  Mail as MailIcon,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

type AccountType = "customer" | "partner" | "prospect" | "competitor";
type AccountStatus = "active" | "inactive" | "churned";
type AccountTier = "enterprise" | "mid-market" | "smb";

interface Account {
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
  owner: string;
  created: string;
  contacts: number;
  deals: number;
  dealValue: number;
  revenueTotal: number;
  parentAccount: string | null;
  tags: string[];
}

const typeConfig: Record<AccountType, { label: string; color: string }> = {
  customer: { label: "Customer", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  partner: { label: "Partner", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  prospect: { label: "Prospect", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  competitor: { label: "Competitor", color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const statusConfig: Record<AccountStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  churned: { label: "Churned", color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const tierConfig: Record<AccountTier, { label: string; color: string }> = {
  enterprise: { label: "Enterprise", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  "mid-market": { label: "Mid-Market", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  smb: { label: "SMB", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
};

const industries = [
  "Technology", "SaaS", "Healthcare", "Finance", "E-commerce",
  "Manufacturing", "Education", "Logistics", "Consulting", "Media",
  "Retail", "Real Estate", "Energy", "Telecom", "Other",
];

const initialAccounts: Account[] = [
  {
    id: 1,
    name: "Acme Corp",
    website: "acmecorp.com",
    industry: "Technology",
    type: "customer",
    status: "active",
    tier: "enterprise",
    annualRevenue: 50000000,
    employeeCount: 1200,
    phone: "+1 (555) 100-0001",
    email: "contact@acmecorp.com",
    location: "San Francisco, CA",
    address: "100 Market Street",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94105",
    description: "Leading technology company specializing in cloud infrastructure and enterprise solutions.",
    notes: "Strategic account. Multi-year partnership. Key stakeholder: Sarah Chen (VP Engineering).",
    owner: "Alex Morgan",
    created: "2022-03-15",
    contacts: 8,
    deals: 4,
    dealValue: 124000,
    revenueTotal: 342000,
    parentAccount: null,
    tags: ["strategic", "cloud", "enterprise"],
  },
  {
    id: 2,
    name: "TechFlow",
    website: "techflow.io",
    industry: "SaaS",
    type: "customer",
    status: "active",
    tier: "enterprise",
    annualRevenue: 25000000,
    employeeCount: 450,
    phone: "+1 (555) 200-0002",
    email: "hello@techflow.io",
    location: "Austin, TX",
    address: "500 Congress Ave",
    city: "Austin",
    state: "TX",
    country: "USA",
    zipCode: "78701",
    description: "SaaS platform for workflow automation and team collaboration.",
    notes: "Growing account. Expanding usage. Technical buyer: Marcus Johnson (CTO).",
    owner: "Sarah Kim",
    created: "2022-08-22",
    contacts: 5,
    deals: 3,
    dealValue: 89000,
    revenueTotal: 198000,
    parentAccount: null,
    tags: ["saas", "automation", "growing"],
  },
  {
    id: 3,
    name: "NexGen Solutions",
    website: "nexgen.com",
    industry: "Technology",
    type: "customer",
    status: "active",
    tier: "mid-market",
    annualRevenue: 12000000,
    employeeCount: 200,
    phone: "+1 (555) 300-0003",
    email: "info@nexgen.com",
    location: "New York, NY",
    address: "350 Fifth Avenue",
    city: "New York",
    state: "NY",
    country: "USA",
    zipCode: "10118",
    description: "Product development and innovation consultancy.",
    notes: "Product-focused buyer. Emily Rodriguez is the main contact.",
    owner: "Alex Morgan",
    created: "2023-01-10",
    contacts: 3,
    deals: 2,
    dealValue: 56000,
    revenueTotal: 78000,
    parentAccount: null,
    tags: ["product", "consulting"],
  },
  {
    id: 4,
    name: "Synergy Co",
    website: "synergy.co",
    industry: "Consulting",
    type: "partner",
    status: "active",
    tier: "enterprise",
    annualRevenue: 80000000,
    employeeCount: 2500,
    phone: "+1 (555) 400-0004",
    email: "partners@synergy.co",
    location: "Seattle, WA",
    address: "1918 8th Ave",
    city: "Seattle",
    state: "WA",
    country: "USA",
    zipCode: "98101",
    description: "Global consulting firm with strong enterprise relationships.",
    notes: "Strategic partner. Referral source. David Kim (CEO) is a champion.",
    owner: "Jordan Lee",
    created: "2021-06-01",
    contacts: 12,
    deals: 6,
    dealValue: 210000,
    revenueTotal: 890000,
    parentAccount: null,
    tags: ["partner", "referral", "strategic"],
  },
  {
    id: 5,
    name: "CloudBase",
    website: "cloudbase.io",
    industry: "Technology",
    type: "customer",
    status: "inactive",
    tier: "mid-market",
    annualRevenue: 8000000,
    employeeCount: 150,
    phone: "+1 (555) 500-0005",
    email: "support@cloudbase.io",
    location: "Denver, CO",
    address: "1600 Champa St",
    city: "Denver",
    state: "CO",
    country: "USA",
    zipCode: "80202",
    description: "Cloud infrastructure and managed services provider.",
    notes: "Went dark after budget freeze. Re-engage in Q2. Lisa Park is the contact.",
    owner: "Sarah Kim",
    created: "2023-05-15",
    contacts: 2,
    deals: 2,
    dealValue: 45000,
    revenueTotal: 45000,
    parentAccount: null,
    tags: ["cloud", "inactive"],
  },
  {
    id: 6,
    name: "DataPrime",
    website: "dataprime.io",
    industry: "Technology",
    type: "customer",
    status: "active",
    tier: "enterprise",
    annualRevenue: 35000000,
    employeeCount: 800,
    phone: "+1 (555) 600-0006",
    email: "contact@dataprime.io",
    location: "Boston, MA",
    address: "200 Clarendon St",
    city: "Boston",
    state: "MA",
    country: "USA",
    zipCode: "02116",
    description: "Data analytics and business intelligence platform.",
    notes: "High-value account. Anna Martinez (CFO) handles contracts. Renewal in June.",
    owner: "Alex Morgan",
    created: "2022-01-20",
    contacts: 6,
    deals: 4,
    dealValue: 167000,
    revenueTotal: 520000,
    parentAccount: null,
    tags: ["data", "analytics", "high-value"],
  },
  {
    id: 7,
    name: "ScaleUp",
    website: "scaleup.com",
    industry: "E-commerce",
    type: "customer",
    status: "active",
    tier: "enterprise",
    annualRevenue: 120000000,
    employeeCount: 3000,
    phone: "+1 (555) 700-0007",
    email: "business@scaleup.com",
    location: "Los Angeles, CA",
    address: "600 Wilshire Blvd",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    zipCode: "90017",
    description: "Fast-growing e-commerce platform serving SMB retailers.",
    notes: "Largest account. Robert Taylor (Founder) is the relationship. Needs dedicated AM.",
    owner: "Jordan Lee",
    created: "2021-09-01",
    contacts: 10,
    deals: 7,
    dealValue: 340000,
    revenueTotal: 1240000,
    parentAccount: null,
    tags: ["ecommerce", "largest", "expansion"],
  },
  {
    id: 8,
    name: "Innovate Inc",
    website: "innovate.com",
    industry: "Technology",
    type: "prospect",
    status: "active",
    tier: "mid-market",
    annualRevenue: 15000000,
    employeeCount: 300,
    phone: "+1 (555) 800-0008",
    email: "sales@innovate.com",
    location: "Chicago, IL",
    address: "233 S Wacker Dr",
    city: "Chicago",
    state: "IL",
    country: "USA",
    zipCode: "60606",
    description: "Sales technology and CRM solutions provider.",
    notes: "Prospect evaluating our platform. James Wright (VP Sales) is champion.",
    owner: "Sarah Kim",
    created: "2023-07-18",
    contacts: 4,
    deals: 3,
    dealValue: 78000,
    revenueTotal: 0,
    parentAccount: null,
    tags: ["prospect", "sales-tech"],
  },
  {
    id: 9,
    name: "HealthBridge",
    website: "healthbridge.org",
    industry: "Healthcare",
    type: "customer",
    status: "churned",
    tier: "smb",
    annualRevenue: 5000000,
    employeeCount: 80,
    phone: "+1 (555) 900-0009",
    email: "admin@healthbridge.org",
    location: "Portland, OR",
    address: "1000 SW Broadway",
    city: "Portland",
    state: "OR",
    country: "USA",
    zipCode: "97205",
    description: "Healthcare technology platform for patient management.",
    notes: "Churned due to compliance concerns. May return with HIPAA module.",
    owner: "Alex Morgan",
    created: "2022-11-05",
    contacts: 2,
    deals: 2,
    dealValue: 0,
    revenueTotal: 28000,
    parentAccount: null,
    tags: ["healthcare", "churned", "compliance"],
  },
  {
    id: 10,
    name: "LogixPro",
    website: "logixpro.com",
    industry: "Logistics",
    type: "customer",
    status: "active",
    tier: "mid-market",
    annualRevenue: 20000000,
    employeeCount: 500,
    phone: "+1 (555) 100-0010",
    email: "contact@logixpro.com",
    location: "Atlanta, GA",
    address: "303 Peachtree St",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    zipCode: "30303",
    description: "Supply chain and logistics optimization platform.",
    notes: "Chris Anderson (COO) is the main contact. ERP integration in progress.",
    owner: "Jordan Lee",
    created: "2023-04-01",
    contacts: 5,
    deals: 3,
    dealValue: 92000,
    revenueTotal: 184000,
    parentAccount: null,
    tags: ["logistics", "supply-chain"],
  },
  {
    id: 11,
    name: "CloudBase Europe",
    website: "cloudbase.eu",
    industry: "Technology",
    type: "customer",
    status: "active",
    tier: "smb",
    annualRevenue: 3000000,
    employeeCount: 45,
    phone: "+44 20 7946 0958",
    email: "eu@cloudbase.io",
    location: "London, UK",
    address: "10 Downing Street",
    city: "London",
    state: "",
    country: "UK",
    zipCode: "SW1A 2AA",
    description: "European subsidiary of CloudBase.",
    notes: "Subsidiary account. Parent: CloudBase (ID: 5). Separate contract.",
    owner: "Sarah Kim",
    created: "2023-09-01",
    contacts: 2,
    deals: 1,
    dealValue: 22000,
    revenueTotal: 22000,
    parentAccount: "CloudBase",
    tags: ["subsidiary", "europe"],
  },
  {
    id: 12,
    name: "CompetitorX",
    website: "competitorx.com",
    industry: "Technology",
    type: "competitor",
    status: "active",
    tier: "enterprise",
    annualRevenue: 200000000,
    employeeCount: 5000,
    phone: "+1 (555) 999-0012",
    email: "info@competitorx.com",
    location: "San Jose, CA",
    address: "170 W Tasman Dr",
    city: "San Jose",
    state: "CA",
    country: "USA",
    zipCode: "95134",
    description: "Direct competitor in the enterprise cloud space.",
    notes: "Tracking for competitive intelligence. Lost 2 deals to them this quarter.",
    owner: "Jordan Lee",
    created: "2023-02-01",
    contacts: 1,
    deals: 0,
    dealValue: 0,
    revenueTotal: 0,
    parentAccount: null,
    tags: ["competitor", "tracking"],
  },
];

const Accounts = () => {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.accounts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created successfully");
      setShowAdd(false);
      setAddStep(0);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.accounts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.accounts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted successfully");
      setShowDetail(false);
      setSelectedAccount(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addStep, setAddStep] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "Technology",
    type: "prospect" as AccountType,
    status: "active" as AccountStatus,
    tier: "smb" as AccountTier,
    annualRevenue: "",
    employeeCount: "",
    phone: "",
    email: "",
    location: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    description: "",
    notes: "",
    owner: "",
    parentAccount: "",
    tags: "",
  });

  const steps = [
    { label: "Company", icon: Building2, description: "Basic info" },
    { label: "Contact", icon: PhoneIcon, description: "Phone & email" },
    { label: "Details", icon: FileText, description: "Type, tier & revenue" },
    { label: "Address", icon: MapPin, description: "Location details" },
    { label: "Review", icon: Eye, description: "Confirm & create" },
  ];

  const filtered = accounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.website.toLowerCase().includes(search.toLowerCase()) ||
      a.industry.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || a.type === filterType;
    const matchesIndustry = filterIndustry === "all" || a.industry === filterIndustry;
    const matchesTier = filterTier === "all" || a.tier === filterTier;
    return matchesSearch && matchesType && matchesIndustry && matchesTier;
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === "active").length,
    customers: accounts.filter((a) => a.type === "customer").length,
    totalRevenue: accounts.reduce((sum, a) => sum + a.revenueTotal, 0),
    totalPipeline: accounts.reduce((sum, a) => sum + a.dealValue, 0),
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: value >= 1000000 ? 0 : 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      website: "",
      industry: "Technology",
      type: "prospect",
      status: "active",
      tier: "smb",
      annualRevenue: "",
      employeeCount: "",
      phone: "",
      email: "",
      location: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      description: "",
      notes: "",
      owner: "",
      parentAccount: "",
      tags: "",
    });
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      website: account.website,
      industry: account.industry,
      type: account.type,
      status: account.status,
      tier: account.tier,
      annualRevenue: account.annualRevenue.toString(),
      employeeCount: account.employeeCount.toString(),
      phone: account.phone,
      email: account.email,
      location: account.location,
      address: account.address,
      city: account.city,
      state: account.state,
      country: account.country,
      zipCode: account.zipCode,
      description: account.description,
      notes: account.notes,
      owner: account.owner,
      parentAccount: account.parentAccount || "",
      tags: account.tags.join(", "),
    });
    setShowEdit(true);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.website) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      website: formData.website,
      industry: formData.industry,
      type: formData.type,
      status: formData.status,
      tier: formData.tier,
      annualRevenue: parseInt(formData.annualRevenue) || 0,
      employeeCount: parseInt(formData.employeeCount) || 0,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      zipCode: formData.zipCode,
      description: formData.description,
      notes: formData.notes,
      owner: formData.owner,
      parentAccountId: formData.parentAccount ? parseInt(formData.parentAccount) : null,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  const handleEdit = () => {
    if (!editingAccount || !formData.name) return;
    updateMutation.mutate({
      id: editingAccount.id,
      data: {
        name: formData.name,
        website: formData.website,
        industry: formData.industry,
        type: formData.type,
        status: formData.status,
        tier: formData.tier,
        annualRevenue: parseInt(formData.annualRevenue) || 0,
        employeeCount: parseInt(formData.employeeCount) || 0,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        description: formData.description,
        notes: formData.notes,
        owner: formData.owner,
        parentAccountId: formData.parentAccount ? parseInt(formData.parentAccount) : null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      },
    });
    setShowEdit(false);
    setEditingAccount(null);
    resetForm();
  };

  const handleDelete = (account: Account) => {
    deleteMutation.mutate(account.id);
  };

  const handleStatusChange = (accountId: number, newStatus: AccountStatus) => {
    updateMutation.mutate({ id: accountId, data: { status: newStatus } });
    toast.success(`Status updated to ${statusConfig[newStatus].label}`);
  };

  const AccountForm = ({ onSubmit }: { onSubmit: () => void }) => (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Acme Corp"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            Website <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="acmecorp.com"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(v) => setFormData({ ...formData, industry: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) =>
              setFormData({ ...formData, type: v as AccountType })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="competitor">Competitor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData({ ...formData, status: v as AccountStatus })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tier</Label>
          <Select
            value={formData.tier}
            onValueChange={(v) =>
              setFormData({ ...formData, tier: v as AccountTier })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="mid-market">Mid-Market</SelectItem>
              <SelectItem value="smb">SMB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Annual Revenue</Label>
          <Input
            type="number"
            placeholder="10000000"
            value={formData.annualRevenue}
            onChange={(e) =>
              setFormData({ ...formData, annualRevenue: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Employee Count</Label>
          <Input
            type="number"
            placeholder="500"
            value={formData.employeeCount}
            onChange={(e) =>
              setFormData({ ...formData, employeeCount: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="contact@company.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="San Francisco, CA"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Account Owner</Label>
          <Input
            placeholder="Alex Morgan"
            value={formData.owner}
            onChange={(e) =>
              setFormData({ ...formData, owner: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Parent Account</Label>
          <Input
            placeholder="Leave blank if none"
            value={formData.parentAccount}
            onChange={(e) =>
              setFormData({ ...formData, parentAccount: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input
            placeholder="strategic, cloud, enterprise"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Brief description of the company..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="resize-none"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Internal notes..."
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          className="resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <CRMLayout title="Accounts">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Building2 className="h-3 w-3 inline mr-1" />
                In database
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Engaged accounts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats.customers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <Handshake className="h-3 w-3 inline mr-1" />
                Paying customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <DollarSign className="h-3 w-3 inline mr-1" />
                Won deals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalPipeline)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Open opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="competitor">Competitor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="mid-market">Mid-Market</SelectItem>
                <SelectItem value="smb">SMB</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Account
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((account) => (
                <TableRow
                  key={account.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowDetail(true);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {account.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {account.name}
                          {account.parentAccount && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              <Layers className="h-2.5 w-2.5 mr-0.5" />
                              {account.parentAccount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {account.website}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={typeConfig[account.type].color}
                    >
                      {typeConfig[account.type].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={tierConfig[account.tier].color}
                    >
                      {tierConfig[account.tier].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[account.status].color}
                    >
                      {statusConfig[account.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.industry}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(account.annualRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {account.contacts}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm">
                      <Handshake className="h-3.5 w-3.5 text-muted-foreground" />
                      {account.deals}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {account.owner.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{account.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Email sent to ${account.name}`);
                        }}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Calling ${account.name}...`);
                        }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(account);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Copied ${account.name}`);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(account.id, "active");
                            }}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                            Mark Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(account.id, "inactive");
                            }}
                          >
                            <Minus className="h-4 w-4 mr-2 text-gray-500" />
                            Mark Inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(account.id, "churned");
                            }}
                          >
                            <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                            Mark Churned
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(account);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedAccount && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                          {selectedAccount.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <DialogTitle className="text-xl">
                          {selectedAccount.name}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          {selectedAccount.website}
                          {selectedAccount.parentAccount && (
                            <>
                              <span className="mx-1">·</span>
                              <Layers className="h-3 w-3" />
                              Subsidiary of {selectedAccount.parentAccount}
                            </>
                          )}
                        </DialogDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={typeConfig[selectedAccount.type].color}
                      >
                        {typeConfig[selectedAccount.type].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={tierConfig[selectedAccount.tier].color}
                      >
                        {tierConfig[selectedAccount.tier].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={statusConfig[selectedAccount.status].color}
                      >
                        {statusConfig[selectedAccount.status].label}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Company Info
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium">{selectedAccount.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Revenue</span>
                        <span className="font-medium">{formatCurrency(selectedAccount.annualRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees</span>
                        <span>{formatNumber(selectedAccount.employeeCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Owner</span>
                        <span>{selectedAccount.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer Since</span>
                        <span>{formatDate(selectedAccount.created)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Sales Metrics
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Deal</span>
                        <span className="font-semibold">{formatCurrency(selectedAccount.dealValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Revenue</span>
                        <span className="font-semibold text-green-500">{formatCurrency(selectedAccount.revenueTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open Deals</span>
                        <span>{selectedAccount.deals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contacts</span>
                        <span>{selectedAccount.contacts}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Address</span>
                      <p>{selectedAccount.address}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">City</span>
                      <p>{selectedAccount.city}{selectedAccount.state ? `, ${selectedAccount.state}` : ""}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Country</span>
                      <p>{selectedAccount.country}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ZIP</span>
                      <p>{selectedAccount.zipCode}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Contact
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAccount.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAccount.email}</span>
                    </div>
                  </div>
                </div>

                {selectedAccount.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAccount.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAccount.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedAccount.description}</p>
                  </div>
                )}

                {selectedAccount.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Internal Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedAccount.notes}
                    </p>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEdit(selectedAccount)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Scheduling activity for ${selectedAccount.name}`);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Schedule Activity
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Creating deal for ${selectedAccount.name}`);
                    }}
                  >
                    <Handshake className="h-4 w-4 mr-2" /> New Deal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedAccount)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Account Dialog - Stepper */}
        <Dialog
          open={showAdd}
          onOpenChange={(open) => {
            setShowAdd(open);
            if (!open) {
              setAddStep(0);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Account</DialogTitle>
              <DialogDescription>
                Create a new account in {steps.length} steps.
              </DialogDescription>
            </DialogHeader>

            {/* Stepper */}
            <div className="flex items-center justify-between px-2 py-2">
              {steps.map((step, idx) => {
                const isCompleted = idx < addStep;
                const isCurrent = idx === addStep;
                return (
                  <div key={step.label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-all ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : isCurrent
                              ? "border-primary text-primary"
                              : "border-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-xs font-medium ${
                            isCurrent ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground hidden sm:block">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 mb-6 ${
                          idx < addStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="min-h-[260px]">
              {/* Step 0: Company */}
              {addStep === 0 && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Acme Corp"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Website <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="acmecorp.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(v) => setFormData({ ...formData, industry: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of the company..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Contact */}
              {addStep === 1 && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="contact@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Owner</Label>
                    <Input
                      placeholder="Alex Morgan"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {addStep === 2 && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) =>
                          setFormData({ ...formData, type: v as AccountType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="competitor">Competitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) =>
                          setFormData({ ...formData, status: v as AccountStatus })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="churned">Churned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tier</Label>
                      <Select
                        value={formData.tier}
                        onValueChange={(v) =>
                          setFormData({ ...formData, tier: v as AccountTier })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="mid-market">Mid-Market</SelectItem>
                          <SelectItem value="smb">SMB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Revenue</Label>
                      <Input
                        type="number"
                        placeholder="10000000"
                        value={formData.annualRevenue}
                        onChange={(e) =>
                          setFormData({ ...formData, annualRevenue: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee Count</Label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={formData.employeeCount}
                        onChange={(e) =>
                          setFormData({ ...formData, employeeCount: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent Account</Label>
                      <Input
                        placeholder="Leave blank if none"
                        value={formData.parentAccount}
                        onChange={(e) =>
                          setFormData({ ...formData, parentAccount: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                      placeholder="strategic, cloud, enterprise"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {addStep === 3 && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      placeholder="100 Market Street"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        placeholder="San Francisco"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        placeholder="CA"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        placeholder="USA"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input
                        placeholder="94105"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea
                      placeholder="Internal notes about this account..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {addStep === 4 && (
                <div className="space-y-4 py-2">
                  <div className="bg-muted/50 rounded-lg divide-y">
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Company
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name</span>
                          <p className="font-medium">{formData.name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Website</span>
                          <p className="font-medium">{formData.website || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Industry</span>
                          <p>{formData.industry || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Description</span>
                          <p>{formData.description || "—"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Contact
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Phone</span>
                          <p>{formData.phone || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email</span>
                          <p>{formData.email || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location</span>
                          <p>{formData.location || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Owner</span>
                          <p>{formData.owner || "—"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type</span>
                          <p>
                            <Badge
                              variant="outline"
                              className={typeConfig[formData.type].color}
                            >
                              {typeConfig[formData.type].label}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status</span>
                          <p>
                            <Badge
                              variant="outline"
                              className={statusConfig[formData.status].color}
                            >
                              {statusConfig[formData.status].label}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tier</span>
                          <p>
                            <Badge
                              variant="outline"
                              className={tierConfig[formData.tier].color}
                            >
                              {tierConfig[formData.tier].label}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Annual Revenue</span>
                          <p className="font-semibold">
                            {formData.annualRevenue
                              ? formatCurrency(parseInt(formData.annualRevenue))
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Employees</span>
                          <p>{formData.employeeCount ? formatNumber(parseInt(formData.employeeCount)) : "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parent Account</span>
                          <p>{formData.parentAccount || "—"}</p>
                        </div>
                      </div>
                      {formData.tags && (
                        <div className="mt-3">
                          <span className="text-muted-foreground text-sm">Tags</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {formData.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Address
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Address</span>
                          <p>{formData.address || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">City</span>
                          <p>{formData.city || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">State</span>
                          <p>{formData.state || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Country</span>
                          <p>{formData.country || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ZIP</span>
                          <p>{formData.zipCode || "—"}</p>
                        </div>
                      </div>
                      {formData.notes && (
                        <div className="mt-3">
                          <span className="text-muted-foreground text-sm">Notes</span>
                          <p className="text-sm text-muted-foreground mt-1 bg-background p-2 rounded">
                            {formData.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  if (addStep === 0) {
                    setShowAdd(false);
                    resetForm();
                  } else {
                    setAddStep(addStep - 1);
                  }
                }}
              >
                {addStep === 0 ? "Cancel" : "Back"}
              </Button>
              <div className="flex items-center gap-2">
                {addStep < steps.length - 1 ? (
                  <Button
                    onClick={() => {
                      if (addStep === 0 && (!formData.name || !formData.website)) {
                        toast.error("Please fill in name and website");
                        return;
                      }
                      setAddStep(addStep + 1);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleAdd}>
                    <Check className="h-4 w-4 mr-2" /> Create Account
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>
                Update account information.
              </DialogDescription>
            </DialogHeader>
            <AccountForm onSubmit={handleEdit} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

export default Accounts;
