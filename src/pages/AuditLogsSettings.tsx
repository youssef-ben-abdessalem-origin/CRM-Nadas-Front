import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Search,
  Clock,
  Filter,
  Monitor,
  Activity,
  Shield,
  Box,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  changes: string;
  user: { id: number; name: string; email: string };
  ipAddress: string;
  createdAt: string;
}

const AuditLogsSettings = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: paginatedAuditLogs, isLoading } = useQuery({
    queryKey: ["auditLogs", "paginated", page, pageSize, searchTerm, entityFilter],
    queryFn: () =>
      api.settings
        .getAuditLogsPaginated({
          page,
          limit: pageSize,
          search: searchTerm || undefined,
          entityType: entityFilter !== "all" ? entityFilter : undefined,
        })
        .catch(() => ({ data: [], total: 0, page: 1, limit: pageSize, totalPages: 1 })),
  });
  const auditLogs = paginatedAuditLogs?.data || [];
  const totalAuditLogs = paginatedAuditLogs?.total || 0;
  const totalPages = paginatedAuditLogs?.totalPages || 1;

  const getActionInfo = (action: string) => {
    const method = action.split(' ')[0];
    const path = action.split(' ')[1] || '';

    if (method === 'POST') return { label: 'CREATE', color: '#10b981' };
    if (method === 'PUT' || method === 'PATCH') return { label: 'UPDATE', color: '#f59e0b' };
    if (method === 'DELETE') return { label: 'DELETE', color: '#ef4444' };
    if (path.includes('restore')) return { label: 'RESTORE', color: '#6366f1' };

    return { label: 'ACTION', color: '#6b7280' };
  };

  const getEntityName = (log: AuditLog) => {
    try {
      const parsed = JSON.parse(log.changes);
      const payload = parsed.payload || {};
      return payload.name || payload.subject || payload.title || payload.email || `ID: ${log.entityId}`;
    } catch {
      return `ID: ${log.entityId}`;
    }
  };

  const uniqueEntities = useMemo(() => {
    const entities = new Set(auditLogs.map((l: AuditLog) => l.entityType));
    return Array.from(entities).sort();
  }, [auditLogs]);

  return (
    <CRMLayout title={t("auditLogs.pageTitle")}>
      <div className="space-y-4">
        {/* Header section matching Leads Page style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("auditLogs.title")}</h1>
            <p className="text-muted-foreground">{t("auditLogs.subtitle")}</p>
          </div>
        </div>

        {/* Toolbar matching Leads Page style */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("auditLogs.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select
              value={entityFilter}
              onValueChange={(value) => {
                setEntityFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder={t("auditLogs.allEntities")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("auditLogs.allEntities")}</SelectItem>
                {uniqueEntities.map((entity: any) => (
                  <SelectItem key={entity} value={entity} className="capitalize">
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> {t("auditLogs.filter")}
            </Button>
          </div>
        </div>

        {/* Table View matching Leads Page style */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{t("auditLogs.id")}</TableHead>
                <TableHead>{t("auditLogs.entity")}</TableHead>
                <TableHead>{t("auditLogs.recordName")}</TableHead>
                <TableHead>{t("auditLogs.action")}</TableHead>
                <TableHead>{t("auditLogs.performedBy")}</TableHead>
                <TableHead>{t("auditLogs.performedAt")}</TableHead>
                <TableHead className="text-right">{t("auditLogs.timeAgo")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-16">
                      <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("auditLogs.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log: AuditLog) => {
                  const action = getActionInfo(log.action);
                  const entityName = getEntityName(log);
                  return (
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-mono">#{log.id}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {log.entityType.toLowerCase() === 'roles' ? (
                            <Shield className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Box className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm capitalize">{log.entityType}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-[200px] truncate font-medium text-sm">
                          {entityName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-0"
                          style={{
                            backgroundColor: `${action.color}20`,
                            color: action.color,
                          }}
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          {action.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{log.user?.name || "System"}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.user?.email || "internal@nexus.crm"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Monitor className="h-3 w-3" />
                          {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              Showing {auditLogs.length} of {totalAuditLogs}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> {t("common.previous")}
              </Button>
              <span>
                Page {page} / {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("common.next")} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default AuditLogsSettings;
