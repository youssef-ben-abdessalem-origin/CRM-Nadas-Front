import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Megaphone, ArrowLeft, Save, Calendar, DollarSign,
  Target, Users, Radio, TrendingUp, Hash, FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function NewCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { symbol: currencySymbol } = useDefaultCurrency();

  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    campaignTypeId: "",
    statusId: "",
    campaignCode: "",
    targetAudience: "",
    communicationChannel: "",
    objective: "",
    startDate: "",
    endDate: "",
    budgetedCost: "",
    actualCost: "",
    expectedRevenue: "",
    actualRevenue: "",
    expectedResponse: "",
    actualResponse: "",
    leadsGenerated: "",
    conversionRate: "",
    numbersSent: "",
    ownerId: "",
    description: "",
    notes: "",
  });

  const { data: existing, isLoading: isExistingLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.campaigns.getOne(Number(id)),
    enabled: isEdit,
  });

  const { data: types = [] } = useQuery({
    queryKey: ["campaign-types"],
    queryFn: () => api.campaigns.getTypes().catch(() => []),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["campaign-statuses"],
    queryFn: () => api.campaigns.getStatuses().catch(() => []),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll().catch(() => []),
  });

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name ?? "",
        campaignTypeId: existing.campaignTypeId?.toString() ?? "",
        statusId: existing.statusId?.toString() ?? "",
        campaignCode: existing.campaignCode ?? "",
        targetAudience: existing.targetAudience ?? "",
        communicationChannel: existing.communicationChannel ?? "",
        objective: existing.objective ?? "",
        startDate: existing.startDate ? existing.startDate.substring(0, 10) : "",
        endDate: existing.endDate ? existing.endDate.substring(0, 10) : "",
        budgetedCost: existing.budgetedCost?.toString() ?? "",
        actualCost: existing.actualCost?.toString() ?? "",
        expectedRevenue: existing.expectedRevenue?.toString() ?? "",
        actualRevenue: existing.actualRevenue?.toString() ?? "",
        expectedResponse: existing.expectedResponse?.toString() ?? "",
        actualResponse: existing.actualResponse?.toString() ?? "",
        leadsGenerated: existing.leadsGenerated?.toString() ?? "",
        conversionRate: existing.conversionRate?.toString() ?? "",
        numbersSent: existing.numbersSent?.toString() ?? "",
        ownerId: existing.ownerId?.toString() ?? "",
        description: existing.description ?? "",
        notes: existing.notes ?? "",
      });
    }
  }, [existing]);

  const createMutation = useMutation({
    mutationFn: api.campaigns.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(t("campaigns.statusUpdates.created", "Campaign created successfully"));
      navigate("/campaigns");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.campaigns.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success(t("campaigns.statusUpdates.updated", "Campaign updated"));
      navigate("/campaigns");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const parseNum = (v: string) => (v !== "" ? Number(v) : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    const payload = {
      name: form.name,
      campaignTypeId: parseNum(form.campaignTypeId),
      statusId: parseNum(form.statusId),
      campaignCode: form.campaignCode || undefined,
      targetAudience: form.targetAudience || undefined,
      communicationChannel: form.communicationChannel || undefined,
      objective: form.objective || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      budgetedCost: parseNum(form.budgetedCost),
      actualCost: parseNum(form.actualCost),
      expectedRevenue: parseNum(form.expectedRevenue),
      actualRevenue: parseNum(form.actualRevenue),
      expectedResponse: parseNum(form.expectedResponse),
      actualResponse: parseNum(form.actualResponse),
      leadsGenerated: parseNum(form.leadsGenerated),
      conversionRate: parseNum(form.conversionRate),
      numbersSent: parseNum(form.numbersSent),
      ownerId: parseNum(form.ownerId),
      description: form.description || undefined,
      notes: form.notes || undefined,
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  if (isEdit && isExistingLoading) {
    return (
      <CRMLayout title="Loading...">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading campaign...
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? "Edit Campaign" : "New Campaign"}>
      <form onSubmit={handleSubmit} className="space-y-6 pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/campaigns")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {isEdit ? "Edit Campaign" : "New Campaign"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "Update campaign details"
                  : "Create a new marketing campaign"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/campaigns")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Campaign"}
            </Button>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Campaign Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="e.g. Summer Sale 2026"
                required
                className="text-base"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.campaignTypeId} onValueChange={set("campaignTypeId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t: any) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.statusId} onValueChange={set("statusId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campaign Code</Label>
                <Input
                  value={form.campaignCode}
                  onChange={(e) => set("campaignCode")(e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={form.ownerId} onValueChange={set("ownerId")}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Targeting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Target className="h-4 w-4" />
              Targeting & Channel
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={form.targetAudience} onValueChange={set("targetAudience")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customers">Customers</SelectItem>
                  <SelectItem value="Leads">Leads</SelectItem>
                  <SelectItem value="Vendors">Vendors</SelectItem>
                  <SelectItem value="VIP Customers">VIP Customers</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Communication Channel</Label>
              <Select value={form.communicationChannel} onValueChange={set("communicationChannel")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objective</Label>
              <Select value={form.objective} onValueChange={set("objective")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Calendar className="h-4 w-4" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate")(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Budget & Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <DollarSign className="h-4 w-4" />
              Budget & Revenue ({currencySymbol})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budgeted Cost</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={form.budgetedCost}
                onChange={(e) => set("budgetedCost")(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Actual Cost</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={form.actualCost}
                onChange={(e) => set("actualCost")(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Revenue</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={form.expectedRevenue}
                onChange={(e) => set("expectedRevenue")(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Actual Revenue</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={form.actualRevenue}
                onChange={(e) => set("actualRevenue")(e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Expected Response (%)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                max="100"
                value={form.expectedResponse}
                onChange={(e) => set("expectedResponse")(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-2">
              <Label>Actual Response (%)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                max="100"
                value={form.actualResponse}
                onChange={(e) => set("actualResponse")(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
            <div className="space-y-2">
              <Label>Numbers Sent</Label>
              <Input
                type="number"
                min="0"
                value={form.numbersSent}
                onChange={(e) => set("numbersSent")(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Leads Generated</Label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border select-none">
                  Auto • System
                </span>
              </div>
              <Input
                type="number"
                readOnly
                tabIndex={-1}
                value={form.leadsGenerated || "0"}
                className="bg-muted/40 cursor-not-allowed text-muted-foreground select-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Automatically counted from leads linked to this campaign.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Conversion Rate (%)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                max="100"
                value={form.conversionRate}
                onChange={(e) => set("conversionRate")(e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              Description & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Campaign description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Internal comments, reminders..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/campaigns")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2 px-8">
            <Save className="h-4 w-4" />
            {isPending
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Campaign"}
          </Button>
        </div>
      </form>
    </CRMLayout>
  );
}
