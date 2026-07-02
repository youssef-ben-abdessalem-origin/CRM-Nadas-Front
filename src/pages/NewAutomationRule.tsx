import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft,
  Zap,
  CheckCircle2,
  Box,
  Save
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ENTITIES = ["lead", "contact", "deal", "invoice"];
const EVENTS = ["created", "updated", "deleted", "stage_changed"];
const OPERATORS = ["=", "!=", ">", "<", ">=", "<=", "contains"];
const ACTION_TYPES = [
  "assign_owner",
  "send_email",
  "create_task",
  "update_field",
  "add_tag",
  "notify_user"
];

export default function NewAutomationRule() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [ruleName, setRuleName] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("lead");
  const [selectedEvent, setSelectedEvent] = useState("created");
  const [priority, setPriority] = useState(0);
  const [stopIfMatched, setStopIfMatched] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [conditions, setConditions] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: api.users.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.automations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast.success(t("newAutomationRule.statusUpdates.created"));
      navigate("/automations");
    },
  });

  const addCondition = () => {
    setConditions([...conditions, { field: "status", operator: "=", value: "", logic: "AND" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setActions([...actions, { type: "assign_owner", config: {} }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleCreateRule = () => {
    if (!ruleName) return toast.error(t("newAutomationRule.errors.nameRequired"));
    if (actions.length === 0) return toast.error(t("newAutomationRule.errors.actionRequired"));

    createMutation.mutate({
      name: ruleName,
      entity: selectedEntity,
      event: selectedEvent,
      conditions,
      actions,
      priority,
      stopIfMatched,
      isActive,
    });
  };

  return (
    <CRMLayout title={t("newAutomationRule.pageTitle")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/automations")}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">{t("newAutomationRule.title")}</h1>
                <p className="text-muted-foreground">{t("newAutomationRule.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/automations")}>
                Cancel
            </Button>
            <Button 
                onClick={handleCreateRule}
                disabled={createMutation.isPending}
            >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? t("common.creating") : t("newAutomationRule.saveRule")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* General Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        {t("newAutomationRule.generalSettings")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("newAutomationRule.ruleName")}</Label>
                        <Input 
                            placeholder={t("newAutomationRule.placeholders.ruleName")} 
                            value={ruleName}
                            onChange={(e) => setRuleName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("newAutomationRule.triggerEntity")}</Label>
                            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ENTITIES.map(e => <SelectItem key={e} value={e}>{e.toUpperCase()}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("newAutomationRule.triggerEvent")}</Label>
                            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {EVENTS.map(e => <SelectItem key={e} value={e}>{e.replace("_", " ").toUpperCase()}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conditions Builder */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {t("newAutomationRule.conditionsTitle")}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={addCondition}>
                        <Plus className="h-4 w-4 mr-1" /> {t("newAutomationRule.addCondition")}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {conditions.map((cond, idx) => (
                        <div key={idx} className="flex gap-2 items-end border p-4 rounded-lg relative bg-muted/30">
                             <div className="flex-1 space-y-1">
                                <Label className="text-xs text-muted-foreground">{t("newAutomationRule.field")}</Label>
                                <Input 
                                    className="h-8"
                                    placeholder={t("newAutomationRule.placeholders.field")} 
                                    value={cond.field}
                                    onChange={(e) => {
                                        const newConds = [...conditions];
                                        newConds[idx].field = e.target.value;
                                        setConditions(newConds);
                                    }}
                                />
                            </div>
                            <div className="w-24 space-y-1">
                                <Label className="text-xs text-muted-foreground">{t("newAutomationRule.operator")}</Label>
                                <Select value={cond.operator} onValueChange={(v) => {
                                    const newConds = [...conditions];
                                    newConds[idx].operator = v;
                                    setConditions(newConds);
                                }}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {OPERATORS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-muted-foreground">{t("newAutomationRule.value")}</Label>
                                <Input 
                                    className="h-8"
                                    value={cond.value}
                                    onChange={(e) => {
                                        const newConds = [...conditions];
                                        newConds[idx].value = e.target.value;
                                        setConditions(newConds);
                                    }}
                                />
                            </div>
                            <div className="w-24 space-y-1">
                                <Label className="text-xs text-muted-foreground">{t("newAutomationRule.logic")}</Label>
                                <Select value={cond.logic} onValueChange={(v) => {
                                const newConds = [...conditions];
                                newConds[idx].logic = v;
                                setConditions(newConds);
                                }}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AND">AND</SelectItem>
                                    <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeCondition(idx)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {conditions.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-lg">
                            {t("newAutomationRule.noConditions")}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Actions Pipeline */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {t("newAutomationRule.actionsTitle")}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={addAction}>
                        <Plus className="h-4 w-4 mr-1" /> {t("newAutomationRule.addAction")}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {actions.map((action, idx) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge>{idx + 1}</Badge>
                                    <Select 
                                        value={action.type} 
                                        onValueChange={(v: any) => {
                                            const newActions = [...actions];
                                            newActions[idx].type = v;
                                            newActions[idx].config = {};
                                            setActions(newActions);
                                        }}
                                    >
                                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ACTION_TYPES.map(a => <SelectItem key={a} value={a}>{a.replace("_", " ").toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeAction(idx)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {action.type === "assign_owner" && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">{t("newAutomationRule.mode")}</Label>
                                            <Select 
                                                value={action.config.mode || "single"} 
                                                onValueChange={(v) => {
                                                    const newActions = [...actions];
                                                    newActions[idx].config.mode = v;
                                                    setActions(newActions);
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">{t("newAutomationRule.singleOwner")}</SelectItem>
                                                    <SelectItem value="round_robin">{t("newAutomationRule.roundRobin")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {action.config.mode === "single" ? (
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">{t("newAutomationRule.agent")}</Label>
                                                <Select onValueChange={(v) => {
                                                    const newActions = [...actions];
                                                    newActions[idx].config.ownerId = Number(v);
                                                    setActions(newActions);
                                                }}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {users.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <div className="col-span-2 text-xs text-muted-foreground flex items-center gap-2">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {t("newAutomationRule.rotatingLeads")}
                                            </div>
                                        )}
                                    </>
                                )}

                                {action.type === "create_task" && (
                                    <>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-xs text-muted-foreground">{t("newAutomationRule.subject")}</Label>
                                            <Input 
                                                className="h-8"
                                                placeholder={t("newAutomationRule.placeholders.taskDetails")} 
                                                onChange={(e) => {
                                                    const newActions = [...actions];
                                                    newActions[idx].config.title = e.target.value;
                                                    setActions(newActions);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">{t("newAutomationRule.dueDays")}</Label>
                                            <Input 
                                                className="h-8"
                                                type="number" 
                                                placeholder={t("newAutomationRule.placeholders.dueDays")}
                                                onChange={(e) => {
                                                    const newActions = [...actions];
                                                    newActions[idx].config.dueInDays = Number(e.target.value);
                                                    setActions(newActions);
                                                }}
                                            />
                                        </div>
                                    </>
                                )}

                                {action.type === "send_email" && (
                                    <div className="col-span-2 space-y-2">
                                        <Input 
                                            className="h-8"
                                            placeholder={t("newAutomationRule.placeholders.subject")} 
                                            onChange={(e) => {
                                                const newActions = [...actions];
                                                newActions[idx].config.subject = e.target.value;
                                                setActions(newActions);
                                            }}
                                        />
                                        <Textarea 
                                            placeholder={t("newAutomationRule.placeholders.content")} 
                                            rows={2} 
                                            onChange={(e) => {
                                                const newActions = [...actions];
                                                newActions[idx].config.body = e.target.value;
                                                setActions(newActions);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {actions.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-lg">
                            {t("newAutomationRule.noActions")}
                        </p>
                    )}
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
              {/* Controls */}
              <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">{t("newAutomationRule.settings")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                        <Label className="text-sm">{t("newAutomationRule.active")}</Label>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                   </div>
                   <div className="flex items-center justify-between">
                        <Label className="text-sm">{t("newAutomationRule.stopIfMatch")}</Label>
                        <Switch checked={stopIfMatched} onCheckedChange={setStopIfMatched} />
                   </div>
                   <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between items-center text-xs">
                            <Label>{t("newAutomationRule.priority")}</Label>
                            <span className="font-bold text-primary">{priority}</span>
                        </div>
                        <Input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="1" 
                            value={priority} 
                            onChange={(e) => setPriority(Number(e.target.value))} 
                        />
                   </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
