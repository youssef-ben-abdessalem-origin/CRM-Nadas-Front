import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, IrppDeclaration } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSpreadsheet, Eye } from "lucide-react";

export default function IrppDeclarations() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [viewing, setViewing] = useState<IrppDeclaration | null>(null);

  const { data: declarations = [], isLoading } = useQuery({
    queryKey: ["irppDeclarations"],
    queryFn: api.payroll.irppDeclarations.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: (year: number) => api.payroll.irppDeclarations.generate(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["irppDeclarations"] });
      toast.success("IRPP declarations generated");
      setIsOpen(false);
    },
  });

  return (
    <CRMLayout title="Payroll - IRPP Declarations">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">IRPP Declarations</h1>
            <p className="text-muted-foreground">Annual income tax declarations per employee.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setTaxYear(new Date().getFullYear()); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><FileSpreadsheet className="h-4 w-4" /> Generate Annual IRPP</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate IRPP Declaration</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Tax Year *</label>
                  <Input type="number" min={2020} max={2100} value={taxYear} onChange={(e) => setTaxYear(+e.target.value)} />
                </div>
                <Button onClick={() => generateMutation.mutate(taxYear)} disabled={generateMutation.isPending}>
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
                <TableHead>Employee</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Taxable Income</TableHead>
                <TableHead>Tax Deducted</TableHead>
                <TableHead>CNSS Deducted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading declarations...</TableCell>
                </TableRow>
              ) : declarations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No declarations generated yet.</TableCell>
                </TableRow>
              ) : (
                declarations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-semibold">
                      {d.employee ? `${d.employee.firstName} ${d.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell>{d.taxYear}</TableCell>
                    <TableCell>{Number(d.annualTaxableIncome).toFixed(3)} TND</TableCell>
                    <TableCell>{Number(d.annualTaxDeducted).toFixed(3)} TND</TableCell>
                    <TableCell>{Number(d.annualCnssDeducted).toFixed(3)} TND</TableCell>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>IRPP Declaration Details</DialogTitle>
            </DialogHeader>
            {viewing && (
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-semibold">{viewing.employee ? `${viewing.employee.firstName} ${viewing.employee.lastName}` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Year</p>
                    <p className="font-semibold">{viewing.taxYear}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between py-1"><span>Annual Taxable Income</span><span className="font-semibold">{Number(viewing.annualTaxableIncome).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>Annual Tax Deducted</span><span className="font-semibold">{Number(viewing.annualTaxDeducted).toFixed(3)} TND</span></div>
                  <div className="flex justify-between py-1"><span>Annual CNSS Deducted</span><span className="font-semibold">{Number(viewing.annualCnssDeducted).toFixed(3)} TND</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
