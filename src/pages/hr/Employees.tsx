import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Edit,
  Trash,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

function getStatusVariant(status?: string) {
  if (status === "Active") return "default";
  if (status === "Draft") return "secondary";
  return "outline";
}

function getReadinessVariant(readinessStatus?: string) {
  if (readinessStatus === "Legally Active") return "default";
  if (readinessStatus === "Payroll Ready") return "secondary";
  if (readinessStatus === "Draft") return "outline";
  return "outline";
}

export default function Employees() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", search, deptFilter],
    queryFn: () =>
      api.hr.employees.getAll(
        search,
        deptFilter !== "all" ? Number(deptFilter) : undefined,
        true,
      ),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.departments.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: api.hr.employees.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(t("hr.statusUpdates.employeeDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const stats = useMemo(
    () => ({
      total: employees.length,
      drafts: employees.filter((employee) => employee.status === "Draft").length,
      active: employees.filter((employee) => employee.status === "Active").length,
    }),
    [employees],
  );

  return (
    <CRMLayout title={t("hr.employees.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.employees.title")}</h1>
            <p className="text-muted-foreground">
              {t("hr.employees.description")}
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/hr/employees/new")}>
            <UserPlus className="h-4 w-4" />
            {t("hr.employees.actions.newEmployee")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hr.employees.stats.total")}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hr.employees.stats.active")}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hr.employees.stats.drafts")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-morphism">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("hr.employees.placeholders.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-56">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("hr.employees.placeholders.filterDepartment")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hr.employees.options.allDepartments")}</SelectItem>
                  {departments.map((department: any) => (
                    <SelectItem key={department.id} value={String(department.id)}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="glass-morphism">
            <CardContent className="py-10 text-center text-muted-foreground">
              {t("common.loading")}
            </CardContent>
          </Card>
        ) : employees.length === 0 ? (
          <Card className="glass-morphism">
            <CardContent className="py-10 text-center text-muted-foreground">
              {t("hr.employees.noResults")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {employees.map((employee) => (
              <Card
                key={employee.id}
                className="glass-morphism overflow-hidden border-border/70 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.employeeNumber}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge variant={getStatusVariant(employee.status)}>
                        {t(`common.status.${employee.status}`, employee.status)}
                      </Badge>
                      <Badge variant={getReadinessVariant(employee.readinessStatus)}>
                        {employee.readinessStatus || t("common.status.Draft")}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{employee.department?.name || t("hr.employees.noDepartment")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{employee.position?.title || t("hr.employees.noPosition")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {employee.hireDate
                          ? new Date(employee.hireDate).toLocaleDateString()
                          : t("hr.employees.noHireDate")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{employee.workEmail || employee.email || t("hr.employees.noEmail")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{employee.phone || t("hr.employees.noPhone")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{t("hr.employees.costCenter")}: {employee.costCenter || t("hr.employees.notAssigned")}</span>
                    </div>
                  </div>

                  {employee.status === "Draft" ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800">
                      {t("hr.employees.draftNotice")}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/hr/employees/${employee.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      {t("hr.employees.actions.view")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/hr/employees/edit/${employee.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      {employee.status === "Draft" ? t("hr.employees.actions.resume") : t("common.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => {
                        if (confirm(t("common.actions.confirm_delete"))) {
                          deleteMutation.mutate(employee.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
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
