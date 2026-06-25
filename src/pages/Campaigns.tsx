import { CRMLayout } from "@/components/CRMLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Megaphone, MoreVertical, Trash2,
  Search, Filter, Calendar, LayoutGrid, List, Edit,
  Eye, Copy, Play, PauseCircle, CheckSquare, XCircle,
  Archive, Send, Clock, UserPlus, Upload, Download,
  MessageSquare, Paperclip, BarChart2, CornerUpLeft,
  UserCheck, FileBarChart2, StickyNote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { symbol: currencySymbol } = useDefaultCurrency();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api.campaigns.getAll().catch(() => []),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["campaign-statuses"],
    queryFn: () => api.campaigns.getStatuses().catch(() => []),
  });

  const deleteMutation = useMutation({
    mutationFn: api.campaigns.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success(t("campaigns.statusUpdates.deleted", "Campaign deleted"));
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) =>
      Promise.all(ids.map((id) => api.campaigns.delete(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success(t("campaigns.statusUpdates.batchComplete", "Batch operations complete"));
    },
  });

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        c.status?.name.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === filteredCampaigns.length
        ? []
        : filteredCampaigns.map((c: any) => c.id)
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <CRMLayout title={t("campaigns.title")}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("campaigns.loading")}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("campaigns.title")}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("campaigns.title")}</h1>
            <p className="text-muted-foreground">{t("campaigns.desc")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg p-0.5 bg-muted/30">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setView("table")}
              >
                <List className="h-3.5 w-3.5 mr-2" /> {t("campaigns.toolbar.table")}
              </Button>
              <Button
                variant={view === "kanban" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-2" /> {t("campaigns.toolbar.kanban")}
              </Button>
            </div>
            <Button onClick={() => navigate("/campaigns/new")}>
              <Plus className="h-4 w-4 mr-2" /> {t("campaigns.toolbar.add")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 bg-muted/20 p-2 rounded-lg border">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("campaigns.toolbar.search")}
                className="pl-9 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder={t("campaigns.toolbar.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("campaigns.toolbar.allStatuses")}</SelectItem>
                {statuses.map((s: any) => (
                  <SelectItem key={s.id} value={s.name.toLowerCase()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => bulkDeleteMutation.mutate(selectedIds)}
            >
              <Trash2 className="h-3 w-3 mr-2" /> {t("campaigns.toolbar.deleteSelected")}{" "}
              {selectedIds.length}
            </Button>
          )}
        </div>

        {/* Table View */}
        {view === "table" ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] pl-4">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredCampaigns.length &&
                        filteredCampaigns.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t("campaigns.table.name")}</TableHead>
                  <TableHead>{t("campaigns.table.type")}</TableHead>
                  <TableHead>{t("campaigns.table.status")}</TableHead>
                  <TableHead>{t("campaigns.table.budget")}</TableHead>
                  <TableHead className="text-right pr-4">
                    {t("campaigns.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t("campaigns.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedIds.includes(c.id)}
                          onCheckedChange={() => toggleSelect(c.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <Link
                          to={`/campaigns/${c.id}`}
                          className="hover:underline text-primary flex items-center gap-1.5"
                        >
                          <Megaphone className="h-3.5 w-3.5" />
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.campaignType?.name || "None"}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status?.name} />
                      </TableCell>
                      <TableCell>
                        {c.budgetedCost
                          ? `${currencySymbol}${Number(c.budgetedCost).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <CampaignActions
                          campaign={c}
                          statuses={statuses}
                          queryClient={queryClient}
                          navigate={navigate}
                          deleteMutation={deleteMutation}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        ) : (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statuses.map((status: any) => {
              const statusCampaigns = filteredCampaigns.filter(
                (c: any) => c.status?.id === status.id
              );
              return (
                <div
                  key={status.id}
                  className="min-w-[300px] bg-muted/20 border rounded-xl p-3 h-fit"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-sm">{status.name}</span>
                      <Badge variant="secondary" className="h-5 px-1.5">
                        {statusCampaigns.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {statusCampaigns.map((c: any) => (
                      <Card
                        key={c.id}
                        className="shadow-sm hover:ring-1 hover:ring-primary/20 transition-all"
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              to={`/campaigns/${c.id}`}
                              className="text-sm font-semibold mb-1 line-clamp-1 hover:underline text-primary"
                            >
                              {c.name}
                            </Link>
                            <CampaignActions
                              campaign={c}
                              statuses={statuses}
                              queryClient={queryClient}
                              navigate={navigate}
                              deleteMutation={deleteMutation}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {c.campaignType?.name}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {c.startDate
                                ? new Date(c.startDate).toLocaleDateString()
                                : t("campaigns.kanban.noDate")}
                            </span>
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
      </div>
    </CRMLayout>
  );
}

/* ─── Status Badge ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase();
  const variant =
    s === "running" || s === "active"
      ? "default"
      : s === "completed"
      ? "outline"
      : s === "cancelled"
      ? "destructive"
      : "secondary";
  return <Badge variant={variant}>{status || "Draft"}</Badge>;
}

/* ─── Campaign Actions Dropdown ────────────────────────────────────── */
function CampaignActions({
  campaign,
  statuses,
  queryClient,
  navigate,
  deleteMutation,
}: {
  campaign: any;
  statuses: any[];
  queryClient: any;
  navigate: (path: string) => void;
  deleteMutation: any;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  /* ── Status change helper ───────────────────────────── */
  const findStatus = (name: string) =>
    statuses.find((s: any) => s.name.toLowerCase() === name.toLowerCase());

  const updateStatusMutation = useMutation({
    mutationFn: ({ statusId }: { statusId: number }) =>
      api.campaigns.update(campaign.id, { statusId }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      const status = statuses.find((s: any) => s.id === vars.statusId);
      toast.success(`Campaign marked as ${status?.name ?? "updated"}`);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const changeStatus = (name: string) => {
    const s = findStatus(name);
    if (!s) {
      toast.error(`Status "${name}" not found. Check your campaign statuses.`);
      return;
    }
    updateStatusMutation.mutate({ statusId: s.id });
  };

  /* ── Clone ──────────────────────────────────────────── */
  const cloneMutation = useMutation({
    mutationFn: () =>
      api.campaigns.create({
        name: `${campaign.name} (Copy)`,
        campaignTypeId: campaign.campaignTypeId,
        targetAudience: campaign.targetAudience,
        communicationChannel: campaign.communicationChannel,
        objective: campaign.objective,
        budgetedCost: campaign.budgetedCost,
        expectedRevenue: campaign.expectedRevenue,
        expectedResponse: campaign.expectedResponse,
        description: campaign.description,
        ownerId: campaign.ownerId,
      }),
    onSuccess: (newCampaign: any) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign duplicated successfully");
      navigate(`/campaigns/edit/${newCampaign.id ?? newCampaign?.data?.id}`);
    },
    onError: () => toast.error("Failed to duplicate campaign"),
  });

  /* ── Export single campaign ─────────────────────────── */
  const handleExport = () => {
    const rows = [
      ["Field", "Value"],
      ["Name", campaign.name],
      ["Code", campaign.campaignCode ?? ""],
      ["Type", campaign.campaignType?.name ?? ""],
      ["Status", campaign.status?.name ?? ""],
      ["Start Date", campaign.startDate ?? ""],
      ["End Date", campaign.endDate ?? ""],
      ["Target Audience", campaign.targetAudience ?? ""],
      ["Channel", campaign.communicationChannel ?? ""],
      ["Objective", campaign.objective ?? ""],
      ["Budgeted Cost", campaign.budgetedCost ?? ""],
      ["Actual Cost", campaign.actualCost ?? ""],
      ["Expected Revenue", campaign.expectedRevenue ?? ""],
      ["Actual Revenue", campaign.actualRevenue ?? ""],
      ["Expected Response (%)", campaign.expectedResponse ?? ""],
      ["Actual Response (%)", campaign.actualResponse ?? ""],
      ["Numbers Sent", campaign.numbersSent ?? ""],
      ["Leads Generated", campaign.leadsGenerated ?? ""],
      ["Conversion Rate (%)", campaign.conversionRate ?? ""],
      ["Owner", campaign.owner?.name ?? ""],
      ["Description", campaign.description ?? ""],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${campaign.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Campaign exported");
  };

  /* ── Save note ──────────────────────────────────────── */
  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    await api.campaigns.update(campaign.id, {
      notes: campaign.notes
        ? `${campaign.notes}\n\n[${new Date().toLocaleString()}]\n${noteText}`
        : `[${new Date().toLocaleString()}]\n${noteText}`,
    });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    setNoteOpen(false);
    setNoteText("");
    toast.success("Note added to campaign");
  };

  /* ── Save schedule ──────────────────────────────────── */
  const handleSaveSchedule = async () => {
    if (!scheduleDate) return;
    await api.campaigns.update(campaign.id, { startDate: scheduleDate });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    setScheduleOpen(false);
    toast.success("Campaign scheduled");
  };

  /* ── Send Campaign ──────────────────────────────────── */
  const sendCampaignMutation = useMutation({
    mutationFn: () => api.campaigns.sendCampaign(campaign.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(`Campaign "${campaign.name}" sent successfully`);
    },
    onError: () => toast.error("Failed to send campaign"),
  });

  /* ── Generate backend report ───────────────────────── */
  const handleGenerateReport = async () => {
    try {
      const data = await api.campaigns.getReport(campaign.id);
      const blob = new Blob([data.reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-campaign-${campaign.name.replace(/\s+/g, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Campaign report generated and downloaded");
    } catch {
      toast.error("Failed to generate campaign report");
    }
  };

  const currentStatus = campaign.status?.name?.toLowerCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">

          {/* ── Primary ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            General
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <Eye className="h-4 w-4 text-blue-500" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}>
            <Edit className="h-4 w-4 text-amber-500" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => cloneMutation.mutate()}>
            <Copy className="h-4 w-4 text-purple-500" /> Duplicate / Clone
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* ── Status Changes ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Change Status
          </DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <Play className="h-4 w-4 text-green-500" /> Lifecycle
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                disabled={currentStatus === "active" || currentStatus === "running"}
                onClick={() => changeStatus("Active")}
              >
                <Play className="h-3.5 w-3.5 text-green-500" /> Activate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                disabled={currentStatus === "paused"}
                onClick={() => changeStatus("Paused")}
              >
                <PauseCircle className="h-3.5 w-3.5 text-yellow-500" /> Pause
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                disabled={currentStatus === "completed"}
                onClick={() => changeStatus("Completed")}
              >
                <CheckSquare className="h-3.5 w-3.5 text-teal-500" /> Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                disabled={currentStatus === "cancelled"}
                onClick={() => changeStatus("Cancelled")}
              >
                <XCircle className="h-3.5 w-3.5 text-red-500" /> Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                disabled={currentStatus === "archived"}
                onClick={() => changeStatus("Archived")}
              >
                <Archive className="h-3.5 w-3.5 text-slate-400" /> Archive
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* ── Execution ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Execution
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => sendCampaignMutation.mutate()}>
            <Send className="h-4 w-4 text-sky-500" /> Send Campaign
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setScheduleOpen(true)}>
            <Clock className="h-4 w-4 text-orange-500" /> Schedule
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* ── Recipients ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Recipients
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <UserPlus className="h-4 w-4 text-indigo-500" /> Add Recipients
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <Upload className="h-4 w-4 text-violet-500" /> Import Recipients
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <UserCheck className="h-4 w-4 text-emerald-500" /> Convert Leads
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* ── Engagement ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Engagement
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/activities?campaignId=${campaign.id}`)}>
            <MessageSquare className="h-4 w-4 text-cyan-500" /> Add Activity
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setNoteOpen(true)}>
            <StickyNote className="h-4 w-4 text-lime-500" /> Add Note
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <Paperclip className="h-4 w-4 text-rose-500" /> Attach Files
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* ── Analytics ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Analytics
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <BarChart2 className="h-4 w-4 text-fuchsia-500" /> View Analytics
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <CornerUpLeft className="h-4 w-4 text-amber-500" /> View Responses
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleGenerateReport}>
            <FileBarChart2 className="h-4 w-4 text-teal-500" /> Generate Report
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* ── Data ── */}
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Data
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleExport}>
            <Download className="h-4 w-4 text-slate-400" /> Export CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
            onClick={() => deleteMutation.mutate(campaign.id)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Add Note Dialog ────────────────────────────── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-lime-500" />
              Add Note — {campaign.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Note</Label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Internal note or comment..."
              rows={4}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote} disabled={!noteText.trim()}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Schedule Dialog ────────────────────────────── */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Schedule Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule} disabled={!scheduleDate}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
