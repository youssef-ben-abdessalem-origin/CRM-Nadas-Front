import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Shield,
  Plus,
  Trash2,
  Lock,
  Check,
  ShieldCheck,
  X,
  Pencil,
  Settings2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CRMLayout } from "@/components/CRMLayout";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Role } from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
];

const Roles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });

  const { data: paginatedRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles", "paginated", page, pageSize, search],
    queryFn: () => api.roles.getPaginated({ page, limit: pageSize, search }),
  });
  const roles = paginatedRoles?.data || [];
  const totalRoles = paginatedRoles?.total || 0;
  const totalPages = paginatedRoles?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (data: any) => api.roles.create(data),
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(t("team.roles.status.created"));
      setIsDialogOpen(false);
      navigate(`/team/roles/${newRole.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.roles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(t("team.roles.status.updated"));
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.roles.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(t("team.roles.status.deleted"));
    },
  });

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", color: "#6366f1" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      color: role.color,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error(t("team.roles.validation.nameRequired"));

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, permissionIds: [] });
    }
  };

  return (
    <CRMLayout title={t("team.roles.pageTitle")}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("team.roles.title")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("team.roles.description")}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder={t("team.roles.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="md:w-64"
            />
            <Button
              onClick={openCreateDialog}
              className="bg-primary hover:bg-secondary text-white h-11 px-6 rounded-lg font-medium transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("team.roles.actions.create")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingRoles ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className=" rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2 " />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full " />
                    <Skeleton className="h-3 w-5/6 " />
                  </div>
                  <Separator className="" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 " />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg " />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            roles.map((role: Role) => (
              <Card key={role.id} className=" hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#1a1d23]">
                      <Shield className="h-5 w-5" style={{ color: role.color }} />
                    </div>
                    {role.isSystem && (
                      <Badge variant="secondary" className="bg-[#1a1d23] text-muted-foreground border-none text-[10px] uppercase font-bold px-2 py-0.5">
                        {t("team.roles.systemBadge")}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg font-bold">
                    {role.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                    {role.description || t("team.roles.defaultDescription")}
                  </p>

                  <Separator className="bg-[#1f2128]" />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {t("team.roles.permissionsCount", { count: role.permissions?.length || 0 })}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                        onClick={() => openEditDialog(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        onClick={() => navigate(`/team/roles/${role.id}`)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (await confirm({ 
                              title: t("team.roles.confirmDelete.title"), 
                              description: t("team.roles.confirmDelete.description", { name: role.name }),
                              variant: "destructive",
                              confirmText: t("team.roles.confirmDelete.confirmText")
                            })) {
                              deleteMutation.mutate(role.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("team.roles.pagination.showing", { count: roles.length, total: totalRoles })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("team.roles.pagination.previous")}
            </Button>
            <span>
              {t("team.roles.pagination.pageOf", { page, total: Math.max(1, totalPages) })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("team.roles.pagination.next")}
            </Button>
          </div>
        </div>
      </div>

      {/* Shared Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]  text-white p-0 overflow-hidden rounded-xl shadow-2xl">
          <div className="p-6 border-b flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              {editingRole ? t("team.roles.dialog.editTitle") : t("team.roles.dialog.createTitle")}
            </DialogTitle>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pro-name" className="text-sm font-medium text-white">
                  {t("team.roles.form.name")}
                </Label>
                <Input
                  id="pro-name"
                  placeholder={t("team.roles.placeholders.name")}
                  className=" border-2 focus-visible:ring-0 focus-visible:border-primary h-11 text-white placeholder:text-muted-foreground rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white block">{t("team.roles.form.badgeColor")}</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`w-full aspect-square rounded-lg border-2 transition-all ${formData.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setFormData({ ...formData, color: c })}
                      >
                        {formData.color === c && <Check className="h-4 w-4 mx-auto text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pro-desc" className="text-sm font-medium text-white">
                  {t("team.roles.form.description")}
                </Label>
                <Textarea
                  id="pro-desc"
                  placeholder={t("team.roles.placeholders.description")}
                  className=" border-2 focus-visible:ring-0 focus-visible:border-primary min-h-[100px] text-white placeholder:text-muted-foreground rounded-lg resize-none p-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {editingRole && (
                <Button
                  type="button"
                  variant="link"
                  className="text-primary p-0 h-auto font-bold text-xs"
                  onClick={() => {
                    setIsDialogOpen(false);
                    navigate(`/team/roles/${editingRole.id}`);
                  }}
                >
                  {t("team.roles.dialog.configureMatrix")} <ChevronRight className="h-3 w-3 inline" />
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-white hover:bg-[#1a1d23] px-6 h-10 font-medium"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 h-10 font-medium rounded-lg shadow-lg shadow-indigo-500/20"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingRole ? (updateMutation.isPending ? t("team.roles.actions.updating") : t("team.roles.actions.updateSignature")) : (createMutation.isPending ? t("team.roles.actions.creating") : t("team.roles.actions.create"))}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default Roles;
