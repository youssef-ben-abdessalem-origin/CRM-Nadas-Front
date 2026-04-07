import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Check,
  LayoutGrid,
  ShieldAlert,
  ArrowLeft,
  Shield,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMLayout } from "@/components/CRMLayout";
import { api, Permission, Role } from "@/lib/api";

const RoleConfig = () => {
  const { id } = useParams();
  const isEdit = !!id && id !== "new" && !isNaN(Number(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [permSearch, setPermSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  const { data: roleData, isLoading: loadingRole } = useQuery({
    queryKey: ["role", id],
    queryFn: () => api.roles.getOne(Number(id)),
    enabled: isEdit,
  });

  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  useEffect(() => {
    if (roleData && !hasLoadedInitialData) {
      setFormData({
        name: roleData.name,
        description: roleData.description || "",
        color: roleData.color,
      });
      setSelectedPerms(roleData.permissions.map(p => p.id));
      setHasLoadedInitialData(true);
    }
  }, [roleData, hasLoadedInitialData]);

  const { data: allPermissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: api.permissions.getAll,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? api.roles.update(Number(id), data) : api.roles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(isEdit ? "Role updated successfully" : "Role created successfully");
      navigate("/team/roles");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Role name is required");

    mutation.mutate({
      ...formData,
      permissionIds: selectedPerms,
    });
  };

  const togglePermission = (permId: number) => {
    setSelectedPerms(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleModulePermissions = (module: string, perms: Permission[]) => {
    const modulePermIds = perms.map(p => p.id);
    const allSelected = modulePermIds.every(id => selectedPerms.includes(id));

    if (allSelected) {
      setSelectedPerms(prev => prev.filter(id => !modulePermIds.includes(id)));
    } else {
      const otherPerms = selectedPerms.filter(id => !modulePermIds.includes(id));
      setSelectedPerms([...otherPerms, ...modulePermIds]);
    }
  };

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter(p =>
      p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.module.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(permSearch.toLowerCase())
    );
  }, [allPermissions, permSearch]);

  const permissionsByModule = useMemo(() => {
    return filteredPermissions.reduce((acc: any, p: Permission) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    }, {});
  }, [filteredPermissions]);

  if (isEdit && loadingRole) {
    return (
      <CRMLayout title="Team - Role Config">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="animate-pulse text-muted-foreground">Fetching role configuration...</p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? "Team - Edit Role" : "Team - Create Role"}>
      <div className="space-y-8 pb-20">



        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-muted/50 p-0 mb-6">
                <TabsTrigger value="details" className="flex-1 py-2.5">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Basic Configuration
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex-1 py-2.5">
                  <ShieldAlert className="h-4 w-4 mr-2" /> Authorization Matrix
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Role Identity
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Senior Account Executive"
                        className="h-12 bg-background border-muted-foreground/20 text-lg"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={roleData?.isSystem}
                      />
                      {roleData?.isSystem && (
                        <p className="text-[10px] text-orange-400 flex items-center gap-1 mt-1 font-medium">
                          <Lock className="h-3 w-3" /> System role identity is protected.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Internal Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Briefly explain the purpose of this access level..."
                        className="min-h-[140px] bg-background border-muted-foreground/20 resize-none leading-relaxed"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
                      Brand Profile & Accent
                    </Label>
                    <div className="flex flex-wrap gap-4">
                      {["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-12 h-12 rounded-2xl border-4 transition-all duration-200 ${formData.color === c ? 'scale-110 border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:scale-105 opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setFormData({ ...formData, color: c })}
                        >
                          {formData.color === c && <Check className="h-6 w-6 mx-auto text-white drop-shadow-sm" />}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 font-medium italic">
                      This accent color will denote members of this role in tables and charts.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Filter permissions..."
                          className="pl-9 h-11"
                          value={permSearch}
                          onChange={(e) => setPermSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-11 px-4"
                          onClick={() => setSelectedPerms(allPermissions.map(p => p.id))}
                        >
                          Full Access
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-11 px-4 text-destructive"
                          onClick={() => setSelectedPerms([])}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-8">
                        {loadingPerms ? (
                          <div className="py-12 text-center text-muted-foreground animate-pulse">
                            Syncing authorization matrix...
                          </div>
                        ) : (
                          Object.entries(permissionsByModule).map(([module, perms]: [any, any]) => (
                            <div key={module} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                                  {module}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest"
                                  onClick={() => toggleModulePermissions(module, perms)}
                                >
                                  {perms.every((p: any) => selectedPerms.includes(p.id)) ? "Deselect Group" : "Select Group"}
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {perms.map((p: Permission) => (
                                  <div
                                    key={p.id}
                                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer group ${selectedPerms.includes(p.id) ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted border-transparent'}`}
                                    onClick={() => togglePermission(p.id)}
                                  >
                                    <Checkbox
                                      id={`perm-${p.id}`}
                                      checked={selectedPerms.includes(p.id)}
                                      onCheckedChange={() => { }}
                                    />
                                    <div className="flex-1">
                                      <Label className="text-sm font-semibold cursor-pointer block">
                                        {p.name}
                                      </Label>
                                      <span className="text-[10px] opacity-40 font-mono uppercase">
                                        {p.code}
                                      </span>
                                    </div>
                                    {selectedPerms.includes(p.id) && <CheckCircle2 className="h-4 w-4 text-primary opacity-60" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-none shadow-md bg-primary/5 border-primary/10 overflow-hidden">
              <div
                className="h-2 w-full"
                style={{ backgroundColor: formData.color }}
              />
              <CardHeader>
                <CardTitle className="text-lg">Role Summary</CardTitle>
                <CardDescription>Review configuration before processing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl bg-background shadow-sm border space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner" style={{ backgroundColor: `${formData.color}20`, color: formData.color }}>
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold leading-none">{formData.name || "Undefined Role"}</h4>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] h-5 px-1.5"
                        style={{ color: formData.color, borderColor: formData.color, backgroundColor: `${formData.color}10` }}
                      >
                        Preview Badge
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2">
                      <div className="text-2xl font-bold">{selectedPerms.length}</div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Capabilities</p>
                    </div>
                    <div className="text-center p-2 border-l">
                      <div className="text-2xl font-bold" style={{ color: formData.color }}>{formData.color.slice(1, 4)}</div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Accent</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-1">Selected Access</h5>
                  <ScrollArea className="h-32 rounded-xl bg-background/50 p-3 border">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPerms.length === 0 && <span className="text-xs italic text-muted-foreground">No permissions selected yet...</span>}
                      {allPermissions.filter(p => selectedPerms.includes(p.id)).map(p => (
                        <Badge key={p.id} variant="secondary" className="text-[9px] h-5 py-0 px-2 font-medium">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-black uppercase tracking-widest"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Syncing..." : (isEdit ? "Update Profile" : "Provision Role")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-11 text-muted-foreground"
                    onClick={() => navigate("/team/roles")}
                  >
                    Discard Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </CRMLayout>
  );
};

export default RoleConfig;
