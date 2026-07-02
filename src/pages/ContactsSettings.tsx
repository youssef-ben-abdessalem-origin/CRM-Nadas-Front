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
  Settings as SettingsIcon,
  ToggleLeft,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

interface DynamicOption {
  id: number;
  name: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export default function ContactsSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<{ type: string; item: DynamicOption | null }>({ type: "", item: null });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState("");
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [addForm, setAddForm] = useState<Record<string, any>>({});

  const { data: statuses = [], isLoading: statusesLoading } = useQuery({
    queryKey: ["contact-statuses"],
    queryFn: async () => {
      const data = await api.contacts.getStatuses();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["contact-tiers"],
    queryFn: async () => {
      const data = await api.contacts.getTiers();
      return Array.isArray(data) ? data : [];
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["contact-statuses"] });
    queryClient.invalidateQueries({ queryKey: ["contact-tiers"] });
  };

  const createMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      switch (type) {
        case "status":
          return api.contacts.createStatus(data);
        case "tier":
          return api.contacts.createTier(data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(t("contactsSettings.statusUpdates.created", { type }));
      setShowAddDialog(false);
      setAddForm({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: number; data: any }) => {
      switch (type) {
        case "status":
          return api.contacts.updateStatus(id, data);
        case "tier":
          return api.contacts.updateTier(id, data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(t("contactsSettings.statusUpdates.updated", { type }));
      setShowEditDialog(false);
      setEditingItem({ type: "", item: null });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      switch (type) {
        case "status":
          return api.contacts.deleteStatus(id);
        case "tier":
          return api.contacts.deleteTier(id);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(t("contactsSettings.statusUpdates.deleted", { type }));
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
    
    updateMutation.mutate({ type: editingItem.type, id: editingItem.item.id, data });
  };

  const handleAdd = () => {
    if (!addForm.name) {
      toast.error(t("contactsSettings.errors.nameRequired"));
      return;
    }
    const data: Record<string, any> = { name: addForm.name };
    if (addForm.color) data.color = addForm.color;
    
    createMutation.mutate({ type: addType, data });
  };

  const handleDelete = (type: string, id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ type, id });
    }
  };

  const openAddDialog = (type: string) => {
    setAddType(type);
    setAddForm({ name: "", color: "" });
    setShowAddDialog(true);
  };

  const ColorPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const colors = [
      "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
      "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
      "#a855f7", "#d946ef", "#ec4899", "#6b7280", "#1f2937",
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
    <CRMLayout title={t("contactsSettings.pageTitle")}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("contactsSettings.pageTitle")}</h1>
        </div>
        <p className="text-muted-foreground">
          {t("contactsSettings.subtitle")}
        </p>

        <Tabs defaultValue="statuses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="statuses">
              <ToggleLeft className="h-4 w-4 mr-2" />
              {t("contactsSettings.tabs.statuses")}
            </TabsTrigger>
            <TabsTrigger value="tiers">
              <Star className="h-4 w-4 mr-2" />
              {t("contactsSettings.tabs.tiers")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statuses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("contactsSettings.sectionTitle", { type: "status" })}</CardTitle>
                  <CardDescription>{t("contactsSettings.sectionDescription", { type: "status" })}</CardDescription>
                </div>
                <Button onClick={() => openAddDialog("status")}>
                  <Plus className="h-4 w-4 mr-2" /> {t("contactsSettings.addItem", { type: "status" })}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">{t("contactsSettings.order")}</TableHead>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.color")}</TableHead>
                      <TableHead>{t("common.default")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">{t("common.loading")}</TableCell>
                      </TableRow>
                    ) : statuses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">{t("contactsSettings.noResults", { type: "status" })}</TableCell>
                      </TableRow>
                    ) : (
                      statuses.map((status: DynamicOption) => (
                        <TableRow key={status.id}>
                          <TableCell>{status.order}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: status.color || "#6b7280" }}
                              />
                              {status.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {status.color || "—"}
                            </code>
                          </TableCell>
                          <TableCell>
                            {status.isDefault ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {t("common.default")}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("status", status)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete("status", status.id, status.name)}
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

          <TabsContent value="tiers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("contactsSettings.sectionTitle", { type: "tier" })}</CardTitle>
                  <CardDescription>Manage contact tiers (Enterprise, Professional, Starter, etc.)</CardDescription>
                </div>
                <Button onClick={() => openAddDialog("tier")}>
                  <Plus className="h-4 w-4 mr-2" /> {t("contactsSettings.addItem", { type: "tier" })}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">{t("contactsSettings.order")}</TableHead>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.color")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiersLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">{t("common.loading")}</TableCell>
                      </TableRow>
                    ) : tiers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">{t("contactsSettings.noResults", { type: "tier" })}</TableCell>
                      </TableRow>
                    ) : (
                      tiers.map((tier: DynamicOption) => (
                        <TableRow key={tier.id}>
                          <TableCell>{tier.order}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: tier.color || "#6b7280" }}
                              />
                              {tier.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {tier.color || "—"}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit("tier", tier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete("tier", tier.id, tier.name)}
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
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                value={addForm.name || ""}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder={t("contactsSettings.placeholders.name", { type: addType })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.color")}</Label>
              <ColorPicker
                value={addForm.color || ""}
                onChange={(v) => setAddForm({ ...addForm, color: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editingItem.type?.charAt(0).toUpperCase() + editingItem.type?.slice(1) || ""}
            </DialogTitle>
            <DialogDescription>
              Update the details for this {editingItem.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t("contactsSettings.placeholders.editName")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.color")}</Label>
              <ColorPicker
                value={editForm.color || ""}
                onChange={(v) => setEditForm({ ...editForm, color: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
