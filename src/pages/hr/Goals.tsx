import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Goal } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, Flag } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Not Started": "secondary",
  "In Progress": "default",
  Completed: "outline",
  Cancelled: "destructive",
};

export default function Goals() {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Not Started");

  const { data: items = [], isLoading } = useQuery({ queryKey: ["goals"], queryFn: () => api.hr.goals.getAll() });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => api.hr.employees.getAll() });

  const createMut = useMutation({ mutationFn: (d: any) => api.hr.goals.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); toast.success("Goal created"); setIsOpen(false); resetForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: any) => api.hr.goals.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); toast.success("Goal updated"); setIsOpen(false); resetForm(); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => api.hr.goals.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); toast.success("Goal deleted"); } });

  const resetForm = () => { setEditing(null); setEmployeeId(""); setTitle(""); setDescription(""); setCategory(""); setTargetDate(""); setProgress(0); setStatus("Not Started"); };

  const handleEdit = (g: Goal) => {
    setEditing(g); setEmployeeId(String(g.employeeId)); setTitle(g.title); setDescription(g.description || ""); setCategory(g.category || ""); setTargetDate(g.targetDate ? g.targetDate.split("T")[0] : ""); setProgress(g.progress); setStatus(g.status); setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { employeeId: +employeeId, title, description: description || null, category: category || null, targetDate: targetDate || null, progress, status };
    if (editing) updateMut.mutate({ id: editing.id, d: payload }); else createMut.mutate(payload);
  };

  return (
    <CRMLayout title="HR - Goals">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Goals</h1>
            <p className="text-muted-foreground">Track employee objectives and progress.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><Flag className="h-4 w-4" /> New Goal</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit Goal" : "Create Goal"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Employee *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => (<SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Title *</label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Close 10 deals this quarter" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Category</label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Sales, Dev..." />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Target Date</label>
                    <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Progress (%)</label>
                    <Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(+e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              : items.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8">No goals.</TableCell></TableRow>
              : items.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-semibold">{g.employee ? `${g.employee.firstName} ${g.employee.lastName}` : "-"}</TableCell>
                  <TableCell>{g.title}</TableCell>
                  <TableCell>{g.category || "-"}</TableCell>
                  <TableCell>{g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${g.progress}%` }} />
                      </div>
                      <span className="text-xs">{g.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={statusColors[g.status] || "outline"}>{g.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(g)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(g.id)}><Trash className="h-4 w-4" /></Button>
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
