import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";

export default function HrSettings() {
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
      toast.success("HR Settings updated");
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
    <CRMLayout title="HR - Settings">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HR Settings</h1>
            <p className="text-muted-foreground">Configure overtime rates, night hours, and other HR policies.</p>
          </div>
        </div>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Overtime Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading settings...</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Weekday Overtime Rate</label>
                    <Input required type="number" step="0.01" min={1} value={overtimeWeekdayRate}
                      onChange={(e) => setOvertimeWeekdayRate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Default: 1.25 (125%)</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Night Overtime Rate</label>
                    <Input required type="number" step="0.01" min={1} value={overtimeNightRate}
                      onChange={(e) => setOvertimeNightRate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Default: 1.50 (150%)</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Rest Day / Holiday Rate</label>
                    <Input required type="number" step="0.01" min={1} value={overtimeRestDayRate}
                      onChange={(e) => setOvertimeRestDayRate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Default: 2.00 (200%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Night Start Hour</label>
                    <Input required type="number" min={0} max={23} value={nightStartHour}
                      onChange={(e) => setNightStartHour(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Default: 21 (9 PM)</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Night End Hour</label>
                    <Input required type="number" min={0} max={23} value={nightEndHour}
                      onChange={(e) => setNightEndHour(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Default: 5 (5 AM)</p>
                  </div>
                </div>

              </form>
            )}
          </CardContent>
        </Card>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Leave Year-End Policy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading settings...</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Year-End Policy</label>
                    <Select value={leaveYearEndPolicy} onValueChange={setLeaveYearEndPolicy}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carry_forward">Carry Forward to Next Year</SelectItem>
                        <SelectItem value="cash_out">Cash Out (Pay Unused Days)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {leaveYearEndPolicy === "carry_forward"
                        ? "Unused leave days are automatically added to the next year's balance."
                        : "Unused leave days are paid out as cash at year-end and reset to 0."}
                    </p>
                  </div>
                  {leaveYearEndPolicy === "cash_out" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Cash Out Rate (per day)</label>
                      <Input value="Employee's gross monthly salary / 26 working days" disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Formula per Tunisian labor law. The system calculates cash out as: remainingDays × (baseSalary / 26)</p>
                    </div>
                  )}
                  {leaveYearEndPolicy === "carry_forward" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Max Carry Forward Days</label>
                      <Input required type="number" min={0} value={maxCarryForwardDays}
                        onChange={(e) => setMaxCarryForwardDays(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Maximum unused days allowed to carry to next year (excess is forfeited)</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
                    <Save className="h-4 w-4" /> Save Settings
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
