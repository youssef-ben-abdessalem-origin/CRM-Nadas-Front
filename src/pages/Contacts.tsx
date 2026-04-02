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
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Star,
  Trash2,
  Edit,
  Copy,
  Handshake,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Check,
  User,
  Briefcase,
  FileText,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

type ContactStatus = "active" | "inactive" | "churned";
type ContactTier = "enterprise" | "professional" | "starter";

interface Contact {
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
}

const statusConfig: Record<ContactStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  churned: { label: "Churned", color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const tierConfig: Record<ContactTier, { label: string; icon: typeof Star }> = {
  enterprise: { label: "Enterprise", icon: Star },
  professional: { label: "Professional", icon: Star },
  starter: { label: "Starter", icon: Star },
};

const tierColors: Record<ContactTier, string> = {
  enterprise: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  professional: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  starter: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const initialContacts: Contact[] = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@acmecorp.com",
    phone: "+1 (555) 101-2020",
    company: "Acme Corp",
    title: "VP Engineering",
    status: "active",
    tier: "enterprise",
    dealValue: 124000,
    lastContact: "2h ago",
    created: "2023-06-15",
    location: "San Francisco, CA",
    industry: "Technology",
    website: "acmecorp.com",
    notes: "Key decision maker. Interested in enterprise migration plan. Quarterly review scheduled for March.",
    dealsWon: 3,
    dealsTotal: 4,
    revenueTotal: 342000,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "m.johnson@techflow.io",
    phone: "+1 (555) 202-3030",
    company: "TechFlow",
    title: "CTO",
    status: "active",
    tier: "enterprise",
    dealValue: 89000,
    lastContact: "1d ago",
    created: "2023-08-22",
    location: "Austin, TX",
    industry: "SaaS",
    website: "techflow.io",
    notes: "Technical buyer. Needs API integration support. Currently evaluating competitors.",
    dealsWon: 2,
    dealsTotal: 3,
    revenueTotal: 198000,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@nexgen.com",
    phone: "+1 (555) 303-4040",
    company: "NexGen Solutions",
    title: "Head of Product",
    status: "active",
    tier: "professional",
    dealValue: 56000,
    lastContact: "3d ago",
    created: "2023-09-10",
    location: "New York, NY",
    industry: "Product Development",
    website: "nexgen.com",
    notes: "Product-focused buyer. Attended our webinar on product analytics. Follow up on demo request.",
    dealsWon: 1,
    dealsTotal: 2,
    revenueTotal: 78000,
  },
  {
    id: 4,
    name: "David Kim",
    email: "dkim@synergy.co",
    phone: "+1 (555) 404-5050",
    company: "Synergy Co",
    title: "CEO",
    status: "active",
    tier: "enterprise",
    dealValue: 210000,
    lastContact: "5h ago",
    created: "2023-04-01",
    location: "Seattle, WA",
    industry: "Consulting",
    website: "synergy.co",
    notes: "C-level relationship. Multi-year contract potential. Referred 2 new leads this quarter.",
    dealsWon: 5,
    dealsTotal: 6,
    revenueTotal: 890000,
  },
  {
    id: 5,
    name: "Lisa Park",
    email: "lisa.park@cloudbase.io",
    phone: "+1 (555) 505-6060",
    company: "CloudBase",
    title: "Director of Ops",
    status: "inactive",
    tier: "professional",
    dealValue: 45000,
    lastContact: "2w ago",
    created: "2023-11-05",
    location: "Denver, CO",
    industry: "Cloud Services",
    website: "cloudbase.io",
    notes: "Went dark after initial demo. Budget freeze mentioned. Re-engage in Q2.",
    dealsWon: 1,
    dealsTotal: 2,
    revenueTotal: 45000,
  },
  {
    id: 6,
    name: "James Wright",
    email: "j.wright@innovate.com",
    phone: "+1 (555) 606-7070",
    company: "Innovate Inc",
    title: "VP Sales",
    status: "active",
    tier: "professional",
    dealValue: 78000,
    lastContact: "6h ago",
    created: "2023-07-18",
    location: "Chicago, IL",
    industry: "Sales Tech",
    website: "innovate.com",
    notes: "Sales ops integration. Interested in CRM analytics module. Champion for upsell.",
    dealsWon: 2,
    dealsTotal: 3,
    revenueTotal: 156000,
  },
  {
    id: 7,
    name: "Anna Martinez",
    email: "anna.m@dataprime.io",
    phone: "+1 (555) 707-8080",
    company: "DataPrime",
    title: "CFO",
    status: "active",
    tier: "enterprise",
    dealValue: 167000,
    lastContact: "1d ago",
    created: "2023-03-20",
    location: "Boston, MA",
    industry: "Data Analytics",
    website: "dataprime.io",
    notes: "Financial decision maker. Contract renewal in June. Prepare ROI analysis.",
    dealsWon: 4,
    dealsTotal: 4,
    revenueTotal: 520000,
  },
  {
    id: 8,
    name: "Robert Taylor",
    email: "r.taylor@scaleup.com",
    phone: "+1 (555) 808-9090",
    company: "ScaleUp",
    title: "Founder",
    status: "active",
    tier: "enterprise",
    dealValue: 340000,
    lastContact: "4h ago",
    created: "2023-01-10",
    location: "Los Angeles, CA",
    industry: "E-commerce",
    website: "scaleup.com",
    notes: "Largest account. Growing fast. Needs dedicated account manager. Expansion opportunity.",
    dealsWon: 6,
    dealsTotal: 7,
    revenueTotal: 1240000,
  },
  {
    id: 9,
    name: "Michelle Lee",
    email: "m.lee@healthbridge.org",
    phone: "+1 (555) 909-0101",
    company: "HealthBridge",
    title: "IT Director",
    status: "churned",
    tier: "starter",
    dealValue: 0,
    lastContact: "1mo ago",
    created: "2023-05-14",
    location: "Portland, OR",
    industry: "Healthcare",
    website: "healthbridge.org",
    notes: "Churned due to compliance concerns. May revisit with HIPAA module.",
    dealsWon: 1,
    dealsTotal: 2,
    revenueTotal: 28000,
  },
  {
    id: 10,
    name: "Chris Anderson",
    email: "chris.a@logixpro.com",
    phone: "+1 (555) 010-1212",
    company: "LogixPro",
    title: "COO",
    status: "active",
    tier: "professional",
    dealValue: 92000,
    lastContact: "12h ago",
    created: "2023-10-01",
    location: "Atlanta, GA",
    industry: "Logistics",
    website: "logixpro.com",
    notes: "Supply chain optimization project. Needs integration with existing ERP system.",
    dealsWon: 2,
    dealsTotal: 3,
    revenueTotal: 184000,
  },
];

