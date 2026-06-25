import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, LeaveRequest, LeaveType } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Check, X, FileText, Settings, CalendarRange, Trash2 } from "lucide-react";

function getEffectiveBalance(balance: any) {
  return balance.monthlyBreakdown
    ? [...balance.monthlyBreakdown].reverse().find((month: any) => !month.isProjected)?.balance ?? balance.remainingDays
    : balance.remainingDays;
}

export default function Leaves() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");

  // Dialog State: Request Leave
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
        const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setDays(String(diff));
      }
    } else {
      setDays("");
    }
  }, [startDate, endDate]);

  // Dialog State: Create Type
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeCode, setTypeCode] = useState("");
  const [typeName, setTypeName] = useState("");
  const [typeNameAr, setTypeNameAr] = useState("");
  const [typeNameFr, setTypeNameFr] = useState("");
  const [typeDesc, setTypeDesc] = useState("");
  const [typePaid, setTypePaid] = useState("true");
  const [typeLimit, setTypeLimit] = useState("");
  const [typeRequiresApproval, setTypeRequiresApproval] = useState("true");
  const [typeRequiresDocs, setTypeRequiresDocs] = useState("false");
  const [typeMaxDays, setTypeMaxDays] = useState("");
  const [typeCarryForward, setTypeCarryForward] = useState("false");

  // Queries
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => api.hr.leaveRequests.getAll(),
  });

  const { data: types = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => api.hr.leaveTypes.getAll(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: balances = [] } = useQuery({
    queryKey: ["leaveBalances", selectedEmpId],
    queryFn: () => api.hr.leaveBalances.getAll(+selectedEmpId, new Date().getFullYear()),
    enabled: !!selectedEmpId,
  });

  const availableLeaveBalances = balances
    .filter((balance) => balance.leaveType)
    .map((balance) => ({
      ...balance,
      effectiveRemainingDays: getEffectiveBalance(balance),
    }))
    .sort((a, b) => (a.leaveType?.name || "").localeCompare(b.leaveType?.name || ""));
  const currentBalance = availableLeaveBalances.find((b) => b.leaveTypeId === +selectedTypeId);

  useEffect(() => {
    setSelectedTypeId("");
  }, [selectedEmpId]);

  useEffect(() => {
    if (!selectedTypeId) return;

    const stillAvailable = availableLeaveBalances.some((balance) => String(balance.leaveTypeId) === selectedTypeId);
    if (!stillAvailable) {
      setSelectedTypeId("");
    }
  }, [availableLeaveBalances, selectedTypeId]);

  // Mutations
  const createRequestMutation = useMutation({
    mutationFn: api.hr.leaveRequests.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave request submitted successfully");
      setIsRequestOpen(false);
      resetRequestForm();
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.leaveRequests.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave request updated");
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: api.hr.leaveTypes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast.success("Leave type created successfully");
      setIsTypeOpen(false);
      resetTypeForm();
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: api.hr.leaveTypes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast.success("Leave type deleted");
    },
  });

  const resetRequestForm = () => {
    setSelectedEmpId("");
    setSelectedTypeId("");
    setStartDate("");
    setEndDate("");
    setDays("");
    setReason("");
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate({
      employeeId: +selectedEmpId,
      leaveTypeId: +selectedTypeId,
      startDate,
      endDate,
      days: +days,
      reason,
      status: "Pending",
    });
  };

  const resetTypeForm = () => {
    setTypeCode(""); setTypeName(""); setTypeNameAr(""); setTypeNameFr(""); setTypeDesc("");
    setTypePaid("true"); setTypeLimit(""); setTypeRequiresApproval("true");
    setTypeRequiresDocs("false"); setTypeMaxDays(""); setTypeCarryForward("false");
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTypeMutation.mutate({
      code: typeCode,
      name: typeName,
      nameAr: typeNameAr || undefined,
      nameFr: typeNameFr || undefined,
      description: typeDesc || undefined,
      paid: typePaid === "true",
      annualLimit: typeLimit ? +typeLimit : null,
      requiresApproval: typeRequiresApproval === "true",
      requiresSupportingDocuments: typeRequiresDocs === "true",
      maxConsecutiveDays: typeMaxDays ? +typeMaxDays : null,
      carryForwardAllowed: typeCarryForward === "true",
    });
  };

  return (
    <CRMLayout title="HR - Leaves">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaves & Absences</h1>
            <p className="text-muted-foreground">Manage employee time-off, leave requests, and configurations.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 max-w-sm">
            <TabsTrigger value="requests" className="gap-2"><CalendarRange className="h-4 w-4" /> Requests</TabsTrigger>
            <TabsTrigger value="types" className="gap-2"><Settings className="h-4 w-4" /> Config Types</TabsTrigger>
          </TabsList>

          {/* Leave Requests Tab */}
          <TabsContent value="requests" className="mt-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Request Leave</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Leave Request</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Employee *</label>
                      <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                        <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Leave Type *</label>
                      <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                        <SelectTrigger><SelectValue placeholder="Select Leave Type" /></SelectTrigger>
                        <SelectContent>
                          {availableLeaveBalances.map((balance) => (
                            <SelectItem key={balance.id} value={String(balance.leaveTypeId)}>
                              {balance.leaveType?.name || "Unknown Leave Type"} ({balance.effectiveRemainingDays}/{balance.totalDays})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedEmpId && availableLeaveBalances.length === 0 && (
                        <p className="text-xs text-muted-foreground">This employee has no leave balances for the current year.</p>
                      )}
                      {currentBalance && (
                        <p className="text-xs text-muted-foreground">
                          Remaining: {currentBalance.effectiveRemainingDays} / {currentBalance.totalDays} days
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Start Date *</label>
                        <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">End Date *</label>
                        <Input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Days Count *</label>
                      <Input required type="number" step="0.5" value={days} readOnly className="bg-muted" />
                      {currentBalance && days && +days > currentBalance.effectiveRemainingDays && (
                        <p className="text-xs text-rose-500">Exceeds remaining balance ({currentBalance.effectiveRemainingDays} days)</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Reason</label>
                      <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for time off" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsRequestOpen(false)}>Cancel</Button>
                        <Button
                          type="submit"
                          disabled={
                            createRequestMutation.isPending ||
                            !selectedTypeId ||
                            (!!currentBalance && !!days && +days > currentBalance.effectiveRemainingDays)
                          }
                        >
                          Submit
                        </Button>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRequests ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading requests...</TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">No leave requests logged.</TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold">{req.employee?.firstName} {req.employee?.lastName}</TableCell>
                        <TableCell>{req.leaveType?.name}</TableCell>
                        <TableCell>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{req.days}</TableCell>
                        <TableCell>{req.reason || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === "Approved" ? "default" : req.status === "Pending" ? "outline" : "secondary"}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          {req.status === "Pending" && (
                            <>
                              <Button size="icon" variant="ghost" className="hover:bg-green-100" onClick={() => updateRequestMutation.mutate({ id: req.id, data: { status: "Approved" } })}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="hover:bg-red-100" onClick={() => updateRequestMutation.mutate({ id: req.id, data: { status: "Rejected" } })}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Config Types Tab */}
          <TabsContent value="types" className="mt-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <Dialog open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> New Leave Type</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Leave Type</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTypeSubmit} className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Code *</label>
                        <Input required value={typeCode} onChange={(e) => setTypeCode(e.target.value)} placeholder="e.g. AL" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Name (EN) *</label>
                        <Input required value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="Annual Leave" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Name (FR)</label>
                        <Input value={typeNameFr} onChange={(e) => setTypeNameFr(e.target.value)} placeholder="Congé annuel" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Name (AR)</label>
                        <Input value={typeNameAr} onChange={(e) => setTypeNameAr(e.target.value)} placeholder="إجازة سنوية" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Description</label>
                        <Input value={typeDesc} onChange={(e) => setTypeDesc(e.target.value)} placeholder="Brief description" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Paid Status *</label>
                        <Select value={typePaid} onValueChange={setTypePaid}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Paid Leave</SelectItem>
                            <SelectItem value="false">Unpaid Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Requires Approval</label>
                        <Select value={typeRequiresApproval} onValueChange={setTypeRequiresApproval}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Annual Limit (days)</label>
                        <Input type="number" value={typeLimit} onChange={(e) => setTypeLimit(e.target.value)} placeholder="Optional" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Max Consecutive Days</label>
                        <Input type="number" value={typeMaxDays} onChange={(e) => setTypeMaxDays(e.target.value)} placeholder="Optional" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Requires Documents</label>
                        <Select value={typeRequiresDocs} onValueChange={setTypeRequiresDocs}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Carry Forward Allowed</label>
                        <Select value={typeCarryForward} onValueChange={setTypeCarryForward}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => { setIsTypeOpen(false); resetTypeForm(); }}>Cancel</Button>
                      <Button type="submit" disabled={createTypeMutation.isPending}>Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Annual Limit</TableHead>
                    <TableHead>Max Days</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Carry Fwd</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTypes ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">Loading types...</TableCell>
                    </TableRow>
                  ) : types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">No leave types defined.</TableCell>
                    </TableRow>
                  ) : (
                    types.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-semibold">{t.code}</TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>
                          <Badge variant={t.paid ? "default" : "secondary"}>
                            {t.paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.annualLimit ? `${t.annualLimit} d` : "—"}</TableCell>
                        <TableCell>{t.maxConsecutiveDays ? `${t.maxConsecutiveDays} d` : "—"}</TableCell>
                        <TableCell>{t.requiresApproval ? "Yes" : "No"}</TableCell>
                        <TableCell>{t.carryForwardAllowed ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete leave type?")) deleteTypeMutation.mutate(t.id); }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
