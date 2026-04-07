import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Settings2, 
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CRMLayout } from "@/components/CRMLayout";
import { Separator } from "@/components/ui/separator";
import { api, Role } from "@/lib/api";

const Roles = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: api.roles.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: api.roles.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
    },
  });

  return (
    <CRMLayout title="Team - Roles">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Roles & Permissions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure system access levels and associated capabilities.
            </p>
          </div>
          <Button onClick={() => navigate("/team/roles/new")} className="w-full md:w-auto h-11 px-6 shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingRoles ? (
            <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">
              Loading role configurations...
            </div>
          ) : (
            roles.map((role: Role) => (
              <Card key={role.id} className="hover:shadow-lg transition-all border-none bg-card shadow-md group relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1.5 h-full opacity-80" 
                  style={{ backgroundColor: role.color }}
                />
                <CardHeader className="pb-3 px-6 pt-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-xl bg-muted/50 transition-colors group-hover:bg-muted">
                      <Shield className="h-6 w-6" style={{ color: role.color }} />
                    </div>
                    {role.isSystem && (
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-muted/50 border-none">
                        <Lock className="h-2.5 w-2.5 mr-1" /> System
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-xl font-bold group-hover:text-primary transition-colors">
                    {role.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed mt-2 min-h-[40px]">
                    {role.description || "No access description provided for this role."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <Separator className="mb-4 opacity-50" />
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground/70">
                        {role.permissions?.length || 0} active permissions
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter tabular-nums">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 invisible group-hover:visible transition-all">
                      <Button 
                        variant="secondary" 
                        className="flex-1 h-9 rounded-lg font-medium"
                        onClick={() => navigate(`/team/roles/${role.id}`)}
                      >
                        <Settings2 className="h-3.5 w-3.5 mr-2" /> Configure
                      </Button>
                      {!role.isSystem && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the ${role.name} role?`)) {
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
      </div>
    </CRMLayout>
  );
};

export default Roles;
