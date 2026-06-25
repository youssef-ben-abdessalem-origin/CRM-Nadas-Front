import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Loan, Advance } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, CreditCard, Banknote } from "lucide-react";

export default function LoansAdvances() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("loans");

  // Dialog State: Loan Form
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [selectedEmpLoanId, setSelectedEmpLoanId] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [loanStartDate, setLoanStartDate] = useState("");

  // Dialog State: Advance Form
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [selectedEmpAdvId, setSelectedEmpAdvId] = useState("");
  const [advAmount, setAdvAmount] = useState("");
  const [advRequestDate, setAdvRequestDate] = useState("");
  const [advDeductionDate, setAdvDeductionDate] = useState("");

  // Queries
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ["loans"],
    queryFn: () => api.payroll.loans.getAll(),
  });

  const { data: advances = [], isLoading: loadingAdvances } = useQuery({
    queryKey: ["advances"],
    queryFn: () => api.payroll.advances.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  // Mutations
  const createLoanMutation = useMutation({
    mutationFn: api.payroll.loans.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Loan recorded successfully");
      setIsLoanOpen(false);
      setSelectedEmpLoanId("");
      setLoanAmount("");
      setInstallmentAmount("");
      setLoanStartDate("");
    },
  });

  const createAdvMutation = useMutation({
    mutationFn: api.payroll.advances.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advances"] });
      toast.success("Salary advance recorded successfully");
      setIsAdvanceOpen(false);
      setSelectedEmpAdvId("");
      setAdvAmount("");
      setAdvRequestDate("");
      setAdvDeductionDate("");
    },
  });

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLoanMutation.mutate({
      employeeId: +selectedEmpLoanId,
      loanAmount: +loanAmount,
      installmentAmount: +installmentAmount,
      startDate: loanStartDate,
      status: "Active",
    });
  };

  const handleAdvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdvMutation.mutate({
      employeeId: +selectedEmpAdvId,
      amount: +advAmount,
      requestDate: advRequestDate,
      deductionDate: advDeductionDate,
      status: "Approved",
    });
  };

  return (
    <CRMLayout title="Payroll - Loans & Advances">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loans & Advances</h1>
            <p className="text-muted-foreground">Manage and track employee financial assistance programs.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 max-w-sm">
            <TabsTrigger value="loans" className="gap-2"><CreditCard className="h-4 w-4" /> Employee Loans</TabsTrigger>
            <TabsTrigger value="advances" className="gap-2"><Banknote className="h-4 w-4" /> Salary Advances</TabsTrigger>
          </TabsList>

          {/* Loans Tab */}
          <TabsContent value="loans" className="mt-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <Dialog open={isLoanOpen} onOpenChange={setIsLoanOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Record Loan</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Employee Loan</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLoanSubmit} className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Employee *</label>
                      <Select value={selectedEmpLoanId} onValueChange={setSelectedEmpLoanId}>
                        <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Total Loan Amount (TND) *</label>
                      <Input required type="number" step="0.001" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Monthly Repayment Installment (TND) *</label>
                      <Input required type="number" step="0.001" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Start Date *</label>
                      <Input required type="date" value={loanStartDate} onChange={(e) => setLoanStartDate(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsLoanOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createLoanMutation.isPending}>Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Monthly Installment</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLoans ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading loans...</TableCell>
                    </TableRow>
                  ) : loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">No employee loans registered.</TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-semibold">{loan.employee?.firstName} {loan.employee?.lastName}</TableCell>
                        <TableCell>{Number(loan.loanAmount).toFixed(3)} TND</TableCell>
                        <TableCell>{Number(loan.installmentAmount).toFixed(3)} TND</TableCell>
                        <TableCell className="font-bold text-red-600">{Number(loan.balance).toFixed(3)} TND</TableCell>
                        <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={loan.status === "Active" ? "default" : "secondary"}>
                            {loan.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Advances Tab */}
          <TabsContent value="advances" className="mt-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <Dialog open={isAdvanceOpen} onOpenChange={setIsAdvanceOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Request Advance</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Salary Advance</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAdvSubmit} className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Employee *</label>
                      <Select value={selectedEmpAdvId} onValueChange={setSelectedEmpAdvId}>
                        <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Amount (TND) *</label>
                      <Input required type="number" step="0.001" value={advAmount} onChange={(e) => setAdvAmount(e.target.value)} />
                    </div>
                    <div className="flex grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Request Date *</label>
                        <Input required type="date" value={advRequestDate} onChange={(e) => setAdvRequestDate(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Deduction Date *</label>
                        <Input required type="date" value={advDeductionDate} onChange={(e) => setAdvDeductionDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAdvanceOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createAdvMutation.isPending}>Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Scheduled Deduction</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAdvances ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">Loading advances...</TableCell>
                    </TableRow>
                  ) : advances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">No salary advances registered.</TableCell>
                    </TableRow>
                  ) : (
                    advances.map((adv) => (
                      <TableRow key={adv.id}>
                        <TableCell className="font-semibold">{adv.employee?.firstName} {adv.employee?.lastName}</TableCell>
                        <TableCell>{Number(adv.amount).toFixed(3)} TND</TableCell>
                        <TableCell>{new Date(adv.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(adv.deductionDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={adv.status === "Approved" ? "outline" : adv.status === "Deducted" ? "default" : "secondary"}>
                            {adv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
