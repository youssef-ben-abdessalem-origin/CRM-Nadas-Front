import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, CnssProfile } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, ShieldCheck } from "lucide-react";

export default function CnssProfiles() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CnssProfile | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [cnssNumber, setCnssNumber] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [regime, setRegime] = useState("CNSS");
  const [status, setStatus] = useState("Active");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["cnssProfiles"],
    queryFn: api.hr.cnssProfiles.getAll,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: any }) =>
      api.hr.cnssProfiles.createOrUpdate(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cnssProfiles"] });
      toast.success("CNSS profile saved successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setEditingProfile(null);
    setEmployeeId("");
    setCnssNumber("");
    setRegistrationDate("");
    setRegime("CNSS");
    setStatus("Active");
  };

  const handleEdit = (profile: CnssProfile) => {
    setEditingProfile(profile);
    setEmployeeId(String(profile.employeeId));
    setCnssNumber(profile.cnssNumber);
    setRegistrationDate(profile.registrationDate ? profile.registrationDate.split("T")[0] : "");
    setRegime(profile.regime);
    setStatus(profile.status);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      cnssNumber,
      registrationDate: registrationDate || null,
      regime,
      status,
    };

    if (editingProfile) {
      createMutation.mutate({ employeeId: editingProfile.employeeId, data: payload });
    } else {
      createMutation.mutate({ employeeId: +employeeId, data: payload });
    }
  };

  return (
    <CRMLayout title="HR - CNSS Profiles">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CNSS Profiles</h1>
            <p className="text-muted-foreground">Manage employee CNSS registration and social security information.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><ShieldCheck className="h-4 w-4" /> New CNSS Profile</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingProfile ? "Edit CNSS Profile" : "Create CNSS Profile"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                {!editingProfile && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Employee *</label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                      <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">CNSS Number *</label>
                  <Input required value={cnssNumber} onChange={(e) => setCnssNumber(e.target.value)} placeholder="e.g. 123456789" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Registration Date</label>
                  <Input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Regime *</label>
                    <Select value={regime} onValueChange={setRegime}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNSS">CNSS</SelectItem>
                        <SelectItem value="CNRPS">CNRPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Status *</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>CNSS Number</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading profiles...</TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No CNSS profiles found.</TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-semibold">
                      {profile.employee ? `${profile.employee.firstName} ${profile.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell>{profile.cnssNumber}</TableCell>
                    <TableCell><Badge variant="outline">{profile.regime}</Badge></TableCell>
                    <TableCell>{profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={profile.status === "Active" ? "default" : "secondary"}>{profile.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(profile)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