const Contacts = () => {
  const queryClient = useQueryClient();
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.getAll().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.contacts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact created successfully");
      setShowAdd(false);
      setAddStep(0);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.contacts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.contacts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted successfully");
      setShowDetail(false);
      setSelectedContact(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addStep, setAddStep] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    status: "active" as ContactStatus,
    tier: "starter" as ContactTier,
    dealValue: "",
    location: "",
    industry: "",
    website: "",
    notes: "",
  });

  const steps = [
    { label: "Personal", icon: User, description: "Name & contact details" },
    { label: "Company", icon: Briefcase, description: "Organization info" },
    { label: "Details", icon: FileText, description: "Status, tier & notes" },
    { label: "Review", icon: Eye, description: "Confirm & create" },
  ];

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesTier = filterTier === "all" || c.tier === filterTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const stats = {
    total: contacts.length,
    active: contacts.filter((c) => c.status === "active").length,
    totalRevenue: contacts.reduce((sum, c) => sum + c.revenueTotal, 0),
    avgDealSize:
      contacts.filter((c) => c.dealsWon > 0).length > 0
        ? Math.round(
            contacts.reduce((sum, c) => sum + c.revenueTotal, 0) /
              contacts.filter((c) => c.dealsWon > 0).reduce(
                (sum, c) => sum + c.dealsWon,
                0
              )
          )
        : 0,
    churnRate: Math.round(
      (contacts.filter((c) => c.status === "churned").length / contacts.length) *
        100
    ),
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

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
      email: "",
      phone: "",
      company: "",
      title: "",
      status: "active",
      tier: "starter",
      dealValue: "",
      location: "",
      industry: "",
      website: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      title: formData.title,
      status: formData.status,
      tier: formData.tier,
      dealValue: parseInt(formData.dealValue) || 0,
      location: formData.location,
      industry: formData.industry,
      website: formData.website,
      notes: formData.notes,
    });
  };

  const handleEdit = () => {
    if (!editingContact || !formData.name || !formData.email) return;
    updateMutation.mutate({
      id: editingContact.id,
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        title: formData.title,
        status: formData.status,
        tier: formData.tier,
        dealValue: parseInt(formData.dealValue) || 0,
        location: formData.location,
        industry: formData.industry,
        website: formData.website,
        notes: formData.notes,
      },
    });
    setShowEdit(false);
    setEditingContact(null);
    resetForm();
  };

  const handleDelete = (contact: Contact) => {
    deleteMutation.mutate(contact.id);
  };

  const handleStatusChange = (contactId: number, newStatus: ContactStatus) => {
    updateMutation.mutate({ id: contactId, data: { status: newStatus } });
    toast.success(`Status updated to ${statusConfig[newStatus].label}`);
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      status: contact.status,
      tier: contact.tier,
      dealValue: contact.dealValue.toString(),
      location: contact.location,
      industry: contact.industry,
      website: contact.website,
      notes: contact.notes,
    });
    setShowEdit(true);
  };

  const ContactForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: () => void;
    submitLabel: string;
  }) => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label>
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder="john@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          Company <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Acme Corp"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="VP of Engineering"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(v) =>
            setFormData({ ...formData, status: v as ContactStatus })
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
            setFormData({ ...formData, tier: v as ContactTier })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Deal Value</Label>
        <Input
          type="number"
          placeholder="50000"
          value={formData.dealValue}
          onChange={(e) =>
            setFormData({ ...formData, dealValue: e.target.value })
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
        <Label>Industry</Label>
        <Input
          placeholder="Technology"
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Website</Label>
        <Input
          placeholder="company.com"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Additional context..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="resize-none"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <CRMLayout title="Contacts">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Users className="h-3 w-3 inline mr-1" />
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
                Engaged contacts
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
                Avg Deal Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.avgDealSize)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Per closed deal
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.churnRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lost contacts
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
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
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
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Contact
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Deal Value</TableHead>
                <TableHead>Won / Total</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowDetail(true);
                  }}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {contact.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{contact.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={tierColors[contact.tier]}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {tierConfig[contact.tier].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[contact.status].color}
                    >
                      {statusConfig[contact.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(contact.dealValue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[60px]">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${contact.dealsTotal > 0 ? (contact.dealsWon / contact.dealsTotal) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {contact.dealsWon}/{contact.dealsTotal}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {contact.lastContact}
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
                          toast.info(`Email sent to ${contact.name}`);
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
                          toast.info(`Calling ${contact.name}...`);
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
                              openEdit(contact);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Copied ${contact.name}`);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(contact.id, "active");
                            }}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                            Mark Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(contact.id, "inactive");
                            }}
                          >
                            <Minus className="h-4 w-4 mr-2 text-gray-500" />
                            Mark Inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(contact.id, "churned");
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
                              handleDelete(contact);
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
          <DialogContent className="max-w-2xl">
            {selectedContact && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedContact.name}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedContact.title} at {selectedContact.company}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={tierColors[selectedContact.tier]}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {tierConfig[selectedContact.tier].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={statusConfig[selectedContact.status].color}
                      >
                        {statusConfig[selectedContact.status].label}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Contact Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedContact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedContact.phone}</span>
                      </div>
                      {selectedContact.website && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="text-primary hover:underline">
                            {selectedContact.website}
                          </span>
                        </div>
                      )}
                      {selectedContact.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedContact.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Deal Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Active Deal
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(selectedContact.dealValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Total Revenue
                        </span>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(selectedContact.revenueTotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Deals Won
                        </span>
                        <span>
                          {selectedContact.dealsWon} /{" "}
                          {selectedContact.dealsTotal}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Win Rate
                        </span>
                        <span className="font-medium">
                          {selectedContact.dealsTotal > 0
                            ? Math.round(
                                (selectedContact.dealsWon /
                                  selectedContact.dealsTotal) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <p className="font-medium">{selectedContact.industry}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <span className="text-muted-foreground">
                      Customer Since
                    </span>
                    <p className="font-medium">
                      {formatDate(selectedContact.created)}
                    </p>
                  </div>
                </div>

                {selectedContact.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedContact.notes}
                    </p>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEdit(selectedContact)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Scheduling activity for ${selectedContact.name}`);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Schedule Activity
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Creating deal for ${selectedContact.name}`);
                    }}
                  >
                    <Handshake className="h-4 w-4 mr-2" /> New Deal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Creating invoice for ${selectedContact.name}`);
                    }}
                  >
                    <Receipt className="h-4 w-4 mr-2" /> New Invoice
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedContact)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Contact Dialog - Stepper */}
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
              <DialogTitle>New Contact</DialogTitle>
              <DialogDescription>
                Create a new contact in {steps.length} steps.
              </DialogDescription>
            </DialogHeader>

            {/* Stepper */}
            <div className="flex items-center justify-between px-4 py-2">
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
            <div className="min-h-[280px]">
              {/* Step 0: Personal */}
              {addStep === 0 && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="John"
                        value={formData.name.split(" ").slice(0, -1).join(" ") || formData.name}
                        onChange={(e) => {
                          const parts = formData.name.split(" ");
                          parts[0] = e.target.value;
                          setFormData({ ...formData, name: parts.join(" ").trim() });
                        }}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Doe"
                        value={formData.name.split(" ").slice(1).join(" ") || ""}
                        onChange={(e) => {
                          const first = formData.name.split(" ")[0] || "";
                          setFormData({ ...formData, name: `${first} ${e.target.value}`.trim() });
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      placeholder="company.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Company */}
              {addStep === 1 && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="VP of Engineering"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      placeholder="Technology"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
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
                    <Label>Deal Value</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={formData.dealValue}
                      onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {addStep === 2 && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) =>
                          setFormData({ ...formData, status: v as ContactStatus })
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
                          setFormData({ ...formData, tier: v as ContactTier })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Any additional context about this contact..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="resize-none"
                      rows={4}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {addStep === 3 && (
                <div className="space-y-4 py-2">
                  <div className="bg-muted/50 rounded-lg divide-y">
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Personal Info
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name</span>
                          <p className="font-medium">{formData.name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email</span>
                          <p className="font-medium">{formData.email || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone</span>
                          <p>{formData.phone || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Website</span>
                          <p>{formData.website || "—"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Company
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Company</span>
                          <p className="font-medium">{formData.company || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Title</span>
                          <p>{formData.title || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Industry</span>
                          <p>{formData.industry || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location</span>
                          <p>{formData.location || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deal Value</span>
                          <p className="font-semibold">
                            {formData.dealValue
                              ? formatCurrency(parseInt(formData.dealValue))
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
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
                              className={tierColors[formData.tier]}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {tierConfig[formData.tier].label}
                            </Badge>
                          </p>
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
                      if (addStep === 0 && (!formData.name || !formData.email)) {
                        toast.error("Please fill in name and email");
                        return;
                      }
                      if (addStep === 1 && !formData.company) {
                        toast.error("Please fill in company");
                        return;
                      }
                      setAddStep(addStep + 1);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleAdd}>
                    <Check className="h-4 w-4 mr-2" /> Create Contact
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
                Update contact information.
              </DialogDescription>
            </DialogHeader>
            <ContactForm onSubmit={handleEdit} submitLabel="Save Changes" />
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

export default Contacts;
