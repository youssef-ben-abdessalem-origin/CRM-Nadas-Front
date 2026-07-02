import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CRMLayout } from "@/components/CRMLayout";
import { api, Department, User } from "@/lib/api";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Building2, Plus, Trash2, Pencil } from "lucide-react";

type FormState = {
  name: string;
  description: string;
  representativeId: string;
  memberIds: number[];
};

const emptyForm: FormState = {
  name: "",
  description: "",
  representativeId: "",
  memberIds: [],
};

export default function DepartmentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: paginatedDepartments, isLoading: loadingDepartments } = useQuery({
    queryKey: ["departments", "paginated", page, pageSize, search],
    queryFn: () => api.departments.getPaginated({ page, limit: pageSize, search }),
  });
  const departments = paginatedDepartments?.data || [];
  const totalDepartments = paginatedDepartments?.total || 0;
  const totalPages = paginatedDepartments?.totalPages || 1;

  const { data: usersPage, isLoading: loadingUsers } = useQuery({
    queryKey: ["users", "for-departments"],
    queryFn: () => api.users.getPaginated({ page: 1, limit: 200 }),
  });
  const users = usersPage?.data || [];

  const createMutation = useMutation({
    mutationFn: api.departments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success(t("team.departments.status.created"));
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.departments.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success(t("team.departments.status.updated"));
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.departments.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success(t("team.departments.status.deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const stats = useMemo(() => {
    const totalMembers = departments.reduce(
      (sum: number, dep: Department) => sum + (dep.members?.length || 0),
      0,
    );
    return {
      totalDepartments,
      totalMembers,
      withRepresentative: departments.filter((d: Department) => !!d.representativeId).length,
    };
  }, [departments, totalDepartments]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setForm({
      name: department.name,
      description: department.description || "",
      representativeId: department.representativeId ? String(department.representativeId) : "",
      memberIds: department.members?.map((m) => m.id) || [],
    });
    setOpen(true);
  };

  const toggleMember = (userId: number) => {
    setForm((prev) => {
      const exists = prev.memberIds.includes(userId);
      return {
        ...prev,
        memberIds: exists
          ? prev.memberIds.filter((id) => id !== userId)
          : [...prev.memberIds, userId],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error(t("team.departments.validation.nameRequired"));
      return;
    }

    const repId = form.representativeId ? Number(form.representativeId) : undefined;
    let memberIds = [...form.memberIds];
    if (repId && !memberIds.includes(repId)) memberIds.push(repId);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      representativeId: repId,
      memberIds,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <CRMLayout title={t("team.departments.pageTitle")}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("team.departments.title")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("team.departments.description")}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder={t("team.departments.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="md:w-64"
            />
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> {t("team.departments.actions.create")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {t("team.departments.stats.departments")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {t("team.departments.stats.assignedMembers")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.withRepresentative}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {t("team.departments.stats.withRepresentative")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("team.departments.table.department")}</TableHead>
                <TableHead>{t("team.departments.table.representative")}</TableHead>
                <TableHead>{t("team.departments.table.members")}</TableHead>
                <TableHead>{t("team.departments.table.created")}</TableHead>
                <TableHead className="text-right">{t("team.departments.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDepartments ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    {t("team.departments.loading")}
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    {t("team.departments.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department: Department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium">{department.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {department.description || t("team.departments.noDescription")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {department.representative ? (
                        <Badge variant="outline">{department.representative.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">{t("team.departments.notSet")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(department.members || []).slice(0, 3).map((m: User) => (
                          <Badge key={m.id} variant="secondary">
                            {m.name}
                          </Badge>
                        ))}
                        {(department.members || []).length > 3 ? (
                          <Badge variant="secondary">+{(department.members || []).length - 3}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(department.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(department)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (
                              await confirm({
                                title: t("team.departments.confirmDelete.title"),
                                description: t("team.departments.confirmDelete.description", { name: department.name }),
                                variant: "destructive",
                                confirmText: t("team.departments.confirmDelete.confirmText"),
                              })
                            ) {
                              deleteMutation.mutate(department.id);
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
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              {t("team.departments.pagination.showing", { count: departments.length, total: totalDepartments })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("team.departments.pagination.previous")}
              </Button>
              <span>
                {t("team.departments.pagination.pageOf", { page, total: Math.max(1, totalPages) })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("team.departments.pagination.next")}
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editing ? t("team.departments.dialog.editTitle") : t("team.departments.dialog.createTitle")}</DialogTitle>
                <DialogDescription>
                  {t("team.departments.dialog.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("team.departments.form.name")}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={t("team.departments.placeholders.name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("team.departments.form.description")}</Label>
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder={t("team.departments.placeholders.description")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("team.departments.form.representative")}</Label>
                  <Select
                    value={form.representativeId}
                    onValueChange={(v) => setForm((p) => ({ ...p, representativeId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("team.departments.placeholders.selectRepresentative")} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>
                          {t("team.departments.loading")}
                        </SelectItem>
                      ) : (
                        users.map((u: User) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("team.departments.form.members")}</Label>
                  <div className="max-h-52 overflow-y-auto rounded-md border p-3 space-y-2">
                    {loadingUsers ? (
                      <div className="text-sm text-muted-foreground">{t("team.departments.loading")}</div>
                    ) : users.length === 0 ? (
                      <div className="text-sm text-muted-foreground">{t("team.departments.noUsers")}</div>
                    ) : (
                      users.map((u: User) => (
                        <div key={u.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.memberIds.includes(u.id)}
                            onCheckedChange={() => toggleMember(u.id)}
                            id={`member-${u.id}`}
                          />
                          <Label htmlFor={`member-${u.id}`} className="font-normal">
                            {u.name} ({u.email})
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("team.departments.form.autoAddHint")}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing
                    ? updateMutation.isPending
                      ? t("common.saving")
                      : t("team.departments.actions.saveChanges")
                    : createMutation.isPending
                      ? t("team.departments.actions.creating")
                      : t("team.departments.actions.create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
