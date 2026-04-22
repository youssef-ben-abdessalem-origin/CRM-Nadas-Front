  import { useState, useRef, useEffect } from "react";
  import { useNavigate, useSearchParams } from "react-router-dom";
  import { LeadForm } from "@/components/leads/LeadForm";
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
  import { Checkbox } from "@/components/ui/checkbox";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
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
    Pencil,
    History,
    Ban,
    UserCheck as UserCheckIcon,
    Copy,
    Tag,
    MessageSquare,
    StickyNote,
    ChevronRight,
    User,
  } from "lucide-react";
  import { toast } from "sonner";
  import api, { Lead, DynamicOption, Note } from "@/lib/api";
  import { CurrencyNumbers } from "@/components/CurrencyNumbers";
  import { LeadNotes } from "@/components/leads/LeadNotes";
  import { LeadTaskDialog } from "@/components/leads/LeadTaskDialog";
  import { LeadCallDialog } from "@/components/leads/LeadCallDialog";
  import { LeadLogCallDialog } from "@/components/leads/LeadLogCallDialog";
  import { LeadTagsDialog } from "@/components/leads/LeadTagsDialog";
  import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog";
  import { Textarea } from "@/components/ui/textarea";
  import { Switch } from "@/components/ui/switch";
  import { useConfirm } from "@/hooks/use-confirm";
  import { useTranslation } from "react-i18next";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const confirm = useConfirm();
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"table" | "kanban">("table");
    const [filterScore, setFilterScore] = useState<string>("all");
    const [filterSource, setFilterSource] = useState<string>("all");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showAddLead, setShowAddLead] = useState(false);

    useEffect(() => {
        if (searchParams.get("create") === "true") {
            setShowAddLead(true);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("create");
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);
    const [showConvert, setShowConvert] = useState(false);
    const [convertType, setConvertType] = useState<"contact" | "deal">("contact");
    const [isCreateDeal, setIsCreateDeal] = useState(false);
    const [newOwnerId, setNewOwnerId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showActivity, setShowActivity] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showCallDialog, setShowCallDialog] = useState(false);
    const [showLogCallDialog, setShowLogCallDialog] = useState(false);
    const [showTagsDialog, setShowTagsDialog] = useState(false);
    const [newActivity, setNewActivity] = useState({
      typeId: 0,
      subject: "",
      description: "",
      dueDate: "",
    });
    const [showAssign, setShowAssign] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editFormData, setEditFormData] = useState({
      id: 0,
      name: "",
      company: "",
      value: 0
    });
    const [showLostDialog, setShowLostDialog] = useState(false);
    const [lostFormData, setLostFormData] = useState({
      lossReason: "",
      lossNotes: "",
      reengagementDate: "",
    });

    const lossReasons = [
      { value: "PRICE", label: "Price too high", icon: "💸" },
      { value: "COMPETITOR", label: "Chose competitor", icon: "🏢" },
      { value: "NO_BUDGET", label: "No budget", icon: "🚫" },
      { value: "NOT_FIT", label: "Not a fit", icon: "🎯" },
      { value: "NO_RESPONSE", label: "No response / Ghosted", icon: "👻" },
      { value: "TIMING", label: "Timing not right", icon: "⏳" },
    ];

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

    const { data: teamMembers = [] } = useQuery({
      queryKey: ["users"],
      queryFn: () => api.users.getAll().catch(() => []),
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

    const createLeadMutation = useMutation({
        mutationFn: api.leads.create,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          toast.success("Lead created successfully");
          setShowAddLead(false);
        },
        onError: (err: Error) => toast.error(err.message),
      });
  
      const handleCreateLead = (data: any) => {
          const { useExistingAccount, ...rest } = data;
  
          const payload = {
          ...rest,
          emails: rest.emails.filter((e: string) => e.trim() !== ""),
          phones: rest.phones.filter((p: string) => p.trim() !== ""),
          company: useExistingAccount
              ? accounts.find((a: any) => a.id === rest.accountId)?.name || ""
              : rest.company,
          sourceId: rest.sourceId || sources[0]?.id,
          value: Number.parseInt(rest.value) || 0,
          stageId: rest.stageId || stages[0]?.id,
          scoreCategoryId: rest.scoreCategoryId || scores[0]?.id,
          nextFollowUp: rest.nextFollowUp ? new Date(rest.nextFollowUp) : undefined,
          accountId: useExistingAccount ? rest.accountId : undefined,
          };
  
          createLeadMutation.mutate(payload);
      };

    const convertMutation = useMutation({
      mutationFn: ({ id, data }: { id: number; data?: any }) => api.leads.convert(id, data),
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
      mutationFn: ({ id, data }: { id: number; data?: any }) => api.leads.convertToDeal(id, data),
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
                  <CurrencyNumbers amount={lead.value || 0} />
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                <CurrencyNumbers amount={lead.value || 0} />
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                {lead.source?.name || "—"}
              </div>
            </div>
            <div className="flex items-center gap-1 pt-1 border-t">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (lead.emails?.[0]) {
                    navigate(`/emails?to=${encodeURIComponent(lead.emails[0])}&subject=${encodeURIComponent(`Re: ${lead.company || lead.name}`)}`);
                  } else {
                    toast.error("No email address available for this lead");
                  }
                }}
              >
                <Mail className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(lead);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              {!isLeadLost(lead) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                        setShowActivity(true);
                        setNewActivity(prev => ({ ...prev, typeId: activityTypes.find((t: any) => t.name.toLowerCase().includes('task'))?.id || 0 }));
                      }}
                    >
                      <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Create Task</span>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                        setShowActivity(true);
                        setNewActivity(prev => ({ ...prev, typeId: activityTypes.find((t: any) => t.name.toLowerCase().includes('meeting'))?.id || 0 }));
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Create Meeting</span>
                    </DropdownMenuItem> */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        <span>Create Call</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setShowCallDialog(true);
                          }}>
                            Schedule Call
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setShowActivity(true);
                            setNewActivity(prev => ({ ...prev, typeId: activityTypes.find((t: any) => t.name.toLowerCase().includes('call'))?.id || 0, subject: "Call Log" }));
                          }}>
                            Log Call
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLead(lead);
                  setShowNotes(true);
                }}
              >
                <StickyNote className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-muted-foreground hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(lead);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (lead.emails?.[0]) {
                        navigate(`/emails?to=${encodeURIComponent(lead.emails[0])}&subject=${encodeURIComponent(`Re: ${lead.company || lead.name}`)}`);
                      }
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLead(lead);
                      setShowTaskDialog(true);
                    }}
                  >
                    <CheckSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    Create Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLead(lead);
                    setShowTagsDialog(true);
                  }}>
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    Add Tags
                  </DropdownMenuItem>
                  {!isLeadLost(lead) && (
                    <DropdownMenuItem
                      className="text-blue-600 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConvert(lead);
                      }}
                    >
                      <UserCheckIcon className="h-4 w-4 mr-2" />
                      Convert
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(lead.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `${window.location.origin}/leads?id=${lead.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Lead URL copied");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                    Copy URL
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Phone className="h-4 w-4 mr-2" /> Create Call
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                                setShowCallDialog(true);
                              }}>Schedule Call</DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                                setShowLogCallDialog(true);
                              }}>Log Call</DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        {/* <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Calendar className="h-4 w-4 mr-2" /> Create Meeting
                        </DropdownMenuItem> */}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      );
    };

    const handleConvert = () => {
      if (!selectedLead) return;
      const data = {
        ownerId: newOwnerId,
        createDeal: isCreateDeal
      };
      
      if (convertType === "deal") {
        convertToDealMutation.mutate({ id: selectedLead.id, data });
      } else {
        convertMutation.mutate({ id: selectedLead.id, data });
      }
    };

    const handleOpenEdit = (lead: Lead) => {
      navigate(`/leads/edit/${lead.id}`);
    };

    const handleSaveEdit = () => {
      updateMutation.mutate({
        id: editFormData.id,
        data: {
          name: editFormData.name,
          company: editFormData.company,
          value: editFormData.value,
        },
      });
      setShowEditDialog(false);
    };

    const handleMarkLost = (lead: Lead) => {
      setSelectedLead(lead);
      setLostFormData({ lossReason: "", lossNotes: "", reengagementDate: "" });
      setShowLostDialog(true);
    };

    const handleOpenConvert = (lead: Lead) => {
      setSelectedLead(lead);
      setConvertType("contact");
      setIsCreateDeal(false);
      setNewOwnerId(teamMembers[0]?.id || null);
      setShowConvert(true);
    };

    const handleConfirmLost = () => {
      if (!selectedLead) return;
      if (!lostFormData.lossReason) {
        toast.error(t('leads.statusUpdates.selectLossReason', 'Please select a loss reason'));
        return;
      }
      const lostStage = stages.find(
        (s: DynamicOption) => s.name.toLowerCase() === "unqualified" || s.name.toLowerCase() === "lost"
      );
      if (lostStage) {
        updateMutation.mutate({
          id: selectedLead.id,
          data: {
            stageId: lostStage.id,
            lossReason: lostFormData.lossReason,
            lossNotes: lostFormData.lossNotes,
            reengagementDate: lostFormData.reengagementDate || undefined,
          },
        });
        toast.success(t('leads.statusUpdates.markedLost', { name: selectedLead.name }));
        setShowLostDialog(false);
      } else {
        toast.error("Lost/Unqualified stage not found");
      }
    };

    const handleAssign = (userId: number) => {
      if (!selectedLead) return;
      updateMutation.mutate({
        id: selectedLead.id,
        data: { ownerId: userId },
      });
      setShowAssign(false);
      const user = teamMembers.find((u: any) => u.id === userId);
      toast.success(t('leads.statusUpdates.assignedTo', { name: user?.name || t('leads.statusUpdates.teamMember', 'team member') }));
    };

    const isLeadLost = (lead: Lead | null) =>
      lead?.stage?.name?.toLowerCase() === "unqualified" ||
      lead?.stage?.name?.toLowerCase() === "lost" ||
      lead?.isConverted;

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


    const formatCurrency = (value: number | string) => (
      <CurrencyNumbers amount={value} />
    );

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

      if (diffMins < 1) return t('common.time.justNow', 'Just now');
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    };

    if (isPaginatedLoading || isAllLeadsLoading) {
      return (
        <CRMLayout title={t('leads.title')}>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">{t('common.loading')}</div>
          </div>
        </CRMLayout>
      );
    }

    return (
      <CRMLayout title={t('leads.title')}>
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('leads.stats.total')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 lowercase font-medium">
                  {stats.totalValue > 0 && (
                    <>
                      {formatCurrency(stats.totalValue)} {t('leads.stats.pipelineDesc', 'pipeline')}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('leads.stats.today')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {stats.newToday}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('leads.stats.awaitingOutreach', 'Awaiting outreach')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('leads.stats.hot')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {stats.hotLeads}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('leads.stats.highPriority', 'High priority')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('leads.stats.conversion')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {stats.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('leads.stats.qualifiedTotal', 'Qualified / Total')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('leads.stats.value')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {t('leads.stats.activeOpps', 'Active opportunities')}
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
                  <SelectValue placeholder={t('leads.toolbar.score', 'Score')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allScores', 'All Scores')}</SelectItem>
                  {scores.map((score: DynamicOption) => (
                    <SelectItem key={score.id} value={String(score.id)}>
                      {score.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue placeholder={t('leads.toolbar.source', 'Source')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allSources', 'All Sources')}</SelectItem>
                  {sources.map((source: DynamicOption) => (
                    <SelectItem key={source.id} value={String(source.id)}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5 mr-1" /> {t('common.actions.filter', 'Filter')}
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
                              className="h-7 w-7 text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lead.emails?.[0]) {
                                  navigate(`/emails?to=${encodeURIComponent(lead.emails[0])}&subject=${encodeURIComponent(`Re: ${lead.company || lead.name}`)}`);
                                } else {
                                  toast.error("No email address available for this lead");
                                }
                              }}
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(lead);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            {!isLeadLost(lead) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLead(lead);
                                      setShowTaskDialog(true);
                                    }}
                                  >
                                    <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>Create Task</span>
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLead(lead);
                                      setShowActivity(true);
                                      setNewActivity(prev => ({ ...prev, typeId: activityTypes.find((t: any) => t.name.toLowerCase().includes('meeting'))?.id || 0 }));
                                    }}
                                  >
                                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                                    <span>Create Meeting</span>
                                  </DropdownMenuItem> */}
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <Phone className="h-4 w-4 mr-2 text-green-500" />
                                      <span>Create Call</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                          setShowCallDialog(true);
                                        }}>
                                          Schedule Call
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                          setShowLogCallDialog(true);
                                        }}>
                                          Log Call
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                                setShowNotes(true);
                              }}
                            >
                              <StickyNote className="h-3.5 w-3.5" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(lead);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (lead.emails?.[0]) {
                                      navigate(`/emails?to=${encodeURIComponent(lead.emails[0])}&subject=${encodeURIComponent(`Re: ${lead.company || lead.name}`)}`);
                                    }
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLead(lead);
                                    setShowTaskDialog(true);
                                  }}
                                >
                                  <CheckSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Create Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setShowTagsDialog(true);
                                }}>
                                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Add Tags
                                </DropdownMenuItem>
                                {!isLeadLost(lead) && (
                                  <DropdownMenuItem
                                    className="text-blue-600 font-medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenConvert(lead);
                                    }}
                                  >
                                    <UserCheckIcon className="h-4 w-4 mr-2" />
                                    Convert
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate(lead.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = `${window.location.origin}/leads?id=${lead.id}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success("Lead URL copied");
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                          <Phone className="h-4 w-4 mr-2" /> Create Call
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                          <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedLead(lead);
                                              setShowCallDialog(true);
                                            }}>Schedule Call</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedLead(lead);
                                              setShowLogCallDialog(true);
                                            }}>Log Call</DropdownMenuItem>
                                          </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                      </DropdownMenuSub>
                                      {/* <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        <Calendar className="h-4 w-4 mr-2" /> Create Meeting
                                      </DropdownMenuItem> */}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
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
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
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
                        <div ref={setNodeRef} className="w-[300px] shrink-0">
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

          {/* Detail logic moved to LeadDetail.tsx */}

          {/* Convert to Contact Dialog */}
          <Dialog open={showConvert} onOpenChange={setShowConvert}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl bg-background">
              <DialogHeader className="p-6 bg-card border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                      Convert Lead
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground font-medium">
                      {selectedLead?.name} {selectedLead?.company && <span className="mx-1 opacity-50">—</span>} {selectedLead?.company}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {selectedLead && (
                <div className="px-8 bg-background">
                  <div className="space-y-1">
                    {/* Account Name */}
                    <div className="group border-b border-sidebar-border py-3 flex items-center justify-between transition-colors hover:border-primary/50">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Create New Account</Label>
                        <div className="h-8 flex items-center text-sm font-semibold text-foreground">
                          {selectedLead.company || "Individual Account"}
                        </div>
                      </div>
                      <Building2 className="h-4 w-4 text-muted-foreground/50" />
                    </div>

                    {/* Contact Name */}
                    <div className="group border-b border-sidebar-border py-3 flex items-center justify-between transition-colors hover:border-primary/50">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Create New Contact</Label>
                        <div className="h-8 flex items-center text-sm font-semibold text-foreground">
                          {selectedLead.name}
                        </div>
                      </div>
                      <User className="h-4 w-4 text-muted-foreground/50" />
                    </div>

                    {/* Deal Toggle */}
                    <div className="border-b border-sidebar-border py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${isCreateDeal ? "bg-primary/10" : "bg-muted/50"}`}>
                          <TrendingUp className={`h-4 w-4 ${isCreateDeal ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Create a new Deal</Label>
                          {isCreateDeal && (
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                              Projected: <CurrencyNumbers amount={selectedLead.value || 0} />
                            </p>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={isCreateDeal}
                        onCheckedChange={setIsCreateDeal}
                      />
                    </div>

                    {/* Owner Selection */}
                    <div className="group border-b border-sidebar-border py-3 flex items-center justify-between transition-colors hover:border-primary/50">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Owner of the New Records</Label>
                        <Select 
                          value={String(newOwnerId || "")} 
                          onValueChange={(val) => setNewOwnerId(Number.parseInt(val))}
                        >
                          <SelectTrigger className="h-8 p-0 border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-semibold">
                            <SelectValue placeholder="Select an owner" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {teamMembers.map((member: any) => (
                              <SelectItem 
                                key={member.id} 
                                value={String(member.id)}
                              >
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <User className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="p-6 bg-card border-t border-sidebar-border flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="h-10 px-6 font-semibold border-sidebar-border hover:bg-muted"
                  onClick={() => setShowConvert(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConvert}
                  className="h-10 px-8 bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  <UserPlus className="h-4 w-4 mr-2" /> 
                  Convert Lead
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
                    onValueChange={(val) => setNewActivity({ ...newActivity, typeId: Number.parseInt(val) })}
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
                  onClick={async () => {
                    if (await confirm({ 
                      title: "Delete Leads", 
                      description: `Are you sure you want to delete ${selectedLeads.length} leads? This action cannot be undone.`,
                      variant: "destructive",
                      confirmText: "Delete"
                    })) {
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
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Lead Details</DialogTitle>
                <DialogDescription>Quickly update the lead's basic info.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Lead Name</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pipeline Value</Label>
                  <Input
                    type="number"
                    value={editFormData.value}
                    onChange={(e) => setEditFormData({ ...editFormData, value: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssign} onOpenChange={setShowAssign}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Lead</DialogTitle>
                <DialogDescription>Select a team member to manage this lead.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select onValueChange={(val) => handleAssign(parseInt(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Lead as Lost</DialogTitle>
                <DialogDescription>
                  Please provide a reason for losing this lead. This helps with sales analytics.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Loss Reason *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {lossReasons.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => setLostFormData({ ...lostFormData, lossReason: reason.value })}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${lostFormData.lossReason === reason.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                          }`}
                      >
                        <span className="mr-2">{reason.icon}</span>
                        {reason.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add details about why this lead was lost..."
                    value={lostFormData.lossNotes}
                    onChange={(e) => setLostFormData({ ...lostFormData, lossNotes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Re-engagement Date (Optional)</Label>
                  <Input
                    type="date"
                    value={lostFormData.reengagementDate}
                    onChange={(e) => setLostFormData({ ...lostFormData, reengagementDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Schedule a follow-up for future potential leads</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLostDialog(false)}>Cancel</Button>
                <Button onClick={handleConfirmLost}>Confirm Lost</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <LeadNotes
            lead={selectedLead}
            open={showNotes}
            onOpenChange={setShowNotes}
          />
          <LeadTaskDialog
            lead={selectedLead}
            open={showTaskDialog}
            onOpenChange={setShowTaskDialog}
          />
          <LeadCallDialog
            lead={selectedLead}
            open={showCallDialog}
            onOpenChange={setShowCallDialog}
          />
          <LeadLogCallDialog
            lead={selectedLead}
            open={showLogCallDialog}
            onOpenChange={setShowLogCallDialog}
          />
          <LeadTagsDialog
            lead={selectedLead}
            open={showTagsDialog}
            onOpenChange={setShowTagsDialog}
          />
          <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Enter the details for the new commercial lead.
                </DialogDescription>
              </DialogHeader>
              <LeadForm 
                onCancel={() => setShowAddLead(false)} 
                onSubmit={handleCreateLead}
                isPending={createLeadMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <LeadDetailDialog
            leadId={selectedLead?.id || null}
            open={showDetail}
            onOpenChange={setShowDetail}
            onEdit={(lead) => {
              handleOpenEdit(lead);
            }}
            onAddTask={(lead) => {
              setSelectedLead(lead);
              setShowTaskDialog(true);
            }}
          />
        </div>
      </CRMLayout>
    );
  };

  export default Leads;
