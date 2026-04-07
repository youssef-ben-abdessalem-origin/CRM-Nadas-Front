import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Search,
  CheckCircle2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CRMLayout } from "@/components/CRMLayout";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { api, Permission } from "@/lib/api";

const RoleConfig = () => {
  const { id } = useParams();
  const isEdit = !!id && id !== "new" && !Number.isNaN(Number(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [permSearch, setPermSearch] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  const { data: roleData, isLoading: loadingRole } = useQuery({
    queryKey: ["roles", id],
    queryFn: () => isEdit ? api.roles.getById(Number(id)) : Promise.resolve(null),
    enabled: isEdit,
  });

  const { data: allPermissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: api.permissions.getAll,
  });

  useEffect(() => {
    if (roleData?.permissions && !hasHydrated) {
      setSelectedPerms(roleData.permissions.map(p => p.id));
      setHasHydrated(true);
    } else if (!isEdit && !hasHydrated) {
      setHasHydrated(true);
    }
  }, [roleData, isEdit, hasHydrated]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? api.roles.update(Number(id), data) : api.roles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Security permissions updated");
      navigate("/team/roles");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ permissionIds: selectedPerms });
  };

  const togglePermission = useCallback((permId: number) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  }, []);

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter(p =>
      p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.module.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(permSearch.toLowerCase())
    );
  }, [allPermissions, permSearch]);

  if (isEdit && (loadingRole || !hasHydrated)) {
    return (
      <CRMLayout title="Role Permissions">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="animate-pulse text-muted-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 animate-spin text-primary" /> Syncing authorization grid...
          </p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={`Edit Permissions - ${roleData?.name || ''}`}>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/team/roles")}
              className="hover:bg-accent h-10 w-10 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                 Edit Role Permissions
                 <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-2 bg-primary/5 border-primary/20 italic">
                    {roleData?.name}
                 </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium italic opacity-60">
                Configure individual access hooks and execution rights.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
               variant="ghost" 
               className="h-10 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-white"
               onClick={() => navigate("/team/roles")}
            >
              Cancel
            </Button>
            <Button 
               className="h-10 px-8 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-secondary text-white shadow-lg transition-all"
               onClick={handleSubmit}
               disabled={mutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? "Updating..." : "Save Role"}
            </Button>
          </div>
        </div>

        <div className="space-y-8 px-4">
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[24px] bg-[#0a0a0b] border border-[#1f2128]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Special Operations & System Hooks</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em] opacity-50">Operational Authorization Framework</p>
                </div>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-40" />
                <Input
                  placeholder="Search execution hooks..."
                  className="pl-9 h-11 bg-background border-[#1f2128] focus:border-primary text-xs font-medium rounded-xl w-full"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              {loadingPerms ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-muted/10 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPermissions.map((p: Permission) => (
                    <div 
                      key={p.id} 
                      onClick={() => togglePermission(p.id)}
                      className={`group relative flex items-center justify-between p-5 rounded-[20px] border-2 transition-all cursor-pointer ${selectedPerms.includes(p.id) ? 'bg-[#121214] border-primary/30 ring-1 ring-primary/10' : 'bg-[#0a0a0b]/60 border-[#1f2128] opacity-70 hover:opacity-100 hover:border-white/10'}`}
                    >
                      <div className="flex flex-col gap-1 pr-10">
                        <span className={`text-[13px] font-bold tracking-tight transition-colors ${selectedPerms.includes(p.id) ? 'text-white' : 'text-muted-foreground'}`}>
                          {p.name.toLowerCase()}
                        </span>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-tighter text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">
                          {p.code}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Checkbox 
                          id={`perm-${p.id}`}
                          checked={selectedPerms.includes(p.id)}
                          onCheckedChange={() => togglePermission(p.id)}
                          className="h-5 w-5 rounded-md border-2 border-white/5 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                        />
                      </div>

                      {selectedPerms.includes(p.id) && (
                        <div className="absolute top-2 right-2">
                           <CheckCircle2 className="h-3 w-3 text-primary/40" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </section>
        </div>
      </div>
    </CRMLayout>
  );
};

export default RoleConfig;
