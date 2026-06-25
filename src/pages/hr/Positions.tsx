import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Position } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, Briefcase } from "lucide-react";

export default function Positions() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  // Queries
  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: api.hr.positions.getAll,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.departments.getAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.hr.positions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position created successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.positions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position updated successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.hr.positions.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position deleted successfully");
    },
  });

  const resetForm = () => {
    setEditingPos(null);
    setCode("");
    setTitle("");
    setDepartmentId("");
    setDescription("");
    setStatus("Active");
  };

  const handleEdit = (pos: Position) => {
    setEditingPos(pos);
    setCode(pos.code);
    setTitle(pos.title);
    setDepartmentId(String(pos.departmentId));
    setDescription(pos.description || "");
    setStatus(pos.status);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code,
      title,
      departmentId: +departmentId,
      description,
      status,
    };

    if (editingPos) {
      updateMutation.mutate({ id: editingPos.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <CRMLayout title="HR - Positions">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
            <p className="text-muted-foreground">Define roles, titles, and department alignments.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Briefcase className="h-4 w-4" /> New Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPos ? "Edit Position" : "Create Position"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Code</label>
                  <Input
                    readOnly
                    disabled
                    value={editingPos ? code : "Auto-generated"}
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Title *</label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Engineer" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Department *</label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the role" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Status *</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Positions Table */}
        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading positions...</TableCell>
                </TableRow>
              ) : positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No positions defined yet.</TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-semibold">{pos.code}</TableCell>
                    <TableCell>{pos.title}</TableCell>
                    <TableCell>{pos.department?.name || "-"}</TableCell>
                    <TableCell>{pos.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={pos.status === "Active" ? "default" : "secondary"}>
                        {pos.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(pos)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete position?")) deleteMutation.mutate(pos.id); }}>
                        <Trash className="h-4 w-4 text-red-500" />
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
