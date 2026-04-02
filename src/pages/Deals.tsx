import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { DollarSign, User, Building2, MoreHorizontal, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

type DealStage = "qualification" | "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

interface Deal {
  id: number;
  name: string;
  company: string;
  value: number;
  contact: string;
  probability: number;
  daysInStage: number;
  stage: DealStage;
}

const stages: { key: DealStage; label: string; color: string }[] = [
  { key: "qualification", label: "Qualification", color: "bg-muted-foreground" },
  { key: "discovery", label: "Discovery", color: "bg-primary" },
  { key: "proposal", label: "Proposal", color: "bg-warning" },
  { key: "negotiation", label: "Negotiation", color: "bg-accent-foreground" },
  { key: "closed_won", label: "Closed Won", color: "bg-success" },
  { key: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
];

const Deals = () => {
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: () => api.deals.getAll().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.deals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deals.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const groupedDeals = stages.reduce((acc, stage) => {
    acc[stage.key] = deals.filter((d: Deal) => d.stage === stage.key);
    return acc;
  }, {} as Record<DealStage, Deal[]>);

  const totalPipeline = deals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);

  const handleAddDeal = () => {
    createMutation.mutate({
      name: "New Deal",
      company: "New Company",
      value: 50000,
      stage: "qualification" as DealStage,
    });
  };

  if (isLoading) {
    return (
      <CRMLayout title="Deals Pipeline">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading deals...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Deals Pipeline">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total pipeline: <span className="font-semibold text-foreground">${totalPipeline.toLocaleString()}</span> · {deals.length} deals
          </div>
          <Button size="sm" onClick={handleAddDeal}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Deal
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = groupedDeals[stage.key] || [];
            const stageTotal = stageDeals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);
            return (
              <div key={stage.key} className="pipeline-column shrink-0 min-w-[280px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                    <span className="text-xs text-muted-foreground">({stageDeals.length})</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">${(stageTotal / 1000).toFixed(0)}k</span>
                </div>

                {stageDeals.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">No deals</div>
                ) : (
                  stageDeals.map((deal: Deal) => (
                    <div key={deal.id} className="deal-card bg-card border rounded-lg p-3 mb-2">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground leading-tight">{deal.name}</h4>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMutation.mutate(deal.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Building2 className="h-3 w-3" />
                        <span>{deal.company || "—"}</span>
                        <span className="mx-1">·</span>
                        <User className="h-3 w-3" />
                        <span>{deal.contact || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-sm font-semibold text-foreground">${((deal.value || 0) / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${deal.probability || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{deal.probability || 0}%</span>
                        </div>
                      </div>
                      {(deal.daysInStage || 0) > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">{deal.daysInStage}d in stage</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CRMLayout>
  );
};

export default Deals;