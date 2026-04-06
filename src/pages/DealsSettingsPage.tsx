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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Handshake,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface DynamicOption {
  id: number;
  name: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  isActive?: boolean;
  type?: string;
}

export default function DealsSettingsPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<{ type: string; item: DynamicOption | null }>({ type: "", item: null });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState("");
  const [reasonFilter, setReasonFilter] = useState<"win" | "lost">("lost");
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [addForm, setAddForm] = useState<Record<string, any>>({});

  const { data: stages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ["deal-stages"],
    queryFn: async () => {
      const data = await api.deals.getStages();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: reasons = [], isLoading: reasonsLoading } = useQuery({
    queryKey: ["deal-reasons", reasonFilter],
    queryFn: async () => {
      const data = await api.deals.getReasons(reasonFilter);
      return Array.isArray(data) ? data : [];
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["deal-stages"] });
    queryClient.invalidateQueries({ queryKey: ["deal-reasons"] });
  };

  const createMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      switch (type) {
        case "stage":
          return api.deals.createStage(data);
        case "reason":
          return api.deals.createReason(data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(`${type} created successfully`);
      setShowAddDialog(false);
      setAddForm({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: number; data: any }) => {
      switch (type) {
        case "stage":
          return api.deals.updateStage(id, data);
        case "reason":
          return api.deals.updateReason(id, data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(`${type} updated successfully`);
      setShowEditDialog(false);
      setEditingItem({ type: "", item: null });
      setEditForm({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      switch (type) {
        case "stage":
          return api.deals.deleteStage(id);
        case "reason":
          return api.deals.deleteReason(id);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(`${type} deleted successfully`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openAdd = (type: string) => {
    setAddType(type);
    setAddForm({ name: "", color: "#3b82f6", type: type === "reason" ? reasonFilter : undefined });
    setShowAddDialog(true);
  };

  const openEdit = (type: string, item: DynamicOption) => {
    setEditingItem({ type, item });
    setEditForm({ name: item.name, color: item.color || "#3b82f6", type: item.type });
    setShowEditDialog(true);
  };

  const handleAdd = () => {
    if (!addForm.name) {
      toast.error("Name is required");
      return;
    }
    createMutation.mutate({ type: addType, data: addForm });
  };

  const handleEdit = () => {
    if (!editForm.name) {
      toast.error("Name is required");
      return;
    }
    if (!editingItem.item) return;
    updateMutation.mutate({ type: editingItem.type, id: editingItem.item.id, data: editForm });
  };

  const handleDelete = (type: string, item: DynamicOption) => {
    if (item.isDefault) {
      toast.error("Cannot delete the default item");
      return;
    }
    deleteMutation.mutate({ type, id: item.id });
  };

  const OptionTable = ({ items, type, loading }: { items: DynamicOption[]; type: string; loading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="capitalize">{type}s</CardTitle>
          <CardDescription>Manage your deal {type.toLowerCase()}s</CardDescription>
        </div>
        <Button size="sm" onClick={() => openAdd(type)}>
          <Plus className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No {type.toLowerCase()}s found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color || "#6b7280" }}
                    />
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {item.color || "#6b7280"}
                    </code>
                  </TableCell>
                  <TableCell>
                    {item.isDefault && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(type, item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(type, item)}
                      disabled={item.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <CRMLayout title="Deal Settings">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Handshake className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Deal Settings</h1>
        </div>
        
        <Tabs defaultValue="stages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="reasons">Reasons</TabsTrigger>
          </TabsList>

          <TabsContent value="stages">
            <OptionTable items={stages} type="stage" loading={stagesLoading} />
          </TabsContent>

          <TabsContent value="reasons" className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={reasonFilter === "lost" ? "default" : "outline"}
                size="sm"
                onClick={() => setReasonFilter("lost")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Loss Reasons
              </Button>
              <Button
                variant={reasonFilter === "win" ? "default" : "outline"}
                size="sm"
                onClick={() => setReasonFilter("win")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Win Reasons
              </Button>
            </div>
            <OptionTable items={reasons} type="reason" loading={reasonsLoading} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {addType}</DialogTitle>
            <DialogDescription>Create a new {addType.toLowerCase()} for deals.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={addForm.name || ""}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder={`Enter ${addType.toLowerCase()} name`}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={addForm.color || "#3b82f6"}
                  onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={addForm.color || "#3b82f6"}
                  onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingItem.type}</DialogTitle>
            <DialogDescription>Update the {editingItem.type?.toLowerCase()} details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={editForm.color || "#3b82f6"}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={editForm.color || "#3b82f6"}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
