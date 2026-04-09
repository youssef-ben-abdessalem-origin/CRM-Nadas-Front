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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
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
  Circle,
  CheckCircle,
  CheckSquare,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

interface AccountType {
  id: number;
  name: string;
  color: string;
}

interface AccountStatus {
  id: number;
  name: string;
  color: string;
}

interface AccountTier {
  id: number;
  name: string;
  color: string;
}

interface Account {
  id: number;
  name: string;
  website: string;
  industry: string;
  accountTypeId: number;
  type: AccountType;
  accountStatusId: number;
  status: AccountStatus;
  accountTierId: number;
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
  contactsCount: number;
  dealsCount: number;
  dealValue: number;
  revenueTotal: number;
  parentAccount: string | null;
  tags: string[];
}

interface AccountFormData {
  name: string;
  website: string;
  industry: string;
  accountTypeId: number | null;
  accountStatusId: number | null;
  accountTierId: number | null;
  annualRevenue: string;
  employeeCount: string;
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
  parentAccount: string;
  tags: string;
}

const industries = [
  "Technology",
  "SaaS",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Manufacturing",
  "Education",
  "Logistics",
  "Consulting",
  "Media",
  "Retail",
  "Real Estate",
  "Energy",
  "Telecom",
  "Other",
];

const initialAccounts: Account[] = [];

