import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      toast.success("Contract created successfully");
      setIsCreateOpen(false);
      setNewContractForm(emptyNewContractForm);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setActiveMutation = useMutation({
    mutationFn: api.hr.contracts.setActive,
    onSuccess: () => {
      invalidateContracts();
      toast.success("Contract set as active");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: api.hr.contracts.archive,
    onSuccess: () => {
      invalidateContracts();
      toast.success("Contract archived");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const terminateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TerminateForm }) =>
      api.hr.contracts.terminate(id, data),
    onSuccess: () => {
      invalidateContracts();
      toast.success("Contract ended");
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
      toast.success("Renewal draft created");
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
      toast.error("Popup blocked. Please allow popups to preview the contract.");
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
    <CRMLayout title="HR - Contracts">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
            <p className="text-muted-foreground">
              Manage contract lifecycle with view, print, activation, termination,
              renewal, and archive actions.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => (!open ? resetCreateForm() : setIsCreateOpen(open))}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Contract</DialogTitle>
                <DialogDescription>
                  Add a new contract record. Renewals and endings are handled from the table actions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label>Contract #</Label>
                  <Input
                    readOnly
                    disabled
                    value="Auto-generated by the system"
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Employee *</Label>
                  <Select
                    value={newContractForm.employeeId}
                    onValueChange={(value) =>
                      setNewContractForm((prev) => ({ ...prev, employeeId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
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
                  <Label>Contract Type *</Label>
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
                  <Label>Base Salary *</Label>
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
                  <Label>Start Date *</Label>
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
                  <Label>End Date</Label>
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
                  <Label>Probation End</Label>
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
                  <Label>Hours / Week</Label>
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
                  <Label>Status *</Label>
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
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={resetCreateForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving..." : "Save"}
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
                  <SelectValue placeholder="Filter Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
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
                <TableHead>Contract #</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading contracts...
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No contracts found.
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
                          : "Indefinite"}
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
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openPrintablePreview(contract.id)}
                          >
                            <Printer className="h-4 w-4" />
                            Download/Print
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={contract.status === "Ended" || contract.status === "Archived"}
                            onClick={() => openTerminate(contract)}
                          >
                            <ShieldX className="h-4 w-4" />
                            Terminate/End
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openRenew(contract)}
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Renew
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={contract.status === "Active"}
                            onClick={() => setActiveMutation.mutate(contract.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Set as Active
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={contract.status === "Archived"}
                            onClick={() => archiveMutation.mutate(contract.id)}
                          >
                            <Archive className="h-4 w-4" />
                            Archive
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
              <DialogTitle>Contract Details</DialogTitle>
              <DialogDescription>
                Review the full contract record before printing, ending, or renewing it.
              </DialogDescription>
            </DialogHeader>
            {selectedContract ? (
              <div className="grid gap-4 md:grid-cols-2">
                {infoRow("Contract Number", selectedContract.contractNumber)}
                {infoRow(
                  "Employee",
                  selectedContract.employee
                    ? `${selectedContract.employee.firstName} ${selectedContract.employee.lastName}`
                    : selectedContract.employeeId.toString(),
                )}
                {infoRow("Contract Type", selectedContract.contractType)}
                {infoRow("Status", selectedContract.status)}
                {infoRow(
                  "Start Date",
                  selectedContract.startDate
                    ? new Date(selectedContract.startDate).toLocaleDateString()
                    : "-",
                )}
                {infoRow(
                  "End Date",
                  selectedContract.endDate
                    ? new Date(selectedContract.endDate).toLocaleDateString()
                    : "Indefinite",
                )}
                {infoRow(
                  "Probation End",
                  selectedContract.probationEndDate
                    ? new Date(selectedContract.probationEndDate).toLocaleDateString()
                    : "-",
                )}
                {infoRow(
                  "Base Salary",
                  `${Number(selectedContract.baseSalary).toFixed(3)} TND`,
                )}
                {infoRow(
                  "Working Hours",
                  `${selectedContract.workingHoursPerWeek} h / week`,
                )}
                {infoRow(
                  "Created At",
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
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTerminateOpen} onOpenChange={setIsTerminateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Terminate / End Contract</DialogTitle>
              <DialogDescription>
                End the selected contract without deleting its history.
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
                <Label>End Date *</Label>
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
                <Label>Status *</Label>
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
                    <SelectItem value="Ended">Ended</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTerminateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={terminateMutation.isPending}>
                  {terminateMutation.isPending ? "Saving..." : "Confirm End"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Renew Contract</DialogTitle>
              <DialogDescription>
                Create a renewal draft from the selected contract. You can activate it later.
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
                <Label>Contract Type *</Label>
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
                <Label>New Start Date *</Label>
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
                <Label>New End Date</Label>
                <Input
                  type="date"
                  value={renewForm.endDate}
                  onChange={(e) =>
                    setRenewForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Probation End</Label>
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
                <Label>Base Salary *</Label>
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
                <Label>Hours / Week *</Label>
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
                  Cancel
                </Button>
                <Button type="submit" disabled={renewMutation.isPending}>
                  {renewMutation.isPending ? "Creating..." : "Create Renewal Draft"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
