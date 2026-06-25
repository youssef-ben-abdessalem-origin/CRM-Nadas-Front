import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Save, Gift, Clock, UserX } from "lucide-react";

export default function PayrollSettings() {
  const queryClient = useQueryClient();

  const [cnssEmployeeRate, setCnssEmployeeRate] = useState("");
  const [cnssEmployerRate, setCnssEmployerRate] = useState("");
  const [tfpRate, setTfpRate] = useState("");
  const [foprolosRate, setFoprolosRate] = useState("");
  const [accidentInsuranceRate, setAccidentInsuranceRate] = useState("");
  const [cnssMaxCap, setCnssMaxCap] = useState("");
  const [retirementRate, setRetirementRate] = useState("");
  const [currency, setCurrency] = useState("TND");
  const [workingDaysMonth, setWorkingDaysMonth] = useState("");
  const [overtimeMultiplier, setOvertimeMultiplier] = useState("");
  const [thirteenthMonthEnabled, setThirteenthMonthEnabled] = useState(false);
  const [thirteenthMonthMonth, setThirteenthMonthMonth] = useState("12");
  const [thirteenthMonthRate, setThirteenthMonthRate] = useState("100");
  const [seniorityBonusEnabled, setSeniorityBonusEnabled] = useState(false);
  const [seniorityBonusRate5yr, setSeniorityBonusRate5yr] = useState("5");
  const [seniorityBonusRate10yr, setSeniorityBonusRate10yr] = useState("10");
  const [seniorityBonusRate15yr, setSeniorityBonusRate15yr] = useState("15");
  const [seniorityBonusRate20yr, setSeniorityBonusRate20yr] = useState("20");
  const [absenceDeductionEnabled, setAbsenceDeductionEnabled] = useState(false);
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState("26");
  const [dailySalaryDeductionRate, setDailySalaryDeductionRate] = useState("100");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payrollSettings"],
    queryFn: api.payroll.settings.get,
  });

  useEffect(() => {
    if (settings) {
      setCnssEmployeeRate(String(settings.cnssEmployeeRate));
      setCnssEmployerRate(String(settings.cnssEmployerRate));
      setTfpRate(String(settings.tfpRate));
      setFoprolosRate(String(settings.foprolosRate));
      setAccidentInsuranceRate(String(settings.accidentInsuranceRate));
      setCnssMaxCap(String(settings.cnssMaxCap));
      setRetirementRate(settings.retirementRate ? String(settings.retirementRate) : "");
      setCurrency(settings.currency);
      setWorkingDaysMonth(String(settings.workingDaysMonth));
      setOvertimeMultiplier(String(settings.overtimeMultiplier));
      setThirteenthMonthEnabled(!!settings.thirteenthMonthEnabled);
      setThirteenthMonthMonth(String(settings.thirteenthMonthMonth || 12));
      setThirteenthMonthRate(String(settings.thirteenthMonthRate || 100));
      setSeniorityBonusEnabled(!!settings.seniorityBonusEnabled);
      setSeniorityBonusRate5yr(String(settings.seniorityBonusRate5yr || 5));
      setSeniorityBonusRate10yr(String(settings.seniorityBonusRate10yr || 10));
      setSeniorityBonusRate15yr(String(settings.seniorityBonusRate15yr || 15));
      setSeniorityBonusRate20yr(String(settings.seniorityBonusRate20yr || 20));
      setAbsenceDeductionEnabled(!!settings.absenceDeductionEnabled);
      setWorkingDaysPerMonth(String(settings.workingDaysPerMonth || 26));
      setDailySalaryDeductionRate(String(settings.dailySalaryDeductionRate || 100));
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: api.payroll.settings.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollSettings"] });
      toast.success("Payroll settings updated");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      cnssEmployeeRate: +cnssEmployeeRate,
      cnssEmployerRate: +cnssEmployerRate,
      tfpRate: +tfpRate,
      foprolosRate: +foprolosRate,
      accidentInsuranceRate: +accidentInsuranceRate,
      cnssMaxCap: +cnssMaxCap,
      retirementRate: retirementRate ? +retirementRate : null,
      currency,
      workingDaysMonth: +workingDaysMonth,
      overtimeMultiplier: +overtimeMultiplier,
      thirteenthMonthEnabled,
      thirteenthMonthMonth: +thirteenthMonthMonth,
      thirteenthMonthRate: +thirteenthMonthRate,
      seniorityBonusEnabled,
      seniorityBonusRate5yr: +seniorityBonusRate5yr,
      seniorityBonusRate10yr: +seniorityBonusRate10yr,
      seniorityBonusRate15yr: +seniorityBonusRate15yr,
      seniorityBonusRate20yr: +seniorityBonusRate20yr,
      absenceDeductionEnabled,
      workingDaysPerMonth: +workingDaysPerMonth,
      dailySalaryDeductionRate: +dailySalaryDeductionRate,
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  const switchInput = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );

  return (
    <CRMLayout title="Payroll - Settings">
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Settings</h1>
          <p className="text-muted-foreground">Configure social security rates, tax variables, and calculation constants.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Rules & Rates</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">CNSS Employee (%) *</label>
                  <Input required type="number" step="0.01" value={cnssEmployeeRate} onChange={(e) => setCnssEmployeeRate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">CNSS Employer (%) *</label>
                  <Input required type="number" step="0.01" value={cnssEmployerRate} onChange={(e) => setCnssEmployerRate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">TFP (%)</label>
                  <Input type="number" step="0.01" value={tfpRate} onChange={(e) => setTfpRate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">FOPROLOS (%)</label>
                  <Input type="number" step="0.01" value={foprolosRate} onChange={(e) => setFoprolosRate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Accident Insurance (%)</label>
                  <Input type="number" step="0.01" value={accidentInsuranceRate} onChange={(e) => setAccidentInsuranceRate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">CNSS Monthly Cap (TND)</label>
                  <Input type="number" step="0.001" value={cnssMaxCap} onChange={(e) => setCnssMaxCap(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Retirement Rate (%)</label>
                  <Input type="number" step="0.01" value={retirementRate} onChange={(e) => setRetirementRate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Currency *</label>
                  <Input required value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Work Days / Month *</label>
                  <Input required type="number" value={workingDaysMonth} onChange={(e) => setWorkingDaysMonth(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Overtime Multiplier *</label>
                  <Input required type="number" step="0.01" value={overtimeMultiplier} onChange={(e) => setOvertimeMultiplier(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> 13th Month Salary</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {switchInput("Enable 13th Month Salary", thirteenthMonthEnabled, setThirteenthMonthEnabled)}
              {thirteenthMonthEnabled && (
                <div className="grid grid-cols-2 gap-4 ms-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Payment Month (1-12)</label>
                    <Input type="number" min={1} max={12} value={thirteenthMonthMonth} onChange={(e) => setThirteenthMonthMonth(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Rate (% of base salary)</label>
                    <Input type="number" step="0.01" value={thirteenthMonthRate} onChange={(e) => setThirteenthMonthRate(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Seniority Bonus (Prime d'Ancienneté)</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {switchInput("Enable Seniority Bonus", seniorityBonusEnabled, setSeniorityBonusEnabled)}
              {seniorityBonusEnabled && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ms-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">5+ Years (%)</label>
                    <Input type="number" step="0.01" value={seniorityBonusRate5yr} onChange={(e) => setSeniorityBonusRate5yr(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">10+ Years (%)</label>
                    <Input type="number" step="0.01" value={seniorityBonusRate10yr} onChange={(e) => setSeniorityBonusRate10yr(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">15+ Years (%)</label>
                    <Input type="number" step="0.01" value={seniorityBonusRate15yr} onChange={(e) => setSeniorityBonusRate15yr(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">20+ Years (%)</label>
                    <Input type="number" step="0.01" value={seniorityBonusRate20yr} onChange={(e) => setSeniorityBonusRate20yr(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserX className="h-5 w-5" /> Absence Deduction</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {switchInput("Enable Absence Deduction", absenceDeductionEnabled, setAbsenceDeductionEnabled)}
              {absenceDeductionEnabled && (
                <div className="grid grid-cols-2 gap-4 ms-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Working Days / Month</label>
                    <Input type="number" value={workingDaysPerMonth} onChange={(e) => setWorkingDaysPerMonth(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Daily Deduction Rate (%)</label>
                    <Input type="number" step="0.01" value={dailySalaryDeductionRate} onChange={(e) => setDailySalaryDeductionRate(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="self-end gap-2" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4" /> Save All Settings
          </Button>
        </form>
      </div>
    </CRMLayout>
  );
}
