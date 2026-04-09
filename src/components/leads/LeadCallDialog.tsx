import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Search,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { Lead, api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LeadCallDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadCallDialog = ({ lead, open, onOpenChange }: LeadCallDialogProps) => {
  const queryClient = useQueryClient();
  const [callData, setCallData] = useState({
    callFor: "Lead",
    relatedTo: "Account",
    callType: "Outbound",
    status: "Scheduled",
    startDate: new Date().toISOString().split('T')[0],
    startTime: "11:00",
    ownerId: 0,
    subject: "",
    reminder: "None"
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll().catch(() => []),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activityTypes"],
    queryFn: () => api.activities.getTypes().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const callTypeId = activityTypes.find((t: any) => t.name.toLowerCase().includes('call'))?.id || 0;
      return api.activities.create({
        entityType: "lead",
        entityId: lead!.id,
        typeId: callTypeId,
        subject: data.subject,
        dueDate: `${data.startDate}T${data.startTime}:00Z`,
        assignedToId: data.ownerId,
        callType: data.callType,
        reminder: data.reminder,
        status: data.status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", "lead", lead?.id] });
      toast.success("Call scheduled successfully");
      onOpenChange(false);
    }
  });

  useEffect(() => {
    if (open && lead) {
      const today = new Date();
      setCallData({
        callFor: "Lead",
        relatedTo: "Account",
        callType: "Outbound",
        status: "Scheduled",
        startDate: today.toISOString().split('T')[0],
        startTime: "11:00",
        ownerId: lead.ownerId,
        subject: `Call scheduled with ${lead.name}`,
        reminder: "None"
      });
    }
  }, [open, lead]);

  const handleSchedule = () => {
    if (!callData.subject) {
      toast.error("Subject is required");
      return;
    }
    createMutation.mutate(callData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/50 shadow-2xl bg-card">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Schedule a call
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-8">
          <div className="space-y-6">


            <div className="space-y-5">
              {/* Call For */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Call For</Label>
                <div className="flex gap-0 group">
                  <Select value={callData.callFor} onValueChange={(v) => setCallData({ ...callData, callFor: v })}>
                    <SelectTrigger className="w-[110px] h-10 rounded-r-none border-border bg-background focus:ring-0 focus:ring-offset-0 transition-colors group-hover:border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Input
                      value={lead?.name || ""}
                      readOnly
                      className="h-10 rounded-l-none border-l-0 border-border bg-background focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 group-hover:border-primary/30"
                    />
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/40" />
                  </div>
                </div>
              </div>

              {/* Related To */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Related To</Label>
                <div className="flex gap-0 opacity-80 hover:opacity-100 transition-opacity">
                  <Select value={callData.relatedTo} onValueChange={(v) => setCallData({ ...callData, relatedTo: v })}>
                    <SelectTrigger className="w-[110px] h-10 rounded-r-none border-border bg-muted/30 text-muted-foreground">
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Account">Account</SelectItem>
                      <SelectItem value="Deal">Deal</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Input
                      placeholder=""
                      className="h-10 rounded-l-none border-l-0 border-border bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </div>

              {/* Call Type */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Call Type</Label>
                <div className="relative group">
                  <Input
                    value={callData.callType}
                    readOnly
                    className="h-10 border-border bg-background pr-10 group-hover:border-primary/30 transition-colors"
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/30" />
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Status</Label>
                <div className="relative group">
                  <Input
                    value={callData.status}
                    readOnly
                    className="h-10 border-border bg-background pr-10 group-hover:border-primary/30 transition-colors"
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/30" />
                </div>
              </div>

              {/* Call Start Time */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Start Time</Label>
                <div className="flex gap-0 group">
                  <Input
                    type="date"
                    value={callData.startDate}
                    onChange={(e) => setCallData({ ...callData, startDate: e.target.value })}
                    className="h-10 rounded-r-none border-border bg-background focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-primary/30 transition-colors"
                  />
                  <Input
                    type="time"
                    value={callData.startTime}
                    onChange={(e) => setCallData({ ...callData, startTime: e.target.value })}
                    className="h-10 rounded-l-none border-l-0 border-border bg-background focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-primary/30 transition-colors"
                  />
                </div>
              </div>

              {/* Call Owner */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Call Owner</Label>
                <div className="flex gap-0 group">
                  <Select
                    value={String(callData.ownerId)}
                    onValueChange={(v) => setCallData({ ...callData, ownerId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="flex-1 h-10 rounded-r-none border-border bg-background focus:ring-0 focus:ring-offset-0 group-hover:border-primary/30 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member: any) => (
                        <SelectItem key={member.id} value={String(member.id)}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-center w-10 border border-l-0 border-border rounded-r-md bg-muted/50 group-hover:border-primary/30 transition-colors">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Subject</Label>
                <Input
                  value={callData.subject}
                  onChange={(e) => setCallData({ ...callData, subject: e.target.value })}
                  placeholder="Enter call subject..."
                  className="h-10 border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:border-primary/30"
                />
              </div>

              {/* Reminder */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Reminder</Label>
                <Select value={callData.reminder} onValueChange={(v) => setCallData({ ...callData, reminder: v })}>
                  <SelectTrigger className="h-10 border-border bg-background focus:ring-2 focus:ring-primary/20 ring-offset-0 hover:border-primary/30 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="5 minutes before">5 minutes before</SelectItem>
                    <SelectItem value="10 minutes before">10 minutes before</SelectItem>
                    <SelectItem value="15 minutes before">15 minutes before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-muted/30 border-t border-border/50 flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={createMutation.isPending}
            className="h-10 px-8 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 hover:opacity-90"
          >
            {createMutation.isPending ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
