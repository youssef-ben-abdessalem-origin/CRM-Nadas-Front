import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CRMLayout } from "@/components/CRMLayout";
import { LeadForm } from "@/components/leads/LeadForm";
import api from "@/lib/api";

const NewLead = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const { data: sources = [] } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: () => api.leads.getSources().catch(() => []),
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["lead-stages"],
    queryFn: () => api.leads.getStages().catch(() => []),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["lead-scores"],
    queryFn: () => api.leads.getScores().catch(() => []),
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ["lead-priorities"],
    queryFn: () => api.leads.getPriorities().catch(() => []),
  });

  const { data: qualifications = [] } = useQuery({
    queryKey: ["lead-qualifications"],
    queryFn: () => api.leads.getQualifications().catch(() => []),
  });

  const defaultStage = stages.find((s: any) => s.order === 1) || stages[0];
  const defaultScore = scores.find((s: any) => s.order === 1) || scores[0];
  const defaultPriority = priorities.find((p: any) => p.order === 2) || priorities[0];
  const defaultQualification = qualifications.find((q: any) => q.order === 1) || qualifications[0];

  const createMutation = useMutation({
    mutationFn: api.leads.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Lead created successfully");
      navigate("/leads");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (data: any) => {
    const { useExistingAccount, ...rest } = data;

    if (!rest.name || !rest.emails[0]) {
      toast.error("Please fill in required fields");
      return;
    }
    if (!useExistingAccount && !rest.company) {
      toast.error("Please enter a company name or select an existing account");
      return;
    }

    createMutation.mutate({
      ...rest,
      emails: rest.emails.filter((e: string) => e.trim() !== ""),
      phones: rest.phones.filter((p: string) => p.trim() !== ""),
      company: useExistingAccount
        ? accounts.find((a: any) => a.id === rest.accountId)?.name || ""
        : rest.company,
      sourceId: rest.sourceId || sources[0]?.id,
      value: Number.parseInt(rest.value) || 0,
      stageId: rest.stageId || defaultStage?.id,
      scoreCategoryId: rest.scoreCategoryId || defaultScore?.id,
      priorityId: rest.priorityId || defaultPriority?.id,
      qualificationStageId: rest.qualificationStageId || defaultQualification?.id,
      website: useExistingAccount
        ? accounts.find((a: any) => a.id === rest.accountId)?.website
        : rest.website,
      nextFollowUp: rest.nextFollowUp ? new Date(rest.nextFollowUp) : undefined,
      accountId: useExistingAccount ? rest.accountId : undefined,
    });
  };

  return (
    <CRMLayout title="Add New Lead">
      <div className=" py-2 px-1">


        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <LeadForm
            onCancel={() => navigate("/leads")}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
          />
        </div>
      </div>
    </CRMLayout>
  );
};

export default NewLead;
