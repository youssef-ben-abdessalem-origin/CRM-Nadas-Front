import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Filter } from "lucide-react";
import api from "@/lib/api";

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
  const [entityType, setEntityType] = useState<string>("");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["auditLogs", entityType],
    queryFn: () => api.settings.getAuditLogs(entityType || undefined).catch(() => []),
  });

  const entityTypes = ["Lead", "Contact", "Account", "Deal", "User", "Setting"];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatChanges = (changes: string) => {
    if (!changes) return "—";
    try {
      const parsed = JSON.parse(changes);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch {
      return changes.substring(0, 50) + (changes.length > 50 ? "..." : "");
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Badge className="bg-green-500">Created</Badge>;
      case 'update':
        return <Badge className="bg-blue-500">Updated</Badge>;
      case 'delete':
        return <Badge className="bg-red-500">Deleted</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Audit Logs">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Audit Logs">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Track all changes in the system</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
              >
                <option value="">All Entities</option>
                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <History className="h-8 w-8 mb-2" />
                        <p>No audit logs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        {log.entityType && (
                          <div>
                            <span className="font-medium">{log.entityType}</span>
                            {log.entityId && (
                              <span className="text-muted-foreground"> #{log.entityId}</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div className="font-medium">{log.user.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{log.user.email}</div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.ipAddress || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {formatChanges(log.changes)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default AuditLogsSettings;
