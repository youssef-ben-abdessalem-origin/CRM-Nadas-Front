import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";

interface ActivityType {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
}

const iconOptions = [
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Email' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'file-text', label: 'Note' },
  { value: 'check-square', label: 'Task' },
  { value: 'clock', label: 'Follow-up' },
  { value: 'users', label: 'Meeting' },
  { value: 'target', label: 'Goal' },
];

const ActivityTypesSettings = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingType, setEditingType] = useState<ActivityType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "phone",
  });

  const { data: activityTypes = [], isLoading } = useQuery({
    queryKey: ["activityTypes"],
    queryFn: () => api.settings.getActivityTypes().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createActivityType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityTypes"] });
      toast.success(t("activityTypes.statusUpdates.created"));
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateActivityType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityTypes"] });
      toast.success(t("activityTypes.statusUpdates.updated"));
      setShowDialog(false);
      setEditingType(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteActivityType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityTypes"] });
      toast.success(t("activityTypes.statusUpdates.deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", icon: "phone" });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error(t("activityTypes.errors.requiredFields"));
      return;
    }
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (type: ActivityType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      icon: type.icon || "phone",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ 
      title: t("activityTypes.deleteDialog.title"), 
      description: t("activityTypes.deleteDialog.description"),
      variant: "destructive",
      confirmText: t("common.delete")
    })) {
      deleteMutation.mutate(id);
    }
  };

  const getIconLabel = (icon: string) => {
    return iconOptions.find(i => i.value === icon)?.label || icon;
  };

  if (isLoading) {
    return (
      <CRMLayout title={t("activityTypes.pageTitle")}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("activityTypes.pageTitle")}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("activityTypes.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("activityTypes.subtitle")}</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingType(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> {t("activityTypes.add")}
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("activityTypes.icon")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t("activityTypes.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                activityTypes.map((type: ActivityType) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getIconLabel(type.icon || 'phone')}</Badge>
                    </TableCell>
                    <TableCell>
                      {!type.isActive && (
                        <Badge variant="secondary">{t("common.inactive")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? t("activityTypes.edit") : t("activityTypes.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")} *</Label>
              <Input
                placeholder={t("activityTypes.namePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("activityTypes.icon")}</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingType ? t("common.update") : t("common.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default ActivityTypesSettings;
