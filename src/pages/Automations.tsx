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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.success(t("automations.statusUpdates.ruleCreated"));
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
      toast.success(t("automations.statusUpdates.ruleDeleted"));
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
      toast.error(t("automations.errors.nameRequired"));
      return;
    }

    if (actionType === "assign_owner" && !assignOwnerId) {
      toast.error(t("automations.errors.selectOwner"));
      return;
    }
    if (actionType === "create_task" && !taskSubject.trim()) {
      toast.error(t("automations.errors.taskSubjectRequired"));
      return;
    }
    if (actionType === "send_notification" && !notificationTitle.trim()) {
      toast.error(t("automations.errors.notificationTitleRequired"));
      return;
    }
    if (actionType === "send_email" && !emailSubject.trim()) {
      toast.error(t("automations.errors.emailSubjectRequired"));
      return;
    }
    if (actionType === "send_email" && !emailToEntityContact && !emailTo.trim()) {
      toast.error(t("automations.errors.provideRecipientEmail"));
      return;
    }
    if (actionType === "send_email" && emailSenderMode === "specific" && !emailSenderUserId) {
      toast.error(t("automations.errors.selectSender"));
      return;
    }
    if (useCondition && !conditionField) {
      toast.error(t("automations.errors.selectConditionField"));
      return;
    }
    if (useCondition && requiresConditionValue && !conditionValue.trim()) {
      toast.error(t("automations.errors.provideConditionValue"));
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
        toast.error(t("automations.errors.chooseOwnerValue"));
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
    <CRMLayout title={t("automations.pageTitle")}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("automations.createRule")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>{t("automations.name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("automations.placeholders.ruleName")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("automations.entity")}</Label>
              <Select value={entityType} onValueChange={(v: "lead" | "deal") => setEntityType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">{t("automations.lead")}</SelectItem>
                  <SelectItem value="deal">{t("automations.deal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("automations.event")}</Label>
              <Select value={eventType} onValueChange={(v: "created" | "updated") => setEventType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">{t("automations.created")}</SelectItem>
                  <SelectItem value="updated">{t("automations.updated")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
              <Checkbox
                checked={useCondition}
                onCheckedChange={(v) => setUseCondition(Boolean(v))}
                id="use-condition"
              />
              <Label htmlFor="use-condition">{t("automations.addCondition")}</Label>
            </div>

            {useCondition && (
              <>
                <div className="space-y-2">
                  <Label>{t("automations.conditionField")}</Label>
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
                  <Label>{t("automations.conditionOperator")}</Label>
                  <Select
                    value={conditionOperator}
                    onValueChange={setConditionOperator}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">{t("automations.operators.equals")}</SelectItem>
                      <SelectItem value="not_equals">{t("automations.operators.notEquals")}</SelectItem>
                      <SelectItem value="contains">{t("automations.operators.contains")}</SelectItem>
                      <SelectItem value="gt">{t("automations.operators.greaterThan")}</SelectItem>
                      <SelectItem value="gte">{t("automations.operators.greaterOrEqual")}</SelectItem>
                      <SelectItem value="lt">{t("automations.operators.lessThan")}</SelectItem>
                      <SelectItem value="lte">{t("automations.operators.lessOrEqual")}</SelectItem>
                      <SelectItem value="is_empty">{t("automations.operators.isEmpty")}</SelectItem>
                      <SelectItem value="is_not_empty">{t("automations.operators.isNotEmpty")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {requiresConditionValue && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("automations.conditionValue")}</Label>
                    {conditionField === "ownerId" ? (
                      <Select value={conditionValue} onValueChange={setConditionValue}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("automations.placeholders.selectOwner")} />
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
                        placeholder={t("automations.placeholders.conditionValue")}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>{t("automations.action")}</Label>
              <Select value={actionType} onValueChange={(v: AutomationRule["actionType"]) => setActionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign_owner">{t("automations.assignOwner")}</SelectItem>
                  <SelectItem value="create_task">{t("automations.createTask")}</SelectItem>
                  <SelectItem value="send_notification">{t("automations.sendNotification")}</SelectItem>
                  <SelectItem value="send_email">{t("automations.sendEmail")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionType === "assign_owner" && (
              <div className="space-y-2 md:col-span-2">
                <Label>{t("automations.owner")}</Label>
                <Select value={assignOwnerId} onValueChange={setAssignOwnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("automations.placeholders.selectOwner")} />
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
                  <Label>{t("automations.taskSubject")}</Label>
                  <Input value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("automations.dueIn")}</Label>
                  <Select value={taskDueInDays} onValueChange={setTaskDueInDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("automations.dueInOptions.1day")}</SelectItem>
                      <SelectItem value="2">{t("automations.dueInOptions.2days")}</SelectItem>
                      <SelectItem value="3">{t("automations.dueInOptions.3days")}</SelectItem>
                      <SelectItem value="7">{t("automations.dueInOptions.7days")}</SelectItem>
                      <SelectItem value="14">{t("automations.dueInOptions.14days")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("automations.priority")}</Label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">{t("automations.priorityOptions.low")}</SelectItem>
                      <SelectItem value="Normal">{t("automations.priorityOptions.normal")}</SelectItem>
                      <SelectItem value="High">{t("automations.priorityOptions.high")}</SelectItem>
                      <SelectItem value="Urgent">{t("automations.priorityOptions.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={taskAssignToEntityOwner}
                    onCheckedChange={(v) => setTaskAssignToEntityOwner(Boolean(v))}
                    id="task-entity-owner"
                  />
                  <Label htmlFor="task-entity-owner">{t("automations.assignToRecordOwner")}</Label>
                </div>
                {!taskAssignToEntityOwner && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("automations.specificTaskOwner")}</Label>
                    <Select value={taskOwnerId} onValueChange={setTaskOwnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("automations.placeholders.selectUser")} />
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
                  <Label>{t("automations.notificationTitle")}</Label>
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("automations.message")}</Label>
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
                  <Label htmlFor="notify-entity-owner">{t("automations.notifyRecordOwner")}</Label>
                </div>
                {!notifyEntityOwner && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("automations.recipientUser")}</Label>
                    <Select value={notificationUserId} onValueChange={setNotificationUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("automations.placeholders.selectUser")} />
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
                  <Label>{t("automations.emailSubject")}</Label>
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("automations.emailBody")}</Label>
                  <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={5} />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={emailToEntityContact}
                    onCheckedChange={(v) => setEmailToEntityContact(Boolean(v))}
                    id="email-entity-contact"
                  />
                  <Label htmlFor="email-entity-contact">{t("automations.sendToRecordEmail")}</Label>
                </div>
                {!emailToEntityContact && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("automations.recipientEmail")}</Label>
                    <Input
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder={t("automations.placeholders.recipientEmail")}
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("automations.sender")}</Label>
                  <Select value={emailSenderMode} onValueChange={(v: "actor" | "owner" | "specific") => setEmailSenderMode(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actor">{t("automations.senderOptions.actor")}</SelectItem>
                      <SelectItem value="owner">{t("automations.senderOptions.owner")}</SelectItem>
                      <SelectItem value="specific">{t("automations.senderOptions.specific")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {emailSenderMode === "specific" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("automations.specificSender")}</Label>
                    <Select value={emailSenderUserId} onValueChange={setEmailSenderUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("automations.placeholders.selectSender")} />
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
                {createMutation.isPending ? t("common.creating") : t("automations.createRuleButton")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("automations.existingRules")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("automations.table.trigger")}</TableHead>
                  <TableHead>{t("automations.table.condition")}</TableHead>
                  <TableHead>{t("automations.table.action")}</TableHead>
                  <TableHead>{t("automations.table.status")}</TableHead>
                  <TableHead className="text-right">{t("automations.table.controls")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : sortedRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      {t("automations.noResults")}
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
                          : t("automations.always")}
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
                          {rule.isActive ? t("automations.active") : t("automations.paused")}
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
