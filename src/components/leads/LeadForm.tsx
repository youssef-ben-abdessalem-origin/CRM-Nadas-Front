import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Building2, UserPlus } from "lucide-react";
import api from "@/lib/api";

interface DynamicOption {
  id: number;
  name: string;
  color?: string;
}

interface LeadFormProps {
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export const LeadForm = ({ onCancel, onSubmit, isPending }: LeadFormProps) => {
  const [useExistingAccount, setUseExistingAccount] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    emails: [""] as string[],
    phones: [""] as string[],
    company: "",
    title: "",
    sourceId: 0,
    value: "",
    stageId: 0,
    scoreCategoryId: 0,
    priorityId: 0,
    qualificationStageId: 0,
    location: "",
    industry: "",
    website: "",
    notes: "",
    tags: [] as string[],
    ownerId: undefined as number | undefined,
    nextFollowUp: "",
    accountId: null as number | null,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...newLead,
      useExistingAccount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-2">
          Basic Info
        </div>

        <div className="space-y-2">
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="John Doe"
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Emails <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setNewLead({ ...newLead, emails: [...newLead.emails, ""] })}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {newLead.emails.map((email, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => {
                  const next = [...newLead.emails];
                  next[idx] = e.target.value;
                  setNewLead({ ...newLead, emails: next });
                }}
                required={idx === 0}
              />
              {idx > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setNewLead({ ...newLead, emails: newLead.emails.filter((_, i) => i !== idx) })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Phones</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setNewLead({ ...newLead, phones: [...newLead.phones, ""] })}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {newLead.phones.map((phone, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => {
                  const next = [...newLead.phones];
                  next[idx] = e.target.value;
                  setNewLead({ ...newLead, phones: next });
                }}
              />
              {idx > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setNewLead({ ...newLead, phones: newLead.phones.filter((_, i) => i !== idx) })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Company <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                type="button"
                variant={useExistingAccount ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setUseExistingAccount(false)}
                className="rounded-none h-8 px-3"
                title="New Company"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={useExistingAccount ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setUseExistingAccount(true)}
                className="rounded-none h-8 px-3 border-l"
                title="Existing Account"
              >
                <Building2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {useExistingAccount ? (
            <Select
              value={newLead.accountId?.toString() || ""}
              onValueChange={(v) => setNewLead({ ...newLead, accountId: Number.parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account: any) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="Acme Corp"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              required={!useExistingAccount}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="VP of Engineering"
            value={newLead.title}
            onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Stage</Label>
          <Select
            value={String(newLead.stageId)}
            onValueChange={(v) => setNewLead({ ...newLead, stageId: Number.parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage: DynamicOption) => (
                <SelectItem key={stage.id} value={String(stage.id)}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sales Data */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-2 mt-4">
          Sales Data
        </div>

        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            value={String(newLead.sourceId)}
            onValueChange={(v) => setNewLead({ ...newLead, sourceId: Number.parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source: DynamicOption) => (
                <SelectItem key={source.id} value={String(source.id)}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Est. Value</Label>
          <Input
            type="number"
            placeholder="50000"
            value={newLead.value}
            onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Lead Score</Label>
          <Select
            value={String(newLead.scoreCategoryId)}
            onValueChange={(v) => setNewLead({ ...newLead, scoreCategoryId: Number.parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select score" />
            </SelectTrigger>
            <SelectContent>
              {scores.map((score: DynamicOption) => (
                <SelectItem key={score.id} value={String(score.id)}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: score.color || "#6b7280" }}
                    />
                    {score.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={String(newLead.priorityId)}
            onValueChange={(v) => setNewLead({ ...newLead, priorityId: Number.parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority: DynamicOption) => (
                <SelectItem key={priority.id} value={String(priority.id)}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: priority.color || "#6b7280" }}
                    />
                    {priority.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Qualification</Label>
          <Select
            value={String(newLead.qualificationStageId)}
            onValueChange={(v) => setNewLead({ ...newLead, qualificationStageId: Number.parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select qualification" />
            </SelectTrigger>
            <SelectContent>
              {qualifications.map((qual: DynamicOption) => (
                <SelectItem key={qual.id} value={String(qual.id)}>
                  {qual.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-2 mt-4">
          Organization
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="San Francisco, CA"
            value={newLead.location}
            onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Input
            placeholder="Technology"
            value={newLead.industry}
            onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Website</Label>
          <Input
            placeholder="https://company.com"
            value={newLead.website}
            onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input
            placeholder="enterprise, hot-lead"
            value={newLead.tags.join(", ")}
            onChange={(e) =>
              setNewLead({
                ...newLead,
                tags: e.target.value.split(",").map((t) => t.trim()).filter((t) => t !== ""),
              })
            }
          />
        </div>

        {/* Follow-up */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-2 mt-4">
          Follow-up
        </div>

        <div className="space-y-2">
          <Label>Next Follow-up Date</Label>
          <Input
            type="date"
            value={newLead.nextFollowUp}
            onChange={(e) => setNewLead({ ...newLead, nextFollowUp: e.target.value })}
          />
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
          <Label>Notes</Label>
          <Textarea
            placeholder="Any additional context..."
            value={newLead.notes}
            onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <UserPlus className="h-4 w-4 mr-2" />
          {isPending ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </form>
  );
};
