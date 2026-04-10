import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import api, { AutomationRule } from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type ConditionField = {
  value: string;
  label: string;
};

const conditionFields: Record<"lead" | "deal", ConditionField[]> = {
  lead: [
    { value: "stage.name", label: "Lead Stage" },
    { value: "scoreCategory.name", label: "Lead Score" },
    { value: "source.name", label: "Lead Source" },
    { value: "ownerId", label: "Owner" },
    { value: "value", label: "Lead Value" },
    { value: "company", label: "Company" },
  ],
  deal: [
    { value: "stage.name", label: "Deal Stage" },
    { value: "ownerId", label: "Owner" },
    { value: "value", label: "Deal Value" },
    { value: "probability", label: "Probability" },
    { value: "company", label: "Company" },
  ],
};

export default function AutomationsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<"lead" | "deal">("lead");
  const [eventType, setEventType] = useState<"created" | "updated">("created");
  const [useCondition, setUseCondition] = useState(false);
  const [conditionField, setConditionField] = useState("stage.name");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [conditionValue, setConditionValue] = useState("");
  const [actionType, setActionType] =
    useState<AutomationRule["actionType"]>("assign_owner");

  const [assignOwnerId, setAssignOwnerId] = useState("");

  const [taskSubject, setTaskSubject] = useState("Follow up");
  const [taskDueInDays, setTaskDueInDays] = useState("2");
  const [taskPriority, setTaskPriority] = useState("Normal");
  const [taskAssignToEntityOwner, setTaskAssignToEntityOwner] = useState(true);
  const [taskOwnerId, setTaskOwnerId] = useState("");

  const [notificationTitle, setNotificationTitle] = useState("Automation Triggered");
  const [notificationMessage, setNotificationMessage] = useState("Rule executed.");
  const [notifyEntityOwner, setNotifyEntityOwner] = useState(true);
  const [notificationUserId, setNotificationUserId] = useState("");

  const [emailSubject, setEmailSubject] = useState("Quick update");
  const [emailBody, setEmailBody] = useState("This is an automated email.");
  const [emailToEntityContact, setEmailToEntityContact] = useState(true);
  const [emailTo, setEmailTo] = useState("");
  const [emailSenderMode, setEmailSenderMode] = useState<"actor" | "owner" | "specific">("actor");
  const [emailSenderUserId, setEmailSenderUserId] = useState("");

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: api.automations.getAll,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users-for-automation"],
    queryFn: api.users.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.automations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success("Automation rule created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: api.automations.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.automations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success("Rule deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sortedRules = useMemo(
    () =>
      [...rules].sort(
        (a: AutomationRule, b: AutomationRule) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [rules],
  );

  const requiresConditionValue = !["is_empty", "is_not_empty"].includes(conditionOperator);

  const actionPayload = useMemo(() => {
    if (actionType === "assign_owner") {
      return assignOwnerId ? { ownerId: Number(assignOwnerId) } : {};
    }

    if (actionType === "create_task") {
      const payload: Record<string, any> = {
        subject: taskSubject || "Follow up",
        dueInDays: Number(taskDueInDays || 2),
        priority: taskPriority,
      };
      if (!taskAssignToEntityOwner && taskOwnerId) payload.ownerId = Number(taskOwnerId);
      return payload;
    }

    if (actionType === "send_notification") {
      const payload: Record<string, any> = {
        title: notificationTitle || "Automation Triggered",
        message: notificationMessage || "Rule executed.",
      };
      if (!notifyEntityOwner && notificationUserId) payload.userId = Number(notificationUserId);
      return payload;
    }

    const payload: Record<string, any> = {
      subject: emailSubject || "Quick update",
      body: emailBody || "",
      senderMode: emailSenderMode,
    };
    if (!emailToEntityContact && emailTo) payload.to = emailTo;
    if (emailSenderMode === "specific" && emailSenderUserId) {
      payload.senderUserId = Number(emailSenderUserId);
    }
    return payload;
  }, [
    actionType,
    assignOwnerId,
    taskSubject,
    taskDueInDays,
    taskPriority,
    taskAssignToEntityOwner,
    taskOwnerId,
    notificationTitle,
    notificationMessage,
    notifyEntityOwner,
    notificationUserId,
    emailSubject,
    emailBody,
    emailToEntityContact,
    emailTo,
    emailSenderMode,
    emailSenderUserId,
  ]);

  const onCreate = () => {
    if (!name.trim()) {
      toast.error("Rule name is required");
      return;
    }

    if (actionType === "assign_owner" && !assignOwnerId) {
      toast.error("Please select an owner");
      return;
    }
    if (actionType === "create_task" && !taskSubject.trim()) {
      toast.error("Task subject is required");
      return;
    }
    if (actionType === "send_notification" && !notificationTitle.trim()) {
      toast.error("Notification title is required");
      return;
    }
    if (actionType === "send_email" && !emailSubject.trim()) {
      toast.error("Email subject is required");
      return;
    }
    if (actionType === "send_email" && !emailToEntityContact && !emailTo.trim()) {
      toast.error("Please provide recipient email");
      return;
    }
    if (actionType === "send_email" && emailSenderMode === "specific" && !emailSenderUserId) {
      toast.error("Please select sender");
      return;
    }
    if (useCondition && !conditionField) {
      toast.error("Please select a condition field");
      return;
    }
    if (useCondition && requiresConditionValue && !conditionValue.trim()) {
      toast.error("Please provide condition value");
      return;
    }

    const finalPayload = { ...actionPayload };

    if (actionType === "send_email" && emailSenderMode === "owner") {
      finalPayload.senderUserId = undefined;
    }
    if (actionType === "send_email" && emailSenderMode === "actor") {
      finalPayload.senderUserId = undefined;
    }
    if (actionType === "send_notification" && notifyEntityOwner) {
      finalPayload.userId = undefined;
    }
    if (actionType === "create_task" && taskAssignToEntityOwner) {
      finalPayload.ownerId = undefined;
    }
    if (actionType === "send_email" && emailToEntityContact) {
      finalPayload.to = undefined;
    }

    if (useCondition && conditionField === "ownerId" && !["is_empty", "is_not_empty"].includes(conditionOperator)) {
      if (!conditionValue) {
        toast.error("Please choose owner value");
        return;
      }
    }

    createMutation.mutate({
      name,
      entityType,
      eventType,
      conditionField: useCondition ? conditionField : undefined,
      conditionOperator: useCondition ? conditionOperator : undefined,
      conditionValue:
        useCondition && requiresConditionValue ? conditionValue : undefined,
      actionType,
      actionPayload: finalPayload,
      isActive: true,
    });
  };

  return (
    <CRMLayout title="Automations">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Rule</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Assign enterprise leads to owner"
              />
            </div>

            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entityType} onValueChange={(v: "lead" | "deal") => setEntityType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Event</Label>
              <Select value={eventType} onValueChange={(v: "created" | "updated") => setEventType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
              <Checkbox
                checked={useCondition}
                onCheckedChange={(v) => setUseCondition(Boolean(v))}
                id="use-condition"
              />
              <Label htmlFor="use-condition">Add Condition</Label>
            </div>

            {useCondition && (
              <>
                <div className="space-y-2">
                  <Label>Condition Field</Label>
                  <Select
                    value={conditionField}
                    onValueChange={setConditionField}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionFields[entityType].map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition Operator</Label>
                  <Select
                    value={conditionOperator}
                    onValueChange={setConditionOperator}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">equals</SelectItem>
                      <SelectItem value="not_equals">not equals</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="gt">greater than</SelectItem>
                      <SelectItem value="gte">greater or equal</SelectItem>
                      <SelectItem value="lt">less than</SelectItem>
                      <SelectItem value="lte">less or equal</SelectItem>
                      <SelectItem value="is_empty">is empty</SelectItem>
                      <SelectItem value="is_not_empty">is not empty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {requiresConditionValue && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Condition Value</Label>
                    {conditionField === "ownerId" ? (
                      <Select value={conditionValue} onValueChange={setConditionValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u: any) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={conditionValue}
                        onChange={(e) => setConditionValue(e.target.value)}
                        placeholder="Condition value"
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={actionType} onValueChange={(v: AutomationRule["actionType"]) => setActionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign_owner">Assign Owner</SelectItem>
                  <SelectItem value="create_task">Create Task</SelectItem>
                  <SelectItem value="send_notification">Send Notification</SelectItem>
                  <SelectItem value="send_email">Send Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionType === "assign_owner" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Owner</Label>
                <Select value={assignOwnerId} onValueChange={setAssignOwnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u: any) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionType === "create_task" && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Task Subject</Label>
                  <Input value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due In</Label>
                  <Select value={taskDueInDays} onValueChange={setTaskDueInDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={taskAssignToEntityOwner}
                    onCheckedChange={(v) => setTaskAssignToEntityOwner(Boolean(v))}
                    id="task-entity-owner"
                  />
                  <Label htmlFor="task-entity-owner">Assign to record owner</Label>
                </div>
                {!taskAssignToEntityOwner && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Specific Task Owner</Label>
                    <Select value={taskOwnerId} onValueChange={setTaskOwnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {actionType === "send_notification" && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Notification Title</Label>
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Message</Label>
                  <Textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={notifyEntityOwner}
                    onCheckedChange={(v) => setNotifyEntityOwner(Boolean(v))}
                    id="notify-entity-owner"
                  />
                  <Label htmlFor="notify-entity-owner">Notify record owner</Label>
                </div>
                {!notifyEntityOwner && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Recipient User</Label>
                    <Select value={notificationUserId} onValueChange={setNotificationUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {actionType === "send_email" && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email Subject</Label>
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email Body</Label>
                  <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={5} />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={emailToEntityContact}
                    onCheckedChange={(v) => setEmailToEntityContact(Boolean(v))}
                    id="email-entity-contact"
                  />
                  <Label htmlFor="email-entity-contact">Send to record email/contact</Label>
                </div>
                {!emailToEntityContact && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Recipient Email</Label>
                    <Input
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="name@company.com"
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label>Sender</Label>
                  <Select value={emailSenderMode} onValueChange={(v: "actor" | "owner" | "specific") => setEmailSenderMode(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actor">User who triggered the event</SelectItem>
                      <SelectItem value="owner">Record owner</SelectItem>
                      <SelectItem value="specific">Specific user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {emailSenderMode === "specific" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Specific Sender</Label>
                    <Select value={emailSenderUserId} onValueChange={setEmailSenderUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sender" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="md:col-span-2">
              <Button onClick={onCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Rule"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Loading rules...
                    </TableCell>
                  </TableRow>
                ) : sortedRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No automation rules yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRules.map((rule: AutomationRule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.entityType}.{rule.eventType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rule.conditionField
                          ? `${rule.conditionField} ${rule.conditionOperator} ${rule.conditionValue ?? ""}`
                          : "Always"}
                      </TableCell>
                      <TableCell>
                        <Badge>{rule.actionType}</Badge>
                        {rule.actionPayload && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {rule.actionType === "assign_owner" && rule.actionPayload.ownerId
                              ? `Owner #${rule.actionPayload.ownerId}`
                              : rule.actionType === "create_task" && rule.actionPayload.subject
                                ? rule.actionPayload.subject
                                : rule.actionType === "send_notification" && rule.actionPayload.title
                                  ? rule.actionPayload.title
                                  : rule.actionType === "send_email" && rule.actionPayload.subject
                                    ? rule.actionPayload.subject
                                    : ""}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-3">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleMutation.mutate(rule.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
}
