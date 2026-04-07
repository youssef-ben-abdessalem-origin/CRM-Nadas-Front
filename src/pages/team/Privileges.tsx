import React from "react";
import { Lock, Info, AlertCircle, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api, Role, Permission } from "@/lib/api";

const Privileges = () => {
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: api.roles.getAll,
  });

  const { data: permissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: api.permissions.getAll,
  });

  const permissionsByModule = permissions.reduce((acc: any, p: Permission) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const hasPermission = (role: Role, permCode: string) => {
    return role.permissions.some(p => p.code === permCode);
  };

  if (loadingRoles || loadingPerms) {
    return (
      <CRMLayout title="Team - Privileges">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground animate-pulse">Loading privilege matrix...</p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Team - Privileges">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center">
              <Lock className="h-5 w-5 mr-2 text-primary" />
              Privilege Control Matrix
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Global overview of permission mapping across system roles.
            </p>
          </div>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertTitle>Read-Only View</AlertTitle>
          <AlertDescription>
            This matrix provides a comprehensive overview. To modify permissions for a specific role, please use the 
            <span className="font-semibold mx-1">Roles management</span> page.
          </AlertDescription>
        </Alert>

        <div className="border rounded-xl overflow-hidden bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-muted/50 z-10">Capability / Module</TableHead>
                {roles.map((role: Role) => (
                  <TableHead key={role.id} className="text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                      <span>{role.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(permissionsByModule).map(([module, perms]: [any, any]) => (
                <React.Fragment key={module}>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={roles.length + 1} className="py-2 px-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {module}
                      </span>
                    </TableCell>
                  </TableRow>
                  {perms.map((p: Permission) => (
                    <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium text-sm pl-6 sticky left-0 bg-card z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {p.name}
                      </TableCell>
                      {roles.map((role: Role) => {
                        const granted = hasPermission(role, p.code);
                        return (
                          <TableCell key={role.id} className="text-center">
                            {granted ? (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/15 border-transparent">
                                Granted
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/30 text-[10px]">&mdash;</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
           <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6">
               <div className="flex items-start gap-3">
                 <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-bold text-sm">Hierarchy</h4>
                   <p className="text-xs text-muted-foreground mt-1">
                     Roles are horizontal. To create a hierarchical permission structure, simply add more permissions to the higher-level roles.
                   </p>
                 </div>
               </div>
            </CardContent>
           </Card>
           
           <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6">
               <div className="flex items-start gap-3">
                 <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-bold text-sm">System Roles</h4>
                   <p className="text-xs text-muted-foreground mt-1">
                     Roles marked as "System" cannot be deleted. They are critical for core platform operations.
                   </p>
                 </div>
               </div>
            </CardContent>
           </Card>

           <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6">
               <div className="flex items-start gap-3">
                 <Lock className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-bold text-sm">Security Policy</h4>
                   <p className="text-xs text-muted-foreground mt-1">
                     Changes to permissions take effect immediately for all active sessions assigned to the role.
                   </p>
                 </div>
               </div>
            </CardContent>
           </Card>
        </div>
      </div>
    </CRMLayout>
  );
};

export default Privileges;
