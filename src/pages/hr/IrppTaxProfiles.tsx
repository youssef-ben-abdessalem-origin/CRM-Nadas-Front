import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, IrppTaxProfile } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function IrppTaxProfiles() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IrppTaxProfile | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [childrenCount, setChildrenCount] = useState(0);
  const [disabledDependents, setDisabledDependents] = useState(0);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["irppTaxProfiles"],
    queryFn: api.hr.irppTaxProfiles.getAll,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: any }) =>
      api.hr.irppTaxProfiles.createOrUpdate(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["irppTaxProfiles"] });
      toast.success(t("hr.statusUpdates.irppTaxProfileSaved"));
      setIsOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setEditingProfile(null);
    setEmployeeId("");
    setMaritalStatus("Single");
    setChildrenCount(0);
    setDisabledDependents(0);
  };

  const handleEdit = (profile: IrppTaxProfile) => {
    setEditingProfile(profile);
    setEmployeeId(String(profile.employeeId));
    setMaritalStatus(profile.maritalStatus);
    setChildrenCount(profile.childrenCount);
    setDisabledDependents(profile.disabledDependents);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      maritalStatus,
      childrenCount: +childrenCount,
      disabledDependents: +disabledDependents,
    };

    if (editingProfile) {
      createMutation.mutate({ employeeId: editingProfile.employeeId, data: payload });
    } else {
      createMutation.mutate({ employeeId: +employeeId, data: payload });
    }
  };

  return (
    <CRMLayout title={t("hr.irppTaxProfiles.pageTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.irppTaxProfiles.title")}</h1>
            <p className="text-muted-foreground">{t("hr.irppTaxProfiles.description")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Receipt className="h-4 w-4" /> {t("hr.irppTaxProfiles.actions.create")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingProfile ? t("hr.irppTaxProfiles.dialog.edit") : t("hr.irppTaxProfiles.dialog.create")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                {!editingProfile && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.irppTaxProfiles.forms.employee")} *</label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                      <SelectTrigger><SelectValue placeholder={t("hr.irppTaxProfiles.placeholders.selectEmployee")} /></SelectTrigger>
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
                  <label className="text-sm font-semibold">{t("hr.irppTaxProfiles.forms.maritalStatus")} *</label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">{t("hr.irppTaxProfiles.options.single")}</SelectItem>
                      <SelectItem value="Married">{t("hr.irppTaxProfiles.options.married")}</SelectItem>
                      <SelectItem value="Divorced">{t("hr.irppTaxProfiles.options.divorced")}</SelectItem>
                      <SelectItem value="Widowed">{t("hr.irppTaxProfiles.options.widowed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.irppTaxProfiles.forms.children")}</label>
                    <Input type="number" min={0} value={childrenCount} onChange={(e) => setChildrenCount(+e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.irppTaxProfiles.forms.disabledDependents")}</label>
                    <Input type="number" min={0} value={disabledDependents} onChange={(e) => setDisabledDependents(+e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t("hr.irppTaxProfiles.forms.taxExemptions")}</label>
                  <Input type="number" value={(maritalStatus === "Married" ? 300 : 0) + (childrenCount * 100) + (disabledDependents * 100)} readOnly />
                  <p className="text-xs text-muted-foreground">{t("hr.irppTaxProfiles.hints.autoCalculated")}: {maritalStatus === "Married" ? `300 (${t("hr.irppTaxProfiles.options.married").toLowerCase()})` : `0 (${t("hr.irppTaxProfiles.options.single").toLowerCase()})`} + {childrenCount} × 100 ({t("hr.irppTaxProfiles.forms.children").toLowerCase()}) + {disabledDependents} × 100 ({t("hr.irppTaxProfiles.forms.disabledDependents").toLowerCase()})</p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={createMutation.isPending}>{t("common.save")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("hr.irppTaxProfiles.table.employee")}</TableHead>
                <TableHead>{t("hr.irppTaxProfiles.table.maritalStatus")}</TableHead>
                <TableHead>{t("hr.irppTaxProfiles.table.children")}</TableHead>
                <TableHead>{t("hr.irppTaxProfiles.table.disabled")}</TableHead>
                <TableHead>{t("hr.irppTaxProfiles.table.exemptions")}</TableHead>
                <TableHead className="text-right">{t("hr.irppTaxProfiles.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">{t("hr.irppTaxProfiles.loading")}</TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">{t("hr.irppTaxProfiles.empty")}</TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-semibold">
                      {profile.employee ? `${profile.employee.firstName} ${profile.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell>{profile.maritalStatus}</TableCell>
                    <TableCell>{profile.childrenCount}</TableCell>
                    <TableCell>{profile.disabledDependents}</TableCell>
                    <TableCell>{profile.taxExemptions} TND</TableCell>
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
