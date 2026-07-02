import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api, Attendance as AttendanceRecord, Employee } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  Clock3,
  Grid3X3,
  Save,
  Table2,
} from "lucide-react";

type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Leave"
  | "Holiday"
  | "Remote"
  | "Mission"
  | "Training"
  | "Weekend"
  | "Half Day"
  | "Sick Leave"
  | "Excused";

type AttendanceRowState = {
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  workedHours: string;
  notes: string;
  source: string;
};

const STATUS_OPTIONS: AttendanceStatus[] = [
  "Present",
  "Absent",
  "Leave",
  "Holiday",
  "Remote",
  "Mission",
  "Training",
  "Weekend",
  "Half Day",
  "Sick Leave",
  "Excused",
];

const statusTheme: Record<AttendanceStatus, { label: string; pill: string; cell: string; text: string }> = {
  Present: { label: "P", pill: "bg-emerald-500 text-white", cell: "bg-emerald-500/95 hover:bg-emerald-600", text: "text-emerald-700" },
  Absent: { label: "A", pill: "bg-rose-500 text-white", cell: "bg-rose-500/95 hover:bg-rose-600", text: "text-rose-700" },
  Leave: { label: "L", pill: "bg-amber-500 text-white", cell: "bg-amber-500/95 hover:bg-amber-600", text: "text-amber-700" },
  Holiday: { label: "H", pill: "bg-slate-500 text-white", cell: "bg-slate-500/95 hover:bg-slate-600", text: "text-slate-700" },
  Remote: { label: "R", pill: "bg-sky-500 text-white", cell: "bg-sky-500/95 hover:bg-sky-600", text: "text-sky-700" },
  Mission: { label: "M", pill: "bg-violet-500 text-white", cell: "bg-violet-500/95 hover:bg-violet-600", text: "text-violet-700" },
  Training: { label: "T", pill: "bg-indigo-500 text-white", cell: "bg-indigo-500/95 hover:bg-indigo-600", text: "text-indigo-700" },
  Weekend: { label: "W", pill: "bg-zinc-500 text-white", cell: "bg-zinc-500/95 hover:bg-zinc-600", text: "text-zinc-700" },
  "Half Day": { label: "HD", pill: "bg-orange-500 text-white", cell: "bg-orange-500/95 hover:bg-orange-600", text: "text-orange-700" },
  "Sick Leave": { label: "S", pill: "bg-red-400 text-white", cell: "bg-red-400/95 hover:bg-red-500", text: "text-red-700" },
  Excused: { label: "E", pill: "bg-cyan-500 text-white", cell: "bg-cyan-500/95 hover:bg-cyan-600", text: "text-cyan-700" },
};

function buildDefaultRowState(log?: AttendanceRecord): AttendanceRowState {
  return {
    status: (log?.status as AttendanceStatus) || "Present",
    checkIn: log?.checkIn || "08:30",
    checkOut: log?.checkOut || "17:30",
    workedHours: log?.workedHours != null ? String(log.workedHours) : "8",
    notes: log?.notes || "",
    source: log?.source || "Manual Entry",
  };
}

function getMonthRange(monthValue: string) {
  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  return {
    start: firstDay.toISOString().split("T")[0],
    end: lastDay.toISOString().split("T")[0],
    daysInMonth: lastDay.getDate(),
    year,
    monthIndex,
  };
}

function getDayLabel(year: number, monthIndex: number, day: number) {
  const date = new Date(year, monthIndex, day);
  return {
    shortWeekday: date
      .toLocaleDateString("en-US", { weekday: "short" })
      .slice(0, 2)
      .toUpperCase(),
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
  };
}

