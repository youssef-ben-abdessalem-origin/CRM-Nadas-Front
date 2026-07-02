import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api, Contract } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Archive,
  CheckCircle2,
  Eye,
  FileText,
  Plus,
  Printer,
  RefreshCcw,
  ShieldX,
} from "lucide-react";

const CONTRACT_TYPES = ["CDI", "CDD", "SIVP", "Stage", "Freelance", "Part Time"];

type NewContractForm = {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate: string;
  probationEndDate: string;
  baseSalary: string;
  workingHoursPerWeek: string;
  status: string;
};

type TerminateForm = {
  endDate: string;
  status: string;
};

type RenewForm = {
  contractType: string;
  startDate: string;
  endDate: string;
  probationEndDate: string;
  baseSalary: string;
  workingHoursPerWeek: string;
};

const emptyNewContractForm: NewContractForm = {
  employeeId: "",
  contractType: "CDI",
  startDate: "",
  endDate: "",
  probationEndDate: "",
  baseSalary: "",
  workingHoursPerWeek: "40",
  status: "Draft",
};

const emptyTerminateForm: TerminateForm = {
  endDate: new Date().toISOString().split("T")[0],
  status: "Ended",
};

const emptyRenewForm: RenewForm = {
  contractType: "CDI",
  startDate: "",
  endDate: "",
  probationEndDate: "",
  baseSalary: "",
  workingHoursPerWeek: "40",
};

