import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, KpiAssignment } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, AlignStartVertical } from "lucide-react";

export default function KpiAssignments() {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<KpiAssignment | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [kpiId, setKpiId] = useState("");
  const [targetValue, setTargetValue] = useState(0);
  const [actualValue, setActualValue] = useState(0);
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");

  const { data: items = [], isLoading } = useQuery({ queryKey: ["kpiAssignments"], queryFn: () => api.hr.kpiAssignments.getAll() });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => api.hr.employees.getAll() });
  const { data: kpis = [] } = useQuery({ queryKey: ["kpis"], queryFn: api.hr.kpis.getAll });

  const createMut = useMutation({ mutationFn: (d: any) => api.hr.kpiAssignments.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["kpiAssignments"] }); toast.success("KPI assigned"); setIsOpen(false); resetForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: any) => api.hr.kpiAssignments.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["kpiAssignments"] }); toast.success("Assignment updated"); setIsOpen(false); resetForm(); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => api.hr.kpiAssignments.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["kpiAssignments"] }); toast.success("Assignment deleted"); } });

  const resetForm = () => { setEditing(null); setEmployeeId(""); setKpiId(""); setTargetValue(0); setActualValue(0); setPeriod(""); setNotes(""); };

  const handleEdit = (a: KpiAssignment) => {
    setEditing(a); setEmployeeId(String(a.employeeId)); setKpiId(String(a.kpiId)); setTargetValue(a.targetValue || 0); setActualValue(a.actualValue || 0); setPeriod(a.period || ""); setNotes(a.notes || ""); setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { employeeId: +employeeId, kpiId: +kpiId, targetValue, actualValue, period: period || null, notes: notes || null };
    if (editing) updateMut.mutate({ id: editing.id, d: payload }); else createMut.mutate(payload);
  };

  return (
    <CRMLayout title="HR - KPI Assignments">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KPI Assignments</h1>
            <p className="text-muted-foreground">Assign KPIs to employees and track actual results.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><AlignStartVertical className="h-4 w-4" /> Assign KPI</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit Assignment" : "Assign KPI"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Employee *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => (<SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">KPI *</label>
                  <Select value={kpiId} onValueChange={setKpiId}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{kpis.map((k: any) => (<SelectItem key={k.id} value={String(k.id)}>{k.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Target Value</label>
                    <Input type="number" step={0.01} value={targetValue} onChange={(e) => setTargetValue(+e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Actual Value</label>
                    <Input type="number" step={0.01} value={actualValue} onChange={(e) => setActualValue(+e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Period</label>
                  <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. 2025-Q1" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Notes</label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
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
                <TableHead>KPI</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              : items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">No assignments.</TableCell></TableRow>
              : items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold">{a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : "-"}</TableCell>
                  <TableCell>{a.kpi?.name || "-"}</TableCell>
                  <TableCell>{a.period || "-"}</TableCell>
                  <TableCell>{a.targetValue != null ? a.targetValue : "-"}</TableCell>
                  <TableCell>
                    {a.actualValue != null ? (
                      <Badge variant={a.actualValue >= (a.targetValue || 0) ? "default" : "destructive"}>{a.actualValue}</Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(a)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(a.id)}><Trash className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