export default function Attendance() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [gridState, setGridState] = useState<Record<number, AttendanceRowState>>({});
  const [matrixEditorOpen, setMatrixEditorOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    employee: Employee;
    day: number;
    dateKey: string;
    record?: AttendanceRecord;
  } | null>(null);
  const [cellForm, setCellForm] = useState<AttendanceRowState>(buildDefaultRowState());

  const monthRange = useMemo(() => getMonthRange(selectedMonth), [selectedMonth]);

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees", "all-for-attendance"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: dailyLogs = [], isLoading: loadingDailyLogs } = useQuery({
    queryKey: ["attendance", "day", selectedDate],
    queryFn: () => api.hr.attendance.getAll(undefined, selectedDate, selectedDate),
  });

  const { data: monthlyLogs = [], isLoading: loadingMonthlyLogs } = useQuery({
    queryKey: ["attendance", "month", monthRange.start, monthRange.end],
    queryFn: () => api.hr.attendance.getAll(undefined, monthRange.start, monthRange.end),
  });

  useEffect(() => {
    if (!employees.length) return;

    const nextState: Record<number, AttendanceRowState> = {};
    for (const employee of employees) {
      const log = dailyLogs.find((item) => item.employeeId === employee.id);
      nextState[employee.id] = buildDefaultRowState(log);
    }
    setGridState(nextState);
  }, [employees, dailyLogs, selectedDate]);

  const logMutation = useMutation({
    mutationFn: api.hr.attendance.log,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success(t("hr.statusUpdates.attendanceSaved"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateRowState = (employeeId: number, patch: Partial<AttendanceRowState>) => {
    setGridState((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || buildDefaultRowState()),
        ...patch,
      },
    }));
  };

  const applyStatusDefaults = (employeeId: number, status: AttendanceStatus) => {
    const workLikeStatuses = new Set<AttendanceStatus>([
      "Present",
      "Remote",
      "Mission",
      "Training",
      "Half Day",
    ]);

    if (!workLikeStatuses.has(status)) {
      updateRowState(employeeId, {
        status,
        checkIn: "",
        checkOut: "",
        workedHours: "0",
      });
      return;
    }

    updateRowState(employeeId, {
      status,
      checkIn: status === "Half Day" ? "08:30" : "08:30",
      checkOut: status === "Half Day" ? "12:30" : "17:30",
      workedHours: status === "Half Day" ? "4" : "8",
    });
  };

  const handleSaveRow = (employeeId: number, workDate = selectedDate, rowState?: AttendanceRowState) => {
    const row = rowState || gridState[employeeId] || buildDefaultRowState();
    logMutation.mutate({
      employeeId,
      workDate,
      status: row.status,
      checkIn: row.checkIn || null,
      checkOut: row.checkOut || null,
      workedHours: row.workedHours ? Number(row.workedHours) : null,
      notes: row.notes || null,
      source: row.source || "Manual Entry",
    });
  };

  const groupedEmployees = useMemo(() => {
    const groups = new Map<string, Employee[]>();

    for (const employee of employees) {
      const departmentName = employee.department?.name || t("hr.attendance.unassigned");
      const current = groups.get(departmentName) || [];
      current.push(employee);
      groups.set(departmentName, current);
    }

    return Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([department, members]) => ({
        department,
        members: members.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
        ),
      }));
  }, [employees]);

  const monthlyLogMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const log of monthlyLogs) {
      const dateKey = log.workDate.split("T")[0];
      map.set(`${log.employeeId}-${dateKey}`, log);
    }
    return map;
  }, [monthlyLogs]);

  const openMatrixEditor = (employee: Employee, day: number) => {
    const dateKey = `${selectedMonth}-${String(day).padStart(2, "0")}`;
    const record = monthlyLogMap.get(`${employee.id}-${dateKey}`);
    setSelectedCell({ employee, day, dateKey, record });
    setCellForm(buildDefaultRowState(record));
    setMatrixEditorOpen(true);
  };

  const monthlySummaryByEmployee = useMemo(() => {
    const summary = new Map<number, { present: number; absent: number; recorded: number }>();

    for (const employee of employees) {
      summary.set(employee.id, { present: 0, absent: 0, recorded: 0 });
    }

    for (const log of monthlyLogs) {
      const current = summary.get(log.employeeId) || {
        present: 0,
        absent: 0,
        recorded: 0,
      };

      if (["Present", "Remote", "Mission", "Training", "Half Day"].includes(log.status)) {
        current.present += 1;
      }
      if (log.status === "Absent") {
        current.absent += 1;
      }
      current.recorded += 1;
      summary.set(log.employeeId, current);
    }

    return summary;
  }, [employees, monthlyLogs]);

  return (
    <CRMLayout title={t("hr.attendance.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.attendance.title")}</h1>
            <p className="text-muted-foreground">
              {t("hr.attendance.description")}
            </p>
          </div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "daily" | "monthly")}>
            <TabsList className="grid w-[260px] grid-cols-2">
              <TabsTrigger value="daily" className="gap-2">
                <Table2 className="h-4 w-4" />
                {t("hr.attendance.tabs.daily")}
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                {t("hr.attendance.tabs.monthlyMatrix")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "daily" ? (
          <>
            <Card className="glass-morphism">
              <CardContent className="flex items-center gap-3 py-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-56"
                />
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("hr.attendance.table.employeeId")}</TableHead>
                    <TableHead>{t("hr.attendance.table.employeeName")}</TableHead>
                    <TableHead>{t("hr.attendance.table.status")}</TableHead>
                    <TableHead>{t("hr.attendance.table.checkIn")}</TableHead>
                    <TableHead>{t("hr.attendance.table.checkOut")}</TableHead>
                    <TableHead>{t("hr.attendance.table.hours")}</TableHead>
                    <TableHead>{t("hr.attendance.table.notes")}</TableHead>
                    <TableHead className="text-right">{t("hr.attendance.table.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmployees || loadingDailyLogs ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center">
                        {t("hr.attendance.noEmployees")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => {
                      const state = gridState[employee.id] || buildDefaultRowState();
                      const log = dailyLogs.find((item) => item.employeeId === employee.id);

                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-semibold">{employee.employeeNumber}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>{employee.firstName} {employee.lastName}</div>
                              {log?.shiftName ? (
                                <div className="text-xs text-muted-foreground">
                                  {t("hr.attendance.shiftLabel")}: {log.shiftName}
                                </div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={state.status}
                              onValueChange={(value) =>
                                applyStatusDefaults(employee.id, value as AttendanceStatus)
                              }
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={state.checkIn}
                              disabled={!["Present", "Remote", "Mission", "Training", "Half Day"].includes(state.status)}
                              onChange={(e) => updateRowState(employee.id, { checkIn: e.target.value })}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={state.checkOut}
                              disabled={!["Present", "Remote", "Mission", "Training", "Half Day"].includes(state.status)}
                              onChange={(e) => updateRowState(employee.id, { checkOut: e.target.value })}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Input
                                type="number"
                                step="0.5"
                                value={state.workedHours}
                                disabled={!["Present", "Remote", "Mission", "Training", "Half Day"].includes(state.status)}
                                onChange={(e) => updateRowState(employee.id, { workedHours: e.target.value })}
                                className="w-20"
                              />
                              {log ? (
                                <div className="text-xs text-muted-foreground">
                                  {t("hr.attendance.lateLabel")} {log.lateMinutes || 0}m • {t("hr.attendance.otLabel")} {log.overtimeHours || 0}h
                                </div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={state.notes}
                              onChange={(e) => updateRowState(employee.id, { notes: e.target.value })}
                              placeholder={t("hr.attendance.placeholders.optionalNote")}
                              className="min-w-[180px]"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleSaveRow(employee.id)}
                              className="gap-1"
                            >
                              <Save className="h-4 w-4" />
                                {t("common.save")}
                              </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </>
        ) : (
          <>
            <Card className="glass-morphism">
              <CardContent className="flex items-center gap-3 py-4">
                <Clock3 className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-56"
                />
                <div className="text-sm text-muted-foreground">
                  {t("hr.attendance.monthlyHint")}
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[1600px] w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="sticky left-0 z-10 min-w-[280px] border-r bg-muted/30 px-4 py-3 text-left font-semibold text-foreground">
                        {t("hr.attendance.table.employee")}
                      </th>
                      {Array.from({ length: monthRange.daysInMonth }, (_, index) => {
                        const day = index + 1;
                        const label = getDayLabel(monthRange.year, monthRange.monthIndex, day);
                        return (
                          <th
                            key={day}
                            className={`min-w-[42px] border-r px-1 py-2 text-center text-[11px] font-semibold ${
                              label.isWeekend ? "bg-muted/20 text-muted-foreground" : "text-muted-foreground"
                            }`}
                          >
                            <div>{label.shortWeekday}</div>
                            <div className="text-xs">{day}</div>
                          </th>
                        );
                      })}
                      <th className="min-w-[70px] px-2 py-3 text-center text-xs font-semibold text-muted-foreground">{t("hr.attendance.monthly.rate")}</th>
                      <th className="min-w-[50px] px-2 py-3 text-center text-xs font-semibold text-muted-foreground">{t("hr.attendance.monthly.present")}</th>
                      <th className="min-w-[50px] px-2 py-3 text-center text-xs font-semibold text-muted-foreground">{t("hr.attendance.monthly.absent")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingEmployees || loadingMonthlyLogs ? (
                      <tr>
                        <td
                          colSpan={monthRange.daysInMonth + 4}
                          className="px-4 py-12 text-center text-muted-foreground"
                        >
                          {t("hr.attendance.loadingMonthly")}
                        </td>
                      </tr>
                    ) : groupedEmployees.map((group) => (
                      <>
                        <tr key={`${group.department}-header`} className="border-y bg-muted/20">
                          <td
                            colSpan={monthRange.daysInMonth + 4}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
                          >
                            {group.department} ({group.members.length} {t("hr.attendance.employees")})
                          </td>
                        </tr>
                        {group.members.map((employee) => {
                          const summary = monthlySummaryByEmployee.get(employee.id) || {
                            present: 0,
                            absent: 0,
                            recorded: 0,
                          };
                          const attendanceRate =
                            summary.recorded > 0
                              ? Math.round((summary.present / summary.recorded) * 100)
                              : 0;

                          return (
                            <tr key={employee.id} className="border-b last:border-b-0">
                              <td className="sticky left-0 z-10 border-r bg-card px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                                    {employee.firstName[0]}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {employee.firstName} {employee.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {employee.employeeNumber}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {Array.from({ length: monthRange.daysInMonth }, (_, index) => {
                                const day = index + 1;
                                const dateKey = `${selectedMonth}-${String(day).padStart(2, "0")}`;
                                const record = monthlyLogMap.get(`${employee.id}-${dateKey}`);
                                const status = (record?.status as AttendanceStatus | undefined) || null;
                                const theme = status ? statusTheme[status] : null;
                                const dayLabel = getDayLabel(monthRange.year, monthRange.monthIndex, day);

                                return (
                                  <td
                                    key={`${employee.id}-${day}`}
                                    className={`border-r px-1 py-1 text-center ${
                                      dayLabel.isWeekend ? "bg-muted/10" : "bg-card"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => openMatrixEditor(employee, day)}
                                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                                        theme
                                          ? `${theme.cell} text-white shadow-sm`
                                          : "text-muted-foreground hover:bg-muted/20"
                                      }`}
                                      title={
                                        record
                                          ? `${status} - ${record.checkIn || ""} ${record.checkOut || ""}`.trim()
                                          : t("hr.attendance.noRecord")
                                      }
                                    >
                                      {theme ? theme.label : "•"}
                                    </button>
                                  </td>
                                );
                              })}
                              <td className="px-2 py-3 text-center text-xs font-bold text-emerald-500">
                                {attendanceRate}%
                              </td>
                              <td className="px-2 py-3 text-center text-xs font-bold text-emerald-500">
                                {summary.present}
                              </td>
                              <td className="px-2 py-3 text-center text-xs font-bold text-rose-500">
                                {summary.absent}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <Dialog open={matrixEditorOpen} onOpenChange={setMatrixEditorOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("hr.attendance.dialog.title")}</DialogTitle>
              <DialogDescription>
                {selectedCell
                  ? `${selectedCell.employee.firstName} ${selectedCell.employee.lastName} - ${selectedCell.dateKey}`
                  : t("hr.attendance.dialog.description")}
              </DialogDescription>
            </DialogHeader>
            {selectedCell ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveRow(selectedCell.employee.id, selectedCell.dateKey, cellForm);
                  setMatrixEditorOpen(false);
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>{t("hr.attendance.dialog.status")}</Label>
                  <Select
                    value={cellForm.status}
                    onValueChange={(value) =>
                      setCellForm((prev) => ({
                        ...prev,
                        status: value as AttendanceStatus,
                        ...(!["Present", "Remote", "Mission", "Training", "Half Day"].includes(value)
                          ? { checkIn: "", checkOut: "", workedHours: "0" }
                          : value === "Half Day"
                            ? { checkIn: "08:30", checkOut: "12:30", workedHours: "4" }
                            : {}),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("hr.attendance.dialog.source")}</Label>
                  <Input
                    value={cellForm.source}
                    onChange={(e) =>
                      setCellForm((prev) => ({ ...prev, source: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("hr.attendance.dialog.checkIn")}</Label>
                  <Input
                    type="time"
                    value={cellForm.checkIn}
                    onChange={(e) =>
                      setCellForm((prev) => ({ ...prev, checkIn: e.target.value }))
                    }
                    disabled={!["Present", "Remote", "Mission", "Training", "Half Day"].includes(cellForm.status)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("hr.attendance.dialog.checkOut")}</Label>
                  <Input
                    type="time"
                    value={cellForm.checkOut}
                    onChange={(e) =>
                      setCellForm((prev) => ({ ...prev, checkOut: e.target.value }))
                    }
                    disabled={!["Present", "Remote", "Mission", "Training", "Half Day"].includes(cellForm.status)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("hr.attendance.dialog.workedHours")}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={cellForm.workedHours}
                    onChange={(e) =>
                      setCellForm((prev) => ({ ...prev, workedHours: e.target.value }))
                    }
                    disabled={!["Present", "Remote", "Mission", "Training", "Half Day"].includes(cellForm.status)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("hr.attendance.dialog.notes")}</Label>
                  <Textarea
                    rows={3}
                    value={cellForm.notes}
                    onChange={(e) =>
                      setCellForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder={t("hr.attendance.placeholders.hrNote")}
                  />
                </div>
                {selectedCell.record ? (
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground md:col-span-2">
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline">{t("hr.attendance.dialog.shiftBadge")}: {selectedCell.record.shiftName || "N/A"}</Badge>
                      <Badge variant="outline">{t("hr.attendance.dialog.lateBadge")}: {selectedCell.record.lateMinutes || 0} min</Badge>
                      <Badge variant="outline">{t("hr.attendance.dialog.earlyLeaveBadge")}: {selectedCell.record.earlyDepartureMinutes || 0} min</Badge>
                      <Badge variant="outline">{t("hr.attendance.dialog.otBadge")}: {selectedCell.record.overtimeHours || 0} h</Badge>
                    </div>
                  </div>
                ) : null}
                <DialogFooter className="md:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setMatrixEditorOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={logMutation.isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {logMutation.isPending ? t("common.actions.saving") : t("hr.attendance.actions.saveAttendance")}
                  </Button>
                </DialogFooter>
              </form>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
