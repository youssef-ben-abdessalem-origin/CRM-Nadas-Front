import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSpreadsheet, Download, Eye } from "lucide-react";

export default function StcSettlements() {
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
      toast.success("STC settlement generated");
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

  return (
    <CRMLayout title="Payroll - STC Settlements">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">STC Settlements</h1>
            <p className="text-muted-foreground">Generate STC (Société Tunisienne de Compensation) settlement files for salary transfers.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedPeriodId(""); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><FileSpreadsheet className="h-4 w-4" /> Generate STC File</Button>
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

        {viewing && (
          <Card className="glass-morphism">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">STC Settlement - {viewing.periodName}</h3>
                  <p className="text-sm text-muted-foreground">{viewing.totalEmployees} employees, {Number(viewing.totalAmount).toFixed(3)} TND</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(viewing.content, `STC-${viewing.periodName.replace(/\s+/g, "-")}.txt`)}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setViewing(null)}>Close</Button>
                </div>
              </div>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap break-all">
                {viewing.content}
              </pre>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : settlements.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No STC settlements generated yet</TableCell></TableRow>
              ) : (
                settlements.map((s: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{s.periodName}</TableCell>
                    <TableCell><Badge variant="outline">STC</Badge></TableCell>
                    <TableCell>{s.totalEmployees}</TableCell>
                    <TableCell>{Number(s.totalAmount).toFixed(3)} TND</TableCell>
                    <TableCell>{new Date(s.generatedAt).toLocaleString()}</TableCell>
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
