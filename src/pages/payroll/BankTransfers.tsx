import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSpreadsheet, Download, Eye } from "lucide-react";

export default function BankTransfers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("sepa");
  const [viewing, setViewing] = useState<any>(null);

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["bankTransfers"],
    queryFn: api.payroll.bankTransfers.getAll,
  });

  const { data: periods = [] } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: api.payroll.periods.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: ({ periodId, format }: { periodId: number; format: string }) =>
      api.payroll.bankTransfers.generate(periodId, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankTransfers"] });
      toast.success(t("payrollPages.bankTransfers.toasts.generated"));
      setIsOpen(false);
    },
  });

  const handleDownload = (file: any) => {
    const blob = new Blob([file.fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CRMLayout title={t("payrollPages.bankTransfers.layoutTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("payrollPages.bankTransfers.title")}</h1>
            <p className="text-muted-foreground">{t("payrollPages.bankTransfers.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setSelectedPeriodId(""); setSelectedFormat("sepa"); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><FileSpreadsheet className="h-4 w-4" /> {t("payrollPages.bankTransfers.actions.generateFile")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t("payrollPages.bankTransfers.dialogs.generateTitle")}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("payrollPages.bankTransfers.fields.payrollPeriod")}</label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger><SelectValue placeholder={t("payrollPages.bankTransfers.placeholders.selectPeriod")} /></SelectTrigger>
                    <SelectContent>
                      {periods.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.periodName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("payrollPages.bankTransfers.fields.format")}</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sepa">{t("payrollPages.bankTransfers.formats.sepa")}</SelectItem>
                      <SelectItem value="csv">{t("payrollPages.bankTransfers.formats.csv")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => generateMutation.mutate({ periodId: +selectedPeriodId, format: selectedFormat })}
                  disabled={!selectedPeriodId || generateMutation.isPending}
                >
                  {t("common.actions.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {viewing && (
          <Card className="glass-morphism">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{viewing.fileName}</h3>
                <Button size="sm" variant="outline" onClick={() => setViewing(null)}>{t("common.close")}</Button>
              </div>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap break-all">
                {viewing.fileContent}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("payrollPages.bankTransfers.table.fileName")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.period")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.format")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.employees")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.totalAmount")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.status")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.created")}</TableHead>
                <TableHead>{t("payrollPages.bankTransfers.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">{t("common.loading")}</TableCell></TableRow>
              ) : transfers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">{t("payrollPages.bankTransfers.states.empty")}</TableCell></TableRow>
              ) : (
                transfers.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.fileName}</TableCell>
                    <TableCell>{f.payrollPeriod?.periodName}</TableCell>
                    <TableCell><Badge variant="outline">{f.format?.toUpperCase()}</Badge></TableCell>
                    <TableCell>{f.totalEmployees}</TableCell>
                    <TableCell>{Number(f.totalAmount).toFixed(3)} TND</TableCell>
                    <TableCell><Badge>{t(`payrollPages.bankTransfers.statuses.${String(f.status).toLowerCase()}`, { defaultValue: f.status })}</Badge></TableCell>
                    <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setViewing(f)}><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(f)}><Download className="h-4 w-4" /></Button>
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
