import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ChevronDown, ChevronRight, Edit, Plus, RefreshCw, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, Employee, LeaveBalance } from "@/lib/api";
import { useTranslation } from "react-i18next";

type EmployeeBalanceGroup = {
  employee: Employee;
  balances: LeaveBalance[];
  leaveTypeCount: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  currentYearRemainingDays: number;
};

function getEmployeeLabel(employee?: Employee) {
  if (!employee) return "Unknown employee";
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function getInitials(employee?: Employee) {
  const label = getEmployeeLabel(employee);
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "NA";
}

function getEffectiveBalance(lb: LeaveBalance) {
  return lb.monthlyBreakdown
    ? [...lb.monthlyBreakdown].reverse().find((month) => !month.isProjected)?.balance ?? lb.totalDays
    : lb.totalDays;
}

function buildEmployeeGroups(balances: LeaveBalance[]) {
  const groups = new Map<number, EmployeeBalanceGroup>();
  const currentYear = new Date().getFullYear();

  balances.forEach((balance) => {
    if (!balance.employee) return;

    const existing = groups.get(balance.employeeId);
    const effectiveBalance = getEffectiveBalance(balance);

    if (existing) {
      existing.balances.push(balance);
      existing.leaveTypeCount += 1;
      existing.totalDays += balance.totalDays;
      existing.usedDays += balance.usedDays;
      existing.remainingDays += effectiveBalance;
      if (balance.year === currentYear) {
        existing.currentYearRemainingDays += effectiveBalance;
      }
      return;
    }

    groups.set(balance.employeeId, {
      employee: balance.employee,
      balances: [balance],
      leaveTypeCount: 1,
      totalDays: balance.totalDays,
      usedDays: balance.usedDays,
      remainingDays: effectiveBalance,
      currentYearRemainingDays: balance.year === currentYear ? effectiveBalance : 0,
    });
  });

  return Array.from(groups.values()).sort((a, b) =>
    getEmployeeLabel(a.employee).localeCompare(getEmployeeLabel(b.employee)),
  );
}

export default function LeaveBalances() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { employeeId: routeEmployeeId } = useParams();
  const queryClient = useQueryClient();
  const isDetailView = Boolean(routeEmployeeId);
  const selectedEmployeeId = routeEmployeeId ? Number(routeEmployeeId) : undefined;
  const currentYear = new Date().getFullYear();

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveBalance | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const [employeeId, setEmployeeId] = useState(routeEmployeeId || "");
  const [year, setYear] = useState(currentYear);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [usedDays, setUsedDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);

  const { data: balances = [], isLoading } = useQuery({
    queryKey: ["leaveBalances", selectedEmployeeId, yearFilter],
    queryFn: () =>
      api.hr.leaveBalances.getAll(
        selectedEmployeeId,
        yearFilter !== "all" ? Number(yearFilter) : undefined,
      ),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: api.hr.leaveTypes.getAll,
  });

  const usableEmployees = useMemo(
    () => employees.filter((employee) => employee.status !== "Draft"),
    [employees],
  );

  const usableBalances = useMemo(
    () => balances.filter((balance) => balance.employee?.status !== "Draft"),
    [balances],
  );

  const selectedEmployee = useMemo(
    () => usableEmployees.find((employee) => employee.id === selectedEmployeeId),
    [usableEmployees, selectedEmployeeId],
  );

  const employeeGroups = useMemo(() => {
    const grouped = buildEmployeeGroups(usableBalances);
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return grouped;

    return grouped.filter(({ employee, balances: employeeBalances }) => {
      const haystacks = [
        getEmployeeLabel(employee),
        employee.employeeNumber,
        employee.cin,
        employee.department?.name,
        employee.position?.title,
        ...employeeBalances.map((balance) => balance.leaveType?.name || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystacks.includes(normalizedSearch);
    });
  }, [usableBalances, search]);

  const detailBalances = useMemo(
    () => usableBalances.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return (a.leaveType?.name || "").localeCompare(b.leaveType?.name || "");
    }),
    [usableBalances],
  );

  const resetForm = () => {
    setEditing(null);
    setEmployeeId(routeEmployeeId || "");
    setYear(currentYear);
    setLeaveTypeId("");
    setTotalDays(0);
    setUsedDays(0);
    setRemainingDays(0);
  };

  const handleEdit = (balance: LeaveBalance) => {
    setEditing(balance);
    setEmployeeId(String(balance.employeeId));
    setYear(balance.year);
    setLeaveTypeId(String(balance.leaveTypeId));
    setTotalDays(balance.totalDays);
    setUsedDays(balance.usedDays);
    setRemainingDays(Math.max(0, balance.totalDays - balance.usedDays));
    setIsOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.hr.leaveBalances.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      toast.success(t("hr.statusUpdates.leaveBalanceCreated"));
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.leaveBalances.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      toast.success(t("hr.statusUpdates.leaveBalanceUpdated"));
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.hr.leaveBalances.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      toast.success(t("hr.statusUpdates.leaveBalanceDeleted"));
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => api.hr.leaveBalances.sync(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      toast.success(data.message || t("hr.statusUpdates.synchronized"));
    },
    onError: () => toast.error(t("hr.statusUpdates.syncFailed")),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId || Number(employeeId) <= 0) {
      toast.error(t("hr.statusUpdates.validEmployeeRequired"));
      return;
    }

    if (!leaveTypeId || Number(leaveTypeId) <= 0) {
      toast.error(t("hr.statusUpdates.selectLeaveType"));
      return;
    }

    const payload = {
      employeeId: Number(employeeId),
      year,
      leaveTypeId: Number(leaveTypeId),
      totalDays,
      usedDays,
      remainingDays,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  if (isDetailView) {
    if (!selectedEmployee) {
      return (
        <CRMLayout title={t("hr.leaveBalances.pageTitle")}>
          <div className="flex flex-col gap-6 p-6">
            <Button variant="outline" className="w-fit gap-2" onClick={() => navigate("/hr/leave-balances")}>
              <ArrowLeft className="h-4 w-4" />
              {t("hr.leaveBalances.actions.backToEmployees")}
            </Button>
            <Card className="glass-morphism">
              <CardContent className="py-10 text-center">
                <p className="text-lg font-semibold">{t("hr.leaveBalances.employeeNotUsable")}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("hr.leaveBalances.draftExcludedHint")}</p>
              </CardContent>
            </Card>
          </div>
        </CRMLayout>
      );
    }

    return (
      <CRMLayout title={`HR - ${t("hr.leaveBalances.pageTitleSimple")}${selectedEmployee ? ` - ${getEmployeeLabel(selectedEmployee)}` : ""}`}>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Button variant="outline" className="gap-2" onClick={() => navigate("/hr/leave-balances")}>
                <ArrowLeft className="h-4 w-4" />
                {t("hr.leaveBalances.actions.backToEmployees")}
              </Button>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">HR &gt; {t("hr.leaveBalances.title")} &gt; {selectedEmployee ? getEmployeeLabel(selectedEmployee) : t("hr.leaveBalances.employee")}</p>
                <h1 className="text-3xl font-bold tracking-tight">{selectedEmployee ? getEmployeeLabel(selectedEmployee) : t("hr.leaveBalances.employeeLeaveBalances")}</h1>
                <p className="text-muted-foreground">{t("hr.leaveBalances.detailDescription")}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                <RefreshCw className="h-4 w-4" />
                {t("hr.leaveBalances.actions.synchronize")}
              </Button>
              <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                  setIsOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("hr.leaveBalances.actions.create")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editing ? t("hr.leaveBalances.dialog.edit") : t("hr.leaveBalances.dialog.create")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.leaveBalances.forms.employee")} *</label>
                      <Input value={selectedEmployee ? getEmployeeLabel(selectedEmployee) : employeeId} readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaveBalances.forms.year")} *</label>
                        <Input required type="number" min={2020} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value) || currentYear)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaveBalances.forms.leaveType")} *</label>
                        <Select value={leaveTypeId} onValueChange={setLeaveTypeId} disabled={!!editing}>
                          <SelectTrigger><SelectValue placeholder={t("hr.leaveBalances.placeholders.selectType")} /></SelectTrigger>
                          <SelectContent>
                            {leaveTypes.map((leaveType: any) => (
                              <SelectItem key={leaveType.id} value={String(leaveType.id)}>{leaveType.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaveBalances.forms.totalDays")}</label>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          value={totalDays}
                          onChange={(e) => {
                            const nextTotal = Number(e.target.value) || 0;
                            setTotalDays(nextTotal);
                            setRemainingDays(Math.max(0, nextTotal - usedDays));
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaveBalances.forms.used")}</label>
                        <Input type="number" min={0} step={0.5} value={usedDays} className="bg-muted" readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">{t("hr.leaveBalances.forms.remaining")}</label>
                        <Input type="number" min={0} step={0.5} value={remainingDays} className="bg-muted" readOnly />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t("common.cancel")}</Button>
                      <Button
                        type="submit"
                        disabled={
                          createMutation.isPending ||
                          updateMutation.isPending ||
                          !employeeId ||
                          !leaveTypeId
                        }
                      >
                        {t("common.save")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-morphism">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.employee")}</p>
                <p className="mt-2 text-xl font-semibold">{selectedEmployee ? getEmployeeLabel(selectedEmployee) : t("hr.leaveBalances.unknownEmployee")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedEmployee?.employeeNumber || t("hr.leaveBalances.noEmployeeNumber")}</p>
              </CardContent>
            </Card>
            <Card className="glass-morphism">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.departmentPosition")}</p>
                <p className="mt-2 text-base font-semibold">{selectedEmployee?.department?.name || t("hr.leaveBalances.noDepartment")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedEmployee?.position?.title || t("hr.leaveBalances.noPosition")}</p>
              </CardContent>
            </Card>
            <Card className="glass-morphism">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.contact")}</p>
                <p className="mt-2 text-base font-semibold">{selectedEmployee?.workEmail || selectedEmployee?.email || t("hr.leaveBalances.noEmail")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedEmployee?.phone || t("hr.leaveBalances.noPhone")}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-morphism">
            <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{t("hr.leaveBalances.balancesByType")}</p>
                <p className="text-sm text-muted-foreground">{t("hr.leaveBalances.balancesDescription")}</p>
              </div>
              <div className="w-full md:w-52">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hr.leaveBalances.placeholders.filterYear")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("hr.leaveBalances.allYears")}</SelectItem>
                    {Array.from(new Set(detailBalances.map((balance) => balance.year)))
                      .sort((a, b) => b - a)
                      .map((balanceYear) => (
                        <SelectItem key={balanceYear} value={String(balanceYear)}>
                          {balanceYear}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hr.leaveBalances.table.year")}</TableHead>
                  <TableHead>{t("hr.leaveBalances.table.leaveType")}</TableHead>
                  <TableHead>{t("hr.leaveBalances.table.total")}</TableHead>
                  <TableHead>{t("hr.leaveBalances.table.used")}</TableHead>
                  <TableHead>{t("hr.leaveBalances.table.remaining")}</TableHead>
                  <TableHead className="text-right">{t("hr.leaveBalances.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">{t("hr.leaveBalances.loading")}</TableCell>
                  </TableRow>
                ) : detailBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">{t("hr.leaveBalances.emptyDetail")}</TableCell>
                  </TableRow>
                ) : (
                  detailBalances.map((balance) => {
                    const effectiveBalance = getEffectiveBalance(balance);

                    return (
                      <Fragment key={balance.id}>
                        <TableRow className="cursor-pointer" onClick={() => setExpandedRow(expandedRow === balance.id ? null : balance.id)}>
                          <TableCell className="font-medium">{balance.year}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {expandedRow === balance.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {balance.leaveType?.name || "-"}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{balance.totalDays}</Badge></TableCell>
                          <TableCell><Badge variant="secondary">{balance.usedDays}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={effectiveBalance > 0 ? "default" : "destructive"}>{effectiveBalance}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(balance); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(balance.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRow === balance.id && balance.monthlyBreakdown && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/10 p-0">
                              <div className="px-6 py-3">
                                {balance.carriedForwardDays ? (
                                  <p className="mb-1 text-xs text-muted-foreground">{t("hr.leaveBalances.carriedForward", { days: balance.carriedForwardDays })}</p>
                                ) : null}
                                <p className="mb-2 text-xs text-muted-foreground">
                                  {balance.leaveType?.accrualPolicy === "Monthly"
                                    ? t("hr.leaveBalances.monthlyAccrualRate", { rate: balance.monthlyAccrualRate })
                                    : t("hr.leaveBalances.allocationPolicy", { policy: balance.leaveType?.accrualPolicy || "Standard" })}
                                </p>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b text-muted-foreground">
                                      <th className="py-1 pr-4 text-left">{t("hr.leaveBalances.monthTable.month")}</th>
                                      <th className="py-1 px-2 text-right">{t("hr.leaveBalances.monthTable.accrued")}</th>
                                      <th className="py-1 px-2 text-right">{t("hr.leaveBalances.monthTable.used")}</th>
                                      <th className="py-1 pl-2 text-right">{t("hr.leaveBalances.monthTable.balance")}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {balance.monthlyBreakdown.map((month) => (
                                      <tr
                                        key={month.month}
                                        className={`border-b border-border/40 ${month.month === 0 ? "bg-muted/20 font-semibold" : ""} ${month.isProjected ? "italic text-muted-foreground/60" : ""}`}
                                      >
                                        <td className="py-1 pr-4 font-medium">{month.label}{month.isProjected ? ` (${t("hr.leaveBalances.projected")})` : ""}</td>
                                        <td className="py-1 px-2 text-right">{month.month === 0 ? "-" : month.accrued}</td>
                                        <td className="py-1 px-2 text-right text-rose-500">{month.month === 0 ? "-" : month.used > 0 ? month.used : "-"}</td>
                                        <td className="py-1 pl-2 text-right font-semibold">{month.balance}{month.isProjected ? "*" : ""}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("hr.leaveBalances.pageTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.leaveBalances.title")}</h1>
            <p className="text-muted-foreground">{t("hr.leaveBalances.description")}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            <RefreshCw className="h-4 w-4" />
            {t("hr.leaveBalances.actions.synchronizeBalance")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{employeeGroups.length}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.stats.employeesWithBalances")}</p>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{employeeGroups.reduce((sum, group) => sum + group.leaveTypeCount, 0)}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.stats.leaveBalanceRecords")}</p>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{employeeGroups.reduce((sum, group) => sum + group.currentYearRemainingDays, 0)}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.stats.currentYearRemaining")}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-morphism">
          <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder={t("hr.leaveBalances.placeholders.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-52">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("hr.leaveBalances.placeholders.filterYear")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hr.leaveBalances.allYears")}</SelectItem>
                  {Array.from(new Set(usableBalances.map((balance) => balance.year)))
                    .sort((a, b) => b - a)
                    .map((balanceYear) => (
                      <SelectItem key={balanceYear} value={String(balanceYear)}>
                        {balanceYear}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="glass-morphism">
            <CardContent className="py-10 text-center text-muted-foreground">{t("hr.leaveBalances.loading")}</CardContent>
          </Card>
        ) : employeeGroups.length === 0 ? (
          <Card className="glass-morphism">
            <CardContent className="py-10 text-center text-muted-foreground">{t("hr.leaveBalances.empty")}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {employeeGroups.map((group) => (
              <Card
                key={group.employee.id}
                className="glass-morphism cursor-pointer overflow-hidden border-border/70 transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => navigate(`/hr/leave-balances/${group.employee.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                        {getInitials(group.employee)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{getEmployeeLabel(group.employee)}</CardTitle>
                        <p className="text-sm text-muted-foreground">{group.employee.employeeNumber || t("hr.leaveBalances.noEmployeeNumber")}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{group.leaveTypeCount} {t("hr.leaveBalances.types")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      <span>{group.employee.department?.name || t("hr.leaveBalances.noDepartment")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{group.employee.position?.title || t("hr.leaveBalances.noPosition")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.total")}</p>
                      <p className="mt-1 text-lg font-semibold">{group.totalDays}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.used")}</p>
                      <p className="mt-1 text-lg font-semibold">{group.usedDays}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hr.leaveBalances.remaining")}</p>
                      <p className="mt-1 text-lg font-semibold">{group.remainingDays}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{t("hr.leaveBalances.currentYearRemaining")}</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-800">{group.currentYearRemainingDays} {t("hr.leaveBalances.days")}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
