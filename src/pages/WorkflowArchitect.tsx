import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  ArrowRight,
  Zap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";

export default function WorkflowArchitect() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Queries
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: () => api.automations.getAll().catch(() => []),
  });

  const toggleMutation = useMutation({
    mutationFn: api.automations.toggle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automation-rules"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.automations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success(t("workflowArchitect.statusUpdates.deleted"));
    },
  });

  const handleDelete = async (id: string) => {
    if (await confirm({
      title: t("workflowArchitect.deleteDialog.title"),
      description: t("workflowArchitect.deleteDialog.description"),
      variant: "destructive",
      confirmText: t("workflowArchitect.deleteDialog.confirm")
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title={t("workflowArchitect.pageTitle")}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("workflowArchitect.pageTitle")}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("workflowArchitect.title")}</h1>
            <p className="text-muted-foreground">{t("workflowArchitect.subtitle")}</p>
          </div>
          <Button onClick={() => navigate("/automations/new")}>
            <Plus className="h-4 w-4 mr-2" /> {t("workflowArchitect.startNew")}
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("workflowArchitect.table.workflowName")}</TableHead>
                <TableHead>{t("workflowArchitect.table.trigger")}</TableHead>
                <TableHead>{t("workflowArchitect.table.condition")}</TableHead>
                <TableHead>{t("workflowArchitect.table.pipeline")}</TableHead>
                <TableHead>{t("workflowArchitect.table.priority")}</TableHead>
                <TableHead>{t("workflowArchitect.table.active")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Zap className="h-8 w-8 opacity-20" />
                        <span>{t("workflowArchitect.noResults")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{rule.entity}</Badge>
                        <ArrowRight className="h-3 w-3 opacity-30" />
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          {rule.event.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.conditions?.length > 0 ? (
                        <span className="text-sm text-amber-600 font-medium">
                          {t("workflowArchitect.filters", { count: rule.conditions.length })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{t("workflowArchitect.always")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {rule.actions?.map((a: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1 font-normal opacity-80 whitespace-nowrap">
                            {a.type.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {rule.priority}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={rule.isActive} 
                        onCheckedChange={() => toggleMutation.mutate(rule.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
