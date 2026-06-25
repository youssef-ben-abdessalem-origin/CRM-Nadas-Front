import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function HrReports() {
  const { t } = useTranslation();
  const [trendYear] = useState(new Date().getFullYear());

  const { data: hc } = useQuery({ queryKey: ["hr-headcount"], queryFn: api.payroll.reports.hr.headcount });
  const { data: turnover } = useQuery({ queryKey: ["hr-turnover"], queryFn: api.payroll.reports.hr.turnover });
  const { data: leaveTrends } = useQuery({
    queryKey: ["hr-leave-trends", trendYear],
    queryFn: () => api.payroll.reports.hr.leaveTrends(trendYear),
  });
  const { data: payrollCost } = useQuery({ queryKey: ["payroll-cost"], queryFn: () => api.payroll.reports.payroll.cost() });
  const { data: deptCost } = useQuery({ queryKey: ["dept-cost"], queryFn: () => api.payroll.reports.payroll.departmentCost() });
  const { data: periodComp } = useQuery({ queryKey: ["period-comp"], queryFn: () => api.payroll.reports.payroll.periodComparison() });

  const statCard = (label: string, value: string | number, sub?: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? "-"}</div>
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );

  return (
    <CRMLayout title={t("reports.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-muted-foreground">{t("reports.description")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {statCard(t("reports.totalEmployees"), hc?.total || "-")}
          {statCard(
            t("reports.activeEmployees"),
            hc?.active || "-",
            `${t("reports.turnoverRate")}: ${turnover?.turnoverRate ?? "-"}%`,
          )}
          {statCard(t("reports.leftThisYear"), turnover?.leftThisYear || 0)}
          {statCard(t("reports.hiredThisYear"), turnover?.hiredThisYear || 0)}
        </div>

        {hc ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("reports.byDepartment")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("reports.department")}</TableHead>
                      <TableHead className="text-right">{t("reports.count")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(hc.byDepartment || []).map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{row.department || t("reports.unassigned")}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("reports.byStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("reports.status")}</TableHead>
                      <TableHead className="text-right">{t("reports.count")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(hc.byStatus || []).map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{row.status}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("reports.byGender")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("reports.gender")}</TableHead>
                      <TableHead className="text-right">{t("reports.count")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(hc.byGender || []).map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{row.gender || t("reports.notAvailable")}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("reports.leaveTrends")} - {trendYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("reports.leaveType")}</TableHead>
                  <TableHead className="text-right">{t("reports.paid")}</TableHead>
                  <TableHead className="text-right">{t("reports.approved")}</TableHead>
                  <TableHead className="text-right">{t("reports.pending")}</TableHead>
                  <TableHead className="text-right">{t("reports.totalDays")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(leaveTrends?.trends || []).map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.leaveType}</TableCell>
                    <TableCell className="text-right">{row.paid ? t("reports.yes") : t("reports.no")}</TableCell>
                    <TableCell className="text-right">{row.approved}</TableCell>
                    <TableCell className="text-right">{row.pending}</TableCell>
                    <TableCell className="text-right">{row.totalDays}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("reports.payrollCost")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("reports.grossSalary")}</span>
                  <span className="font-bold">{Number(payrollCost?.totalGrossSalary || 0).toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("reports.netSalary")}</span>
                  <span className="font-bold">{Number(payrollCost?.totalNetSalary || 0).toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("reports.deductions")}</span>
                  <span className="font-bold">{Number(payrollCost?.totalDeductions || 0).toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("reports.employerContributions")}</span>
                  <span className="font-bold">{Number(payrollCost?.totalEmployerContributions || 0).toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("reports.avgNetSalary")}</span>
                  <span className="font-bold">{Number(payrollCost?.averageNetSalary || 0).toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("reports.employees")}</span>
                  <span className="font-bold">{payrollCost?.totalEmployees || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("reports.deptCost")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("reports.department")}</TableHead>
                    <TableHead className="text-right">{t("reports.employees")}</TableHead>
                    <TableHead className="text-right">{t("reports.netSalary")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(deptCost || []).map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{row.department}</TableCell>
                      <TableCell className="text-right">{row.totalEmployees}</TableCell>
                      <TableCell className="text-right">{Number(row.totalNetSalary).toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("reports.periodComparison")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("reports.period")}</TableHead>
                  <TableHead className="text-right">{t("reports.employees")}</TableHead>
                  <TableHead className="text-right">{t("reports.grossSalary")}</TableHead>
                  <TableHead className="text-right">{t("reports.netSalary")}</TableHead>
                  <TableHead className="text-right">{t("reports.deductions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(periodComp || []).map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.periodName}</TableCell>
                    <TableCell className="text-right">{row.totalEmployees}</TableCell>
                    <TableCell className="text-right">{Number(row.totalGrossSalary).toFixed(3)}</TableCell>
                    <TableCell className="text-right">{Number(row.totalNetSalary).toFixed(3)}</TableCell>
                    <TableCell className="text-right">{Number(row.totalDeductions).toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