const Accounts = () => {
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const { data: accountTypes = [] } = useQuery({
    queryKey: ["account-types"],
    queryFn: () => api.accounts.getTypes().catch(() => []),
  });

  const { data: accountStatuses = [] } = useQuery({
    queryKey: ["account-statuses"],
    queryFn: () => api.accounts.getStatuses().catch(() => []),
  });

  const { data: accountTiers = [] } = useQuery({
    queryKey: ["account-tiers"],
    queryFn: () => api.accounts.getTiers().catch(() => []),
  });

  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const { data: accountActivities = [] } = useQuery({
    queryKey: ["account-activities", selectedAccount?.id],
    queryFn: () => selectedAccount ? api.activities.getByEntity("account", selectedAccount.id).catch(() => []) : [],
    enabled: !!selectedAccount,
  });

  const { data: accountDeals = [] } = useQuery({
    queryKey: ["account-deals", selectedAccount?.id],
    queryFn: () => selectedAccount ? api.deals.getByAccount(selectedAccount.id).catch(() => []) : [],
    enabled: !!selectedAccount,
  });

  const createMutation = useMutation({
    mutationFn: api.accounts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created successfully");
      setShowAdd(false);
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

  const completeActivityMutation = useMutation({
    mutationFn: (id: number) => api.activities.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-activities"] });
      toast.success("Activity completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
  const [formData, setFormData] = useState<AccountFormData>({
    name: "",
    website: "",
    industry: "Technology",
    accountTypeId: null,
    accountStatusId: null,
    accountTierId: null,
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
    owner: user?.name ? `${user.name} <${user.email || ""}>` : "",
    parentAccount: "",
    tags: "",
  });

  const getTypeId = (account: Account) =>
    account.type?.id || account.accountTypeId;
  const getStatusId = (account: Account) =>
    account.status?.id || account.accountStatusId;
  const getTierId = (account: Account) =>
    account.tier?.id || account.accountTierId;

  const getTypeName = (account: Account) => account.type?.name || "Unknown";
  const getStatusName = (account: Account) => account.status?.name || "Unknown";
  const getTierName = (account: Account) => account.tier?.name || "Unknown";

  const getTypeColor = (account: Account) => account.type?.color || "#6b7280";
  const getStatusColor = (account: Account) =>
    account.status?.color || "#6b7280";
  const getTierColor = (account: Account) => account.tier?.color || "#6b7280";

  const filtered = accounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.website?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (a.industry?.toLowerCase() || "").includes(search.toLowerCase());
    const typeId = getTypeId(a);
    const statusId = getStatusId(a);
    const tierId = getTierId(a);
    const matchesType = filterType === "all" || String(typeId) === filterType;
    const matchesStatus =
      filterStatus === "all" || String(statusId) === filterStatus;
    const matchesIndustry =
      filterIndustry === "all" || a.industry === filterIndustry;
    const matchesTier = filterTier === "all" || String(tierId) === filterTier;
    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesIndustry &&
      matchesTier
    );
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => getStatusName(a).toLowerCase() === "active")
      .length,
    customers: accounts.filter(
      (a) => getTypeName(a).toLowerCase() === "customer",
    ).length,
    totalRevenue: accounts.reduce((sum, a) => sum + (a.revenueTotal || 0), 0),
    totalPipeline: accounts.reduce((sum, a) => sum + (a.dealValue || 0), 0),
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
      accountTypeId: accountTypes[0]?.id || null,
      accountStatusId: accountStatuses[0]?.id || null,
      accountTierId: accountTiers[0]?.id || null,
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
      name: account.name || "",
      website: account.website || "",
      industry: account.industry || "Technology",
      accountTypeId: getTypeId(account),
      accountStatusId: getStatusId(account),
      accountTierId: getTierId(account),
      annualRevenue: (account.annualRevenue || 0).toString(),
      employeeCount: (account.employeeCount || 0).toString(),
      phone: account.phone || "",
      email: account.email || "",
      location: account.location || "",
      address: account.address || "",
      city: account.city || "",
      state: account.state || "",
      country: account.country || "",
      zipCode: account.zipCode || "",
      description: account.description || "",
      notes: account.notes || "",
      owner: account.owner || "",
      parentAccount: account.parentAccount || "",
      tags: Array.isArray(account.tags) ? account.tags.join(", ") : "",
    });
    setShowDetail(false);
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
      accountTypeId: formData.accountTypeId,
      accountStatusId: formData.accountStatusId,
      accountTierId: formData.accountTierId,
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
      parentAccountId: formData.parentAccount
        ? parseInt(formData.parentAccount)
        : null,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
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
        accountTypeId: formData.accountTypeId,
        accountStatusId: formData.accountStatusId,
        accountTierId: formData.accountTierId,
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
        parentAccountId: formData.parentAccount
          ? parseInt(formData.parentAccount)
          : null,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      },
    });
    setShowEdit(false);
    setEditingAccount(null);
    resetForm();
  };

  const handleDelete = (account: Account) => {
    deleteMutation.mutate(account.id);
  };

  const handleStatusChange = (accountId: number, newStatusId: number) => {
    updateMutation.mutate({
      id: accountId,
      data: { accountStatusId: newStatusId },
    });
    const found = accountStatuses.find((s) => s.id === newStatusId);
    toast.success(`Status updated to ${found?.name || "Unknown"}`);
  };

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
                {accountTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {accountStatuses.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
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
                {accountTiers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
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
            {selectedAccounts.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowBulkActions(true)}>
                <CheckSquare className="h-3.5 w-3.5 mr-1" /> Bulk ({selectedAccounts.length})
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Account
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedAccounts.length > 0 && selectedAccounts.length === filtered.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccounts(filtered.map((a: Account) => a.id));
                      } else {
                        setSelectedAccounts([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No accounts found</p>
                    <p className="text-sm">
                      Get started by adding your first account
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((account) => (
                  <TableRow
                    key={account.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowDetail(true);
                    }}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedAccounts([...selectedAccounts, account.id]);
                          } else {
                            setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            {account.name}
                            {account.parentAccount && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4"
                              >
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
                        className={`bg-[${getTypeColor(account)}]/10 text-[${getTypeColor(account)}] border-[${getTypeColor(account)}]/20`}
                      >
                        {getTypeName(account)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getTierColor(account)}
                      >
                        {getTierName(account)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(account)}
                      >
                        {getStatusName(account)}
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
                        {account.contactsCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <Handshake className="h-3.5 w-3.5 text-muted-foreground" />
                        {account.dealsCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{account.owner || "—"}</span>
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
                ))
              )}
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
                        className={getTypeColor(selectedAccount)}
                      >
                        {getTypeName(selectedAccount)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getTierColor(selectedAccount)}
                      >
                        {getTierName(selectedAccount)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusColor(selectedAccount)}
                      >
                        {getStatusName(selectedAccount)}
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
                        <span className="font-medium">
                          {selectedAccount.industry}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Annual Revenue
                        </span>
                        <span className="font-medium">
                          {formatCurrency(selectedAccount.annualRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees</span>
                        <span>
                          {formatNumber(selectedAccount.employeeCount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Owner
                        </span>
                        <span>{selectedAccount.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Customer Since
                        </span>
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
                        <span className="text-muted-foreground">
                          Active Deal
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(selectedAccount.dealValue || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Revenue
                        </span>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(selectedAccount.revenueTotal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Open Deals
                        </span>
                        <span>{selectedAccount.dealsCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contacts</span>
                        <span>{selectedAccount.contactsCount || 0}</span>
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
                      <p>
                        {selectedAccount.city}
                        {selectedAccount.state
                          ? `, ${selectedAccount.state}`
                          : ""}
                      </p>
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

                {selectedAccount.tags?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAccount.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAccount.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAccount.description}
                    </p>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Activities</h4>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Add activity")}>
                      <Plus className="h-4 w-4" />
                      <span className="ml-1">Add</span>
                    </Button>
                  </div>
                  {accountActivities && accountActivities.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {accountActivities.map((activity: any) => (
                        <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <button onClick={() => !activity.completed && completeActivityMutation.mutate(activity.id)}>
                              {activity.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <div>
                              <p className={`text-sm ${activity.completed ? "line-through text-muted-foreground" : ""}`}>
                                {activity.subject || "Activity"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : "No due date"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No activities</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Deals</h4>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Create new deal")}>
                      <Plus className="h-4 w-4" />
                      <span className="ml-1">Add</span>
                    </Button>
                  </div>
                  {accountDeals && accountDeals.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {accountDeals.map((deal: any) => (
                        <div key={deal.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Handshake className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{deal.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(deal.value)} • {deal.stage?.name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No deals</p>
                  )}
                </div>

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
                      toast.info(
                        `Scheduling activity for ${selectedAccount.name}`,
                      );
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

        {/* Add Account Drawer */}
        <Drawer
          open={showAdd}
          onOpenChange={(open) => {
            setShowAdd(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Account</DrawerTitle>
              <DrawerDescription>
                Fill in the details to create a new account.
              </DrawerDescription>
            </DrawerHeader>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            >
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1">
                Company Info
              </div>

              <div className="space-y-2">
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Acme Corp"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  onValueChange={(v) =>
                    setFormData({ ...formData, industry: v })
                  }
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
                <Label>Location</Label>
                <Input
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Contact Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">
                Contact Info
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
                <Label>Account Owner</Label>
                <Input
                  placeholder="Alex Morgan"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                />
              </div>

              {/* Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">
                Details
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={
                    formData.accountTypeId ? String(formData.accountTypeId) : ""
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, accountTypeId: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={
                    formData.accountStatusId
                      ? String(formData.accountStatusId)
                      : ""
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, accountStatusId: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountStatuses.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={
                    formData.accountTierId ? String(formData.accountTierId) : ""
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, accountTierId: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTiers.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
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
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="strategic, cloud"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">
                Address
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  placeholder="100 Market Street"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  placeholder="USA"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  placeholder="94105"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
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
            <DrawerFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdd(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={createMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create Account"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Edit Account Drawer */}
        <Drawer
          open={showEdit}
          onOpenChange={(open) => {
            setShowEdit(open);
            if (!open) {
              setEditingAccount(null);
            }
          }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Account</DrawerTitle>
              <DrawerDescription>Update account information.</DrawerDescription>
            </DrawerHeader>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            >
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1">
                Company Info
              </div>

              <div className="space-y-2">
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Acme Corp"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  onValueChange={(v) =>
                    setFormData({ ...formData, industry: v })
                  }
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
                <Label>Location</Label>
                <Input
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Contact Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">
                Contact Info
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
                <Label>Account Owner</Label>
                <Input
                  placeholder="Alex Morgan"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                />
              </div>

              {/* Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">
                Details
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={
                    formData.accountTypeId ? String(formData.accountTypeId) : ""
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, accountTypeId: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={
                    formData.accountStatusId
                      ? String(formData.accountStatusId)
                      : ""
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, accountStatusId: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountStatuses.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={
                    formData.accountTierId ? String(formData.accountTierId) : ""
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, accountTierId: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTiers.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
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
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="strategic, cloud"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">
                Address
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  placeholder="100 Market Street"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  placeholder="USA"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  placeholder="94105"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
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
            <DrawerFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEdit(false);
                  setEditingAccount(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
              <DialogDescription>
                Apply actions to {selectedAccounts.length} selected accounts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  api.accounts.bulkUpdate(selectedAccounts, { accountTypeId: 1 }).then(() => {
                    toast.success("Accounts updated");
                    setSelectedAccounts([]);
                    setShowBulkActions(false);
                    queryClient.invalidateQueries({ queryKey: ["accounts"] });
                  }).catch((err: Error) => toast.error(err.message));
                }}
              >
                <Briefcase className="h-4 w-4 mr-2" /> Update Type
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-500"
                onClick={() => {
                  if (confirm(`Delete ${selectedAccounts.length} accounts?`)) {
                    api.accounts.bulkDelete(selectedAccounts).then(() => {
                      toast.success("Accounts deleted");
                      setSelectedAccounts([]);
                      setShowBulkActions(false);
                      queryClient.invalidateQueries({ queryKey: ["accounts"] });
                    }).catch((err: Error) => toast.error(err.message));
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

export default Accounts;
