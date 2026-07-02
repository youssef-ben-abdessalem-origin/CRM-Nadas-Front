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
import { useTranslation } from "react-i18next";

export default function ShiftAssignments() {
  const { t } = useTranslation();
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
      toast.success(t("hr.statusUpdates.shiftAssignmentCreated"));
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.shiftAssignments.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftAssignments"] });
      toast.success(t("hr.statusUpdates.shiftAssignmentUpdated"));
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.shiftAssignments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftAssignments"] });
      toast.success(t("hr.statusUpdates.shiftAssignmentDeleted"));
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
    <CRMLayout title={t("hr.shiftAssignments.pageTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.shiftAssignments.title")}</h1>
            <p className="text-muted-foreground">{t("hr.shiftAssignments.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><CalendarDays className="h-4 w-4" /> {t("hr.shiftAssignments.actions.create")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? t("hr.shiftAssignments.dialog.edit") : t("hr.shiftAssignments.dialog.create")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.shiftAssignments.forms.employee")} *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder={t("hr.shiftAssignments.placeholders.selectEmployee")} /></SelectTrigger>
                    <SelectContent>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.shiftAssignments.forms.shift")} *</label>
                  <Select value={shiftId} onValueChange={setShiftId}>
                    <SelectTrigger><SelectValue placeholder={t("hr.shiftAssignments.placeholders.selectShift")} /></SelectTrigger>
                    <SelectContent>
                      {shifts.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.startTime}-{s.endTime})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.shiftAssignments.forms.startDate")} *</label>
                    <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.shiftAssignments.forms.endDate")}</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.shiftAssignments.forms.notes")}</label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("hr.shiftAssignments.placeholders.notes")} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{t("common.save")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("hr.shiftAssignments.table.employee")}</TableHead>
                <TableHead>{t("hr.shiftAssignments.table.shift")}</TableHead>
                <TableHead>{t("hr.shiftAssignments.table.startDate")}</TableHead>
                <TableHead>{t("hr.shiftAssignments.table.endDate")}</TableHead>
                <TableHead className="text-right">{t("hr.shiftAssignments.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">{t("hr.shiftAssignments.loading")}</TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">{t("hr.shiftAssignments.empty")}</TableCell>
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
                    <TableCell>{a.endDate ? new Date(a.endDate).toLocaleDateString() : t("hr.shiftAssignments.ongoing")}</TableCell>
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
