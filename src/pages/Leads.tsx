import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
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
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  UserPlus,
  ArrowRight,
  X,
  Calendar,
  ExternalLink,
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

type LeadScore = "hot" | "warm" | "cold";
type LeadSource =
  | "Website"
  | "LinkedIn"
  | "Referral"
  | "Cold Call"
  | "Trade Show"
  | "Google Ads"
  | "Email Campaign";
type LeadStatus = "new" | "contacted" | "qualified" | "unqualified";
type LeadPriority = "low" | "medium" | "high" | "urgent";
type LeadQualification = "not_qualified" | "in_progress" | "qualified_hot";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  source: LeadSource;
  score: LeadScore;
  status: LeadStatus;
  priority: LeadPriority;
  qualification: LeadQualification;
  value: number;
  created: string;
  lastActivity: string;
  notes: string;
  location: string;
  industry: string;
  website: string;
  tags: string;
  nextFollowUp: string;
  assignedToId: number;
  assignedTo: {
    id: number;
    name: string;
    email: string;
  };
}

const scoreConfig: Record<
  LeadScore,
  { label: string; color: string; icon: typeof Star }
> = {
  hot: {
    label: "Hot",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: Star,
  },
  warm: {
    label: "Warm",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: Star,
  },
  cold: {
    label: "Cold",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Star,
  },
};

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  contacted: {
    label: "Contacted",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  qualified: {
    label: "Qualified",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  unqualified: {
    label: "Unqualified",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
};

const sourceIcons: Record<LeadSource, typeof ExternalLink> = {
  Website: ExternalLink,
  LinkedIn: ExternalLink,
  Referral: ExternalLink,
  "Cold Call": ExternalLink,
  "Trade Show": ExternalLink,
  "Google Ads": ExternalLink,
  "Email Campaign": ExternalLink,
};

const Leads = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [filterScore, setFilterScore] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    source: "Website" as LeadSource,
    value: "",
    status: "new" as LeadStatus,
    score: "cold" as LeadScore,
    priority: "medium" as LeadPriority,
    qualification: "not_qualified" as LeadQualification,
    location: "",
    industry: "",
    website: "",
    notes: "",
    tags: "",
    assignedToId: undefined as number | undefined,
    nextFollowUp: "",
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.leads.getAll().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.leads.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead created successfully");
      setShowAddLead(false);
      setNewLead({ 
        name: "", email: "", phone: "", company: "", title: "", 
        source: "Website", value: "", status: "new", score: "cold", 
        priority: "medium", qualification: "not_qualified", 
        location: "", industry: "", website: "", notes: "", tags: "", 
        assignedToId: undefined, nextFollowUp: "" 
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.leads.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.leads.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = leads.filter((lead: Lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (lead.email?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesScore = filterScore === "all" || lead.score === filterScore;
    const matchesSource = filterSource === "all" || lead.source === filterSource;
    return matchesSearch && matchesScore && matchesSource;
  });

  const stats = {
    total: leads.length,
    newToday: leads.filter((l: Lead) => l.status === "new").length,
    hotLeads: leads.filter((l: Lead) => l.score === "hot").length,
    conversionRate: leads.length > 0 ? Math.round(
      (leads.filter((l: Lead) => l.status === "qualified").length / leads.length) * 100
    ) : 0,
    totalValue: leads.reduce((sum: number, l: Lead) => sum + (l.value || 0), 0),
  };

  const handleStatusChange = (leadId: number, newStatus: Lead["status"]) => {
    updateMutation.mutate({ id: leadId, data: { status: newStatus } });
    toast.success(`Lead status updated to ${statusConfig[newStatus].label}`);
  };

  const handleConvert = () => {
    if (!selectedLead) return;
    toast.success(`${selectedLead.name} converted to Contact`);
    setShowConvert(false);
    setShowDetail(false);
    setSelectedLead(null);
  };

  const handleDisqualify = () => {
    if (!selectedLead) return;
    handleStatusChange(selectedLead.id, "unqualified");
    setShowDetail(false);
    setSelectedLead(null);
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email || !newLead.company) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate({
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      company: newLead.company,
      title: newLead.title,
      source: newLead.source,
      value: parseInt(newLead.value) || 0,
      status: newLead.status,
      score: newLead.score,
      priority: newLead.priority,
      qualification: newLead.qualification,
      location: newLead.location,
      industry: newLead.industry,
      website: newLead.website,
      notes: newLead.notes,
      tags: newLead.tags,
      assignedToId: newLead.assignedToId,
      nextFollowUp: newLead.nextFollowUp ? new Date(newLead.nextFollowUp) : undefined,
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stages: { key: Lead["status"]; label: string; color: string }[] = [
    { key: "new", label: "New", color: "border-blue-500" },
    { key: "contacted", label: "Contacted", color: "border-amber-500" },
    { key: "qualified", label: "Qualified", color: "border-green-500" },
    { key: "unqualified", label: "Unqualified", color: "border-gray-500" },
  ];

  if (isLoading) {
    return (
      <CRMLayout title="Leads">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading leads...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Leads">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalValue > 0 && formatCurrency(stats.totalValue) + " pipeline"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                New Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.newToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting outreach</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.hotLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">High priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.conversionRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Qualified / Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pipeline Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Active opportunities
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
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Cold Call">Cold Call</SelectItem>
                <SelectItem value="Trade Show">Trade Show</SelectItem>
                <SelectItem value="Google Ads">Google Ads</SelectItem>
                <SelectItem value="Email Campaign">Email Campaign</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-3"
                onClick={() => setView("table")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={view === "kanban" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-3"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddLead(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Lead
            </Button>
          </div>
        </div>

        {/* Table View */}
        {view === "table" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((lead: Lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowDetail(true);
                      }}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {lead.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{lead.company || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={scoreConfig[lead.score]?.color || "bg-gray-500/10 text-gray-500"}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {scoreConfig[lead.score]?.label || lead.score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusConfig[lead.status]?.color || "bg-gray-500/10 text-gray-500"}
                        >
                          {statusConfig[lead.status]?.label || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          {lead.source}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(lead.value || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lead.lastActivity || "—"}
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
                              toast.info(`Email sent to ${lead.name}`);
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
                              toast.info(`Calling ${lead.name}...`);
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
                                  setSelectedLead(lead);
                                  setShowConvert(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Convert to Contact
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(lead.id, "contacted");
                                }}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Mark as Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(lead.id, "qualified");
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Mark as Qualified
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDisqualify();
                                }}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Disqualify
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(lead.id);
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
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
        )}

        {/* Kanban View */}
        {view === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads = filtered.filter((l: Lead) => l.status === stage.key);
              const stageValue = stageLeads.reduce((sum: number, l: Lead) => sum + (l.value || 0), 0);
              return (
                <div key={stage.key} className="min-w-[300px] max-w-[300px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-1 rounded-full ${stage.color.replace("border-", "bg-")}`} />
                      <span className="text-sm font-semibold">{stage.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stageLeads.length}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(stageValue)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.map((lead: Lead) => (
                      <Card
                        key={lead.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                        style={{
                          borderLeftColor:
                            stage.key === "new"
                              ? "hsl(var(--primary))"
                              : stage.key === "contacted"
                                ? "hsl(var(--warning))"
                                : stage.key === "qualified"
                                  ? "hsl(var(--success))"
                                  : "hsl(var(--muted-foreground))",
                        }}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetail(true);
                        }}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">
                                {lead.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {lead.title || "—"}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={scoreConfig[lead.score]?.color || "bg-gray-500/10 text-gray-500"}
                            >
                              <Star className="h-2.5 w-2.5 mr-1" />
                              {scoreConfig[lead.score]?.label || lead.score}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {lead.company || "—"}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {formatCurrency(lead.value || 0)}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <ExternalLink className="h-3 w-3" />
                              {lead.source}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lead.lastActivity || "—"}
                          </div>
                          <div className="flex items-center gap-1 pt-1 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(`Email sent to ${lead.name}`);
                              }}
                            >
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(`Calling ${lead.name}...`);
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" /> Call
                            </Button>
                            {stage.key !== "qualified" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs ml-auto text-green-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStage =
                                    stage.key === "new"
                                      ? "contacted"
                                      : stage.key === "contacted"
                                        ? "qualified"
                                        : "qualified";
                                  handleStatusChange(lead.id, nextStage);
                                }}
                              >
                                <ArrowRight className="h-3 w-3 mr-1" /> Move
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lead Detail Dialog */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-2xl">
            {selectedLead && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedLead.name}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedLead.title || "No title"} at {selectedLead.company || "No company"}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={scoreConfig[selectedLead.score]?.color || "bg-gray-500/10 text-gray-500"}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {scoreConfig[selectedLead.score]?.label || selectedLead.score}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={statusConfig[selectedLead.status]?.color || "bg-gray-500/10 text-gray-500"}
                      >
                        {statusConfig[selectedLead.status]?.label || selectedLead.status}
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
                        <span>{selectedLead.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.phone || "—"}</span>
                      </div>
                      {selectedLead.website && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="text-primary hover:underline">
                            {selectedLead.website}
                          </span>
                        </div>
                      )}
                      {selectedLead.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Lead Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Source</span>
                        <span className="font-medium">{selectedLead.source}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedLead.value || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{formatDate(selectedLead.created)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Last Activity
                        </span>
                        <span>{selectedLead.lastActivity || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedLead.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDisqualify();
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" /> Disqualify
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(
                        selectedLead.id,
                        selectedLead.status === "new"
                          ? "contacted"
                          : selectedLead.status === "contacted"
                            ? "qualified"
                            : selectedLead.status
                      );
                      setShowDetail(false);
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {selectedLead.status === "new"
                      ? "Mark Contacted"
                      : selectedLead.status === "contacted"
                        ? "Mark Qualified"
                        : "Update Status"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConvert(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Convert to Contact
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Convert to Contact Dialog */}
        <Dialog open={showConvert} onOpenChange={setShowConvert}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Lead to Contact</DialogTitle>
              <DialogDescription>
                This will move {selectedLead?.name} from Leads to Contacts. The
                lead will be removed from the pipeline.
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{selectedLead.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Company</span>
                    <span>{selectedLead.company || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span>{selectedLead.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedLead.value || 0)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Create Deal?</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">
                        Yes, create a new deal
                      </SelectItem>
                      <SelectItem value="no">
                        No, just add as contact
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConvert(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvert}>
                <UserPlus className="h-4 w-4 mr-2" /> Convert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Lead Drawer */}
        <Drawer open={showAddLead} onOpenChange={setShowAddLead}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Lead</DrawerTitle>
              <DrawerDescription>Fill in the details to create a new lead.</DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {/* Basic Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1">Basic Info</div>
              
              <div className="space-y-2">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input placeholder="John Doe" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input type="email" placeholder="john@company.com" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company <span className="text-red-500">*</span></Label>
                <Input placeholder="Acme Corp" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="VP of Engineering" value={newLead.title} onChange={(e) => setNewLead({ ...newLead, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status <span className="text-red-500">*</span></Label>
                <Select value={newLead.status} onValueChange={(v) => setNewLead({ ...newLead, status: v as LeadStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sales Data */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">Sales Data</div>
              
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={newLead.source} onValueChange={(v) => setNewLead({ ...newLead, source: v as LeadSource })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Est. Value</Label>
                <Input type="number" placeholder="50000" value={newLead.value} onChange={(e) => setNewLead({ ...newLead, value: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Lead Score</Label>
                <Select value={newLead.score} onValueChange={(v) => setNewLead({ ...newLead, score: v as LeadScore })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newLead.priority} onValueChange={(v) => setNewLead({ ...newLead, priority: v as LeadPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Select value={newLead.qualification} onValueChange={(v) => setNewLead({ ...newLead, qualification: v as LeadQualification })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_qualified">Not Qualified</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="qualified_hot">Qualified Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organization */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">Organization</div>
              
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="San Francisco, CA" value={newLead.location} onChange={(e) => setNewLead({ ...newLead, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input placeholder="Technology" value={newLead.industry} onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input placeholder="https://company.com" value={newLead.website} onChange={(e) => setNewLead({ ...newLead, website: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input placeholder="enterprise, hot-lead" value={newLead.tags} onChange={(e) => setNewLead({ ...newLead, tags: e.target.value })} />
              </div>

              {/* Follow-up */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">Follow-up</div>
              
              <div className="space-y-2">
                <Label>Next Follow-up Date</Label>
                <Input type="date" value={newLead.nextFollowUp} onChange={(e) => setNewLead({ ...newLead, nextFollowUp: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                <Label>Notes</Label>
                <Textarea placeholder="Any additional context..." value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} />
              </div>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setShowAddLead(false)}>Cancel</Button>
              <Button onClick={handleAddLead} disabled={createMutation.isPending}>
                <UserPlus className="h-4 w-4 mr-2" /> 
                {createMutation.isPending ? "Creating..." : "Create Lead"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </CRMLayout>
  );
};

export default Leads;