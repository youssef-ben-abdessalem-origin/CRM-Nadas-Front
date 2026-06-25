import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Play } from "lucide-react";

export default function VacationAccrualRules() {
  const queryClient = useQueryClient();

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [accrualRate, setAccrualRate] = useState("2.5");
  const [maxAccrual, setMaxAccrual] = useState("30");

  // Run accrual dialog
  const [isRunOpen, setIsRunOpen] = useState(false);
  const [runEmployeeId, setRunEmployeeId] = useState("");
  const [runYear, setRunYear] = useState(String(new Date().getFullYear()));
  const [runMonth, setRunMonth] = useState(String(new Date().getMonth() + 1));
  const [runResults, setRunResults] = useState<Record<string, string[]> | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["accrualRules"],
    queryFn: () => api.hr.accrualRules.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: api.hr.employees.getAll,
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: api.hr.leaveTypes.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editingId ? api.hr.accrualRules.update(editingId, data) : api.hr.accrualRules.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accrualRules"] });
      toast.success(editingId ? "Accrual rule updated" : "Accrual rule created");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.accrualRules.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accrualRules"] });
      toast.success("Accrual rule deleted");
    },
  });

  const runMutation = useMutation({
    mutationFn: (data: any) => api.hr.accrualRules.run(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      setRunResults(data);
      toast.success("Accrual run completed");
    },
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditingId(null);
    setEmployeeId("");
    setLeaveTypeId("");
    setAccrualRate("2.5");
    setMaxAccrual("30");
  };

  const openEdit = (rule: any) => {
    setEditingId(rule.id);
    setEmployeeId(String(rule.employeeId));
    setLeaveTypeId(String(rule.leaveTypeId));
    setAccrualRate(String(rule.accrualRate));
    setMaxAccrual(String(rule.maxAccrual));
    setIsOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      employeeId: +employeeId,
      leaveTypeId: +leaveTypeId,
      accrualRate: +accrualRate,
      maxAccrual: +maxAccrual,
    });
  };

  return (
    <CRMLayout title="HR - Vacation Accrual Rules">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vacation Accrual Rules</h1>
            <p className="text-muted-foreground">Define automatic vacation day accrual rates per employee.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsRunOpen(true)}>
              <Play className="h-4 w-4" /> Run Accrual
            </Button>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => { setEditingId(null); resetForm(); }}><Plus className="h-4 w-4" /> New Rule</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Accrual Rule" : "New Accrual Rule"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Employee *</label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                      <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e: any) => (
                          <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Leave Type *</label>
                    <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                      <SelectTrigger><SelectValue placeholder="Select Leave Type" /></SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((lt: any) => (
                          <SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Accrual Rate (days/month)</label>
                    <Input type="number" step="0.5" value={accrualRate} onChange={(e) => setAccrualRate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Max Accrual (days)</label>
                    <Input type="number" value={maxAccrual} onChange={(e) => setMaxAccrual(e.target.value)} />
                  </div>
                  <Button onClick={handleSave} disabled={!employeeId || !leaveTypeId || saveMutation.isPending}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Run Accrual Dialog */}
        <Dialog open={isRunOpen} onOpenChange={(open) => { setIsRunOpen(open); if (!open) setRunResults(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Run Vacation Accrual</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Employee (optional - leave empty for all)</label>
                <Select value={runEmployeeId} onValueChange={setRunEmployeeId}>
                  <SelectTrigger><SelectValue placeholder="All Employees" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employees</SelectItem>
                    {employees.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Year</label>
                  <Input type="number" value={runYear} onChange={(e) => setRunYear(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Month</label>
                  <Input type="number" min={1} max={12} value={runMonth} onChange={(e) => setRunMonth(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => runMutation.mutate({
                  employeeId: runEmployeeId ? +runEmployeeId : undefined,
                  year: +runYear,
                  month: +runMonth,
                })}
                disabled={runMutation.isPending}
              >
                Run Accrual
              </Button>
              {runResults && (
                <div className="mt-2">
                  <h4 className="font-semibold mb-2">Results:</h4>
                  <div className="max-h-48 overflow-y-auto">
                    {Object.entries(runResults).map(([name, msgs]) => (
                      <div key={name} className="mb-1">
                        <span className="font-medium text-sm">{name}:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {(msgs as string[]).map((msg, i) => <li key={i}>{msg}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Rate (days/month)</TableHead>
                <TableHead>Max Accrual</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : rules.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No accrual rules defined</TableCell></TableRow>
              ) : (
                rules.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.employee?.firstName} {r.employee?.lastName}</TableCell>
                    <TableCell>{r.leaveType?.name}</TableCell>
                    <TableCell>{r.accrualRate}</TableCell>
                    <TableCell>{r.maxAccrual}</TableCell>
                    <TableCell><Badge variant={r.active ? "default" : "secondary"}>{r.active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
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
