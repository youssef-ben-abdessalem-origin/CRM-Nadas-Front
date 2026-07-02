import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CRMLayout } from "@/components/CRMLayout";
import { api, CostCenter, Employee } from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Pencil, Plus, Trash2 } from "lucide-react";

type FormState = {
  name: string;
  description: string;
  departmentId: string;
  managerId: string;
  status: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  departmentId: "",
  managerId: "",
  status: "Active",
};

export default function CostCentersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ["costCenters"],
    queryFn: () => api.costCenters.getAll(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.departments.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: api.costCenters.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
      toast.success(t("hr.statusUpdates.costCenterCreated"));
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.costCenters.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
      toast.success(t("hr.statusUpdates.costCenterUpdated"));
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.costCenters.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costCenters"] });
      toast.success(t("hr.statusUpdates.costCenterDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const usageByCode = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, employee: Employee) => {
      if (employee.costCenter) {
        acc[employee.costCenter] = (acc[employee.costCenter] || 0) + 1;
      }
      return acc;
    }, {});
  }, [employees]);

  const stats = useMemo(() => {
    return {
      total: costCenters.length,
      active: costCenters.filter((item: CostCenter) => item.status === "Active").length,
      assigned: costCenters.filter((item: CostCenter) => (usageByCode[item.code] || 0) > 0).length,
    };
  }, [costCenters, usageByCode]);

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (costCenter: CostCenter) => {
    setEditing(costCenter);
    setForm({
      name: costCenter.name,
      description: costCenter.description || "",
      departmentId: costCenter.departmentId ? String(costCenter.departmentId) : "",
      managerId: costCenter.managerId ? String(costCenter.managerId) : "",
      status: costCenter.status,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error(t("hr.statusUpdates.costCenterNameRequired"));
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      managerId: form.managerId ? Number(form.managerId) : null,
      status: form.status,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <CRMLayout title={t("hr.costCenters.title")}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("hr.costCenters.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("hr.costCenters.description")}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("hr.costCenters.actions.new")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hr.costCenters.stats.total")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hr.costCenters.stats.active")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hr.costCenters.stats.assigned")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("hr.costCenters.table.code")}</TableHead>
                <TableHead>{t("hr.costCenters.table.name")}</TableHead>
                <TableHead>{t("hr.costCenters.table.department")}</TableHead>
                <TableHead>{t("hr.costCenters.table.manager")}</TableHead>
                <TableHead>{t("hr.costCenters.table.employees")}</TableHead>
                <TableHead>{t("hr.costCenters.table.status")}</TableHead>
                <TableHead className="text-right">{t("hr.costCenters.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : costCenters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                    {t("hr.costCenters.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                costCenters.map((costCenter: CostCenter) => (
                  <TableRow key={costCenter.id}>
                    <TableCell className="font-medium">{costCenter.code}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Landmark className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{costCenter.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {costCenter.description || t("hr.costCenters.noDescription")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{costCenter.department?.name || t("hr.costCenters.notLinked")}</TableCell>
                    <TableCell>
                      {costCenter.manager
                        ? `${costCenter.manager.firstName} ${costCenter.manager.lastName}`
                        : t("hr.costCenters.notSet")}
                    </TableCell>
                    <TableCell>{usageByCode[costCenter.code] || 0}</TableCell>
                    <TableCell>
                      <Badge variant={costCenter.status === "Active" ? "default" : "secondary"}>
                        {costCenter.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(costCenter)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (
                              await confirm({
                                title: t("hr.costCenters.deleteTitle"),
                                description: t("hr.costCenters.deleteDescription", { name: costCenter.name }),
                                variant: "destructive",
                                confirmText: t("common.delete"),
                              })
                            ) {
                              deleteMutation.mutate(costCenter.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) resetForm();
            else setOpen(nextOpen);
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editing ? t("hr.costCenters.actions.edit") : t("hr.costCenters.actions.create")}</DialogTitle>
                <DialogDescription>
                  {t("hr.costCenters.formDescription")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("hr.costCenters.forms.code")}</Label>
                  <Input
                    readOnly
                    disabled
                    value={editing?.code || t("hr.costCenters.placeholders.autoGenerated")}
                    className="cursor-not-allowed bg-muted text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("hr.costCenters.forms.name")}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={t("hr.costCenters.placeholders.name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("hr.costCenters.forms.description")}</Label>
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder={t("hr.costCenters.placeholders.description")}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("hr.costCenters.forms.department")}</Label>
                    <Select
                      value={form.departmentId || "none"}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, departmentId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("hr.costCenters.placeholders.selectDepartment")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("hr.costCenters.options.noDepartment")}</SelectItem>
                        {departments.map((department: any) => (
                          <SelectItem key={department.id} value={String(department.id)}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("hr.costCenters.forms.manager")}</Label>
                    <Select
                      value={form.managerId || "none"}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, managerId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("hr.costCenters.placeholders.selectManager")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("hr.costCenters.options.noManager")}</SelectItem>
                        {employees.map((employee: Employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>
                            {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("hr.costCenters.forms.status")}</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{t("hr.costCenters.options.active")}</SelectItem>
                      <SelectItem value="Inactive">{t("hr.costCenters.options.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing
                    ? updateMutation.isPending
                      ? t("common.actions.saving")
                      : t("hr.costCenters.actions.saveChanges")
                    : createMutation.isPending
                      ? t("common.actions.creating")
                      : t("hr.costCenters.actions.create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
