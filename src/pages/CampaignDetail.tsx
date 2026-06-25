import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  Percent,
  User,
  Clock,
  Edit,
  Trash2,
  Megaphone,
  CheckCircle,
  FileText,
  Upload,
  Plus,
  Loader2,
  Paperclip,
  Activity,
  BarChart2,
  CornerUpLeft
} from "lucide-react";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaignId = Number(id);
  const queryClient = useQueryClient();
  const { symbol: currencySymbol } = useDefaultCurrency();

  // Dialog & Selection State
  const [addLeadsOpen, setAddLeadsOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [leadSearch, setLeadSearch] = useState("");

  // Refs for File Inputs
  const csvInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: () => api.campaigns.getOne(campaignId),
    enabled: !!campaignId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.campaigns.delete(id),
    onSuccess: () => {
      toast.success("Campaign deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      navigate("/campaigns");
    },
  });

  const { data: allLeads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.leads.getAll().catch(() => []),
  });

  const { data: analytics } = useQuery({
    queryKey: ["campaign-analytics", campaignId],
    queryFn: () => api.campaigns.getAnalytics(campaignId),
    enabled: !!campaignId,
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: () => api.campaigns.getResponses(campaignId),
    enabled: !!campaignId,
  });

  const addRecipientsMutation = useMutation({
    mutationFn: (leadIds: number[]) => api.campaigns.addRecipients(campaignId, leadIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-analytics", campaignId] });
      toast.success("Recipients added successfully");
      setAddLeadsOpen(false);
      setSelectedLeadIds([]);
    },
    onError: () => toast.error("Failed to add recipients"),
  });

  const importRecipientsMutation = useMutation({
    mutationFn: (file: File) => api.campaigns.importRecipients(campaignId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-analytics", campaignId] });
      toast.success("Recipients imported successfully");
    },
    onError: () => toast.error("Failed to import recipients"),
  });

  const convertLeadsMutation = useMutation({
    mutationFn: () => api.campaigns.convertLeads(campaignId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-analytics", campaignId] });
      toast.success(`Converted ${data.convertedCount} leads successfully`);
    },
    onError: () => toast.error("Failed to convert leads"),
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => api.uploads.uploadDocument(file, "campaign", campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success("Attachment uploaded successfully");
    },
    onError: () => toast.error("Failed to upload attachment"),
  });

  if (isLoading) {
    return (
      <CRMLayout title="Campaign Details">
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground italic">Loading campaign record...</div>
        </div>
      </CRMLayout>
    );
  }

  if (!campaign) {
    return (
      <CRMLayout title="Not Found">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Campaign record not found.</p>
          <Button onClick={() => navigate("/campaigns")}>Back to Campaigns</Button>
        </div>
      </CRMLayout>
    );
  }

  const budgetedCost = Number(campaign.budgetedCost || 0);
  const actualCost = Number(campaign.actualCost || 0);
  const expectedRevenue = Number(campaign.expectedRevenue || 0);
  const actualRevenue = Number(campaign.actualRevenue || 0);
  const expectedResponse = campaign.expectedResponse || "-";
  const actualResponse = campaign.actualResponse ? Number(campaign.actualResponse) : null;
  const leadsGenerated = campaign.leadsGenerated ? Number(campaign.leadsGenerated) : null;
  const conversionRate = campaign.conversionRate ? Number(campaign.conversionRate) : null;

  // Calculate ROI
  let roi = 0;
  let roiText = "N/A";
  let isPositive = false;
  
  const costForRoi = actualCost > 0 ? actualCost : budgetedCost;
  const revenueForRoi = actualRevenue > 0 ? actualRevenue : expectedRevenue;
  const isEstimated = actualCost <= 0 || actualRevenue <= 0;

  if (costForRoi > 0) {
    roi = ((revenueForRoi - costForRoi) / costForRoi) * 100;
    roiText = `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%${isEstimated ? " (est.)" : ""}`;
    isPositive = roi >= 0;
  }

  const leads = campaign.leads || [];
  const deals = campaign.deals || [];

  return (
    <CRMLayout title={campaign.name}>
      <div className="flex flex-col h-screen -m-6 bg-background py-3">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => navigate("/campaigns")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-10 w-10 border border-border shadow-sm rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">
                  {campaign.name}
                </h1>
                <Badge variant={
                  campaign.status?.name?.toLowerCase() === 'running'
                    ? 'default'
                    : campaign.status?.name?.toLowerCase() === 'completed'
                    ? 'outline'
                    : campaign.status?.name?.toLowerCase() === 'cancelled'
                    ? 'destructive'
                    : 'secondary'
                }>
                  {campaign.status?.name || "Draft"}
                </Badge>
                <Badge variant="outline">
                  {campaign.campaignType?.name || "None"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                {campaign.campaignCode && (
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[10px]">
                    {campaign.campaignCode}
                  </span>
                )}
                <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-bold h-8 px-4 text-red-500 hover:bg-red-950/20 border-red-500/20 hover:border-red-500/30"
              onClick={() => {
                if (confirm("Are you sure you want to delete this campaign?")) {
                  deleteMutation.mutate(campaignId);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Revenue Card */}
            <Card className="bg-card shadow-sm border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue</p>
                  <h3 className="text-lg font-black text-foreground mt-1">
                    {currencySymbol}{actualRevenue.toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Expected: {currencySymbol}{expectedRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-950/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* Cost Card */}
            <Card className="bg-card shadow-sm border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost</p>
                  <h3 className="text-lg font-black text-foreground mt-1">
                    {currencySymbol}{actualCost.toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Budgeted: {currencySymbol}{budgetedCost.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-950/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* ROI Card */}
            <Card className="bg-card shadow-sm border border-border overflow-hidden relative">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROI Metric</p>
                  <h3 className={`text-lg font-black mt-1 ${roiText === "N/A" ? "text-muted-foreground" : isPositive ? "text-green-500" : "text-red-500"}`}>
                    {roiText}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Profit: {currencySymbol}{(revenueForRoi - costForRoi).toLocaleString()}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${roiText === "N/A" ? "bg-muted" : isPositive ? "bg-green-950/20" : "bg-red-950/20"}`}>
                  <Percent className={`h-5 w-5 ${roiText === "N/A" ? "text-muted-foreground" : isPositive ? "text-green-500" : "text-red-500"}`} />
                </div>
              </CardContent>
            </Card>

            {/* Response Rate Card */}
            <Card className="bg-card shadow-sm border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Response Rate</p>
                  <h3 className="text-lg font-black text-foreground mt-1">
                    {actualResponse !== null ? `${actualResponse}%` : "-"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Expected: {expectedResponse}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-950/20 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            {/* Leads Generated Card */}
            <Card className="bg-card shadow-sm border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Leads Generated</p>
                  <h3 className="text-lg font-black text-foreground mt-1">
                    {leadsGenerated !== null ? leadsGenerated.toLocaleString() : "-"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    From leads: {leads.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-950/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rate Card */}
            <Card className="bg-card shadow-sm border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                  <h3 className="text-lg font-black text-foreground mt-1">
                    {conversionRate !== null ? `${conversionRate}%` : "-"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Associated deals: {deals.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-teal-950/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Details */}
            <Card className="bg-card shadow-sm border border-border lg:col-span-1">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-sm font-bold text-foreground">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-semibold text-foreground">{campaign.startDate ? formatDate(campaign.startDate) : "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-semibold text-foreground">{campaign.endDate ? formatDate(campaign.endDate) : "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Target Audience</span>
                  <span className="font-semibold text-foreground">{campaign.targetAudience || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="font-semibold text-foreground">{campaign.communicationChannel || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Objective</span>
                  <span className="font-semibold text-foreground">{campaign.objective || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Expected Response</span>
                  <span className="font-semibold text-foreground">{campaign.expectedResponse || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Numbers Sent</span>
                  <span className="font-semibold text-foreground">{campaign.numbersSent ? Number(campaign.numbersSent).toLocaleString() : "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-semibold text-foreground">{campaign.owner?.name || "Unassigned"}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <span className="text-muted-foreground text-xs font-bold block mb-1">Description</span>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {campaign.description || "No description provided for this campaign."}
                  </p>
                </div>
                {campaign.notes && (
                  <div className="border-t border-border pt-4">
                    <span className="text-muted-foreground text-xs font-bold block mb-1">Notes</span>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {campaign.notes}
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-bold block">Attachments</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1.5"
                      onClick={() => attachmentInputRef.current?.click()}
                      disabled={uploadAttachmentMutation.isPending}
                    >
                      {uploadAttachmentMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      Upload File
                    </Button>
                    <input
                      type="file"
                      ref={attachmentInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAttachmentMutation.mutate(file);
                      }}
                    />
                  </div>
                  {campaign.attachments && campaign.attachments.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {campaign.attachments.map((file: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs p-1.5 border border-border bg-muted/20 rounded"
                        >
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-primary hover:underline font-bold truncate max-w-[200px]"
                          >
                            <Paperclip className="h-3.5 w-3.5 shrink-0" />
                            {file.name}
                          </a>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No files attached.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Associated Records Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="leads" className="space-y-4">
                <TabsList className="bg-card border border-border p-1 rounded-lg">
                  <TabsTrigger value="leads" className="font-bold text-xs uppercase px-4 gap-2">
                    <Users className="h-3.5 w-3.5" /> Related Leads ({leads.length})
                  </TabsTrigger>
                  <TabsTrigger value="deals" className="font-bold text-xs uppercase px-4 gap-2">
                    <Briefcase className="h-3.5 w-3.5" /> Related Deals ({deals.length})
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="font-bold text-xs uppercase px-4 gap-2">
                    <BarChart2 className="h-3.5 w-3.5" /> Analytics
                  </TabsTrigger>
                  <TabsTrigger value="responses" className="font-bold text-xs uppercase px-4 gap-2">
                    <CornerUpLeft className="h-3.5 w-3.5" /> Responses ({responses.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="leads" className="bg-card border border-border rounded-xl shadow-sm p-4 min-h-[300px] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Campaign Recipients</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5" onClick={() => setAddLeadsOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> Add Leads
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5" onClick={() => csvInputRef.current?.click()} disabled={importRecipientsMutation.isPending}>
                        {importRecipientsMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Import (CSV)
                      </Button>
                      <input
                        type="file"
                        ref={csvInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) importRecipientsMutation.mutate(file);
                        }}
                      />
                      {leads.some((l: any) => !l.isConverted) && (
                        <Button variant="default" size="sm" className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => {
                          if (confirm("Are you sure you want to convert all unconverted leads in this campaign?")) {
                            convertLeadsMutation.mutate();
                          }
                        }} disabled={convertLeadsMutation.isPending}>
                          {convertLeadsMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Convert Leads
                        </Button>
                      )}
                    </div>
                  </div>
                  {leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-sm">No Leads Associated</p>
                      <p className="text-xs max-w-sm mt-1">Leads that are created with this campaign source will show up here.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead: any) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium text-foreground">
                              <Link to={`/leads/${lead.id}`} className="text-primary hover:underline font-bold">
                                {lead.name}
                              </Link>
                            </TableCell>
                            <TableCell>{lead.company || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-muted/30 text-[10px]">
                                {lead.stage?.name || "New"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[10px]">
                                {lead.priority?.name || "Normal"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="deals" className="bg-card border border-border rounded-xl shadow-sm p-4 min-h-[300px]">
                  {deals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-sm">No Deals Associated</p>
                      <p className="text-xs max-w-sm mt-1">Deals that are associated with this campaign will show up here.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deal Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Probability</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deals.map((deal: any) => (
                          <TableRow key={deal.id}>
                            <TableCell className="font-medium text-foreground">
                              <Link to={`/deals/${deal.id}`} className="text-primary hover:underline font-bold">
                                {deal.name}
                              </Link>
                            </TableCell>
                            <TableCell className="font-bold">
                              {currencySymbol}{(deal.value || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-muted/30 text-[10px]">
                                {deal.stage?.name || "Discovery"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-500 font-bold">
                              {deal.probability || 0}%
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(deal.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="bg-card border border-border rounded-xl shadow-sm p-5 min-h-[300px] space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Campaign Performance Analytics</h3>
                    <p className="text-xs text-muted-foreground">Aggregated financial and conversion funnel metrics for this campaign.</p>
                  </div>
                  
                  {analytics ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4 bg-muted/10 space-y-2">
                          <span className="text-xs text-muted-foreground font-medium block">Financial ROI Analysis</span>
                          <div className="flex justify-between text-sm">
                            <span>Cost Basis:</span>
                            <span className="font-bold">{currencySymbol}{Number(analytics.metrics.actualCost || analytics.metrics.budgetedCost).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Revenue Returned:</span>
                            <span className="font-bold text-green-500">{currencySymbol}{Number(analytics.metrics.actualRevenue || analytics.metrics.expectedRevenue).toLocaleString()}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between text-sm font-black">
                            <span>Net ROI:</span>
                            <span className={analytics.metrics.roi >= 0 ? "text-green-500" : "text-red-500"}>
                              {analytics.metrics.roi >= 0 ? "+" : ""}{analytics.metrics.roi}%
                            </span>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-muted/10 space-y-2">
                          <span className="text-xs text-muted-foreground font-medium block">Conversion Funnel</span>
                          <div className="flex justify-between text-sm">
                            <span>Total Leads Generated:</span>
                            <span className="font-bold">{analytics.metrics.leadsGenerated}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Conversion Rate:</span>
                            <span className="font-bold text-primary">{analytics.metrics.conversionRate}%</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between text-sm font-black">
                            <span>Associated Deals:</span>
                            <span className="font-bold">{analytics.metrics.totalDeals} ({currencySymbol}{Number(analytics.metrics.totalDealValue).toLocaleString()})</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Leads by Pipeline Stage</h4>
                          {Object.keys(analytics.leadStages).length > 0 ? (
                            <div className="space-y-2">
                              {Object.entries(analytics.leadStages).map(([stage, count]: any) => (
                                <div key={stage} className="flex justify-between items-center text-xs p-2 border border-border rounded bg-muted/5">
                                  <span className="font-bold">{stage}</span>
                                  <Badge variant="secondary">{count} leads</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No leads mapped.</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Deals by Stage</h4>
                          {Object.keys(analytics.dealStages).length > 0 ? (
                            <div className="space-y-2">
                              {Object.entries(analytics.dealStages).map(([stage, count]: any) => (
                                <div key={stage} className="flex justify-between items-center text-xs p-2 border border-border rounded bg-muted/5">
                                  <span className="font-bold">{stage}</span>
                                  <Badge variant="secondary">{count} deals</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No deals mapped.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-muted-foreground italic text-xs">
                      Loading analytics data...
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="responses" className="bg-card border border-border rounded-xl shadow-sm p-4 min-h-[300px] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Recipient Engagement Logs</h3>
                    <p className="text-xs text-muted-foreground font-medium">Deterministic simulation of delivered and responded emails/SMS.</p>
                  </div>

                  {responses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Activity className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-sm">No Engagement Logs</p>
                      <p className="text-xs max-w-sm mt-1">Associate leads with this campaign to see simulated delivery status.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {responses.map((resp: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(resp.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-bold text-xs">{resp.leadName}</TableCell>
                            <TableCell className="text-xs">{resp.email}</TableCell>
                            <TableCell>
                              <Badge variant={
                                resp.status === 'Replied' ? 'default' :
                                resp.status === 'Opened' ? 'secondary' :
                                resp.status === 'Clicked' ? 'outline' :
                                resp.status === 'Opted Out' ? 'destructive' : 'secondary'
                              } className="text-[10px]">
                                {resp.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{resp.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Leads Dialog ────────────────────────────── */}
      <Dialog open={addLeadsOpen} onOpenChange={setAddLeadsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <Plus className="h-4 w-4 text-primary" />
              Add Leads to Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3 flex-1 overflow-y-auto">
            <Input
              placeholder="Search leads by name or company..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="h-9"
            />
            
            <div className="border rounded-lg max-h-60 overflow-y-auto divide-y">
              {allLeads
                .filter((l: any) => l.campaignId !== campaignId)
                .filter((l: any) => 
                  l.name.toLowerCase().includes(leadSearch.toLowerCase()) || 
                  (l.company && l.company.toLowerCase().includes(leadSearch.toLowerCase()))
                )
                .map((lead: any) => (
                  <div key={lead.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/30">
                    <Checkbox
                      checked={selectedLeadIds.includes(lead.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLeadIds(prev => [...prev, lead.id]);
                        } else {
                          setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                        }
                      }}
                      id={`add-lead-${lead.id}`}
                    />
                    <label htmlFor={`add-lead-${lead.id}`} className="flex-1 text-xs cursor-pointer">
                      <div className="font-bold text-foreground">{lead.name}</div>
                      {lead.company && <div className="text-[10px] text-muted-foreground">{lead.company}</div>}
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter className="border-t pt-3 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setAddLeadsOpen(false)}>Cancel</Button>
            <Button 
              size="sm" 
              onClick={() => addRecipientsMutation.mutate(selectedLeadIds)} 
              disabled={selectedLeadIds.length === 0 || addRecipientsMutation.isPending}
            >
              {addRecipientsMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              Add Selected ({selectedLeadIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
