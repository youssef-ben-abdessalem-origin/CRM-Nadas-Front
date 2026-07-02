import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, PayrollPeriod, Payslip } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Play, Eye, CheckCircle2, DollarSign, Calendar } from "lucide-react";

export default function PayrollPeriods() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Queries
  const { data: periods = [], isLoading: loadingPeriods } = useQuery({
    queryKey: ["periods"],
    queryFn: api.payroll.periods.getAll,
  });

  const { data: payslips = [], isLoading: loadingPayslips } = useQuery({
    queryKey: ["payslips", selectedPeriod?.id],
    queryFn: () => api.payroll.payslips.getAll(selectedPeriod?.id),
    enabled: !!selectedPeriod,
  });

  // Mutations
  const createPeriodMutation = useMutation({
    mutationFn: api.payroll.periods.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success(t("payrollPages.periods.toasts.periodCreated"));
      setIsOpen(false);
      setPeriodName("");
      setStartDate("");
      setEndDate("");
    },
  });

  const generateMutation = useMutation({
    mutationFn: api.payroll.payslips.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips", selectedPeriod?.id] });
      toast.success(t("payrollPages.periods.toasts.payslipsGenerated"));
    },
  });

  const approveMutation = useMutation({
    mutationFn: api.payroll.payslips.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips", selectedPeriod?.id] });
      toast.success(t("payrollPages.periods.toasts.payslipApproved"));
    },
  });

  const payMutation = useMutation({
    mutationFn: api.payroll.payslips.pay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips", selectedPeriod?.id] });
      toast.success(t("payrollPages.periods.toasts.payslipPaid"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPeriodMutation.mutate({
      periodName,
      startDate,
      endDate,
      status: "Draft",
    });
  };

  return (
    <CRMLayout title={t("payrollPages.periods.layoutTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("payrollPages.periods.title")}</h1>
            <p className="text-muted-foreground">{t("payrollPages.periods.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> {t("payrollPages.periods.actions.newPeriod")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("payrollPages.periods.dialogs.openTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("payrollPages.periods.fields.periodName")}</label>
                  <Input required value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder={t("payrollPages.periods.placeholders.periodName")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("payrollPages.periods.fields.startDate")}</label>
                    <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("payrollPages.periods.fields.endDate")}</label>
                    <Input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={createPeriodMutation.isPending}>{t("payrollPages.periods.actions.openPeriod")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Period Selection */}
          <div className="col-span-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold">{t("payrollPages.periods.sections.periods")}</h2>
            {loadingPeriods ? (
              <div>{t("payrollPages.periods.states.loadingRuns")}</div>
            ) : periods.length === 0 ? (
              <div className="text-muted-foreground text-sm">{t("payrollPages.periods.states.noPeriods")}</div>
            ) : (
              periods.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => setSelectedPeriod(p)}
                  className={`cursor-pointer transition-colors hover:bg-muted ${selectedPeriod?.id === p.id ? "border-primary bg-primary/5" : "glass-morphism"}`}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{p.periodName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={p.status === "Closed" ? "secondary" : "default"}>
                      {t(`payrollPages.periods.statuses.${String(p.status).toLowerCase()}`, { defaultValue: p.status })}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Payslip Batches */}
          <div className="col-span-2 flex flex-col gap-4">
            {selectedPeriod ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">{t("payrollPages.periods.sections.payslipsFor", { period: selectedPeriod.periodName })}</h2>
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => generateMutation.mutate(selectedPeriod.id)}>
                    <Play className="h-4 w-4" /> {t("payrollPages.periods.actions.generateRecalculate")}
                  </Button>
                </div>

                <Card className="glass-morphism">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("payrollPages.periods.table.employee")}</TableHead>
                        <TableHead>{t("payrollPages.periods.table.gross")}</TableHead>
                        <TableHead>{t("payrollPages.periods.table.deductions")}</TableHead>
                        <TableHead>{t("payrollPages.periods.table.netSalary")}</TableHead>
                        <TableHead>{t("payrollPages.periods.table.status")}</TableHead>
                        <TableHead className="text-right">{t("payrollPages.periods.table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingPayslips ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">{t("payrollPages.periods.states.loadingPayslips")}</TableCell>
                        </TableRow>
                      ) : payslips.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">{t("payrollPages.periods.states.noPayslips")}</TableCell>
                        </TableRow>
                      ) : (
                        payslips.map((ps) => (
                          <TableRow key={ps.id}>
                            <TableCell className="font-semibold">{ps.employee?.firstName} {ps.employee?.lastName}</TableCell>
                            <TableCell>{Number(ps.grossSalary).toFixed(3)}</TableCell>
                            <TableCell className="text-red-500">-{Number(ps.totalDeductions).toFixed(3)}</TableCell>
                            <TableCell className="font-bold text-green-600">{Number(ps.netSalary).toFixed(3)}</TableCell>
                            <TableCell>
                              <Badge variant={ps.status === "Paid" ? "default" : ps.status === "Approved" ? "outline" : "secondary"}>
                                {t(`payrollPages.periods.statuses.${String(ps.status).toLowerCase()}`, { defaultValue: ps.status })}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => navigate(`/payroll/payslips/${ps.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {ps.status === "Draft" && (
                                <Button size="icon" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => approveMutation.mutate(ps.id)}>
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              {ps.status === "Approved" && (
                                <Button size="icon" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => payMutation.mutate(ps.id)}>
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg glass-morphism text-muted-foreground">
                <Calendar className="h-10 w-10 mb-2 opacity-50" />
                <p>{t("payrollPages.periods.states.selectPeriod")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
