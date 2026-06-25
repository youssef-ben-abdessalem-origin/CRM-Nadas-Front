import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, CnssDeclaration } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSpreadsheet, Eye } from "lucide-react";

export default function CnssDeclarations() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [viewing, setViewing] = useState<CnssDeclaration | null>(null);

  const { data: declarations = [], isLoading } = useQuery({
    queryKey: ["cnssDeclarations"],
    queryFn: api.payroll.cnssDeclarations.getAll,
  });

  const { data: periods = [] } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: api.payroll.periods.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: (periodId: number) => api.payroll.cnssDeclarations.generate(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cnssDeclarations"] });
      toast.success("CNSS declaration generated");
      setIsOpen(false);
    },
  });

  return (
    <CRMLayout title="Payroll - CNSS Declarations">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CNSS Declarations</h1>
            <p className="text-muted-foreground">Generate and view monthly CNSS social security declarations.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedPeriodId(""); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><FileSpreadsheet className="h-4 w-4" /> Generate Declaration</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate CNSS Declaration</DialogTitle>
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

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>CNSS Employee</TableHead>
                <TableHead>CNSS Employer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading declarations...</TableCell>
                </TableRow>
              ) : declarations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">No declarations generated yet.</TableCell>
                </TableRow>
              ) : (
                declarations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-semibold">{d.payrollPeriod?.periodName || "-"}</TableCell>
                    <TableCell>{new Date(d.declarationDate).toLocaleDateString()}</TableCell>
                    <TableCell>{d.employeeCount}</TableCell>
                    <TableCell>{Number(d.totalGrossSalary).toFixed(3)} TND</TableCell>
                    <TableCell>{Number(d.totalCnssEmployee).toFixed(3)} TND</TableCell>
                    <TableCell>{Number(d.totalCnssEmployer).toFixed(3)} TND</TableCell>
                    <TableCell><Badge variant={d.status === "Generated" ? "default" : "outline"}>{d.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(d)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>CNSS Declaration Details</DialogTitle>
            </DialogHeader>
            {viewing && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-semibold">{viewing.payrollPeriod?.periodName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(viewing.declarationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-semibold">{viewing.employeeCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{viewing.status}</Badge>
                </div>
                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Financial Summary</p>
                  <div className="flex justify-between py-1"><span>Total Gross Salary</span><span>{Number(viewing.totalGrossSalary).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>CNSS Employee</span><span>{Number(viewing.totalCnssEmployee).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>CNSS Employer</span><span>{Number(viewing.totalCnssEmployer).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>TFP</span><span>{Number(viewing.totalTfp).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>FOPROLOS</span><span>{Number(viewing.totalFoprolos).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>Accident Insurance</span><span>{Number(viewing.totalAccidentInsurance).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1 font-bold border-t pt-2 mt-2">
                    <span>Total Employer</span>
                    <span>{(Number(viewing.totalCnssEmployer) + Number(viewing.totalTfp) + Number(viewing.totalFoprolos) + Number(viewing.totalAccidentInsurance)).toFixed(3)} TND</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
