import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Calendar, FileText, Target, ClipboardCheck, PenLine } from "lucide-react";
import { listSignatureTasks } from "@/lib/signatures";

export default function EmployeePortal() {
  const navigate = useNavigate();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [pendingSignatureCount, setPendingSignatureCount] = useState(0);

  useEffect(() => {
    const pending = listSignatureTasks().filter((task) => task.status === "pending").length;
    setPendingSignatureCount(pending);
  }, []);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const empId = selectedEmpId ? +selectedEmpId : undefined;

  const { data: employee } = useQuery({
    queryKey: ["employee", empId],
    queryFn: () => api.hr.employees.getOne(empId!),
    enabled: !!empId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", empId],
    queryFn: () => api.hr.attendance.getAll(empId),
    enabled: !!empId,
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ["leaveRequests", empId],
    queryFn: () => api.hr.leaveRequests.getAll(empId),
    enabled: !!empId,
  });

  const { data: payslips = [] } = useQuery({
    queryKey: ["payslips", empId],
    queryFn: () => api.payroll.payslips.getAll(undefined, empId),
    enabled: !!empId,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", empId],
    queryFn: () => api.hr.goals.getAll(empId),
    enabled: !!empId,
  });

  const { data: leaveBalances = [] } = useQuery({
    queryKey: ["leaveBalances", empId],
    queryFn: () => api.hr.leaveBalances.getAll(empId),
    enabled: !!empId,
  });

  return (
    <CRMLayout title="Employee Portal">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Portal</h1>
            <p className="text-muted-foreground">Self-service dashboard for employees to view their HR and payroll data.</p>
          </div>
          <div className="w-64">
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger><SelectValue placeholder="Select Employee..." /></SelectTrigger>
              <SelectContent>
                {employees.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.firstName} {e.lastName} ({e.employeeNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!empId ? (
          <Card className="glass-morphism">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <User className="h-16 w-16 text-muted-foreground/40" />
              <p className="text-lg text-muted-foreground">Select an employee to view their portal</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Card */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="glass-morphism col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" /> Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employee && (
                    <div className="space-y-2 text-sm">
                      <div><span className="font-semibold">Name:</span> {employee.firstName} {employee.lastName}</div>
                      <div><span className="font-semibold">Employee #:</span> {employee.employeeNumber}</div>
                      <div><span className="font-semibold">Department:</span> {employee.department?.name || "-"}</div>
                      <div><span className="font-semibold">Position:</span> {employee.position?.title || "-"}</div>
                      <div><span className="font-semibold">CIN:</span> {employee.cin}</div>
                      <div><span className="font-semibold">Status:</span> <Badge variant={employee.status === "Active" ? "default" : "secondary"}>{employee.status}</Badge></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" /> Leave Balances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaveBalances.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No leave balances</p>
                  ) : (
                    <div className="space-y-2">
                      {leaveBalances.map((lb: any) => (
                        <div key={lb.id} className="flex justify-between items-center text-sm">
                          <span>{lb.leaveType?.name}</span>
                          <span className="font-semibold">{lb.usedDays}/{lb.totalDays} days used</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" /> Goals Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No goals assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {goals.slice(0, 5).map((g: any) => (
                        <div key={g.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="truncate">{g.title}</span>
                            <Badge variant="outline" className="text-xs">{g.status}</Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${g.progress || 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-morphism cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => navigate("/signatures")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PenLine className="h-5 w-5" /> Signatures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Open the signing queue and complete pending document signatures.</p>
                  <div className="mt-4">
                    <Badge variant={pendingSignatureCount > 0 ? "secondary" : "outline"}>
                      {pendingSignatureCount} pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Attendance */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" /> Recent Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">No attendance records</TableCell></TableRow>
                    ) : (
                      attendance.slice(0, 10).map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell>{new Date(a.workDate).toLocaleDateString()}</TableCell>
                          <TableCell>{a.checkIn || "-"}</TableCell>
                          <TableCell>{a.checkOut || "-"}</TableCell>
                          <TableCell>{a.workedHours || "-"}</TableCell>
                          <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Leave Requests */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" /> Recent Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">No leave requests</TableCell></TableRow>
                    ) : (
                      leaves.slice(0, 10).map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell>{l.leaveType?.name}</TableCell>
                          <TableCell>{new Date(l.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(l.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>{l.days}</TableCell>
                          <TableCell><Badge variant={l.status === "Approved" ? "default" : l.status === "Pending" ? "secondary" : "destructive"}>{l.status}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Payslips */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardCheck className="h-5 w-5" /> Recent Payslips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">No payslips</TableCell></TableRow>
                    ) : (
                      payslips.slice(0, 10).map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.payrollPeriod?.periodName}</TableCell>
                          <TableCell>{Number(p.grossSalary).toFixed(3)}</TableCell>
                          <TableCell>{Number(p.totalDeductions).toFixed(3)}</TableCell>
                          <TableCell className="font-semibold">{Number(p.netSalary).toFixed(3)} TND</TableCell>
                          <TableCell><Badge variant={p.status === "Paid" ? "default" : p.status === "Approved" ? "secondary" : "outline"}>{p.status}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </CRMLayout>
  );
}
