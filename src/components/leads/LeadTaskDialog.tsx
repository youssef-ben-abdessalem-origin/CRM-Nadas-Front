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
import { Switch } from "@/components/ui/switch";
import {
  Search,
  X,
  User as UserIcon,
  FileText,
  RefreshCw,
  Bell,
} from "lucide-react";
import { Lead, api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LeadTaskDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SubView = "main" | "subject" | "reminder" | "repeat";

const COMMON_SUBJECTS = ["Email", "Call", "Meeting", "Send Letter", "Product Demo", "Follow-up", "Negotiation"];
const PRIORITIES = ["Highest", "High", "Normal", "Low", "Lowest"];

export const LeadTaskDialog = ({ lead, open, onOpenChange }: LeadTaskDialogProps) => {
  const queryClient = useQueryClient();
  const [subView, setSubView] = useState<SubView>("main");
  const [taskData, setTaskData] = useState({
    subject: "",
    dueDate: "",
    priority: "Normal",
    ownerId: lead?.ownerId || 0,
    hasReminder: false,
    hasRepeat: false,
    reminder: {
      type: "on_date" as "on_date" | "before_due",
      date: "",
      time: "09:00",
      period: "AM",
      relativeValue: 1,
      relativeUnit: "Day(s)",
      alert: "Both"
    },
    repeat: {
      type: "Daily",
      ends: "Never" as "Never" | "After" | "On",
      afterOccurrences: 1,
      endDate: ""
    }
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.tasks.create({
      entityType: "lead",
      entityId: lead!.id,
      subject: data.subject,
      priority: data.priority,
      dueDate: data.dueDate,
      ownerId: data.ownerId,
      description: data.description || "",
      hasReminder: data.hasReminder,
      hasRepeat: data.hasRepeat,
      reminder: data.reminder,
      repeat: data.repeat,
      status: "Pending"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", "lead", lead?.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "lead", lead?.id] });
      toast.success("Task created successfully");
      onOpenChange(false);
    }
  });

  useEffect(() => {
    if (open) {
      setSubView("main");
      if (lead) setTaskData(prev => ({ ...prev, ownerId: lead.ownerId }));
    }
  }, [open, lead]);

  const handleSave = () => {
    if (!taskData.subject) {
      toast.error("Subject is required");
      return;
    }
    createMutation.mutate(taskData);
  };

  const renderSubjectView = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by Subject" className="pl-10 h-10" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
          Subject
        </div>
        <div className="divide-y divide-border">
          {COMMON_SUBJECTS.map((s) => (
            <button
              key={s}
              className="w-full flex items-center px-4 py-3 hover:bg-muted/50 transition-colors group"
              onClick={() => {
                setTaskData({ ...taskData, subject: s });
                setSubView("main");
              }}
            >
              <div className={`h-4 w-4 rounded-full border border-primary mr-3 flex items-center justify-center ${taskData.subject === s ? "bg-primary" : ""}`}>
                {taskData.subject === s && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">{s}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 text-xs text-muted-foreground px-1">
        <button className="hover:text-foreground">Previous</button>
        <button className="hover:text-foreground">Next</button>
      </div>
    </div>
  );

  const renderReminderView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="radio"
            checked={taskData.reminder.type === "on_date"}
            onChange={() => setTaskData({ ...taskData, reminder: { ...taskData.reminder, type: "on_date" } })}
            className="h-4 w-4 text-primary"
          />
          <span className="text-sm">On</span>
          <Input
            type="date"
            value={taskData.reminder.date}
            onChange={(e) => setTaskData({ ...taskData, reminder: { ...taskData.reminder, date: e.target.value } })}
            className="w-40 h-9"
          />
          <span className="text-sm">at</span>
          <Input
            type="time"
            value={taskData.reminder.time}
            onChange={(e) => setTaskData({ ...taskData, reminder: { ...taskData.reminder, time: e.target.value } })}
            className="w-32 h-9"
          />
        </div>

        <div className="flex items-center gap-4">
          <input
            type="radio"
            checked={taskData.reminder.type === "before_due"}
            onChange={() => setTaskData({ ...taskData, reminder: { ...taskData.reminder, type: "before_due" } })}
            className="h-4 w-4 text-primary"
          />
          <Input
            type="number"
            value={taskData.reminder.relativeValue}
            onChange={(e) => setTaskData({ ...taskData, reminder: { ...taskData.reminder, relativeValue: Number.parseInt(e.target.value) } })}
            className="w-16 h-9"
          />
          <Select
            value={taskData.reminder.relativeUnit}
            onValueChange={(val) => setTaskData({ ...taskData, reminder: { ...taskData.reminder, relativeUnit: val } })}
          >
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Min(s)">Min(s)</SelectItem>
              <SelectItem value="Hour(s)">Hour(s)</SelectItem>
              <SelectItem value="Day(s)">Day(s)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">before of due date at</span>
          <Input
            type="time"
            value={taskData.reminder.time}
            className="w-32 h-9"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Alert</Label>
          <Select
            value={taskData.reminder.alert}
            onValueChange={(val) => setTaskData({ ...taskData, reminder: { ...taskData.reminder, alert: val } })}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Both">Both</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Popup">Popup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => setSubView("main")} className="bg-primary text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">Done</Button>
      </div>
    </div>
  );

  const renderRepeatView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Type</Label>
        <Select
          value={taskData.repeat.type}
          onValueChange={(val) => setTaskData({ ...taskData, repeat: { ...taskData.repeat, type: val } })}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Daily">Daily</SelectItem>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <Label className="text-sm font-medium block">Ends</Label>

        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={taskData.repeat.ends === "Never"}
              onChange={() => setTaskData({ ...taskData, repeat: { ...taskData.repeat, ends: "Never" } })}
              className="h-4 w-4"
            />
            <span className="text-sm">Never</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={taskData.repeat.ends === "After"}
              onChange={() => setTaskData({ ...taskData, repeat: { ...taskData.repeat, ends: "After" } })}
              className="h-4 w-4"
            />
            <span className="text-sm">After</span>
            <Input
              type="number"
              value={taskData.repeat.afterOccurrences}
              onChange={(e) => setTaskData({ ...taskData, repeat: { ...taskData.repeat, afterOccurrences: Number.parseInt(e.target.value) } })}
              className="w-16 h-8"
            />
            <span className="text-sm">Time(s)</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={taskData.repeat.ends === "On"}
              onChange={() => setTaskData({ ...taskData, repeat: { ...taskData.repeat, ends: "On" } })}
              className="h-4 w-4"
            />
            <span className="text-sm">On</span>
            <Input
              type="date"
              value={taskData.repeat.endDate}
              onChange={(e) => setTaskData({ ...taskData, repeat: { ...taskData.repeat, endDate: e.target.value } })}
              className="w-36 h-8"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => setSubView("main")} className="bg-primary text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">Done</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {subView === "main" ? "Create Task" : subView === "subject" ? "Choose Subject" : subView === "reminder" ? "Reminder" : "Repeat"}
            </DialogTitle>


          </div>
        </DialogHeader>

        <div className="px-8 bg-background">
          {subView === "main" && (
            <div className="space-y-1">
              {/* Subject */}
              <div className="group border-b border-border py-2 flex items-center justify-between transition-colors hover:border-primary/50">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Subject</Label>
                  <Input
                    placeholder="Enter task Subject"
                    variant="unstyled"
                    className="h-8 p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium placeholder:text-muted-foreground/50"
                    value={taskData.subject}
                    onChange={(e) => setTaskData({ ...taskData, subject: e.target.value })}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" onClick={() => setSubView("subject")}>
                  <FileText className="h-4 w-4" />
                </Button>
              </div>

              {/* Due Date */}
              <div className="group border-b border-border py-2 flex items-center justify-between transition-colors hover:border-primary/50">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Due Date</Label>
                  <Input
                    type="date"
                    variant="unstyled"
                    className="h-8 p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="group border-b border-border py-2 flex items-center justify-between transition-colors hover:border-primary/50">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Priority</Label>
                  <Select
                    value={taskData.priority}
                    onValueChange={(val) => setTaskData({ ...taskData, priority: val })}
                  >
                    <SelectTrigger className="h-8 p-0 border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Owner */}
              <div className="group border-b border-border py-2 flex items-center justify-between transition-colors hover:border-primary/50">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Owner</Label>
                  <Select
                    value={String(taskData.ownerId)}
                    onValueChange={(val) => setTaskData({ ...taskData, ownerId: Number.parseInt(val) })}
                  >
                    <SelectTrigger className="h-8 p-0 border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Reminder Toggle */}
              <div className="border-b border-border py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${taskData.hasReminder ? "bg-primary/10" : "bg-muted"}`}>
                    <Bell className={`h-4 w-4 ${taskData.hasReminder ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <Label className="text-sm font-medium">Reminder</Label>
                </div>
                <div className="flex items-center gap-4">
                  {taskData.hasReminder && (
                    <button onClick={() => setSubView("reminder")} className="text-xs text-primary font-bold hover:underline">
                      Settings
                    </button>
                  )}
                  <Switch
                    checked={taskData.hasReminder}
                    onCheckedChange={(val) => {
                      setTaskData({ ...taskData, hasReminder: val });
                      if (val) setSubView("reminder");
                    }}
                  />
                </div>
              </div>

              {/* Repeat Toggle */}
              <div className="border-b border-border py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${taskData.hasRepeat ? "bg-primary/10" : "bg-muted"}`}>
                    <RefreshCw className={`h-4 w-4 ${taskData.hasRepeat ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <Label className="text-sm font-medium">Repeat</Label>
                </div>
                <div className="flex items-center gap-4">
                  {taskData.hasRepeat && (
                    <button onClick={() => setSubView("repeat")} className="text-xs text-primary font-bold hover:underline">
                      Settings
                    </button>
                  )}
                  <Switch
                    checked={taskData.hasRepeat}
                    onCheckedChange={(val) => {
                      setTaskData({ ...taskData, hasRepeat: val });
                      if (val) setSubView("repeat");
                    }}
                  />
                </div>
              </div>


            </div>
          )}

          {subView === "subject" && renderSubjectView()}
          {subView === "reminder" && renderReminderView()}
          {subView === "repeat" && renderRepeatView()}
        </div>

        {subView === "main" && (
          <DialogFooter className="p-6 bg-card border-t border-border flex items-center gap-3">
            <Button variant="outline" className="h-10 px-6 font-semibold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="h-10 px-8 bg-primary text-white font-semibold shadow-lg shadow-primary/20 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" onClick={handleSave}>
              Save Task
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
