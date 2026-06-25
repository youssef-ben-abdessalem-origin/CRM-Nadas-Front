import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      toast.success("Bank transfer file generated");
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
    <CRMLayout title="Payroll - Bank Transfers">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Transfers</h1>
            <p className="text-muted-foreground">Generate SEPA XML or CSV bank transfer files for payroll payments.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setSelectedPeriodId(""); setSelectedFormat("sepa"); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><FileSpreadsheet className="h-4 w-4" /> Generate Transfer File</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Bank Transfer File</DialogTitle>
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Format</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sepa">SEPA XML (PAIN.001)</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => generateMutation.mutate({ periodId: +selectedPeriodId, format: selectedFormat })}
                  disabled={!selectedPeriodId || generateMutation.isPending}
                >
                  Generate
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
                <Button size="sm" variant="outline" onClick={() => setViewing(null)}>Close</Button>
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
                <TableHead>File Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : transfers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">No bank transfer files generated yet</TableCell></TableRow>
              ) : (
                transfers.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.fileName}</TableCell>
                    <TableCell>{f.payrollPeriod?.periodName}</TableCell>
                    <TableCell><Badge variant="outline">{f.format?.toUpperCase()}</Badge></TableCell>
                    <TableCell>{f.totalEmployees}</TableCell>
                    <TableCell>{Number(f.totalAmount).toFixed(3)} TND</TableCell>
                    <TableCell><Badge>{f.status}</Badge></TableCell>
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
