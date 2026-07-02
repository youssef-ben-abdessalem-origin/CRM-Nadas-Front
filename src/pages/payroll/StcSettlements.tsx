import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSpreadsheet, Download, Eye, FileText, Landmark, Users, Wallet } from "lucide-react";

type SettlementPreview = {
  header: {
    fileType: string;
    transferType: string;
    generatedDate: string;
    periodName: string;
  };
  totals: {
    employees: number;
    amount: number;
    generatedAt: string;
  };
  employees: Array<{
    employeeNumber: string;
    fullName: string;
    rib: string;
    amount: number;
  }>;
  rawContent: string;
};

function parseStcSettlement(content: string, fallback?: any): SettlementPreview {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headerParts = (lines.find((line) => line.startsWith("STC\t")) || "").split("\t");
  const totalParts = (lines.find((line) => line.startsWith("H\t")) || "").split("\t");
  const timestampParts = (lines.find((line) => line.startsWith("T\t")) || "").split("\t");
  const employeeLines = lines.filter((line) => line.startsWith("D\t"));

  return {
    header: {
      fileType: headerParts[0] || "STC",
      transferType: headerParts[1] || "SALARY_TRANSFER",
      generatedDate: headerParts[2] || "",
      periodName: headerParts[3] || fallback?.periodName || "-",
    },
    totals: {
      employees: Number(totalParts[1] || fallback?.totalEmployees || 0),
      amount: Number(totalParts[2] || fallback?.totalAmount || 0),
      generatedAt: timestampParts[1] || fallback?.generatedAt || "",
    },
    employees: employeeLines.map((line) => {
      const [, employeeNumber, fullName, rib, amount] = line.split("\t");
      return {
        employeeNumber: employeeNumber || "-",
        fullName: fullName || "-",
        rib: rib || "-",
        amount: Number(amount || 0),
      };
    }),
    rawContent: content,
  };
}

function formatAmount(value: number | string | undefined) {
  return `${Number(value || 0).toFixed(3)} TND`;
}

