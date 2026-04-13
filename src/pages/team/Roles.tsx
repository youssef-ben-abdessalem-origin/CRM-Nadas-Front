import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
      toast.success("Security protocol generated");
      setIsDialogOpen(false);
      navigate(`/team/roles/${newRole.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.roles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("System signature updated");
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.roles.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role decommissioned");
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
    if (!formData.name) return toast.error("Identity name required");

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, permissionIds: [] });
    }
  };

  return (
    <CRMLayout title="Team - Roles">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Team Roles</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure the access levels and feature permissions for your organization.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Search roles..."
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
              <Plus className="h-4 w-4 mr-2" /> Add New Role
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
                        System
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg font-bold">
                    {role.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                    {role.description || "Active operational descriptor for system personnel."}
                  </p>

                  <Separator className="bg-[#1f2128]" />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {role.permissions?.length || 0} Permissions
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
                              title: "Decommission Role", 
                              description: `Are you sure you want to delete the ${role.name} role? This action will affect all users currently assigned to this role.`,
                              variant: "destructive",
                              confirmText: "Decommission"
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
            Showing {roles.length} of {totalRoles} roles
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span>
              Page {page} / {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Shared Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]  text-white p-0 overflow-hidden rounded-xl shadow-2xl">
          <div className="p-6 border-b flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              {editingRole ? "Change Role Details" : "Create New Role"}
            </DialogTitle>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pro-name" className="text-sm font-medium text-white">
                  Role Name *
                </Label>
                <Input
                  id="pro-name"
                  placeholder="e.g. Sales Manager"
                  className=" border-2 focus-visible:ring-0 focus-visible:border-primary h-11 text-white placeholder:text-muted-foreground rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white block">Badge Color</Label>
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
                  Role Description
                </Label>
                <Textarea
                  id="pro-desc"
                  placeholder="Primary responsibilities and permissions..."
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
                  Configure Matrix <ChevronRight className="h-3 w-3 inline" />
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-white hover:bg-[#1a1d23] px-6 h-10 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 h-10 font-medium rounded-lg shadow-lg shadow-indigo-500/20"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingRole ? (updateMutation.isPending ? "Updating..." : "Update Signature") : (createMutation.isPending ? "Creating..." : "Create Role")}
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
