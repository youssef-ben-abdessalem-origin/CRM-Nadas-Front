import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";

interface Industry {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
}

const IndustriesSettings = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isDefault: false,
  });

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ["industries"],
    queryFn: () => api.settings.getIndustries().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      toast.success(t("industries.statusUpdates.created"));
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateIndustry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      toast.success(t("industries.statusUpdates.updated"));
      setShowDialog(false);
      setEditingIndustry(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      toast.success(t("industries.statusUpdates.deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", isDefault: false });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error(t("industries.errors.requiredFields"));
      return;
    }
    if (editingIndustry) {
      updateMutation.mutate({ id: editingIndustry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (industry: Industry) => {
    setEditingIndustry(industry);
    setFormData({
      name: industry.name,
      description: industry.description || "",
      isDefault: industry.isDefault,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ 
      title: t("industries.deleteDialog.title"), 
      description: t("industries.deleteDialog.description"),
      variant: "destructive",
      confirmText: t("common.delete")
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title={t("industries.pageTitle")}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("industries.pageTitle")}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("industries.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("industries.subtitle")}</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingIndustry(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> {t("industries.addIndustry")}
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.description")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {industries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t("industries.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                industries.map((industry: Industry) => (
                  <TableRow key={industry.id}>
                    <TableCell className="font-medium">{industry.name}</TableCell>
                    <TableCell className="text-muted-foreground">{industry.description || "—"}</TableCell>
                    <TableCell>
                      {industry.isDefault && (
                        <Badge className="bg-green-500">{t("common.default")}</Badge>
                      )}
                      {!industry.isActive && (
                        <Badge variant="secondary">{t("common.inactive")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(industry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!industry.isDefault && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(industry.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
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
            <DialogTitle>{editingIndustry ? t("industries.edit") : t("industries.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")} *</Label>
              <Input
                placeholder={t("industries.namePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea
                placeholder={t("industries.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <Label htmlFor="isDefault">{t("industries.setDefault")}</Label>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingIndustry ? t("common.update") : t("common.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default IndustriesSettings;
