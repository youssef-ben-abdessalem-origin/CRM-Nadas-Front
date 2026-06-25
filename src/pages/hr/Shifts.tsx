import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Shift } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, Clock } from "lucide-react";

export default function Shifts() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakDuration, setBreakDuration] = useState(0);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [flexible, setFlexible] = useState(false);

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["shifts"],
    queryFn: api.hr.shifts.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.hr.shifts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift created successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.shifts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift updated successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.shifts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift deleted");
    },
  });

  const resetForm = () => {
    setEditing(null);
    setCode("");
    setName("");
    setStartTime("");
    setEndTime("");
    setBreakDuration(0);
    setDescription("");
    setColor("");
    setFlexible(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditing(shift);
    setCode(shift.code);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setBreakDuration(shift.breakDuration);
    setDescription(shift.description || "");
    setColor(shift.color || "");
    setFlexible(shift.flexible);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { code: editing ? code : undefined, name, startTime, endTime, breakDuration, description: description || null, color: color || null, flexible };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <CRMLayout title="HR - Shifts">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
            <p className="text-muted-foreground">Define work shift templates (Morning, Afternoon, Night).</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Clock className="h-4 w-4" /> New Shift</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Shift" : "Create Shift"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                {!editing && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Code</label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Auto-generated if empty" className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Name *</label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning Shift" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Start Time *</label>
                    <Input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">End Time *</label>
                    <Input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Break (hours)</label>
                    <Input type="number" min={0} step={0.5} value={breakDuration} onChange={(e) => setBreakDuration(+e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Color</label>
                    <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional shift notes" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="rounded" />
                  Flexible shift
                </label>
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Flexible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading shifts...</TableCell>
                </TableRow>
              ) : shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No shifts defined yet.</TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell><Badge variant="outline">{shift.code}</Badge></TableCell>
                    <TableCell className="font-semibold flex items-center gap-2">
                      {shift.color && <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: shift.color }} />}
                      {shift.name}
                    </TableCell>
                    <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                    <TableCell>{shift.breakDuration}h</TableCell>
                    <TableCell>{shift.flexible ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(shift)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(shift.id)}>
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