export default function Contracts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [newContractForm, setNewContractForm] = useState<NewContractForm>(emptyNewContractForm);
  const [terminateForm, setTerminateForm] = useState<TerminateForm>(emptyTerminateForm);
  const [renewForm, setRenewForm] = useState<RenewForm>(emptyRenewForm);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", employeeFilter],
    queryFn: () =>
      api.hr.contracts.getAll(
        employeeFilter !== "all" ? Number(employeeFilter) : undefined,
      ),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const employeeMap = useMemo(() => {
    return new Map(employees.map((employee: any) => [employee.id, employee]));
  }, [employees]);

  const invalidateContracts = () =>
    queryClient.invalidateQueries({ queryKey: ["contracts"] });

  const createMutation = useMutation({
    mutationFn: api.hr.contracts.create,
    onSuccess: () => {
      invalidateContracts();
      toast.success(t("hr.statusUpdates.contractCreated"));
      setIsCreateOpen(false);
      setNewContractForm(emptyNewContractForm);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setActiveMutation = useMutation({
    mutationFn: api.hr.contracts.setActive,
    onSuccess: () => {
      invalidateContracts();
      toast.success(t("hr.statusUpdates.contractSetActive"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: api.hr.contracts.archive,
    onSuccess: () => {
      invalidateContracts();
      toast.success(t("hr.statusUpdates.contractArchived"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const terminateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TerminateForm }) =>
      api.hr.contracts.terminate(id, data),
    onSuccess: () => {
      invalidateContracts();
      toast.success(t("hr.statusUpdates.contractEnded"));
      setIsTerminateOpen(false);
      setTerminateForm(emptyTerminateForm);
      setSelectedContract(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const renewMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RenewForm }) =>
      api.hr.contracts.renew(id, {
        contractType: data.contractType,
        startDate: data.startDate,
        endDate: data.endDate || null,
        probationEndDate: data.probationEndDate || null,
        baseSalary: Number(data.baseSalary),
        workingHoursPerWeek: Number(data.workingHoursPerWeek),
      }),
    onSuccess: () => {
      invalidateContracts();
      toast.success(t("hr.statusUpdates.renewalDraftCreated"));
      setIsRenewOpen(false);
      setRenewForm(emptyRenewForm);
      setSelectedContract(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetCreateForm = () => {
    setNewContractForm(emptyNewContractForm);
    setIsCreateOpen(false);
  };

  const openView = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewOpen(true);
  };

  const openTerminate = (contract: Contract) => {
    setSelectedContract(contract);
    setTerminateForm({
      endDate: new Date().toISOString().split("T")[0],
      status: "Ended",
    });
    setIsTerminateOpen(true);
  };

  const openRenew = (contract: Contract) => {
    setSelectedContract(contract);
    setRenewForm({
      contractType: contract.contractType,
      startDate: contract.endDate
        ? contract.endDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: "",
      probationEndDate: "",
      baseSalary: String(contract.baseSalary ?? ""),
      workingHoursPerWeek: String(contract.workingHoursPerWeek ?? 40),
    });
    setIsRenewOpen(true);
  };

  const openPrintablePreview = async (contractId: number) => {
    const html = await api.hr.contracts.getPrintableHtml(contractId);
    const popup = window.open("", "_blank", "width=1100,height=900");

    if (!popup) {
      toast.error(t("hr.statusUpdates.popupBlocked"));
      return;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate({
      employeeId: Number(newContractForm.employeeId),
      contractType: newContractForm.contractType,
      startDate: newContractForm.startDate,
      endDate: newContractForm.endDate || null,
      probationEndDate: newContractForm.probationEndDate || null,
      baseSalary: Number(newContractForm.baseSalary),
      workingHoursPerWeek: Number(newContractForm.workingHoursPerWeek),
      status: newContractForm.status,
    });
  };

  const infoRow = (label: string, value: string) => (
    <div className="rounded-xl border border-border/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value || "-"}</p>
    </div>
  );

  return (
    <CRMLayout title={t("hr.contracts.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.contracts.title")}</h1>
            <p className="text-muted-foreground">
              {t("hr.contracts.description")}
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => (!open ? resetCreateForm() : setIsCreateOpen(open))}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("hr.contracts.actions.newContract")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("hr.contracts.actions.createContract")}</DialogTitle>
                <DialogDescription>
                  {t("hr.contracts.createDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.contractNumber")}</Label>
                  <Input
                    readOnly
                    disabled
                    value={t("hr.contracts.placeholders.autoGenerated")}
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.employee")}</Label>
                  <Select
                    value={newContractForm.employeeId}
                    onValueChange={(value) =>
                      setNewContractForm((prev) => ({ ...prev, employeeId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("hr.contracts.placeholders.selectEmployee")} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee: any) => (
                        <SelectItem key={employee.id} value={String(employee.id)}>
                          {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.contractType")}</Label>
                  <Select
                    value={newContractForm.contractType}
                    onValueChange={(value) =>
                      setNewContractForm((prev) => ({ ...prev, contractType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.baseSalary")}</Label>
                  <Input
                    required
                    type="number"
                    min={0}
                    step={0.001}
                    value={newContractForm.baseSalary}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        baseSalary: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.startDate")}</Label>
                  <Input
                    required
                    type="date"
                    value={newContractForm.startDate}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.endDate")}</Label>
                  <Input
                    type="date"
                    value={newContractForm.endDate}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.probationEnd")}</Label>
                  <Input
                    type="date"
                    value={newContractForm.probationEndDate}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        probationEndDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.hoursPerWeek")}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={newContractForm.workingHoursPerWeek}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        workingHoursPerWeek: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <Label>{t("hr.contracts.forms.status")}</Label>
                  <Select
                    value={newContractForm.status}
                    onValueChange={(value) =>
                      setNewContractForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">{t("hr.contracts.options.draft")}</SelectItem>
                      <SelectItem value="Active">{t("hr.contracts.options.active")}</SelectItem>
                      <SelectItem value="Suspended">{t("hr.contracts.options.suspended")}</SelectItem>
                      <SelectItem value="Inactive">{t("hr.contracts.options.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={resetCreateForm}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t("common.actions.saving") : t("common.save")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-morphism">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-56">
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("hr.contracts.placeholders.filterEmployee")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hr.contracts.options.allEmployees")}</SelectItem>
                  {employees.map((employee: any) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("hr.contracts.table.contractNumber")}</TableHead>
                <TableHead>{t("hr.contracts.table.employee")}</TableHead>
                <TableHead>{t("hr.contracts.table.type")}</TableHead>
                <TableHead>{t("hr.contracts.table.baseSalary")}</TableHead>
                <TableHead>{t("hr.contracts.table.startDate")}</TableHead>
                <TableHead>{t("hr.contracts.table.endDate")}</TableHead>
                <TableHead>{t("hr.contracts.table.status")}</TableHead>
                <TableHead className="text-right">{t("hr.contracts.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {t("hr.contracts.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract: Contract) => {
                  const employee =
                    contract.employee || employeeMap.get(contract.employeeId);

                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-semibold">
                        {contract.contractNumber}
                      </TableCell>
                      <TableCell>
                        {employee
                          ? `${employee.firstName} ${employee.lastName}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contract.contractType}</Badge>
                      </TableCell>
                      <TableCell>
                        {Number(contract.baseSalary).toLocaleString()} TND
                      </TableCell>
                      <TableCell>
                        {contract.startDate
                          ? new Date(contract.startDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString()
                          : t("hr.contracts.indefinite")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contract.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openView(contract)}
                          >
                            <Eye className="h-4 w-4" />
                            {t("common.actions.view", "View")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openPrintablePreview(contract.id)}
                          >
                            <Printer className="h-4 w-4" />
                            {t("hr.contracts.actions.downloadPrint")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={contract.status === "Ended" || contract.status === "Archived"}
                            onClick={() => openTerminate(contract)}
                          >
                            <ShieldX className="h-4 w-4" />
                            {t("hr.contracts.actions.terminate")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openRenew(contract)}
                          >
                            <RefreshCcw className="h-4 w-4" />
                            {t("hr.contracts.actions.renew")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={contract.status === "Active"}
                            onClick={() => setActiveMutation.mutate(contract.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {t("hr.contracts.actions.setActive")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={contract.status === "Archived"}
                            onClick={() => archiveMutation.mutate(contract.id)}
                          >
                            <Archive className="h-4 w-4" />
                            {t("hr.contracts.actions.archive")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t("hr.contracts.dialog.details")}</DialogTitle>
              <DialogDescription>
                {t("hr.contracts.dialog.detailsDescription")}
              </DialogDescription>
            </DialogHeader>
            {selectedContract ? (
              <div className="grid gap-4 md:grid-cols-2">
                {infoRow(t("hr.contracts.view.contractNumber"), selectedContract.contractNumber)}
                {infoRow(
                  t("hr.contracts.view.employee"),
                  selectedContract.employee
                    ? `${selectedContract.employee.firstName} ${selectedContract.employee.lastName}`
                    : selectedContract.employeeId.toString(),
                )}
                {infoRow(t("hr.contracts.view.contractType"), selectedContract.contractType)}
                {infoRow(t("hr.contracts.view.status"), selectedContract.status)}
                {infoRow(
                  t("hr.contracts.view.startDate"),
                  selectedContract.startDate
                    ? new Date(selectedContract.startDate).toLocaleDateString()
                    : "-",
                )}
                {infoRow(
                  t("hr.contracts.view.endDate"),
                  selectedContract.endDate
                    ? new Date(selectedContract.endDate).toLocaleDateString()
                    : t("hr.contracts.indefinite"),
                )}
                {infoRow(
                  t("hr.contracts.view.probationEnd"),
                  selectedContract.probationEndDate
                    ? new Date(selectedContract.probationEndDate).toLocaleDateString()
                    : "-",
                )}
                {infoRow(
                  t("hr.contracts.view.baseSalary"),
                  `${Number(selectedContract.baseSalary).toFixed(3)} TND`,
                )}
                {infoRow(
                  t("hr.contracts.view.workingHours"),
                  `${selectedContract.workingHoursPerWeek} h / week`,
                )}
                {infoRow(
                  t("hr.contracts.view.createdAt"),
                  new Date(selectedContract.createdAt).toLocaleString(),
                )}
              </div>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsViewOpen(false)}
              >
                {t("common.actions.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTerminateOpen} onOpenChange={setIsTerminateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("hr.contracts.dialog.terminate")}</DialogTitle>
              <DialogDescription>
                {t("hr.contracts.dialog.terminateDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedContract) return;
                terminateMutation.mutate({
                  id: selectedContract.id,
                  data: terminateForm,
                });
              }}
              className="space-y-4"
            >
                <div className="space-y-2">
                  <Label>{t("hr.contracts.dialog.endDate")}</Label>
                  <Input
                    required
                    type="date"
                    value={terminateForm.endDate}
                    onChange={(e) =>
                      setTerminateForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("hr.contracts.dialog.status")}</Label>
                  <Select
                    value={terminateForm.status}
                    onValueChange={(value) =>
                      setTerminateForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ended">{t("hr.contracts.options.ended")}</SelectItem>
                      <SelectItem value="Terminated">{t("hr.contracts.options.terminated")}</SelectItem>
                      <SelectItem value="Inactive">{t("hr.contracts.options.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTerminateOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={terminateMutation.isPending}>
                    {terminateMutation.isPending ? t("common.actions.saving") : t("hr.contracts.actions.confirmEnd")}
                  </Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("hr.contracts.dialog.renew")}</DialogTitle>
              <DialogDescription>
                {t("hr.contracts.dialog.renewDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedContract) return;
                renewMutation.mutate({
                  id: selectedContract.id,
                  data: renewForm,
                });
              }}
              className="grid grid-cols-2 gap-4"
            >
                <div className="flex flex-col gap-2 col-span-2">
                  <Label>{t("hr.contracts.forms.contractType")}</Label>
                  <Select
                    value={renewForm.contractType}
                    onValueChange={(value) =>
                      setRenewForm((prev) => ({ ...prev, contractType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.dialog.newStartDate")}</Label>
                  <Input
                    required
                    type="date"
                    value={renewForm.startDate}
                    onChange={(e) =>
                      setRenewForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.dialog.newEndDate")}</Label>
                  <Input
                    type="date"
                    value={renewForm.endDate}
                    onChange={(e) =>
                      setRenewForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.probationEnd")}</Label>
                  <Input
                    type="date"
                    value={renewForm.probationEndDate}
                    onChange={(e) =>
                      setRenewForm((prev) => ({
                        ...prev,
                        probationEndDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("hr.contracts.forms.baseSalary")}</Label>
                  <Input
                    required
                    type="number"
                    step={0.001}
                    min={0}
                    value={renewForm.baseSalary}
                    onChange={(e) =>
                      setRenewForm((prev) => ({ ...prev, baseSalary: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <Label>{t("hr.contracts.forms.hoursPerWeek")}</Label>
                  <Input
                    required
                    type="number"
                    min={1}
                    max={168}
                    value={renewForm.workingHoursPerWeek}
                    onChange={(e) =>
                      setRenewForm((prev) => ({
                        ...prev,
                        workingHoursPerWeek: e.target.value,
                      }))
                    }
                  />
                </div>
                <DialogFooter className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRenewOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={renewMutation.isPending}>
                    {renewMutation.isPending ? t("common.actions.creating") : t("hr.contracts.actions.createRenewalDraft")}
                  </Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
