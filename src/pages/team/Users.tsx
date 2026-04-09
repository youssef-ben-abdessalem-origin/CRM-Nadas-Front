import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  Trash2,
  UserPlus,
  CheckCircle2,
  XCircle,
  Filter,
  User as UserIcon,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, User, Role } from "@/lib/api";
import { CRMLayout } from "@/components/CRMLayout";

const Users = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    phone: "",
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: api.users.getAll,
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: api.roles.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setShowAddUser(false);
      setNewUser({ name: "", email: "", password: "", roleId: "", phone: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
  });

  const filteredUsers = users.filter((u: User) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role?: Role) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;
    return (
      <Badge
        variant="outline"
        className="font-semibold"
        style={{ borderColor: role.color, color: role.color, backgroundColor: `${role.color}10` }}
      >
        {role.name}
      </Badge>
    );
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.roleId) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      ...newUser,
      roleId: newUser.roleId
    });
  };

  const toggleUserStatus = (user: User) => {
    updateMutation.mutate({ id: user.id, data: { enabled: !user.enabled } });
  };

  const changeRole = (user: User, roleId: string) => {
    updateMutation.mutate({ id: user.id, data: { roleId } });
  };

  return (
    <CRMLayout title="Team - Users">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Team Members</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your users and their system access.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}>
              Refresh List
            </Button>
            <Button onClick={() => setShowAddUser(true)} className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.filter((u: any) => u.enabled).length}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Members</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground animation-pulse">
                    Syncing user directory...
                  </TableCell>
                </TableRow>
              ) : null}
              {!loadingUsers && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No team members found matched your criteria.
                  </TableCell>
                </TableRow>
              ) : null}
              {!loadingUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user: User) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {user.enabled ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium bg-muted px-2 py-0.5 rounded-full w-fit">
                          <XCircle className="h-3.5 w-3.5" /> Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-nowrap">
                      {user.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </div>
                      ) : "\u2014"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                            {user.enabled ? (
                              <div className="flex items-center text-orange-600">
                                <XCircle className="h-4 w-4 mr-2" /> Deactivate Account
                              </div>
                            ) : (
                              <div className="flex items-center text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Activate Account
                              </div>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                            Assign New Role
                          </DropdownMenuLabel>
                          {roles.map((role: Role) => (
                            <DropdownMenuItem
                              key={role.id}
                              onClick={() => changeRole(user, role.id)}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                                {role.name}
                              </div>
                              {user.roleId === role.id && <CheckCircle2 className="h-3 w-3 text-primary" />}
                            </DropdownMenuItem>
                          ))}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${user.name} from the team?`)) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Member Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : null}
            </TableBody>
          </Table>
        </div>

        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddUser}>
              <DialogHeader>

                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>
                  Provision a new account and assign their initial system role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Cooper"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@nexus-crm.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Initial Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Initial Role</Label>
                  <Select
                    value={newUser.roleId}
                    onValueChange={(v) => setNewUser({ ...newUser, roleId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role: Role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || loadingRoles}>
                  {createMutation.isPending ? "Inviting..." : "Assign & Invite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

export default Users;
