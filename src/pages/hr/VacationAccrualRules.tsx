import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function VacationAccrualRules() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [accrualRate, setAccrualRate] = useState("2.5");
  const [maxAccrual, setMaxAccrual] = useState("30");

  const [isRunOpen, setIsRunOpen] = useState(false);
  const [runEmployeeId, setRunEmployeeId] = useState("");
  const [runYear, setRunYear] = useState(String(new Date().getFullYear()));
  const [runMonth, setRunMonth] = useState(String(new Date().getMonth() + 1));
  const [runResults, setRunResults] = useState<Record<string, string[]> | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["accrualRules"],
    queryFn: () => api.hr.accrualRules.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: api.hr.employees.getAll,
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: api.hr.leaveTypes.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editingId ? api.hr.accrualRules.update(editingId, data) : api.hr.accrualRules.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accrualRules"] });
      toast.success(editingId ? t("hr.statusUpdates.accrualRuleUpdated") : t("hr.statusUpdates.accrualRuleCreated"));
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.accrualRules.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accrualRules"] });
      toast.success(t("hr.statusUpdates.accrualRuleDeleted"));
    },
  });

  const runMutation = useMutation({
    mutationFn: (data: any) => api.hr.accrualRules.run(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      setRunResults(data);
      toast.success(t("hr.statusUpdates.accrualRunCompleted"));
    },
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditingId(null);
    setEmployeeId("");
    setLeaveTypeId("");
    setAccrualRate("2.5");
    setMaxAccrual("30");
  };

  const openEdit = (rule: any) => {
    setEditingId(rule.id);
    setEmployeeId(String(rule.employeeId));
    setLeaveTypeId(String(rule.leaveTypeId));
    setAccrualRate(String(rule.accrualRate));
    setMaxAccrual(String(rule.maxAccrual));
    setIsOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      employeeId: +employeeId,
      leaveTypeId: +leaveTypeId,
      accrualRate: +accrualRate,
      maxAccrual: +maxAccrual,
    });
  };

  return (
    <CRMLayout title={t("hr.vacationAccrualRules.pageTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.vacationAccrualRules.title")}</h1>
            <p className="text-muted-foreground">{t("hr.vacationAccrualRules.description")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsRunOpen(true)}>
              <Play className="h-4 w-4" /> {t("hr.vacationAccrualRules.actions.runAccrual")}
            </Button>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => { setEditingId(null); resetForm(); }}><Plus className="h-4 w-4" /> {t("hr.vacationAccrualRules.actions.create")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? t("hr.vacationAccrualRules.dialog.edit") : t("hr.vacationAccrualRules.dialog.create")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.employee")} *</label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                      <SelectTrigger><SelectValue placeholder={t("hr.vacationAccrualRules.placeholders.selectEmployee")} /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e: any) => (
                          <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.leaveType")} *</label>
                    <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                      <SelectTrigger><SelectValue placeholder={t("hr.vacationAccrualRules.placeholders.selectLeaveType")} /></SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((lt: any) => (
                          <SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.accrualRate")}</label>
                    <Input type="number" step="0.5" value={accrualRate} onChange={(e) => setAccrualRate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.maxAccrual")}</label>
                    <Input type="number" value={maxAccrual} onChange={(e) => setMaxAccrual(e.target.value)} />
                  </div>
                  <Button onClick={handleSave} disabled={!employeeId || !leaveTypeId || saveMutation.isPending}>
                    {editingId ? t("common.update") : t("common.create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Dialog open={isRunOpen} onOpenChange={(open) => { setIsRunOpen(open); if (!open) setRunResults(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("hr.vacationAccrualRules.dialog.runAccrual")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.employeeOptional")}</label>
                <Select value={runEmployeeId} onValueChange={setRunEmployeeId}>
                  <SelectTrigger><SelectValue placeholder={t("hr.vacationAccrualRules.placeholders.allEmployees")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("hr.vacationAccrualRules.allEmployees")}</SelectItem>
                    {employees.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.year")}</label>
                  <Input type="number" value={runYear} onChange={(e) => setRunYear(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.vacationAccrualRules.forms.month")}</label>
                  <Input type="number" min={1} max={12} value={runMonth} onChange={(e) => setRunMonth(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => runMutation.mutate({
                  employeeId: runEmployeeId ? +runEmployeeId : undefined,
                  year: +runYear,
                  month: +runMonth,
                })}
                disabled={runMutation.isPending}
              >
                {t("hr.vacationAccrualRules.actions.runAccrual")}
              </Button>
              {runResults && (
                <div className="mt-2">
                  <h4 className="font-semibold mb-2">{t("hr.vacationAccrualRules.results")}:</h4>
                  <div className="max-h-48 overflow-y-auto">
                    {Object.entries(runResults).map(([name, msgs]) => (
                      <div key={name} className="mb-1">
                        <span className="font-medium text-sm">{name}:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {(msgs as string[]).map((msg, i) => <li key={i}>{msg}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("hr.vacationAccrualRules.table.employee")}</TableHead>
                <TableHead>{t("hr.vacationAccrualRules.table.leaveType")}</TableHead>
                <TableHead>{t("hr.vacationAccrualRules.table.rate")}</TableHead>
                <TableHead>{t("hr.vacationAccrualRules.table.maxAccrual")}</TableHead>
                <TableHead>{t("hr.vacationAccrualRules.table.active")}</TableHead>
                <TableHead>{t("hr.vacationAccrualRules.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">{t("common.loading")}</TableCell></TableRow>
              ) : rules.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">{t("hr.vacationAccrualRules.empty")}</TableCell></TableRow>
              ) : (
                rules.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.employee?.firstName} {r.employee?.lastName}</TableCell>
                    <TableCell>{r.leaveType?.name}</TableCell>
                    <TableCell>{r.accrualRate}</TableCell>
                    <TableCell>{r.maxAccrual}</TableCell>
                    <TableCell><Badge variant={r.active ? "default" : "secondary"}>{r.active ? t("common.status.active") : t("common.status.inactive")}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
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