function formatDateTime(value?: string | Date) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function createSettlementHtml(preview: SettlementPreview) {
  const employeeRows = preview.employees
    .map(
      (employee, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${employee.employeeNumber}</td>
          <td>${employee.fullName}</td>
          <td>${employee.rib}</td>
          <td style="text-align:right;">${formatAmount(employee.amount)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>STC Settlement - ${preview.header.periodName}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 32px; color: #14213d; background: #f4f7fb; }
          .page { max-width: 1100px; margin: 0 auto; background: #fff; border: 1px solid #d7e0ea; border-radius: 24px; overflow: hidden; }
          .header { display:flex; justify-content:space-between; gap:24px; padding:32px; border-bottom:1px solid #d7e0ea; }
          .brand { font-size: 20px; font-weight: 800; letter-spacing: 0.02em; }
          .subtitle { margin-top: 8px; color: #54657e; font-size: 14px; }
          .title { text-align:right; }
          .title small { display:block; color:#64748b; text-transform:uppercase; letter-spacing:0.3em; font-size:11px; margin-bottom:8px; }
          .title h1 { margin:0; font-size:32px; }
          .meta { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; padding:24px 32px; border-bottom:1px solid #d7e0ea; background:#f8fbff; }
          .metric { border:1px solid #d7e0ea; border-radius:16px; padding:16px; }
          .metric span { display:block; color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px; }
          .metric strong { font-size:22px; }
          .section { padding:24px 32px; }
          .section h2 { margin:0 0 12px; font-size:20px; }
          table { width:100%; border-collapse: collapse; }
          th, td { border:1px solid #d7e0ea; padding:12px 14px; font-size:14px; vertical-align:top; }
          th { background:#eef4fb; text-align:left; }
          .footer { padding:20px 32px 32px; color:#64748b; font-size:13px; }
          @media print {
            body { background:#fff; padding:0; }
            .page { border:none; border-radius:0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div>
              <div class="brand">NADAS ERP SUITE</div>
              <div class="subtitle">Ordre de virement STC - règlement de paie</div>
            </div>
            <div class="title">
              <small>STC Settlement</small>
              <h1>${preview.header.periodName}</h1>
              <div class="subtitle">Généré le ${formatDateTime(preview.totals.generatedAt)}</div>
            </div>
          </div>
          <div class="meta">
            <div class="metric"><span>Format</span><strong>${preview.header.fileType}</strong></div>
            <div class="metric"><span>Type</span><strong>${preview.header.transferType}</strong></div>
            <div class="metric"><span>Employés</span><strong>${preview.totals.employees}</strong></div>
            <div class="metric"><span>Montant total</span><strong>${formatAmount(preview.totals.amount)}</strong></div>
          </div>
          <div class="section">
            <h2>Détail des virements</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Matricule</th>
                  <th>Employé</th>
                  <th>RIB / Compte</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                ${employeeRows}
              </tbody>
            </table>
          </div>
          <div class="footer">
            Document généré depuis le module paie NADAS ERP Suite pour transmission et archivage interne.
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `;
}

export default function StcSettlements() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [viewing, setViewing] = useState<any>(null);

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ["stcSettlements"],
    queryFn: api.payroll.stcSettlements.getAll,
  });

  const { data: periods = [] } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: api.payroll.periods.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: (periodId: number) => api.payroll.stcSettlements.generate(periodId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stcSettlements"] });
      toast.success(t("payrollPages.stc.toasts.generated"));
      setIsOpen(false);
      setViewing(data);
    },
  });

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewSource = viewing?.content || viewing?.fileContent || "";

  const preview = useMemo(
    () => (previewSource ? parseStcSettlement(previewSource, viewing) : null),
    [previewSource, viewing],
  );

  const settlementRows = useMemo(() => {
    if (settlements.length > 0) return settlements;
    if (viewing) return [viewing];
    return [];
  }, [settlements, viewing]);

  const handlePdfExport = (currentPreview: SettlementPreview) => {
    const popup = window.open("", "_blank", "width=1200,height=900");
    if (!popup) {
      toast.error(t("payrollPages.stc.toasts.popupBlocked"));
      return;
    }

    popup.document.open();
    popup.document.write(createSettlementHtml(currentPreview));
    popup.document.close();
  };

  return (
    <CRMLayout title={t("payrollPages.stc.layoutTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("payrollPages.stc.title")}</h1>
            <p className="text-muted-foreground">{t("payrollPages.stc.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedPeriodId(""); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><FileSpreadsheet className="h-4 w-4" /> {t("payrollPages.stc.actions.generateFile")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate STC Settlement</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Payroll Period *</label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger><SelectValue placeholder="Select Period" /></SelectTrigger>
                    <SelectContent>
                      {periods.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.periodName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => generateMutation.mutate(+selectedPeriodId)} disabled={!selectedPeriodId || generateMutation.isPending}>
                  Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {preview && (
          <Card className="glass-morphism">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">Settlement STC - {preview.header.periodName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {preview.totals.employees} employees, {formatAmount(preview.totals.amount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePdfExport(preview)}>
                    <FileText className="h-4 w-4 mr-1" /> PDF / Print
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(preview.rawContent, `STC-${preview.header.periodName.replace(/\s+/g, "-")}.txt`)}>
                    <Download className="h-4 w-4 mr-1" /> TXT
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setViewing(null)}>Close</Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Format</span>
                  </div>
                  <div className="mt-2 text-xl font-bold">{preview.header.fileType}</div>
                  <div className="text-xs text-muted-foreground">{preview.header.transferType}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users className="h-4 w-4" />
                    <span>Employees</span>
                  </div>
                  <div className="mt-2 text-xl font-bold">{preview.totals.employees}</div>
                  <div className="text-xs text-muted-foreground">Included in the transfer file</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Wallet className="h-4 w-4" />
                    <span>Total Amount</span>
                  </div>
                  <div className="mt-2 text-xl font-bold">{formatAmount(preview.totals.amount)}</div>
                  <div className="text-xs text-muted-foreground">Amount to transfer</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Landmark className="h-4 w-4" />
                    <span>Generated</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{formatDateTime(preview.totals.generatedAt)}</div>
                  <div className="text-xs text-muted-foreground">Settlement timestamp</div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 overflow-hidden">
                <div className="border-b border-border/60 px-4 py-3 bg-muted/30">
                  <h4 className="font-semibold">Settlement Details</h4>
                  <p className="text-sm text-muted-foreground">
                    User-friendly transfer breakdown for review before download or PDF export.
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>RIB / Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.employees.map((employee, index) => (
                      <TableRow key={`${employee.employeeNumber}-${index}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{employee.employeeNumber}</TableCell>
                        <TableCell className="font-medium">{employee.fullName}</TableCell>
                        <TableCell className="font-mono text-xs">{employee.rib}</TableCell>
                        <TableCell className="text-right font-semibold">{formatAmount(employee.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4">
                <div className="mb-2 text-sm font-semibold">Raw STC File</div>
                <pre className="text-xs overflow-auto max-h-56 whitespace-pre-wrap break-all text-muted-foreground">
                  {preview.rawContent}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : settlementRows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No STC settlements generated yet</TableCell></TableRow>
              ) : (
                settlementRows.map((s: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{s.periodName}</TableCell>
                    <TableCell><Badge variant="outline">STC</Badge></TableCell>
                    <TableCell>{s.totalEmployees}</TableCell>
                    <TableCell>{Number(s.totalAmount).toFixed(3)} TND</TableCell>
                    <TableCell>{new Date(s.generatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setViewing(s)}>
                        <Eye className="h-4 w-4 mr-1" /> View
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
