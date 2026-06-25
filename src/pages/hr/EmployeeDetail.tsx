import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api, Employee, Contract, SalaryComponent } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, FileText, Settings, User, ShieldAlert, CreditCard, Trash, CheckCircle2, CircleAlert } from "lucide-react";

const NON_ASSIGNABLE_COMPONENT_CODES = new Set([
  "BASIC_SALARY",
  "GROSS_SALARY",
  "BASE_SALARY",
  "CNSS_EMPLOYEE",
  "CNSS",
  "INCOME_TAX",
  "IRPP",
  "CNSS_EMPLOYER",
  "TRAINING_TAX",
  "TFP",
  "FOPROLOS",
  "WORK_ACCIDENT",
  "ACCIDENT_INSURANCE",
]);

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const employeeId = id ? +id : 0;

  const [activeTab, setActiveTab] = useState("profile");

  // Queries
  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => api.hr.employees.getOne(employeeId),
    enabled: !!employeeId,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts", employeeId],
    queryFn: () => api.hr.contracts.getAll(employeeId),
    enabled: !!employeeId,
  });

  const { data: payrollProfile } = useQuery({
    queryKey: ["payrollProfile", employeeId],
    queryFn: () => api.payroll.profiles.getOne(employeeId),
    enabled: !!employeeId,
  });

  const { data: employeeComponents = [] } = useQuery({
    queryKey: ["employeeComponents", employeeId],
    queryFn: () => api.payroll.employeeComponents.getAll(employeeId),
    enabled: !!employeeId,
  });

  const { data: allComponents = [] } = useQuery({
    queryKey: ["components"],
    queryFn: () => api.payroll.components.getAll(),
  });

  // Dialog State: Contract Form
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [contractNumber, setContractNumber] = useState("");
  const [contractType, setContractType] = useState("CDI");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [probationEndDate, setProbationEndDate] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [workingHoursPerWeek, setWorkingHoursPerWeek] = useState(40);
  const [contractStatus, setContractStatus] = useState("Active");

  // Dialog State: Component Form
  const [isComponentOpen, setIsComponentOpen] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState("");
  const [compAmount, setCompAmount] = useState("");
  const [compEffectiveDate, setCompEffectiveDate] = useState("");

  // Form State: Payroll Profile
  const [socialRegime, setSocialRegime] = useState("CNSS");
  const [cnssNumber, setCnssNumber] = useState("");
  const [cnrpsNumber, setCnrpsNumber] = useState("");
  const [taxStatus, setTaxStatus] = useState("Single");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [rib, setRib] = useState("");

  const onboardingResult = (location.state as any)?.onboardingResult as
    | {
        mode: "created" | "updated";
        steps: {
          employee: boolean;
          contract: boolean;
          payroll: boolean;
          cnss: boolean;
          irpp: boolean;
          components: boolean;
          attendance: boolean;
          documents: boolean;
        };
        missingItems: string[];
        readinessStatus: string;
      }
    | undefined;

  // Load profile values on query success
  useState(() => {
    if (payrollProfile) {
      setSocialRegime(payrollProfile.socialRegime);
      setCnssNumber(payrollProfile.cnssNumber || "");
      setCnrpsNumber(payrollProfile.cnrpsNumber || "");
      setTaxStatus(payrollProfile.taxStatus || "Single");
      setPaymentMethod(payrollProfile.paymentMethod);
      setBankName(payrollProfile.bankName || "");
      setBankAccount(payrollProfile.bankAccount || "");
      setRib(payrollProfile.rib || "");
    }
  });

  // Mutations
  const createContractMutation = useMutation({
    mutationFn: api.hr.contracts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] });
      toast.success("Contract created successfully");
      setIsContractOpen(false);
      resetContractForm();
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: api.hr.contracts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] });
      toast.success("Contract deleted successfully");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.payroll.profiles.createOrUpdate(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollProfile", employeeId] });
      toast.success("Payroll profile updated successfully");
    },
  });

  const createEmpCompMutation = useMutation({
    mutationFn: api.payroll.employeeComponents.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeComponents", employeeId] });
      toast.success("Component assigned successfully");
      setIsComponentOpen(false);
      setCompAmount("");
      setSelectedCompId("");
      setCompEffectiveDate("");
    },
  });

  const deleteEmpCompMutation = useMutation({
    mutationFn: api.payroll.employeeComponents.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeComponents", employeeId] });
      toast.success("Component unassigned successfully");
    },
  });

  const resetContractForm = () => {
    setContractNumber("");
    setContractType("CDI");
    setStartDate("");
    setEndDate("");
    setProbationEndDate("");
    setBaseSalary("");
    setWorkingHoursPerWeek(40);
    setContractStatus("Active");
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContractMutation.mutate({
      employeeId,
      contractNumber,
      contractType,
      startDate,
      endDate: endDate || null,
      probationEndDate: probationEndDate || null,
      baseSalary: +baseSalary,
      workingHoursPerWeek: +workingHoursPerWeek,
      status: contractStatus,
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      socialRegime,
      cnssNumber,
      cnrpsNumber,
      taxStatus,
      paymentMethod,
      bankName,
      bankAccount,
      rib,
      active: true,
    });
  };

  const handleComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmpCompMutation.mutate({
      employeeId,
      componentId: +selectedCompId,
      amount: +compAmount,
      effectiveDate: compEffectiveDate,
      active: true,
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading employee profile...</div>;
  if (!employee) return <div className="p-8 text-center text-red-500">Employee not found.</div>;

  return (
    <CRMLayout title={`Employee - ${employee.firstName} ${employee.lastName}`}>
      <div className="flex flex-col gap-6 p-6">
        {onboardingResult && (
          <Card className="border-emerald-500/30 bg-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                {onboardingResult.mode === "created" ? "Employee onboarding completed" : "Employee onboarding updated"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-5">
                {[
                  { key: "employee", label: "Employee" },
                  { key: "contract", label: "Contract" },
                  { key: "payroll", label: "Payroll" },
                  { key: "cnss", label: "CNSS" },
                  { key: "irpp", label: "IRPP" },
                  { key: "components", label: "Components" },
                  { key: "attendance", label: "Shift & Leave" },
                  { key: "documents", label: "Documents" },
                ].map((item) => {
                  const done = onboardingResult.steps[item.key as keyof typeof onboardingResult.steps];
                  return (
                    <div key={item.key} className={`rounded-2xl border p-4 ${done ? "border-emerald-500/30 bg-background/70" : "border-amber-500/30 bg-amber-500/10"}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold">{done ? "Configured" : "Pending"}</p>
                    </div>
                  );
                })}
              </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Readiness Status</p>
                    <p className="mt-1 text-base font-semibold">{onboardingResult.readinessStatus}</p>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <CircleAlert className="h-4 w-4 text-amber-600" />
                    <p className="font-semibold">Remaining onboarding checklist</p>
                </div>
                {onboardingResult.missingItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No remaining checklist items.</p>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {onboardingResult.missingItems.map((item) => (
                      <div key={item} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/hr/employees")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{employee.firstName} {employee.lastName}</h1>
            <p className="text-muted-foreground">ID: {employee.employeeNumber} | {employee.position?.title} ({employee.department?.name})</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2"><FileText className="h-4 w-4" /> Contracts</TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2"><Settings className="h-4 w-4" /> Payroll Profile</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CIN (Card ID)</p>
                  <p className="text-lg font-semibold">{employee.cin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-lg font-semibold">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Place of Birth</p>
                  <p className="text-lg font-semibold">{employee.placeOfBirth || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-lg font-semibold">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-lg font-semibold">{employee.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender & Nationality</p>
                  <p className="text-lg font-semibold">{employee.gender} | {employee.nationality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Readiness Status</p>
                  <p className="text-lg font-semibold">{employee.readinessStatus || "Draft"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marital Status & Children</p>
                  <p className="text-lg font-semibold">{employee.maritalStatus} ({employee.childrenCount} children)</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Full Address</p>
                  <p className="text-lg font-semibold">
                    {employee.address || "-"}, {employee.city || "-"} {employee.postalCode || ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Employment Agreements</h2>
              <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> New Contract</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Employment Contract</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleContractSubmit} className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-sm font-semibold">Contract Number *</label>
                      <Input required value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} placeholder="CONT-2026-001" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Contract Type *</label>
                      <Select value={contractType} onValueChange={setContractType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CDI">CDI (Permanent)</SelectItem>
                          <SelectItem value="CDD">CDD (Temporary)</SelectItem>
                          <SelectItem value="SIVP">SIVP</SelectItem>
                          <SelectItem value="Stage">Internship</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Part Time">Part Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Base Salary (Monthly TND) *</label>
                      <Input required type="number" step="0.001" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Start Date *</label>
                      <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">End Date</label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Probation End Date</label>
                      <Input type="date" value={probationEndDate} onChange={(e) => setProbationEndDate(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Working Hours / Week *</label>
                      <Input type="number" value={workingHoursPerWeek} onChange={(e) => setWorkingHoursPerWeek(+e.target.value)} />
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsContractOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createContractMutation.isPending}>Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Base Salary (TND)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">No contracts registered.</TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold">{c.contractNumber}</TableCell>
                        <TableCell>{c.contractType}</TableCell>
                        <TableCell>{Number(c.baseSalary).toFixed(3)}</TableCell>
                        <TableCell>
                          {new Date(c.startDate).toLocaleDateString()} to {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Indefinite"}
                        </TableCell>
                        <TableCell>{c.status}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete contract?")) deleteContractMutation.mutate(c.id); }}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Payroll Profile Tab */}
          <TabsContent value="payroll" className="mt-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Profile Config */}
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle>Social Regime & Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Social Regime *</label>
                        <Select value={socialRegime} onValueChange={(val) => {
                          setSocialRegime(val);
                          if (payrollProfile) {
                            setSocialRegime(val);
                          }
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CNSS">CNSS</SelectItem>
                            <SelectItem value="CNRPS">CNRPS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">CNSS Number</label>
                        <Input value={cnssNumber} onChange={(e) => setCnssNumber(e.target.value)} placeholder="e.g. 12345678-90" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">CNRPS Number</label>
                        <Input value={cnrpsNumber} onChange={(e) => setCnrpsNumber(e.target.value)} placeholder="e.g. 987654" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Payment Method *</label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Bank Name</label>
                        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="BIAT, Attijari..." />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Bank Account</label>
                        <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Account Number" />
                      </div>
                      <div className="col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-semibold">RIB (24 digits)</label>
                        <Input value={rib} onChange={(e) => setRib(e.target.value)} placeholder="012345678901234567890123" maxLength={24} />
                      </div>
                    </div>
                    <Button type="submit" className="self-end mt-4" disabled={updateProfileMutation.isPending}>
                      Save Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Salary Components Assignments */}
              <Card className="glass-morphism">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Assigned Allowances & Deductions</CardTitle>
                  <Dialog open={isComponentOpen} onOpenChange={setIsComponentOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Assign</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Salary Component</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleComponentSubmit} className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Component *</label>
                          <Select value={selectedCompId} onValueChange={setSelectedCompId}>
                            <SelectTrigger><SelectValue placeholder="Select Component" /></SelectTrigger>
                            <SelectContent>
                              {allComponents.filter(c => !NON_ASSIGNABLE_COMPONENT_CODES.has(c.code)).map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.type})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Amount (Monthly TND) *</label>
                          <Input required type="number" step="0.001" value={compAmount} onChange={(e) => setCompAmount(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Effective Date *</label>
                          <Input required type="date" value={compEffectiveDate} onChange={(e) => setCompEffectiveDate(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" variant="outline" onClick={() => setIsComponentOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={createEmpCompMutation.isPending}>Save</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeComponents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">No custom allowances or deductions assigned.</TableCell>
                        </TableRow>
                      ) : (
                        employeeComponents.map((ec) => (
                          <TableRow key={ec.id}>
                            <TableCell className="font-semibold">{ec.component?.name}</TableCell>
                            <TableCell>{ec.component?.type}</TableCell>
                            <TableCell>{Number(ec.amount).toFixed(3)} TND</TableCell>
                            <TableCell className="text-right">
                              <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remove component assignment?")) deleteEmpCompMutation.mutate(ec.id); }}>
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
