import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarDays, Eye, Gift, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ThirteenthMonth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  const { data: periods = [] } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: api.payroll.periods.getAll,
  });

  const { data: payrollSettings } = useQuery({
    queryKey: ["payrollSettings"],
    queryFn: api.payroll.settings.get,
  });

  useEffect(() => {
    if (!selectedPeriodId && periods.length > 0) {
      setSelectedPeriodId(String(periods[0].id));
    }
  }, [periods, selectedPeriodId]);

  const selectedPeriod = useMemo(
    () => periods.find((period: any) => String(period.id) === selectedPeriodId) || null,
    [periods, selectedPeriodId],
  );

  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ["thirteenthMonthPayslips", selectedPeriod?.id],
    queryFn: () => api.payroll.payslips.getAll(selectedPeriod?.id),
    enabled: !!selectedPeriod?.id,
  });

  const thirteenthMonthPayslips = useMemo(
    () =>
      payslips.filter((payslip: any) =>
        payslip.details?.some((detail: any) => detail.component?.code === "THIRTEENTH_MONTH"),
      ),
    [payslips],
  );

  const totals = useMemo(
    () => ({
      employees: thirteenthMonthPayslips.length,
      gross: thirteenthMonthPayslips.reduce((sum: number, payslip: any) => sum + Number(payslip.grossSalary || 0), 0),
      net: thirteenthMonthPayslips.reduce((sum: number, payslip: any) => sum + Number(payslip.netSalary || 0), 0),
    }),
    [thirteenthMonthPayslips],
  );

  const generateMutation = useMutation({
    mutationFn: (periodId: number) => api.payroll.thirteenthMonth.generate(periodId),
    onSuccess: () => {
      toast.success(t("payrollPages.thirteenthMonth.toasts.generated"));
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["thirteenthMonthPayslips"] });
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
    },
    onError: (err: any) => toast.error(err?.message || t("payrollPages.thirteenthMonth.toasts.failed")),
  });

  return (
    <CRMLayout title={t("payrollPages.thirteenthMonth.layoutTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("payrollPages.thirteenthMonth.title")}</h1>
            <p className="text-muted-foreground">{t("payrollPages.thirteenthMonth.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedPeriodId(""); }}>
            <DialogTrigger asChild>
              <Button><Gift className="mr-2 h-4 w-4" /> {t("payrollPages.thirteenthMonth.actions.generate")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("payrollPages.thirteenthMonth.dialogs.generateTitle")}</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("payrollPages.thirteenthMonth.fields.payrollPeriod")}</label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger><SelectValue placeholder={t("payrollPages.thirteenthMonth.placeholders.selectPeriod")} /></SelectTrigger>
                    <SelectContent>
                      {periods.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.periodName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button disabled={!selectedPeriodId || generateMutation.isPending} onClick={() => generateMutation.mutate(+selectedPeriodId)}>
                  <Plus className="mr-2 h-4 w-4" /> {t("common.actions.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-morphism md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("payrollPages.thirteenthMonth.fields.payrollPeriod")}</span>
              </div>
              <div className="mt-3">
                <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("payrollPages.thirteenthMonth.placeholders.selectPeriod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period: any) => (
                      <SelectItem key={period.id} value={String(period.id)}>
                        {period.periodName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {payrollSettings?.thirteenthMonthEnabled
                  ? t("payrollPages.thirteenthMonth.states.enabledAt", { rate: Number(payrollSettings?.thirteenthMonthRate || 100).toFixed(0) })
                  : t("payrollPages.thirteenthMonth.states.disabled")}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totals.employees}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("payrollPages.thirteenthMonth.cards.generatedPayslips")}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totals.gross.toFixed(3)}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("payrollPages.thirteenthMonth.cards.grossTotal")}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totals.net.toFixed(3)}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("payrollPages.thirteenthMonth.cards.netTotal")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Gross (TND)</TableHead>
                <TableHead>Deductions (TND)</TableHead>
                <TableHead>Net Salary (TND)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading 13th month payslips...
                  </TableCell>
                </TableRow>
              ) : !selectedPeriod ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Select a payroll period to view generated 13th month payslips.
                  </TableCell>
                </TableRow>
              ) : thirteenthMonthPayslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No 13th month payslips found for this period. Use Generate 13th Month to create them.
                  </TableCell>
                </TableRow>
              ) : (
                thirteenthMonthPayslips.map((payslip: any) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-semibold">
                      {payslip.employee?.firstName} {payslip.employee?.lastName}
                    </TableCell>
                    <TableCell>{payslip.payrollPeriod?.periodName || "-"}</TableCell>
                    <TableCell>{Number(payslip.grossSalary || 0).toFixed(3)}</TableCell>
                    <TableCell className="text-red-500">
                      -{Number(payslip.totalDeductions || 0).toFixed(3)}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {Number(payslip.netSalary || 0).toFixed(3)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payslip.status === "Paid"
                            ? "default"
                            : payslip.status === "Approved"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {payslip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/payroll/payslips/${payslip.id}`)}
                      >
                        <Eye className="h-4 w-4" />
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
