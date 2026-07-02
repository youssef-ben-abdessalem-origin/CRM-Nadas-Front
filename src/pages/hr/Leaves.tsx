import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, LeaveRequest, LeaveType } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Check, X, FileText, Settings, CalendarRange, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

function getEffectiveBalance(balance: any) {
  return balance.monthlyBreakdown
    ? [...balance.monthlyBreakdown].reverse().find((month: any) => !month.isProjected)?.balance ?? balance.remainingDays
    : balance.remainingDays;
}

export default function Leaves() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
        const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setDays(String(diff));
      }
    } else {
      setDays("");
    }
  }, [startDate, endDate]);

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeCode, setTypeCode] = useState("");
  const [typeName, setTypeName] = useState("");
  const [typeNameAr, setTypeNameAr] = useState("");
  const [typeNameFr, setTypeNameFr] = useState("");
  const [typeDesc, setTypeDesc] = useState("");
  const [typePaid, setTypePaid] = useState("true");
  const [typeLimit, setTypeLimit] = useState("");
  const [typeRequiresApproval, setTypeRequiresApproval] = useState("true");
  const [typeRequiresDocs, setTypeRequiresDocs] = useState("false");
  const [typeMaxDays, setTypeMaxDays] = useState("");
  const [typeCarryForward, setTypeCarryForward] = useState("false");

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => api.hr.leaveRequests.getAll(),
  });

  const { data: types = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => api.hr.leaveTypes.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: balances = [] } = useQuery({
    queryKey: ["leaveBalances", selectedEmpId],
    queryFn: () => api.hr.leaveBalances.getAll(+selectedEmpId, new Date().getFullYear()),
    enabled: !!selectedEmpId,
  });

  const availableLeaveBalances = balances
    .filter((balance) => balance.leaveType)
    .map((balance) => ({
      ...balance,
      effectiveRemainingDays: getEffectiveBalance(balance),
    }))
    .sort((a, b) => (a.leaveType?.name || "").localeCompare(b.leaveType?.name || ""));
  const currentBalance = availableLeaveBalances.find((b) => b.leaveTypeId === +selectedTypeId);

  useEffect(() => {
    setSelectedTypeId("");
  }, [selectedEmpId]);

  useEffect(() => {
    if (!selectedTypeId) return;

    const stillAvailable = availableLeaveBalances.some((balance) => String(balance.leaveTypeId) === selectedTypeId);
    if (!stillAvailable) {
      setSelectedTypeId("");
    }
  }, [availableLeaveBalances, selectedTypeId]);

  const createRequestMutation = useMutation({
    mutationFn: api.hr.leaveRequests.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success(t("hr.statusUpdates.leaveRequestSubmitted"));
      setIsRequestOpen(false);
      resetRequestForm();
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.leaveRequests.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success(t("hr.statusUpdates.leaveRequestUpdated"));
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: api.hr.leaveTypes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast.success(t("hr.statusUpdates.leaveTypeCreated"));
      setIsTypeOpen(false);
      resetTypeForm();
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: api.hr.leaveTypes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast.success(t("hr.statusUpdates.leaveTypeDeleted"));
    },
  });

  const resetRequestForm = () => {
    setSelectedEmpId("");
    setSelectedTypeId("");
    setStartDate("");
    setEndDate("");
    setDays("");
    setReason("");
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate({
      employeeId: +selectedEmpId,
      leaveTypeId: +selectedTypeId,
      startDate,
      endDate,
      days: +days,
      reason,
      status: "Pending",
    });
  };

  const resetTypeForm = () => {
    setTypeCode(""); setTypeName(""); setTypeNameAr(""); setTypeNameFr(""); setTypeDesc("");
    setTypePaid("true"); setTypeLimit(""); setTypeRequiresApproval("true");
    setTypeRequiresDocs("false"); setTypeMaxDays(""); setTypeCarryForward("false");
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTypeMutation.mutate({
      code: typeCode,
      name: typeName,
      nameAr: typeNameAr || undefined,
      nameFr: typeNameFr || undefined,
      description: typeDesc || undefined,
      paid: typePaid === "true",
      annualLimit: typeLimit ? +typeLimit : null,
      requiresApproval: typeRequiresApproval === "true",
      requiresSupportingDocuments: typeRequiresDocs === "true",
      maxConsecutiveDays: typeMaxDays ? +typeMaxDays : null,
      carryForwardAllowed: typeCarryForward === "true",
    });
  };

  return (
    <CRMLayout title={t("hr.leaves.pageTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.leaves.title")}</h1>
            <p className="text-muted-foreground">{t("hr.leaves.description")}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 max-w-sm">
            <TabsTrigger value="requests" className="gap-2"><CalendarRange className="h-4 w-4" /> {t("hr.leaves.tabs.requests")}</TabsTrigger>
            <TabsTrigger value="types" className="gap-2"><Settings className="h-4 w-4" /> {t("hr.leaves.tabs.types")}</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> {t("hr.leaves.actions.requestLeave")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("hr.leaves.dialog.requestLeave")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.leaves.forms.employee")} *</label>
                      <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                        <SelectTrigger><SelectValue placeholder={t("hr.leaves.placeholders.selectEmployee")} /></SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.leaves.forms.leaveType")} *</label>
                      <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                        <SelectTrigger><SelectValue placeholder={t("hr.leaves.placeholders.selectLeaveType")} /></SelectTrigger>
                        <SelectContent>
                          {availableLeaveBalances.map((balance) => (
                            <SelectItem key={balance.id} value={String(balance.leaveTypeId)}>
                              {balance.leaveType?.name || t("hr.leaves.unknownLeaveType")} ({balance.effectiveRemainingDays}/{balance.totalDays})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedEmpId && availableLeaveBalances.length === 0 && (
                        <p className="text-xs text-muted-foreground">{t("hr.leaves.noBalances")}</p>
                      )}
                      {currentBalance && (
                        <p className="text-xs text-muted-foreground">
                          {t("hr.leaves.remaining")}: {currentBalance.effectiveRemainingDays} / {currentBalance.totalDays} {t("hr.leaves.days")}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.startDate")} *</label>
                        <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.endDate")} *</label>
                        <Input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.leaves.forms.daysCount")} *</label>
                      <Input required type="number" step="0.5" value={days} readOnly className="bg-muted" />
                      {currentBalance && days && +days > currentBalance.effectiveRemainingDays && (
                        <p className="text-xs text-rose-500">{t("hr.leaves.exceedsBalance", { remaining: currentBalance.effectiveRemainingDays })}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.leaves.forms.reason")}</label>
                      <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("hr.leaves.placeholders.reason")} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsRequestOpen(false)}>{t("common.cancel")}</Button>
                        <Button
                          type="submit"
                          disabled={
                            createRequestMutation.isPending ||
                            !selectedTypeId ||
                            (!!currentBalance && !!days && +days > currentBalance.effectiveRemainingDays)
                          }
                        >
                          {t("hr.leaves.actions.submit")}
                        </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("hr.leaves.table.employee")}</TableHead>
                    <TableHead>{t("hr.leaves.table.type")}</TableHead>
                    <TableHead>{t("hr.leaves.table.duration")}</TableHead>
                    <TableHead>{t("hr.leaves.table.days")}</TableHead>
                    <TableHead>{t("hr.leaves.table.reason")}</TableHead>
                    <TableHead>{t("hr.leaves.table.status")}</TableHead>
                    <TableHead className="text-right">{t("hr.leaves.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRequests ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">{t("hr.leaves.loadingRequests")}</TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">{t("hr.leaves.emptyRequests")}</TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold">{req.employee?.firstName} {req.employee?.lastName}</TableCell>
                        <TableCell>{req.leaveType?.name}</TableCell>
                        <TableCell>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{req.days}</TableCell>
                        <TableCell>{req.reason || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === "Approved" ? "default" : req.status === "Pending" ? "outline" : "secondary"}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          {req.status === "Pending" && (
                            <>
                              <Button size="icon" variant="ghost" className="hover:bg-green-100" onClick={() => updateRequestMutation.mutate({ id: req.id, data: { status: "Approved" } })}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="hover:bg-red-100" onClick={() => updateRequestMutation.mutate({ id: req.id, data: { status: "Rejected" } })}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="mt-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <Dialog open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> {t("hr.leaves.actions.newLeaveType")}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t("hr.leaves.dialog.createType")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTypeSubmit} className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.code")} *</label>
                        <Input required value={typeCode} onChange={(e) => setTypeCode(e.target.value)} placeholder={t("hr.leaves.placeholders.code")} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.nameEn")} *</label>
                        <Input required value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder={t("hr.leaves.placeholders.nameEn")} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.nameFr")}</label>
                        <Input value={typeNameFr} onChange={(e) => setTypeNameFr(e.target.value)} placeholder={t("hr.leaves.placeholders.nameFr")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.nameAr")}</label>
                        <Input value={typeNameAr} onChange={(e) => setTypeNameAr(e.target.value)} placeholder={t("hr.leaves.placeholders.nameAr")} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.description")}</label>
                        <Input value={typeDesc} onChange={(e) => setTypeDesc(e.target.value)} placeholder={t("hr.leaves.placeholders.description")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.paidStatus")} *</label>
                        <Select value={typePaid} onValueChange={setTypePaid}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">{t("hr.leaves.options.paid")}</SelectItem>
                            <SelectItem value="false">{t("hr.leaves.options.unpaid")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.requiresApproval")}</label>
                        <Select value={typeRequiresApproval} onValueChange={setTypeRequiresApproval}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">{t("common.yes")}</SelectItem>
                            <SelectItem value="false">{t("common.no")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.annualLimit")}</label>
                        <Input type="number" value={typeLimit} onChange={(e) => setTypeLimit(e.target.value)} placeholder={t("hr.leaves.placeholders.optional")} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.maxConsecutiveDays")}</label>
                        <Input type="number" value={typeMaxDays} onChange={(e) => setTypeMaxDays(e.target.value)} placeholder={t("hr.leaves.placeholders.optional")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.requiresDocs")}</label>
                        <Select value={typeRequiresDocs} onValueChange={setTypeRequiresDocs}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">{t("common.yes")}</SelectItem>
                            <SelectItem value="false">{t("common.no")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaves.forms.carryForward")}</label>
                        <Select value={typeCarryForward} onValueChange={setTypeCarryForward}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">{t("common.yes")}</SelectItem>
                            <SelectItem value="false">{t("common.no")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => { setIsTypeOpen(false); resetTypeForm(); }}>{t("common.cancel")}</Button>
                      <Button type="submit" disabled={createTypeMutation.isPending}>{t("common.save")}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("hr.leaves.table.code")}</TableHead>
                    <TableHead>{t("hr.leaves.table.name")}</TableHead>
                    <TableHead>{t("hr.leaves.table.paid")}</TableHead>
                    <TableHead>{t("hr.leaves.table.annualLimit")}</TableHead>
                    <TableHead>{t("hr.leaves.table.maxDays")}</TableHead>
                    <TableHead>{t("hr.leaves.table.approval")}</TableHead>
                    <TableHead>{t("hr.leaves.table.carryFwd")}</TableHead>
                    <TableHead className="text-right">{t("hr.leaves.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTypes ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">{t("hr.leaves.loadingTypes")}</TableCell>
                    </TableRow>
                  ) : types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">{t("hr.leaves.emptyTypes")}</TableCell>
                    </TableRow>
                  ) : (
                    types.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-semibold">{t.code}</TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>
                          <Badge variant={t.paid ? "default" : "secondary"}>
                            {t.paid ? t("hr.leaves.options.paid") : t("hr.leaves.options.unpaid")}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.annualLimit ? `${t.annualLimit} d` : "—"}</TableCell>
                        <TableCell>{t.maxConsecutiveDays ? `${t.maxConsecutiveDays} d` : "—"}</TableCell>
                        <TableCell>{t.requiresApproval ? t("common.yes") : t("common.no")}</TableCell>
                        <TableCell>{t.carryForwardAllowed ? t("common.yes") : t("common.no")}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => { if (confirm(t("hr.leaves.confirmDeleteType"))) deleteTypeMutation.mutate(t.id); }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
