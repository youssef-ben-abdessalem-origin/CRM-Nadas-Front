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

export default function WorkflowArchitect() {
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
      toast.success("Rule deleted successfully");
    },
  });

  const handleDelete = async (id: string) => {
    if (await confirm({
      title: "Delete Automation Rule",
      description: "Are you sure you want to delete this rule? This action cannot be undone and will stop all automated tasks associated with this trigger.",
      variant: "destructive",
      confirmText: "Delete Rule"
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Workflow Architect">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading workflows...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Workflow Architect">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Workflow Architect</h1>
            <p className="text-muted-foreground">Orchestrate automated business operations</p>
          </div>
          <Button onClick={() => navigate("/automations/new")}>
            <Plus className="h-4 w-4 mr-2" /> Start New Workflow
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Zap className="h-8 w-8 opacity-20" />
                        <span>No automation rules found</span>
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
                          {rule.conditions.length} filters
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Always</span>
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
