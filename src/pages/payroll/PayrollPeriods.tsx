import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
      toast.success("Payroll period created");
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
      toast.success("Payslips generated/updated for this period");
    },
  });

  const approveMutation = useMutation({
    mutationFn: api.payroll.payslips.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips", selectedPeriod?.id] });
      toast.success("Payslip approved");
    },
  });

  const payMutation = useMutation({
    mutationFn: api.payroll.payslips.pay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips", selectedPeriod?.id] });
      toast.success("Payslip marked as paid");
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
    <CRMLayout title="Payroll - Periods & Payslips">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Runs</h1>
            <p className="text-muted-foreground">Manage periodic salary runs and issue payslips.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Period
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open New Payroll Period</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Period Name *</label>
                  <Input required value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder="e.g. June 2026" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Start Date *</label>
                    <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">End Date *</label>
                    <Input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createPeriodMutation.isPending}>Open Period</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Period Selection */}
          <div className="col-span-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold">Periods</h2>
            {loadingPeriods ? (
              <div>Loading runs...</div>
            ) : periods.length === 0 ? (
              <div className="text-muted-foreground text-sm">No payroll periods opened yet.</div>
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
                      {p.status}
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
                  <h2 className="text-lg font-bold">Payslips for {selectedPeriod.periodName}</h2>
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => generateMutation.mutate(selectedPeriod.id)}>
                    <Play className="h-4 w-4" /> Generate / Recalculate
                  </Button>
                </div>

                <Card className="glass-morphism">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Gross (TND)</TableHead>
                        <TableHead>Deductions (TND)</TableHead>
                        <TableHead>Net Salary (TND)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingPayslips ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">Loading payslips...</TableCell>
                        </TableRow>
                      ) : payslips.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">No payslips generated. Click Generate above.</TableCell>
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
                                {ps.status}
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
                <p>Select a payroll period on the left to manage payslips.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
