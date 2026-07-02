import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  ChevronDown,
  Edit2,
  Lock,
  MessageSquare,
  Plus,
  ArrowRight
} from "lucide-react";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";
import { 
  Dialog as UI_Dialog, 
  DialogContent as UI_DialogContent, 
  DialogHeader as UI_DialogHeader, 
  DialogTitle as UI_DialogTitle, 
  DialogFooter as UI_DialogFooter,
  DialogDescription as UI_DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const CurrencyBadge = ({ amount, className }: { amount: number, className?: string }) => (
  <span className={className}>
    <CurrencyNumbers amount={amount} />
  </span>
);

const Forecast = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activePeriodId, setActivePeriodId] = useState<number | null>(null);
  const [selectedRep, setSelectedRep] = useState<any>(null);
  const { code: currencyCode } = useDefaultCurrency();
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriodData, setNewPeriodData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    type: "MONTH"
  });
  const [adjustmentData, setAdjustmentData] = useState({
    commit: "",
    bestCase: "",
    note: ""
  });

  const formatCurrency = (amount: number) => {
    return <CurrencyNumbers amount={amount} />;
  };

  const { data: periods = [] } = useQuery({
    queryKey: ["forecast-periods"],
    queryFn: api.forecast.getPeriods,
  });

  const { data: dashboard = [], isLoading: isDashboardLoading } = useQuery({
    queryKey: ["forecast-dashboard", activePeriodId],
    queryFn: () => activePeriodId ? api.forecast.getDashboard(activePeriodId) : Promise.resolve([]),
    enabled: !!activePeriodId,
  });

  const { data: mappings = [] } = useQuery({
    queryKey: ["forecast-mappings"],
    queryFn: api.forecast.getMappings,
  });

  const { data: targets = [] } = useQuery({
    queryKey: ["forecast-targets", activePeriodId],
    queryFn: () => activePeriodId ? api.forecast.getTargets(activePeriodId) : Promise.resolve([]),
    enabled: !!activePeriodId,
  });

  const { data: myForecast, isLoading: isMyLoading } = useQuery({
    queryKey: ["forecast-my", activePeriodId],
    queryFn: () => api.forecast.getMyForecast(activePeriodId || undefined),
    enabled: !!activePeriodId,
  });

  // Use useEffect for initial selection to avoid render-phase state updates
  useState(() => {
    if (!activePeriodId && periods.length > 0) {
      const active = periods.find((p: any) => p.status === "OPEN") || periods[0];
      if (active) setActivePeriodId(active.id);
    }
  });

  const setTargetMutation = useMutation({
    mutationFn: api.forecast.setTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecast-targets"] });
      queryClient.invalidateQueries({ queryKey: ["forecast-dashboard"] });
      toast.success(t("forecast.statusUpdates.targetUpdated"));
    }
  });

  const updateMappingMutation = useMutation({
    mutationFn: ({ id, category }: { id: number, category: any }) => api.forecast.updateMapping(id, { category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecast-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["forecast-dashboard"] });
      toast.success(t("forecast.statusUpdates.mappingUpdated"));
    }
  });

  const adjustMutation = useMutation({
    mutationFn: api.forecast.adjust,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecast-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["forecast-my"] });
      toast.success(t("forecast.statusUpdates.forecastAdjusted"));
      setShowAdjustment(false);
    }
  });

  const createPeriodMutation = useMutation({
    mutationFn: api.forecast.createPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecast-periods"] });
      toast.success(t("forecast.statusUpdates.periodCreated"));
      setShowNewPeriod(false);
      setNewPeriodData({ name: "", startDate: "", endDate: "", type: "MONTH" });
    }
  });

  const lockPeriodMutation = useMutation({
    mutationFn: (id: number) => api.forecast.updatePeriod(id, { status: "LOCKED" as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecast-periods"] });
      toast.success(t("forecast.statusUpdates.periodLocked"));
    }
  });

  const handleAdjust = () => {
    if (!selectedRep || !activePeriodId) return;
    adjustMutation.mutate({
      userId: selectedRep.userId,
      periodId: activePeriodId,
      commitOverride: adjustmentData.commit ? Number(adjustmentData.commit) : undefined,
      bestCaseOverride: adjustmentData.bestCase ? Number(adjustmentData.bestCase) : undefined,
      note: adjustmentData.note
    });
  };

  const totals = dashboard.reduce((acc: any, curr: any) => {
    acc.target += curr.target || 0;
    acc.pipeline += curr.pipeline || 0;
    acc.bestCase += curr.bestCase || 0;
    acc.commit += curr.commit || 0;
    acc.closed += curr.closed || 0;
    acc.gap += curr.gap || 0;
    return acc;
  }, { target: 0, pipeline: 0, bestCase: 0, commit: 0, closed: 0, gap: 0 });

  return (
    <CRMLayout title={t("forecast.pageTitle")}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select 
              value={activePeriodId?.toString()} 
              onValueChange={(v) => setActivePeriodId(Number(v))}
            >
              <SelectTrigger className="w-[200px] h-9 font-semibold">
                <SelectValue placeholder={t("forecast.selectPeriod")} />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name} ({p.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="h-6 px-3 bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider text-[10px]">
              {t("forecast.currency", { code: currencyCode })}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 font-bold" onClick={() => setShowNewPeriod(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Period
            </Button>
            <Button 
              size="sm" 
              className="h-9 font-bold bg-primary text-white shadow-lg shadow-primary/20"
              onClick={() => activePeriodId && lockPeriodMutation.mutate(activePeriodId)}
              disabled={lockPeriodMutation.isPending || (periods.find((p: any) => p.id === activePeriodId)?.status === 'LOCKED')}
            >
              <Lock className="h-4 w-4 mr-2" /> 
              {periods.find((p: any) => p.id === activePeriodId)?.status === 'LOCKED' ? t('forecast.periodLocked') : t('forecast.lockPeriod')}
            </Button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-bold text-primary tracking-widest flex items-center gap-2">
                <Target className="h-3 w-3" /> {t("forecast.kpis.teamTarget")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">{formatCurrency(totals.target)}</div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{t("forecast.kpis.goalForPeriod")}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-amber-500/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-bold text-amber-600 tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3 w-3" /> {t("forecast.kpis.commitForecast")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight text-amber-600">{formatCurrency(totals.commit)}</div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium italic">{t("forecast.kpis.includingAdjustments")}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-green-500/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-bold text-green-600 tracking-widest flex items-center gap-2">
                <BarChart3 className="h-3 w-3" /> {t("forecast.kpis.closedRevenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight text-green-600">{formatCurrency(totals.closed)}</div>
              <div className="mt-2 h-1.5 w-full bg-green-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${Math.min(100, (totals.closed / Math.max(1, totals.target)) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-destructive/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-bold text-destructive tracking-widest flex items-center gap-2">
                <Users className="h-3 w-3" /> {t("forecast.kpis.remainingGap")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight text-destructive">{formatCurrency(totals.gap)}</div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{t("forecast.kpis.toHitCommitment")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="manager" className="w-full">
          <TabsList className="mb-4 bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value="manager" className="font-bold text-xs px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">{t("forecast.tabs.managerView")}</TabsTrigger>
            <TabsTrigger value="rep" className="font-bold text-xs px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">{t("forecast.tabs.salesRepView")}</TabsTrigger>
            <TabsTrigger value="config" className="font-bold text-xs px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">{t("forecast.tabs.configuration")}</TabsTrigger>
          </TabsList>

          <TabsContent value="manager">
            <Card className="border border-border/50 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 outline-none">{t("forecast.managerTable.salesRep")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("forecast.managerTable.target")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("forecast.managerTable.pipeline")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("forecast.managerTable.bestCase")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("forecast.managerTable.commit")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("forecast.managerTable.closed")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("forecast.managerTable.gap")}</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-right py-4 outline-none">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDashboardLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-20 text-muted-foreground animate-pulse">{t("forecast.loadingDashboard")}</TableCell>
                    </TableRow>
                  ) : dashboard.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">{t("forecast.noData")}</TableCell>
                    </TableRow>
                  ) : (
                    dashboard.map((rep: any) => (
                      <TableRow key={rep.userId} className="hover:bg-muted/20 transition-colors border-b border-border/30 group">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                              {rep.userName.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <span className="font-bold text-sm">{rep.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm">{formatCurrency(rep.target)}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm font-medium">{formatCurrency(rep.pipeline)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          <span className={rep.hasAdjustment ? "text-amber-600 underline decoration-dotted" : ""}>
                            {formatCurrency(rep.bestCase)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-black">
                          <span className={rep.hasAdjustment ? "text-amber-600 underline decoration-dotted" : ""}>
                            {formatCurrency(rep.commit)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-green-600">{formatCurrency(rep.closed)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={`font-black text-[10px] px-2 py-0 h-5 ${rep.gap > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                            {formatCurrency(rep.gap)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600"
                              onClick={() => {
                                setSelectedRep(rep);
                                setAdjustmentData({
                                  commit: rep.commit.toString(),
                                  bestCase: rep.bestCase.toString(),
                                  note: rep.adjustmentNote || ""
                                });
                                setShowAdjustment(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="rep">
            {myForecast ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-border/50 shadow-sm col-span-2">
                    <CardHeader className="pb-3 border-b border-border/50">
                      <CardTitle className="text-sm font-black uppercase tracking-tight">{t("forecast.repView.contributingDeals")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[9px] font-black uppercase py-4">{t("forecast.repView.dealName")}</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-4">{t("forecast.repView.category")}</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-4 text-right">{t("forecast.repView.value")}</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-4 text-right">{t("forecast.repView.probability")}</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-4 text-right">{t("forecast.repView.expected")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myForecast.deals?.map((deal: any) => (
                            <TableRow key={deal.id} className="hover:bg-muted/10 border-b border-border/30 group">
                              <TableCell className="py-4">
                                <span className="font-bold text-xs">{deal.name}</span>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{deal.stage}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 uppercase ${
                                  deal.category === 'CLOSED' ? 'bg-green-50 text-green-600 border-green-200' :
                                  deal.category === 'COMMIT' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                  {deal.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold text-xs">{formatCurrency(deal.value)}</TableCell>
                              <TableCell className="text-right text-xs text-muted-foreground">{deal.probability}%</TableCell>
                              <TableCell className="text-right text-[10px] font-medium">{new Date(deal.expectedCloseDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                          {(!myForecast.deals || myForecast.deals.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs italic">{t("forecast.repView.noContributingDeals")}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border border-border/50 shadow-sm bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-black tracking-widest text-primary">{t("forecast.repView.personalTarget")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-black tracking-tight">{formatCurrency(myForecast.stats?.target || 0)}</div>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium uppercase tracking-tighter">{t("forecast.repView.attainment")}</span>
                            <span className="font-black text-green-600">
                              {Math.round(((myForecast.stats?.closed || 0) / Math.max(1, myForecast.stats?.target || 0)) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                             <div 
                               className="h-full bg-green-500 shadow-sm"
                               style={{ width: `${Math.min(100, ((myForecast.stats?.closed || 0) / Math.max(1, myForecast.stats?.target || 0)) * 100)}%` }}
                             />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border/50 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-black tracking-widest">{t("forecast.repView.commitmentSummary")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border/30 pb-3">
                           <div className="text-[10px] font-bold text-muted-foreground uppercase">{t("forecast.repView.calculated")}</div>
                           <div className="text-sm font-black">{formatCurrency(myForecast.stats?.commit || 0)}</div>
                        </div>
                        {myForecast.stats?.hasAdjustment && (
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 space-y-1">
                             <div className="text-[9px] font-black text-amber-700 uppercase flex items-center gap-1.5">
                                <Edit2 className="h-2.5 w-2.5" /> {t("forecast.repView.managerAdjustment")}
                             </div>
                             <div className="text-xs font-medium text-amber-800 italic">"{myForecast.stats?.adjustmentNote}"</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">{t("forecast.repView.noData")}</div>
            )}
          </TabsContent>

          <TabsContent value="config">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border/50 shadow-sm">
                   <CardHeader>
                      <CardTitle className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center justify-between">
                         {t("forecast.config.stageToCategoryMapping")}
                         <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-muted-foreground hover:text-primary">{t("forecast.config.configure")}</Button>
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[9px] font-black uppercase py-4">{t("forecast.config.crmStage")}</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-4">{t("forecast.config.forecastCategory")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mappings.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-10 text-muted-foreground text-xs font-medium italic">{t("forecast.config.noMappings")}</TableCell>
                            </TableRow>
                          ) : (
                            mappings.map((m: any) => (
                              <TableRow key={m.id} className="hover:bg-muted/10 border-b border-border/30">
                                <TableCell className="font-bold text-xs">{m.dealStage?.name || m.stageName}</TableCell>
                                <TableCell>
                                   <Select 
                                      value={m.category} 
                                      onValueChange={(v) => updateMappingMutation.mutate({ id: m.id, category: v })}
                                    >
                                      <SelectTrigger className="h-7 text-[8px] font-black uppercase w-28 bg-transparent border-none focus:ring-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PIPELINE">{t("forecast.config.categories.pipeline")}</SelectItem>
                                        <SelectItem value="BEST_CASE">{t("forecast.config.categories.bestCase")}</SelectItem>
                                        <SelectItem value="COMMIT">{t("forecast.config.categories.commit")}</SelectItem>
                                        <SelectItem value="CLOSED">{t("forecast.config.categories.closed")}</SelectItem>
                                        <SelectItem value="OMIT">{t("forecast.config.categories.omit")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                   </CardContent>
                </Card>

                <Card className="border border-border/50 shadow-sm">
                   <CardHeader>
                      <CardTitle className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center justify-between">
                         {t("forecast.config.targetAssignment")}
                         <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-muted-foreground hover:text-primary">{t("forecast.config.bulkEdit")}</Button>
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">JD</div>
                            <div>
                               <div className="text-xs font-bold">John Doe</div>
                               <div className="text-[10px] text-muted-foreground font-medium">Global Sales Director</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <Input defaultValue="250000" className="w-24 h-8 text-right font-black text-xs" />
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                         </div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">AS</div>
                            <div>
                               <div className="text-xs font-bold">Alice Smith</div>
                               <div className="text-[10px] text-muted-foreground font-medium">Territory Manager</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <Input defaultValue="185000" className="w-24 h-8 text-right font-black text-xs" />
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                         </div>
                      </div>
                   </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>

        {/* Adjust Forecast Dialog */}
        <Dialog open={showAdjustment} onOpenChange={setShowAdjustment}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-black tracking-tight">{t("forecast.adjustDialog.title")}</DialogTitle>
              <DialogDescription className="text-xs font-medium"> {t("forecast.adjustDialog.description", { name: selectedRep?.userName })}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">{t("forecast.adjustDialog.bestCaseOverride")}</label>
                <div className="relative">
                   <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                   <Input 
                    placeholder={t("forecast.adjustDialog.placeholders.enterValue")} 
                    className="pl-10 font-bold"
                    value={adjustmentData.bestCase}
                    onChange={(e) => setAdjustmentData({...adjustmentData, bestCase: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">{t("forecast.adjustDialog.commitmentOverride")}</label>
                <div className="relative">
                   <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                   <Input 
                    placeholder={t("forecast.adjustDialog.placeholders.enterValue")} 
                    className="pl-10 font-black"
                    value={adjustmentData.commit}
                    onChange={(e) => setAdjustmentData({...adjustmentData, commit: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">{t("forecast.adjustDialog.justification")}</label>
                <Input 
                  placeholder={t("forecast.adjustDialog.placeholders.whyOverride")} 
                  className="font-medium h-12"
                  value={adjustmentData.note}
                  onChange={(e) => setAdjustmentData({...adjustmentData, note: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdjustment(false)} className="font-bold text-xs uppercase tracking-wider">{t("common.cancel")}</Button>
              <Button 
                onClick={handleAdjust} 
                disabled={adjustMutation.isPending}
                className="font-bold text-xs uppercase tracking-wider bg-primary text-white shadow-lg shadow-primary/20"
              >
                {adjustMutation.isPending ? t("forecast.adjustDialog.applying") : t("forecast.adjustDialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Period Dialog */}
        <Dialog open={showNewPeriod} onOpenChange={setShowNewPeriod}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">{t("forecast.newPeriodDialog.title")}</DialogTitle>
              <DialogDescription className="text-xs">
                {t("forecast.newPeriodDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="period-name" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("forecast.newPeriodDialog.periodName")}</Label>
                <Input
                  id="period-name"
                  placeholder={t("forecast.newPeriodDialog.placeholders.periodName")}
                  value={newPeriodData.name}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, name: e.target.value })}
                  className="font-medium h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("forecast.newPeriodDialog.startDate")}</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newPeriodData.startDate}
                    onChange={(e) => setNewPeriodData({ ...newPeriodData, startDate: e.target.value })}
                    className="font-medium h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("forecast.newPeriodDialog.endDate")}</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newPeriodData.endDate}
                    onChange={(e) => setNewPeriodData({ ...newPeriodData, endDate: e.target.value })}
                    className="font-medium h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-type" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("forecast.newPeriodDialog.intervalType")}</Label>
                <Select 
                  value={newPeriodData.type} 
                  onValueChange={(v) => setNewPeriodData({ ...newPeriodData, type: v })}
                >
                  <SelectTrigger id="period-type" className="h-10 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTH">{t("forecast.newPeriodDialog.monthly")}</SelectItem>
                    <SelectItem value="QUARTER">{t("forecast.newPeriodDialog.quarterly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button variant="ghost" onClick={() => setShowNewPeriod(false)} className="font-bold">{t("common.cancel")}</Button>
              <Button 
                onClick={() => createPeriodMutation.mutate(newPeriodData)}
                disabled={!newPeriodData.name || !newPeriodData.startDate || !newPeriodData.endDate || createPeriodMutation.isPending}
                className="font-bold bg-primary shadow-lg shadow-primary/20 min-w-[120px]"
              >
                {createPeriodMutation.isPending ? t("common.creating") : t("forecast.newPeriodDialog.createPeriod")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </CRMLayout>
  );
};

export default Forecast;
