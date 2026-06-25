import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ShiftAssignment } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, CalendarDays } from "lucide-react";

export default function ShiftAssignments() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftAssignment | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["shiftAssignments"],
    queryFn: () => api.hr.shiftAssignments.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: api.hr.shifts.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.hr.shiftAssignments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftAssignments"] });
      toast.success("Shift assignment created");
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.shiftAssignments.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftAssignments"] });
      toast.success("Shift assignment updated");
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.shiftAssignments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftAssignments"] });
      toast.success("Shift assignment deleted");
    },
  });

  const resetForm = () => {
    setEditing(null);
    setEmployeeId("");
    setShiftId("");
    setStartDate("");
    setEndDate("");
    setNotes("");
  };

  const handleEdit = (item: ShiftAssignment) => {
    setEditing(item);
    setEmployeeId(String(item.employeeId));
    setShiftId(String(item.shiftId));
    setStartDate(item.startDate.split("T")[0]);
    setEndDate(item.endDate ? item.endDate.split("T")[0] : "");
    setNotes(item.notes || "");
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { employeeId: +employeeId, shiftId: +shiftId, startDate, endDate: endDate || null, notes: notes || null };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <CRMLayout title="HR - Shift Assignments">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shift Assignments</h1>
            <p className="text-muted-foreground">Assign work shifts to employees for specific date ranges.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><CalendarDays className="h-4 w-4" /> New Assignment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Assignment" : "New Shift Assignment"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Employee *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Shift *</label>
                  <Select value={shiftId} onValueChange={setShiftId}>
                    <SelectTrigger><SelectValue placeholder="Select Shift" /></SelectTrigger>
                    <SelectContent>
                      {shifts.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.startTime}-{s.endTime})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Start Date *</label>
                    <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">End Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Notes</label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
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
                <TableHead>Shift</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading assignments...</TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No shift assignments found.</TableCell>
                </TableRow>
              ) : (
                assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-semibold">
                      {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell>
                      {a.shift ? (
                        <Badge variant="outline" className="gap-1">
                          {a.shift.color && <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: a.shift.color }} />}
                          {a.shift.name}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{new Date(a.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{a.endDate ? new Date(a.endDate).toLocaleDateString() : "Ongoing"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(a)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)}>
                        <Trash className="h-4 w-4" />
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
