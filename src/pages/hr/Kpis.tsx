import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Kpi } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, Target } from "lucide-react";

export default function Kpis() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Kpi | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetValue, setTargetValue] = useState(0);
  const [unit, setUnit] = useState("");

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["kpis"],
    queryFn: api.hr.kpis.getAll,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.hr.kpis.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["kpis"] }); toast.success("KPI created"); setIsOpen(false); resetForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: any }) => api.hr.kpis.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["kpis"] }); toast.success("KPI updated"); setIsOpen(false); resetForm(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.hr.kpis.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["kpis"] }); toast.success("KPI deleted"); },
  });

  const resetForm = () => { setEditing(null); setCode(""); setName(""); setDescription(""); setCategory(""); setTargetValue(0); setUnit(""); };

  const handleEdit = (k: Kpi) => {
    setEditing(k); setCode(k.code); setName(k.name); setDescription(k.description || ""); setCategory(k.category || ""); setTargetValue(k.targetValue || 0); setUnit(k.unit || ""); setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { code: editing ? code : undefined, name, description: description || null, category: category || null, targetValue, unit: unit || null };
    if (editing) updateMut.mutate({ id: editing.id, d: payload }); else createMut.mutate(payload);
  };

  return (
    <CRMLayout title="HR - KPIs">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Key Performance Indicators</h1>
            <p className="text-muted-foreground">Define KPIs for employee performance measurement.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><Target className="h-4 w-4" /> New KPI</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit KPI" : "Create KPI"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                {!editing && (
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-semibold">Code</label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Auto-generated" className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-sm font-semibold">Name *</label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer Satisfaction" />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Category</label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Sales, Support..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Unit</label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="%, count, TND..." />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-sm font-semibold">Target Value</label>
                  <Input type="number" step={0.01} value={targetValue} onChange={(e) => setTargetValue(+e.target.value)} />
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-4">
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              : kpis.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">No KPIs defined.</TableCell></TableRow>
              : kpis.map((k) => (
                <TableRow key={k.id}>
                  <TableCell><Badge variant="outline">{k.code}</Badge></TableCell>
                  <TableCell className="font-semibold">{k.name}</TableCell>
                  <TableCell>{k.category || "-"}</TableCell>
                  <TableCell>{k.targetValue != null ? `${k.targetValue} ${k.unit || ""}` : "-"}</TableCell>
                  <TableCell><Badge variant={k.active ? "default" : "secondary"}>{k.active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(k)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(k.id)}><Trash className="h-4 w-4" /></Button>
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
