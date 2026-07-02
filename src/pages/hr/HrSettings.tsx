import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";

export default function HrSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [overtimeWeekdayRate, setOvertimeWeekdayRate] = useState("1.25");
  const [overtimeNightRate, setOvertimeNightRate] = useState("1.50");
  const [overtimeRestDayRate, setOvertimeRestDayRate] = useState("2.00");
  const [nightStartHour, setNightStartHour] = useState("21");
  const [nightEndHour, setNightEndHour] = useState("5");
  const [leaveYearEndPolicy, setLeaveYearEndPolicy] = useState("carry_forward");
  const [leaveCashOutRate, setLeaveCashOutRate] = useState("0");
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState("30");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["hrSettings"],
    queryFn: () => api.hr.hrSettings.get(),
  });

  useEffect(() => {
    if (settings) {
      setOvertimeWeekdayRate(String(settings.overtimeWeekdayRate));
      setOvertimeNightRate(String(settings.overtimeNightRate));
      setOvertimeRestDayRate(String(settings.overtimeRestDayRate));
      setNightStartHour(String(settings.nightStartHour));
      setNightEndHour(String(settings.nightEndHour));
      setLeaveYearEndPolicy(settings.leaveYearEndPolicy);
      setLeaveCashOutRate(settings.leaveCashOutRate != null ? String(settings.leaveCashOutRate) : "0");
      setMaxCarryForwardDays(settings.maxCarryForwardDays != null ? String(settings.maxCarryForwardDays) : "30");
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.hr.hrSettings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hrSettings"] });
      toast.success(t("hr.statusUpdates.settingsUpdated"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      overtimeWeekdayRate: +overtimeWeekdayRate,
      overtimeNightRate: +overtimeNightRate,
      overtimeRestDayRate: +overtimeRestDayRate,
      nightStartHour: +nightStartHour,
      nightEndHour: +nightEndHour,
      leaveYearEndPolicy,
      leaveCashOutRate: +leaveCashOutRate,
      maxCarryForwardDays: +maxCarryForwardDays,
    });
  };

  return (
    <CRMLayout title={t("hr.settings.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hr.settings.title")}</h1>
            <p className="text-muted-foreground">{t("hr.settings.description")}</p>
          </div>
        </div>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>{t("hr.settings.overtimeConfig")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.settings.forms.weekdayRate")}</label>
                    <Input required type="number" step="0.01" min={1} value={overtimeWeekdayRate}
                      onChange={(e) => setOvertimeWeekdayRate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("hr.settings.hints.weekdayRate")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.settings.forms.nightRate")}</label>
                    <Input required type="number" step="0.01" min={1} value={overtimeNightRate}
                      onChange={(e) => setOvertimeNightRate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("hr.settings.hints.nightRate")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.settings.forms.restDayRate")}</label>
                    <Input required type="number" step="0.01" min={1} value={overtimeRestDayRate}
                      onChange={(e) => setOvertimeRestDayRate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("hr.settings.hints.restDayRate")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.settings.forms.nightStartHour")}</label>
                    <Input required type="number" min={0} max={23} value={nightStartHour}
                      onChange={(e) => setNightStartHour(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("hr.settings.hints.nightStartHour")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.settings.forms.nightEndHour")}</label>
                    <Input required type="number" min={0} max={23} value={nightEndHour}
                      onChange={(e) => setNightEndHour(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("hr.settings.hints.nightEndHour")}</p>
                  </div>
                </div>

              </form>
            )}
          </CardContent>
        </Card>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>{t("hr.settings.leavePolicy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.settings.forms.yearEndPolicy")}</label>
                    <Select value={leaveYearEndPolicy} onValueChange={setLeaveYearEndPolicy}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carry_forward">{t("hr.settings.options.carryForward")}</SelectItem>
                        <SelectItem value="cash_out">{t("hr.settings.options.cashOut")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {leaveYearEndPolicy === "carry_forward"
                        ? t("hr.settings.hints.carryForwardDesc")
                        : t("hr.settings.hints.cashOutDesc")}
                    </p>
                  </div>
                  {leaveYearEndPolicy === "cash_out" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.settings.forms.cashOutRate")}</label>
                      <Input value={t("hr.settings.placeholders.cashOutRateFormula")} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">{t("hr.settings.hints.cashOutRateFormula")}</p>
                    </div>
                  )}
                  {leaveYearEndPolicy === "carry_forward" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">{t("hr.settings.forms.maxCarryForward")}</label>
                      <Input required type="number" min={0} value={maxCarryForwardDays}
                        onChange={(e) => setMaxCarryForwardDays(e.target.value)} />
                      <p className="text-xs text-muted-foreground">{t("hr.settings.hints.maxCarryForwardDesc")}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
                    <Save className="h-4 w-4" /> {t("hr.settings.actions.saveSettings")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
