import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenLine, Printer } from "lucide-react";
import { createPayslipSignatureTask } from "@/lib/signatures";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";

export default function PayslipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const payslipId = id ? +id : 0;

  const { data: payslip, isLoading } = useQuery({
    queryKey: ["payslip", payslipId],
    queryFn: () => api.payroll.payslips.getOne(payslipId),
    enabled: !!payslipId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSign = () => {
    if (!payslip) return;
    const task = createPayslipSignatureTask(payslip);
    navigate(`/signatures/${task.id}`);
  };

  if (isLoading) return <div className="p-8 text-center">Loading payslip...</div>;
  if (!payslip) return <div className="p-8 text-center text-red-500">Payslip not found.</div>;

  return (
    <CRMLayout title={`Payslip - ${payslip.employee?.firstName} ${payslip.employee?.lastName}`}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/payroll/periods")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payslip Detail</h1>
              <p className="text-muted-foreground">View and print employee monthly payslip.</p>
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4" /> Print Payslip
          </Button>
          <Button onClick={handleSign} className="gap-2 bg-violet-600 hover:bg-violet-500">
            <PenLine className="h-4 w-4" /> Sign
          </Button>
        </div>

        {/* Print wrapper */}
        <div className="print:p-0 print:border-0 max-w-3xl mx-auto w-full">
          <PayslipDocument payslip={payslip} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-0, .print\\:p-0 * {
            visibility: visible;
          }
          .print\\:p-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      ` }} />
    </CRMLayout>
  );
}
