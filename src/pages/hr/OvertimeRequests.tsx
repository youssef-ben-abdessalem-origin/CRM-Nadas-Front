import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, OvertimeRequest, HrSettings } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function OvertimeRequests() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<OvertimeRequest | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState("weekday");
  const [approvalAuthority, setApprovalAuthority] = useState("manager");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const startMin = sh * 60 + sm;
      let endMin = eh * 60 + em;
      if (endMin <= startMin) endMin += 24 * 60;
      const hours = Math.round(((endMin - startMin) / 60) * 10) / 10;
      setTotalHours(hours);
    }
  }, [startTime, endTime]);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["overtimeRequests"],
    queryFn: () => api.hr.overtimeRequests.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: hrSettings } = useQuery({
    queryKey: ["hrSettings"],
    queryFn: () => api.hr.hrSettings.get(),
  });

  const getMultiplier = (cat: string): number => {
    if (!hrSettings) return cat === "weekday" ? 1.25 : cat === "night" ? 1.5 : 2.0;
    return cat === "weekday"
      ? hrSettings.overtimeWeekdayRate
      : cat === "night"
      ? hrSettings.overtimeNightRate
      : hrSettings.overtimeRestDayRate;
  };

  const currentMultiplier = getMultiplier(category);
  const nightStart = hrSettings?.nightStartHour ?? 21;
  const nightEnd = hrSettings?.nightEndHour ?? 5;

  const currentUserEmail = JSON.parse(localStorage.getItem("user") || "{}").email;
  const { data: currentEmployee } = useQuery({
    queryKey: ["currentEmployee", currentUserEmail],
    queryFn: () => api.hr.employeeByEmail(currentUserEmail),
    enabled: !!currentUserEmail,
  });

  const canApprove = (ot: OvertimeRequest): boolean => {
    if (ot.status !== "Pending") return false;
    if (ot.approvalAuthority === "manager") return currentEmployee?.id === ot.assignedManagerId;
    if (ot.approvalAuthority === "ceo") {
      const title = (currentEmployee?.position as any)?.title?.toLowerCase() || "";
      return title.includes("ceo") || title.includes("chief executive");
    }
    if (ot.approvalAuthority === "hr") {
      const title = (currentEmployee?.position as any)?.title?.toLowerCase() || "";
      return title.includes("hr") || title.includes("human resource");
    }
    return false;
  };

  const getTimeHint = (): string => {
    switch (category) {
      case "night": return t("hr.overtimeRequests.hints.nightTime", { nightStart: String(nightStart).padStart(2, "0"), nightEnd: String(nightEnd).padStart(2, "0") });
      case "restDay": return t("hr.overtimeRequests.hints.restDay");
      default: return t("hr.overtimeRequests.hints.weekday");
    }
  };

  const timeInRange = (time: string, start: number, end: number): boolean => {
    const h = parseInt(time.split(":")[0], 10);
    if (start <= end) return h >= start && h <= end;
    return h >= start || h <= end;
  };

  const nightTimeValid = category !== "night" || (
    startTime && endTime &&
    timeInRange(startTime, nightStart, 23) &&
    timeInRange(endTime, 0, nightEnd)
  );

  const weekendDateValid = category !== "restDay" || date;

  const createMutation = useMutation({
    mutationFn: (data: any) => api.hr.overtimeRequests.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtimeRequests"] });
      toast.success(t("hr.statusUpdates.overtimeCreated"));
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.overtimeRequests.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtimeRequests"] });
      toast.success(t("hr.statusUpdates.overtimeUpdated"));
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.overtimeRequests.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtimeRequests"] });
      toast.success(t("hr.statusUpdates.overtimeDeleted"));
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.hr.overtimeRequests.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtimeRequests"] });
      toast.success(t("hr.statusUpdates.overtimeApproved"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => api.hr.overtimeRequests.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtimeRequests"] });
      toast.success(t("hr.statusUpdates.overtimeRejected"));
    },
  });

  const resetForm = () => {
    setEditing(null);
    setEmployeeId("");
    setCategory("weekday");
    setApprovalAuthority("manager");
    setDate("");
    setStartTime("");
    setEndTime("");
    setTotalHours(0);
    setDescription("");
    setStatus("Pending");
  };

  const handleEdit = (ot: OvertimeRequest) => {
    setEditing(ot);
    setEmployeeId(String(ot.employeeId));
    setCategory(ot.category || "weekday");
    setApprovalAuthority(ot.approvalAuthority || "manager");
    setDate(ot.date.split("T")[0]);
    setStartTime(ot.startTime);
    setEndTime(ot.endTime);
    setTotalHours(ot.totalHours);
    setDescription(ot.description || "");
    setStatus(ot.status);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      employeeId: +employeeId,
      category,
      approvalAuthority,
      date, startTime, endTime, totalHours,
      multiplier: currentMultiplier,
      description: description || null,
      status,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const categoryLabels: Record<string, string> = {
    weekday: t("hr.overtimeRequests.categoryLabels.weekday"),
    night: t("hr.overtimeRequests.categoryLabels.night"),
    restDay: t("hr.overtimeRequests.categoryLabels.restDay"),
  };

  return (
    <CRMLayout title={t("hr.overtimeRequests.pageTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.overtimeRequests.title")}</h1>
            <p className="text-muted-foreground">{t("hr.overtimeRequests.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Timer className="h-4 w-4" /> {t("hr.overtimeRequests.actions.create")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? t("hr.overtimeRequests.dialog.edit") : t("hr.overtimeRequests.dialog.create")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.employee")} *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder={t("hr.overtimeRequests.placeholders.selectEmployee")} /></SelectTrigger>
                    <SelectContent>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.category")} *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday">{t("hr.overtimeRequests.categoryLabels.weekday")} (×{hrSettings?.overtimeWeekdayRate ?? "1.25"})</SelectItem>
                      <SelectItem value="night">{t("hr.overtimeRequests.categoryLabels.night")} (×{hrSettings?.overtimeNightRate ?? "1.50"})</SelectItem>
                      <SelectItem value="restDay">{t("hr.overtimeRequests.categoryLabels.restDay")} (×{hrSettings?.overtimeRestDayRate ?? "2.00"})</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getTimeHint()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.approvalAuthority")}</label>
                  <Select value={approvalAuthority} onValueChange={setApprovalAuthority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t("hr.overtimeRequests.options.manager")}</SelectItem>
                      <SelectItem value="ceo">{t("hr.overtimeRequests.options.ceo")}</SelectItem>
                      <SelectItem value="hr">{t("hr.overtimeRequests.options.hr")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {approvalAuthority === "manager" ? t("hr.overtimeRequests.approvalDescriptions.manager") :
                     approvalAuthority === "ceo" ? t("hr.overtimeRequests.approvalDescriptions.ceo") :
                     t("hr.overtimeRequests.approvalDescriptions.hr")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.date")} *</label>
                  <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className={category === "restDay" ? "border-amber-400" : ""} />
                  {category === "restDay" && <p className="text-xs text-amber-500">{t("hr.overtimeRequests.restDaySelected")}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.startTime")} *</label>
                    <Input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className={category === "night" && startTime && !timeInRange(startTime, nightStart, 23) ? "border-red-400" : ""} />
                    {category === "night" && startTime && !timeInRange(startTime, nightStart, 23) && (
                      <p className="text-xs text-red-500">{t("hr.overtimeRequests.validation.startMustBe", { nightStart: String(nightStart).padStart(2, "0") })}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.endTime")} *</label>
                    <Input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className={category === "night" && endTime && !timeInRange(endTime, 0, nightEnd) ? "border-red-400" : ""} />
                    {category === "night" && endTime && !timeInRange(endTime, 0, nightEnd) && (
                      <p className="text-xs text-red-500">{t("hr.overtimeRequests.validation.endMustBe", { nightEnd: String(nightEnd).padStart(2, "0") })}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.totalHours")} *</label>
                    <Input required type="number" readOnly value={totalHours} className="bg-muted" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.multiplier")}</label>
                    <Input type="number" readOnly value={currentMultiplier} className="bg-muted" />
                    <p className="text-xs text-muted-foreground">{t("hr.overtimeRequests.autoFromSettings")}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.description")}</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("hr.overtimeRequests.placeholders.description")} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.overtimeRequests.forms.status")}</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">{t("common.status.pending")}</SelectItem>
                      <SelectItem value="Approved">{t("hr.overtimeRequests.options.approved")}</SelectItem>
                      <SelectItem value="Rejected">{t("hr.overtimeRequests.options.rejected")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{t("common.save")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("hr.overtimeRequests.table.employee")}</TableHead>
                <TableHead>{t("hr.overtimeRequests.table.date")}</TableHead>
                <TableHead>{t("hr.overtimeRequests.table.category")}</TableHead>
                <TableHead>{t("hr.overtimeRequests.table.hours")}</TableHead>
                <TableHead>{t("hr.overtimeRequests.table.rate")}</TableHead>
                <TableHead>{t("hr.overtimeRequests.table.approval")}</TableHead>
                <TableHead>{t("hr.overtimeRequests.table.status")}</TableHead>
                <TableHead className="text-right">{t("hr.overtimeRequests.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">{t("hr.overtimeRequests.loading")}</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">{t("hr.overtimeRequests.empty")}</TableCell>
                </TableRow>
              ) : (
                requests.map((ot) => (
                  <TableRow key={ot.id}>
                    <TableCell className="font-semibold">
                      {ot.employee ? `${ot.employee.firstName} ${ot.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell>{new Date(ot.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabels[ot.category] || ot.category}</Badge>
                    </TableCell>
                    <TableCell>{ot.totalHours}h</TableCell>
                    <TableCell>{ot.multiplier}x</TableCell>
                    <TableCell>
                      {ot.approvedBy
                        ? <Badge variant="secondary">{ot.approvedBy.firstName} {ot.approvedBy.lastName}</Badge>
                        : <Badge variant="outline">{ot.approvalAuthority === "manager" ? t("hr.overtimeRequests.options.mgr") : ot.approvalAuthority === "ceo" ? t("hr.overtimeRequests.options.ceo") : t("hr.overtimeRequests.options.hr")}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[ot.status] || "outline"}>{ot.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canApprove(ot) && (
                        <>
                          <Button size="sm" variant="default" className="mr-1" onClick={() => approveMutation.mutate(ot.id)}>
                            {t("hr.overtimeRequests.actions.approve")}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(ot.id)}>
                            {t("hr.overtimeRequests.actions.reject")}
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(ot)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(ot.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
