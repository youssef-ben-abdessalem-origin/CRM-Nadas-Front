import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GripVertical,
  Settings as SettingsIcon,
  Layers,
  Tag,
  Flag,
  CheckCircle,
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
  description?: string;
}

export default function LeadsSettingsPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<{
    type: string;
    item: DynamicOption | null;
  }>({ type: "", item: null });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState("");
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [addForm, setAddForm] = useState<Record<string, any>>({});

  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: async () => {
      const data = await api.leads.getSources();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: stages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ["lead-stages"],
    queryFn: async () => {
      const data = await api.leads.getStages();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: scores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["lead-scores"],
    queryFn: async () => {
      const data = await api.leads.getScores();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: priorities = [], isLoading: prioritiesLoading } = useQuery({
    queryKey: ["lead-priorities"],
    queryFn: async () => {
      const data = await api.leads.getPriorities();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: qualifications = [], isLoading: qualificationsLoading } =
    useQuery({
      queryKey: ["lead-qualifications"],
      queryFn: async () => {
        const data = await api.leads.getQualifications();
        return Array.isArray(data) ? data : [];
      },
    });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["lead-sources"] });
    queryClient.invalidateQueries({ queryKey: ["lead-stages"] });
    queryClient.invalidateQueries({ queryKey: ["lead-scores"] });
    queryClient.invalidateQueries({ queryKey: ["lead-priorities"] });
    queryClient.invalidateQueries({ queryKey: ["lead-qualifications"] });
  };

  const createMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      switch (type) {
        case "source":
          return api.leads.createSource(data);
        case "stage":
          return api.leads.createStage(data);
        case "score":
          return api.leads.createScore(data);
        case "priority":
          return api.leads.createPriority(data);
        case "qualification":
          return api.leads.createQualification(data);
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
    mutationFn: async ({
      type,
      id,
      data,
    }: {
      type: string;
      id: number;
      data: any;
    }) => {
      switch (type) {
        case "source":
          return api.leads.updateSource(id, data);
        case "stage":
          return api.leads.updateStage(id, data);
        case "score":
          return api.leads.updateScore(id, data);
        case "priority":
          return api.leads.updatePriority(id, data);
        case "qualification":
          return api.leads.updateQualification(id, data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(`${type} updated successfully`);
      setShowEditDialog(false);
      setEditingItem({ type: "", item: null });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      switch (type) {
        case "source":
          return api.leads.deleteSource(id);
        case "stage":
          return api.leads.deleteStage(id);
        case "score":
          return api.leads.deleteScore(id);
        case "priority":
          return api.leads.deletePriority(id);
        case "qualification":
          return api.leads.deleteQualification(id);
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

  const handleEdit = (type: string, item: DynamicOption) => {
    setEditingItem({ type, item });
    setEditForm({
      name: item.name || "",
      color: item.color || "",
      order: item.order || 0,
      isDefault: item.isDefault || false,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!editingItem.item) return;
    const data: Record<string, any> = {};
    if (editForm.name) data.name = editForm.name;
    if (editForm.color) data.color = editForm.color;
    if (editForm.order !== undefined) data.order = editForm.order;
    if (editForm.isDefault !== undefined) data.isDefault = editForm.isDefault;

    updateMutation.mutate({
      type: editingItem.type,
      id: editingItem.item.id,
      data,
    });
  };

  const handleAdd = () => {
    if (!addForm.name) {
      toast.error("Name is required");
      return;
    }
    const data: Record<string, any> = { name: addForm.name };
    if (addForm.color) data.color = addForm.color;
    if (addForm.order !== undefined) data.order = addForm.order;

    createMutation.mutate({ type: addType, data });
  };

  const handleDelete = (type: string, id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ type, id });
    }
  };

  const openAddDialog = (type: string) => {
    setAddType(type);
    setAddForm({ name: "", color: "", order: undefined });
    setShowAddDialog(true);
  };

  const ColorPicker = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#84cc16",
      "#22c55e",
      "#14b8a6",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#d946ef",
      "#ec4899",
      "#6b7280",
      "#1f2937",
    ];
    return (
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value === c ? "border-foreground scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="w-24 h-8"
        />
      </div>
    );
  };

  return (
    <CRMLayout title="Settings">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">CRM Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your CRM configuration options. These settings control how
          leads are categorized and tracked.
        </p>

        <Tabs defaultValue="stages" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stages">
              <Layers className="h-4 w-4 mr-2" />
              Stages
            </TabsTrigger>
            <TabsTrigger value="sources">
              <Tag className="h-4 w-4 mr-2" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="scores">
              <Flag className="h-4 w-4 mr-2" />
              Scores
            </TabsTrigger>
            <TabsTrigger value="priorities">
              <Flag className="h-4 w-4 mr-2" />
              Priorities
            </TabsTrigger>
            <TabsTrigger value="qualifications">
              <CheckCircle className="h-4 w-4 mr-2" />
              Qualifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stages" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pipeline Stages</CardTitle>
                  <CardDescription>Manage lead pipeline stages</CardDescription>
                </div>
                <Button onClick={() => openAddDialog("stage")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Stage
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stagesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : stages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No stages found
                        </TableCell>
                      </TableRow>
                    ) : (
                      stages.map((stage: DynamicOption) => (
                        <TableRow key={stage.id}>
                          <TableCell>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: stage.color || "#6b7280",
                                }}
                              />
                              {stage.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {stage.color || "—"}
                            </code>
                          </TableCell>
                          <TableCell>
                            {stage.isDefault ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Default
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("stage", stage)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDelete("stage", stage.id, stage.name)
                              }
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
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>
                    Manage where leads come from
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog("source")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Source
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourcesLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : sources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No sources found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sources.map((source: DynamicOption) => (
                        <TableRow key={source.id}>
                          <TableCell className="font-medium">
                            {source.name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("source", source)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDelete("source", source.id, source.name)
                              }
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
          </TabsContent>

          <TabsContent value="scores" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lead Score Categories</CardTitle>
                  <CardDescription>
                    Manage lead scoring categories
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog("score")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Score
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scoresLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : scores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No scores found
                        </TableCell>
                      </TableRow>
                    ) : (
                      scores.map((score: DynamicOption) => (
                        <TableRow key={score.id}>
                          <TableCell>{score.order}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: score.color || "#6b7280",
                                }}
                              />
                              {score.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {score.color || "—"}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("score", score)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDelete("score", score.id, score.name)
                              }
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
          </TabsContent>

          <TabsContent value="priorities" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lead Priorities</CardTitle>
                  <CardDescription>Manage lead priority levels</CardDescription>
                </div>
                <Button onClick={() => openAddDialog("priority")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Priority
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prioritiesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : priorities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No priorities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      priorities.map((priority: DynamicOption) => (
                        <TableRow key={priority.id}>
                          <TableCell>{priority.order}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: priority.color || "#6b7280",
                                }}
                              />
                              {priority.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {priority.color || "—"}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("priority", priority)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDelete(
                                  "priority",
                                  priority.id,
                                  priority.name,
                                )
                              }
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
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Qualification Stages</CardTitle>
                  <CardDescription>
                    Manage lead qualification stages
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog("qualification")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Qualification
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualificationsLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : qualifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No qualifications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      qualifications.map((qual: DynamicOption) => (
                        <TableRow key={qual.id}>
                          <TableCell>{qual.order}</TableCell>
                          <TableCell className="font-medium">
                            {qual.name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("qualification", qual)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDelete(
                                  "qualification",
                                  qual.id,
                                  qual.name,
                                )
                              }
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {addType.charAt(0).toUpperCase() + addType.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new {addType}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={addForm.name || ""}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                placeholder={`Enter ${addType} name`}
              />
            </div>
            {(addType === "stage" ||
              addType === "score" ||
              addType === "priority") && (
              <div className="space-y-2">
                <Label>Color</Label>
                <ColorPicker
                  value={addForm.color || ""}
                  onChange={(v) => setAddForm({ ...addForm, color: v })}
                />
              </div>
            )}
            {(addType === "stage" ||
              addType === "score" ||
              addType === "priority" ||
              addType === "qualification") && (
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={addForm.order || ""}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      order: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Display order"
                />
              </div>
            )}
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {editingItem.type?.charAt(0).toUpperCase() +
                editingItem.type?.slice(1) || ""}
            </DialogTitle>
            <DialogDescription>
              Update the details for this {editingItem.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>
            {(editingItem.type === "stage" ||
              editingItem.type === "score" ||
              editingItem.type === "priority") && (
              <>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker
                    value={editForm.color || ""}
                    onChange={(v) => setEditForm({ ...editForm, color: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={editForm.order || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </>
            )}
            {editingItem.type === "stage" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={editForm.isDefault || false}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isDefault: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isDefault">Set as default stage</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
