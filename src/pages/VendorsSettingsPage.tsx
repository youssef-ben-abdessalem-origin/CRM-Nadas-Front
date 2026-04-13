import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Settings2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface VendorCategory {
  id: number;
  name: string;
  color?: string;
}

export default function VendorsSettingsPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<VendorCategory | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VendorCategory>>({});
  const [addForm, setAddForm] = useState<Partial<VendorCategory>>({});

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["vendor-categories"],
    queryFn: () => api.vendors.getCategories(),
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["vendor-categories"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<VendorCategory>) => api.vendors.createCategory(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Vertical classification forge successful");
      setShowAddDialog(false);
      setAddForm({});
    },
    onError: (err: any) => toast.error(err.message || "Failed to forge classification"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VendorCategory> }) => api.vendors.updateCategory(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Vertical classification refined");
      setShowEditDialog(false);
      setEditingItem(null);
      setEditForm({});
    },
    onError: (err: any) => toast.error(err.message || "Failed to refine classification"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.vendors.deleteCategory(id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Vertical classification archived");
    },
    onError: (err: any) => toast.error(err.message || "Archive protocol failed"),
  });

  const handleAdd = () => {
    if (!addForm.name) return toast.error("Classification name required");
    createMutation.mutate(addForm);
  };

  const handleEdit = () => {
    if (!editForm.name || !editingItem) return toast.error("Classification name required");
    updateMutation.mutate({ id: editingItem.id, data: editForm });
  };

  return (
    <CRMLayout title="Vendor Intelligence Settings">
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">

            <div>
              <h1 className="text-3xl font-black tracking-tight tracking-tighter">Vertical Classifications</h1>
              <p className="text-muted-foreground font-medium text-sm">Manage dynamic vendor sectors and commercial categories</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="rounded-xl px-6 h-12 font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Classification
          </Button>
        </div>

        <Card className="border-primary/10 overflow-hidden shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Settings2 className="h-3 w-3" /> Active Registries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-b-primary/5">
                  <TableHead className="w-1/2 pl-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Classification Name</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Visual Marker</TableHead>
                  <TableHead className="text-right pr-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tactical Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-20 animate-pulse font-medium text-muted-foreground">Syncing Classification Data...</TableCell></TableRow>
                ) : categories.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic">No classifications archived in the registry.</TableCell></TableRow>
                ) : (
                  categories.map((cat: any) => (
                    <TableRow key={cat.id} className="group hover:bg-primary/[0.02] transition-colors border-b-primary/5">
                      <TableCell className="pl-8 py-5 font-bold text-sm tracking-tight">{cat.name}</TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full shadow-sm border border-black/5" style={{ backgroundColor: cat.color || "#6366f1" }} />
                          <code className="text-[10px] font-mono opacity-50">{cat.color || "#6366f1"}</code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              setEditingItem(cat);
                              setEditForm({ name: cat.name, color: cat.color || "#6366f1" });
                              setShowEditDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteMutation.mutate(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-3xl border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter">Forge Classification</DialogTitle>
            <DialogDescription className="font-medium">Define a new dynamic vertical for your vendor registry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Display Name</Label>
              <Input
                className="h-12 rounded-xl border-primary/10 focus:ring-primary/20"
                value={addForm.name || ""}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Logistics & Supply"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Identity Color</Label>
              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-primary/5">
                <Input
                  type="color"
                  value={addForm.color || "#6366f1"}
                  onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                  className="w-14 h-12 p-1 cursor-pointer bg-transparent border-none rounded-xl"
                />
                <Input
                  value={addForm.color || "#6366f1"}
                  onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                  placeholder="#6366f1"
                  className="flex-1 bg-transparent border-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl h-12 font-bold px-8" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending} className="rounded-xl h-12 font-bold px-10 shadow-lg shadow-primary/20">
              {createMutation.isPending ? "Forging..." : "Create Registry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-3xl border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter">Refine Classification</DialogTitle>
            <DialogDescription className="font-medium">Update the vertical specification for this registry entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Display Name</Label>
              <Input
                className="h-12 rounded-xl border-primary/10 focus:ring-primary/20"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Identity Color</Label>
              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-primary/5">
                <Input
                  type="color"
                  value={editForm.color || "#6366f1"}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="w-14 h-12 p-1 cursor-pointer bg-transparent border-none rounded-xl"
                />
                <Input
                  value={editForm.color || "#6366f1"}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  placeholder="#6366f1"
                  className="flex-1 bg-transparent border-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl h-12 font-bold px-8" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending} className="rounded-xl h-12 font-bold px-10 shadow-lg shadow-primary/20">
              {updateMutation.isPending ? "Refining..." : "Update Registry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
