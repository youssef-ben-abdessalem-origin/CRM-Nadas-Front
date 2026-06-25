import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Gift, Plus } from "lucide-react";

export default function ThirteenthMonth() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  const { data: periods = [] } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: api.payroll.periods.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: (periodId: number) => api.payroll.thirteenthMonth.generate(periodId),
    onSuccess: () => {
      toast.success("13th month payslips generated");
      setIsOpen(false);
      setSelectedPeriodId("");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to generate 13th month"),
  });

  return (
    <CRMLayout title="Payroll - 13th Month">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">13th Month Salary</h1>
            <p className="text-muted-foreground">Generate 13th month payslips for a payroll period.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedPeriodId(""); }}>
            <DialogTrigger asChild>
              <Button><Gift className="mr-2 h-4 w-4" /> Generate 13th Month</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate 13th Month Payslips</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Payroll Period</label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger><SelectValue placeholder="Select period..." /></SelectTrigger>
                    <SelectContent>
                      {periods.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.periodName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button disabled={!selectedPeriodId || generateMutation.isPending} onClick={() => generateMutation.mutate(+selectedPeriodId)}>
                  <Plus className="mr-2 h-4 w-4" /> Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </CRMLayout>
  );
}
