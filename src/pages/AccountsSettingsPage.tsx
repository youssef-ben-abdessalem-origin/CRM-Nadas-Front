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
  Building2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";

interface DynamicOption {
  id: number;
  name: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  isActive?: boolean;
  description?: string;
}

export default function AccountsSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [editingItem, setEditingItem] = useState<{ type: string; item: DynamicOption | null }>({ type: "", item: null });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState("");
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [addForm, setAddForm] = useState<Record<string, any>>({});

  const { data: types = [], isLoading: typesLoading } = useQuery({
    queryKey: ["account-types"],
    queryFn: async () => {
      const data = await api.accounts.getTypes();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: statuses = [], isLoading: statusesLoading } = useQuery({
    queryKey: ["account-statuses"],
    queryFn: async () => {
      const data = await api.accounts.getStatuses();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["account-tiers"],
    queryFn: async () => {
      const data = await api.accounts.getTiers();
      return Array.isArray(data) ? data : [];
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["account-types"] });
    queryClient.invalidateQueries({ queryKey: ["account-statuses"] });
    queryClient.invalidateQueries({ queryKey: ["account-tiers"] });
  };

  const createMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      switch (type) {
        case "type":
          return api.accounts.createType(data);
        case "status":
          return api.accounts.createStatus(data);
        case "tier":
          return api.accounts.createTier(data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(t("accountsSettings.statusUpdates.created", { type }));
      setShowAddDialog(false);
      setAddForm({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: number; data: any }) => {
      switch (type) {
        case "type":
          return api.accounts.updateType(id, data);
        case "status":
          return api.accounts.updateStatus(id, data);
        case "tier":
          return api.accounts.updateTier(id, data);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(t("accountsSettings.statusUpdates.updated", { type }));
      setShowEditDialog(false);
      setEditingItem({ type: "", item: null });
      setEditForm({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      switch (type) {
        case "type":
          return api.accounts.deleteType(id);
        case "status":
          return api.accounts.deleteStatus(id);
        case "tier":
          return api.accounts.deleteTier(id);
        default:
          throw new Error("Unknown type");
      }
    },
    onSuccess: (_, { type }) => {
      invalidateQueries();
      toast.success(t("accountsSettings.statusUpdates.deleted", { type }));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openAdd = (type: string) => {
    setAddType(type);
    setAddForm({ name: "", color: "#3b82f6" });
    setShowAddDialog(true);
  };

  const openEdit = (type: string, item: DynamicOption) => {
    setEditingItem({ type, item });
    setEditForm({ name: item.name, color: item.color || "#3b82f6" });
    setShowEditDialog(true);
  };

  const handleAdd = () => {
    if (!addForm.name) {
      toast.error(t("accountsSettings.errors.nameRequired"));
      return;
    }
    createMutation.mutate({ type: addType, data: addForm });
  };

  const handleEdit = () => {
    if (!editForm.name) {
      toast.error(t("accountsSettings.errors.nameRequired"));
      return;
    }
    if (!editingItem.item) return;
    updateMutation.mutate({ type: editingItem.type, id: editingItem.item.id, data: editForm });
  };

  const handleDelete = async (type: string, item: DynamicOption) => {
    if (item.isDefault) {
      toast.error(t("accountsSettings.errors.cannotDeleteDefault"));
      return;
    }
    
    if (await confirm({
      title: t("accountsSettings.deleteDialog.title", { type }),
      description: t("accountsSettings.deleteDialog.description", { type, itemName: item.name }),
      variant: "destructive",
      confirmText: t("common.delete")
    })) {
      deleteMutation.mutate({ type, id: item.id });
    }
  };

  const OptionTable = ({ items, type, loading }: { items: DynamicOption[]; type: string; loading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="capitalize">{t("accountsSettings.sectionTitle", { type })}</CardTitle>
          <CardDescription>{t("accountsSettings.sectionDescription", { type })}</CardDescription>
        </div>
        <Button size="sm" onClick={() => openAdd(type)}>
          <Plus className="h-4 w-4 mr-2" /> {t("accountsSettings.addItem", { type })}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.color")}</TableHead>
              <TableHead>{t("common.default")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">{t("common.loading")}</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t("accountsSettings.noResults", { type })}
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
    <CRMLayout title={t("accountsSettings.pageTitle")}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("accountsSettings.pageTitle")}</h1>
        </div>
        
        <Tabs defaultValue="types" className="space-y-6">
          <TabsList>
            <TabsTrigger value="types">{t("accountsSettings.tabs.types")}</TabsTrigger>
            <TabsTrigger value="statuses">{t("accountsSettings.tabs.statuses")}</TabsTrigger>
            <TabsTrigger value="tiers">{t("accountsSettings.tabs.tiers")}</TabsTrigger>
          </TabsList>

          <TabsContent value="types">
            <OptionTable items={types} type="type" loading={typesLoading} />
          </TabsContent>

          <TabsContent value="statuses">
            <OptionTable items={statuses} type="status" loading={statusesLoading} />
          </TabsContent>

          <TabsContent value="tiers">
            <OptionTable items={tiers} type="tier" loading={tiersLoading} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("accountsSettings.addDialogTitle", { type: addType })}</DialogTitle>
            <DialogDescription>{t("accountsSettings.addDialogDescription", { type: addType })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input
                value={addForm.name || ""}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder={t("accountsSettings.placeholders.name", { type: addType })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.color")}</Label>
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
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("accountsSettings.editDialogTitle", { type: editingItem.type })}</DialogTitle>
            <DialogDescription>{t("accountsSettings.editDialogDescription", { type: editingItem.type })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t("accountsSettings.placeholders.editName")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.color")}</Label>
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
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
