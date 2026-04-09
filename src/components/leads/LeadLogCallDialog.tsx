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
  Mic,
} from "lucide-react";
import { Lead, api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LeadLogCallDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadLogCallDialog = ({ lead, open, onOpenChange }: LeadLogCallDialogProps) => {
  const queryClient = useQueryClient();
  const [callData, setCallData] = useState({
    callFor: "Lead",
    relatedTo: "Account",
    callType: "Outbound",
    status: "Completed",
    startDate: new Date().toISOString().split('T')[0],
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    durationMinutes: "00",
    durationSeconds: "00",
    subject: "",
    voiceRecording: ""
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activityTypes"],
    queryFn: () => api.activities.getTypes().catch(() => []),
  });

  const logMutation = useMutation({
    mutationFn: (data: any) => {
      const callTypeId = activityTypes.find((t: any) => t.name.toLowerCase().includes('call'))?.id || 0;
      return api.activities.create({
        entityType: "lead",
        entityId: lead!.id,
        typeId: callTypeId,
        subject: data.subject,
        dueDate: `${data.startDate}T${data.startTime}:00Z`,
        assignedToId: lead?.ownerId,
        callType: data.callType,
        status: "Completed",
        durationMinutes: data.durationMinutes,
        durationSeconds: data.durationSeconds,
        voiceRecording: data.voiceRecording
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", "lead", lead?.id] });
      toast.success("Call logged successfully");
      onOpenChange(false);
    }
  });

  useEffect(() => {
    if (open && lead) {
      const now = new Date();
      setCallData({
        callFor: "Lead",
        relatedTo: "Account",
        callType: "Outbound",
        status: "Completed",
        startDate: now.toISOString().split('T')[0],
        startTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        durationMinutes: "00",
        durationSeconds: "00",
        subject: `Outgoing call to ${lead.name}`,
        voiceRecording: ""
      });
    }
  }, [open, lead]);

  const handleLog = () => {
    if (!callData.subject) {
      toast.error("Subject is required");
      return;
    }
    logMutation.mutate(callData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/50 shadow-2xl bg-card">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Log a call
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
                <Select value={callData.callType} onValueChange={(v) => setCallData({ ...callData, callType: v })}>
                  <SelectTrigger className="h-10 border-border bg-background focus:ring-2 focus:ring-primary/20 ring-offset-0 hover:border-primary/30 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outbound">Outbound</SelectItem>
                    <SelectItem value="Inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
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

              {/* Call Duration */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Call Duration</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={callData.durationMinutes}
                      onChange={(e) => setCallData({ ...callData, durationMinutes: e.target.value })}
                      className="w-12 h-10 border-border bg-background text-center focus-visible:ring-primary/20"
                    />
                    <span className="text-[11px] text-muted-foreground font-medium lowercase">minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={callData.durationSeconds}
                      onChange={(e) => setCallData({ ...callData, durationSeconds: e.target.value })}
                      className="w-12 h-10 border-border bg-background text-center focus-visible:ring-primary/20"
                    />
                    <span className="text-[11px] text-muted-foreground font-medium lowercase">seconds</span>
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

              {/* Voice Recording */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-right text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Voice Recording</Label>
                <div className="relative">
                  <Input
                    value={callData.voiceRecording}
                    onChange={(e) => setCallData({ ...callData, voiceRecording: e.target.value })}
                    placeholder="Link to recording..."
                    className="h-10 border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:border-primary/30 pr-10 border-blue-400"
                  />
                  <Mic className="absolute right-3 top-3 h-3.5 w-3.5 text-blue-400" />
                </div>
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
            onClick={handleLog}
            disabled={logMutation.isPending}
            className="h-10 px-8 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 hover:opacity-90"
          >
            {logMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
