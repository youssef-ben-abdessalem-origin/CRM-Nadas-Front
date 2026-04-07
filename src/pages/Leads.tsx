import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Paperclip,
  Calendar,
  CheckCircle,
  Circle,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

interface Lead {
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
}

interface DynamicOption {
  id: number;
  name: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
}

interface SortableLeadCardProps {
  lead: Lead;
  stage: DynamicOption;
  onClick: () => void;
  onMove: (newStageId: number) => void;
}

const Droppable = ({ id, children }: { id: string | number; children: (props: { setNodeRef: (node: HTMLElement | null) => void }) => React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id });
  return children({ setNodeRef });
};

const Leads = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [filterScore, setFilterScore] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [convertType, setConvertType] = useState<"contact" | "deal">("contact");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newActivity, setNewActivity] = useState({
    typeId: 0,
    subject: "",
    description: "",
    dueDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const { data: paginatedLeads, isLoading: isPaginatedLoading } = useQuery({
    queryKey: ["leads", "paginated", page, pageSize, search],
    queryFn: () =>
      api.leads.getPaginated({ page, limit: pageSize, search }).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        limit: pageSize,
        totalPages: 0,
      })),
  });

  const { data: allLeads = [], isLoading: isAllLeadsLoading } = useQuery({
    queryKey: ["leads", "all"],
    queryFn: () => api.leads.getAll().catch(() => []),
  });

  const leads = paginatedLeads?.data || [];
  const allLeadsData = allLeads || [];
  const totalPages = paginatedLeads?.totalPages || 1;
  const total = paginatedLeads?.total || 0;

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const { data: sources = [] } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: () => api.leads.getSources().catch(() => []),
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["lead-stages"],
    queryFn: () => api.leads.getStages().catch(() => []),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["lead-scores"],
    queryFn: () => api.leads.getScores().catch(() => []),
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ["lead-priorities"],
    queryFn: () => api.leads.getPriorities().catch(() => []),
  });

  const { data: qualifications = [] } = useQuery({
    queryKey: ["lead-qualifications"],
    queryFn: () => api.leads.getQualifications().catch(() => []),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api.activities.getTypes().catch(() => []),
  });

  const { data: leadActivities = [] } = useQuery({
    queryKey: ["lead-activities", selectedLead?.id],
    queryFn: () => selectedLead ? api.activities.getByEntity("lead", selectedLead.id).catch(() => []) : [],
    enabled: !!selectedLead,
  });



  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.leads.update(id, data),
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

  const convertMutation = useMutation({
    mutationFn: api.leads.convert,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(
        `Lead converted! Created Account #${data.accountId} and Contact #${data.contactId}`,
      );
      setShowConvert(false);
      setShowDetail(false);
      setSelectedLead(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const convertToDealMutation = useMutation({
    mutationFn: api.leads.convertToDeal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success(`Lead converted to Deal #${data.dealId}`);
      setShowConvert(false);
      setShowDetail(false);
      setSelectedLead(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, leadId }: { file: File; leadId: number }) =>
      api.uploads.uploadDocument(file, "lead", leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("File uploaded successfully");
      setIsUploading(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setIsUploading(false);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedLead) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setIsUploading(true);
      uploadMutation.mutate({ file, leadId: selectedLead.id });
    }
  };

  const createActivityMutation = useMutation({
    mutationFn: (data: any) => api.activities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-activities"] });
      toast.success("Activity added");
      setShowActivity(false);
      setNewActivity({ typeId: 0, subject: "", description: "", dueDate: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const completeActivityMutation = useMutation({
    mutationFn: (id: number) => api.activities.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-activities"] });
      toast.success("Activity completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreateActivity = () => {
    if (!selectedLead || !newActivity.typeId) {
      toast.error("Please select activity type");
      return;
    }
    createActivityMutation.mutate({
      entityType: "lead",
      entityId: selectedLead.id,
      typeId: newActivity.typeId,
      subject: newActivity.subject,
      description: newActivity.description,
      dueDate: newActivity.dueDate || undefined,
    });
  };

  const filtered = leads.filter((lead: Lead) => {
    if (lead.isConverted) return false;
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (lead.emails?.some(e => e.toLowerCase().includes(search.toLowerCase())) || false);
    const matchesScore =
      filterScore === "all" || String(lead.scoreCategoryId) === filterScore;
    const matchesSource =
      filterSource === "all" || String(lead.sourceId) === filterSource;
    return matchesSearch && matchesScore && matchesSource;
  });

  const stats = {
    total: leads.length,
    newToday: leads.filter((l: Lead) => l.stage?.name?.toLowerCase() === "new")
      .length,
    hotLeads: leads.filter(
      (l: Lead) => l.scoreCategory?.name?.toLowerCase() === "hot",
    ).length,
    conversionRate:
      leads.length > 0
        ? Math.round(
            (leads.filter(
              (l: Lead) => l.stage?.name?.toLowerCase() === "qualified",
            ).length /
              leads.length) *
              100,
          )
        : 0,
    totalValue: leads.reduce((sum: number, l: Lead) => sum + (Number(l.value) || 0), 0),
  };

  const handleStageChange = (leadId: number, newStageId: number) => {
    updateMutation.mutate({ id: leadId, data: { stageId: newStageId } });
    const stage = stages.find((s: DynamicOption) => s.id === newStageId);
    toast.success(`Lead stage updated to ${stage?.name || "Stage"}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const leadId = active.id as number;
    const overId = over.id as number;

    const lead = allLeadsData.find((l: Lead) => l.id === leadId);
    if (!lead) return;

    const overStage = stages.find((s: DynamicOption) => s.id === overId);
    if (overStage && overStage.id !== lead.stageId) {
      handleStageChange(leadId, overStage.id);
      return;
    }

    const overLead = allLeadsData.find((l: Lead) => l.id === overId);
    if (overLead && overLead.stageId !== lead.stageId) {
      handleStageChange(leadId, overLead.stageId);
    }
  };

  const SortableLeadCard = ({
    lead,
    stage,
    onClick,
    onMove,
  }: SortableLeadCardProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: lead.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    if (isDragging) {
      return (
        <Card
          ref={setNodeRef}
          style={{
            ...style,
            borderLeftColor: stage.color || "#3b82f6",
            opacity: 0.5,
          }}
          className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm">{lead.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {lead.title || "—"}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-0"
                style={{
                  backgroundColor: lead.scoreCategory?.color
                    ? `${lead.scoreCategory.color}20`
                    : "#6b728020",
                  color: lead.scoreCategory?.color || "#6b7280",
                  fontSize: "10px",
                  padding: "2px 6px",
                }}
              >
                <Star className="h-2.5 w-2.5 mr-1" />
                {lead.scoreCategory?.name || "—"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {lead.company || "—"}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                }).format(lead.value || 0)}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                {lead.source?.name || "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          ...style,
          borderLeftColor: stage.color || "#3b82f6",
        }}
        className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm">{lead.name}</h4>
              <p className="text-xs text-muted-foreground">
                {lead.title || "—"}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-0"
              style={{
                backgroundColor: lead.scoreCategory?.color
                  ? `${lead.scoreCategory.color}20`
                  : "#6b728020",
                color: lead.scoreCategory?.color || "#6b7280",
                fontSize: "10px",
                padding: "2px 6px",
              }}
            >
              <Star className="h-2.5 w-2.5 mr-1" />
              {lead.scoreCategory?.name || "—"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {lead.company || "—"}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(lead.value || 0)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              {lead.source?.name || "—"}
            </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs ml-auto text-green-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowRight className="h-3 w-3 mr-1" /> Move
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stages
                  .filter((s: DynamicOption) => s.id !== stage.id)
                  .map((nextStage: DynamicOption) => (
                    <DropdownMenuItem
                      key={nextStage.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(nextStage.id);
                      }}
                    >
                      Move to {nextStage.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleConvert = () => {
    if (!selectedLead) return;
    if (convertType === "deal") {
      convertToDealMutation.mutate(selectedLead.id);
    } else {
      convertMutation.mutate(selectedLead.id);
    }
  };

  const handleDisqualify = () => {
    if (!selectedLead) return;
    const unqualifiedStage = stages.find(
      (s: DynamicOption) => s.name.toLowerCase() === "unqualified",
    );
    if (unqualifiedStage) {
      handleStageChange(selectedLead.id, unqualifiedStage.id);
    }
    setShowDetail(false);
    setSelectedLead(null);
  };


  const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isPaginatedLoading || isAllLeadsLoading) {
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
                {stats.totalValue > 0 &&
                  formatCurrency(stats.totalValue) + " pipeline"}
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
              <div className="text-2xl font-bold text-blue-500">
                {stats.newToday}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting outreach
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.hotLeads}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                High priority
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                Qualified / Total
              </p>
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
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div> */}
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                {scores.map((score: DynamicOption) => (
                  <SelectItem key={score.id} value={String(score.id)}>
                    {score.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((source: DynamicOption) => (
                  <SelectItem key={source.id} value={String(source.id)}>
                    {source.name}
                  </SelectItem>
                ))}
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
            {selectedLeads.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowBulkActions(true)}>
                <CheckSquare className="h-3.5 w-3.5 mr-1" /> Bulk ({selectedLeads.length})
              </Button>
            )}
            <Button size="sm" onClick={() => navigate("/leads/new")}>
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
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedLeads.length > 0 && selectedLeads.length === filtered.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(filtered.map((l: Lead) => l.id));
                        } else {
                          setSelectedLeads([]);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
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
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedLeads([...selectedLeads, lead.id]);
                            } else {
                              setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {lead.emails?.[0]}
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
                          className="border-0"
                          style={{
                            backgroundColor: lead.scoreCategory?.color
                              ? `${lead.scoreCategory.color}20`
                              : "#6b728020",
                            color: lead.scoreCategory?.color || "#6b7280",
                          }}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {lead.scoreCategory?.name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-0"
                          style={{
                            backgroundColor: lead.stage?.color
                              ? `${lead.stage.color}20`
                              : "#3b82f620",
                            color: lead.stage?.color || "#3b82f6",
                          }}
                        >
                          {lead.stage?.name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          {lead.source?.name || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(lead.value || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(lead.createdAt)}
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
                              {stages.map((stage: DynamicOption) => (
                                <DropdownMenuItem
                                  key={stage.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageChange(lead.id, stage.id);
                                  }}
                                >
                                  Move to {stage.name}
                                </DropdownMenuItem>
                              ))}
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {leads.length} of {total} leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Kanban View */}
        {view === "kanban" && (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
              <div className="flex gap-4 pb-4">
                {stages.map((stage: DynamicOption) => {
                  const stageLeads = allLeadsData.filter(
                    (l: Lead) => !l.isConverted && l.stageId === stage.id,
                  );
                  const stageValue = stageLeads.reduce(
                    (sum: number, l: Lead) => sum + (Number(l.value) || 0),
                    0,
                  );
                  
                  return (
                    <Droppable key={stage.id} id={stage.id}>
                      {({ setNodeRef }) => (
                        <div ref={setNodeRef} className="min-w-[300px] max-w-[300px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-1 rounded-full"
                          style={{ backgroundColor: stage.color || "#3b82f6" }}
                        />
                        <span className="text-sm font-semibold">
                          {stage.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {stageLeads.length}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(stageValue)}
                      </span>
                    </div>
                    <SortableContext
                      items={stageLeads.map((l: Lead) => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 min-h-[100px]">
                        {stageLeads.length === 0 && (
                          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                            Drop leads here
                          </div>
                        )}
                        {stageLeads.map((lead: Lead) => (
                          <SortableLeadCard
                            key={lead.id}
                            lead={lead}
                            stage={stage}
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowDetail(true);
                            }}
                            onMove={(newStageId: number) =>
                              handleStageChange(lead.id, newStageId)
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                    </div>
                      )}
                    </Droppable>
                );
              })}
            </div>
            <DragOverlay>
              {activeDragId ? (
                (() => {
                  const lead = allLeadsData.find((l: Lead) => l.id === activeDragId);
                  const stage = stages.find((s: DynamicOption) => s.id === lead?.stageId);
                  if (!lead || !stage) return null;
                  return (
                    <Card className="cursor-grabbing border-l-4 shadow-lg opacity-90" style={{ borderLeftColor: stage.color || "#3b82f6" }}>
                      <CardContent className="p-4 space-y-2">
                        <div className="font-semibold text-sm">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.company || "—"}</div>
                      </CardContent>
                    </Card>
                  );
                })()
              ) : null}
            </DragOverlay>
          </DndContext>
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
                        {selectedLead.title || "No title"} at{" "}
                        {selectedLead.company || "No company"}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-0"
                        style={{
                          backgroundColor: selectedLead.scoreCategory?.color
                            ? `${selectedLead.scoreCategory.color}20`
                            : "#6b728020",
                          color: selectedLead.scoreCategory?.color || "#6b7280",
                        }}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {selectedLead.scoreCategory?.name || "—"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-0"
                        style={{
                          backgroundColor: selectedLead.stage?.color
                            ? `${selectedLead.stage.color}20`
                            : "#3b82f620",
                          color: selectedLead.stage?.color || "#3b82f6",
                        }}
                      >
                        {selectedLead.stage?.name || "—"}
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
                        <span>{selectedLead.emails?.[0] || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.phones?.[0] || "—"}</span>
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
                        <span className="font-medium">
                          {selectedLead.source?.name || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge
                          variant="outline"
                          className="border-0"
                          style={{
                            backgroundColor: selectedLead.priority?.color
                              ? `${selectedLead.priority.color}20`
                              : "#6b728020",
                            color: selectedLead.priority?.color || "#6b7280",
                          }}
                        >
                          {selectedLead.priority?.name || "—"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedLead.value || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{formatDate(selectedLead.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Last Activity
                        </span>
                        <span>{formatRelativeTime(selectedLead.createdAt)}</span>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Attachments</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <span className="h-4 w-4 block animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                      <span className="ml-1">Add</span>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="*/*"
                    />
                  </div>
                  {selectedLead.attachments && selectedLead.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedLead.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                        >
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            <Paperclip className="h-4 w-4" />
                            {att.name}
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {new Date(att.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attachments</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Activities</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowActivity(true)}>
                      <Plus className="h-4 w-4" />
                      <span className="ml-1">Add</span>
                    </Button>
                  </div>
                  {leadActivities && leadActivities.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {leadActivities.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => !activity.completed && completeActivityMutation.mutate(activity.id)}
                              className="flex-shrink-0"
                            >
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
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDisqualify();
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" /> Disqualify
                  </Button>
                  <Select
                    onValueChange={(stageId) => {
                      handleStageChange(selectedLead.id, parseInt(stageId));
                      setShowDetail(false);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage: DynamicOption) => (
                        <SelectItem key={stage.id} value={String(stage.id)}>
                          Move to {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <span>{selectedLead.emails?.[0]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedLead.value || 0)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Conversion Type</Label>
                  <Select value={convertType} onValueChange={(v) => setConvertType(v as "contact" | "deal")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact">
                        Convert to Contact + Account
                      </SelectItem>
                      <SelectItem value="deal">
                        Convert to Deal Only
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


        <Dialog open={showActivity} onOpenChange={setShowActivity}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Activity Type *</Label>
                <Select
                  value={String(newActivity.typeId)}
                  onValueChange={(val) => setNewActivity({ ...newActivity, typeId: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type: any) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newActivity.subject}
                  onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
                  placeholder="Call follow-up"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Details..."
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newActivity.dueDate}
                  onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActivity(false)}>Cancel</Button>
              <Button onClick={handleCreateActivity} disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? "Adding..." : "Add Activity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
              <DialogDescription>
                Apply actions to {selectedLeads.length} selected leads
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  api.leads.bulkUpdate(selectedLeads, { statusId: 1 }).then(() => {
                    toast.success("Leads updated");
                    setSelectedLeads([]);
                    setShowBulkActions(false);
                    queryClient.invalidateQueries({ queryKey: ["leads"] });
                  }).catch((err: Error) => toast.error(err.message));
                }}
              >
                <Star className="h-4 w-4 mr-2" /> Update Status
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-500"
                onClick={() => {
                  if (confirm(`Delete ${selectedLeads.length} leads?`)) {
                    api.leads.bulkDelete(selectedLeads).then(() => {
                      toast.success("Leads deleted");
                      setSelectedLeads([]);
                      setShowBulkActions(false);
                      queryClient.invalidateQueries({ queryKey: ["leads"] });
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

export default Leads;
