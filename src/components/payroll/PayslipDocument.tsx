import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Payslip } from "@/lib/api";
import { cn } from "@/lib/utils";

type PayslipDocumentProps = {
  payslip: Payslip;
  employeeSignatureSlot?: React.ReactNode;
  managerSignatureSlot?: React.ReactNode;
  rightSignatureLabel?: string;
  className?: string;
};

function formatAmount(value: number | string | undefined) {
  return `${Number(value || 0).toFixed(3)} TND`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export const PayslipDocument = forwardRef<HTMLDivElement, PayslipDocumentProps>(
  ({ payslip, employeeSignatureSlot, managerSignatureSlot, rightSignatureLabel = "HR & Payroll Manager", className }, ref) => {
    const { t } = useTranslation();
    const employeeName = `${payslip.employee?.firstName || ""} ${payslip.employee?.lastName || ""}`.trim() || "Employee";
    const earnings = useMemo(
      () => (payslip.details || []).filter((detail) => Number(detail.amount) >= 0),
      [payslip.details],
    );
    const deductions = useMemo(
      () => (payslip.details || []).filter((detail) => Number(detail.amount) < 0),
      [payslip.details],
    );

    const maxRows = Math.max(earnings.length, deductions.length, 4);

    return (
      <div ref={ref} className={cn("w-full rounded-[28px] bg-white p-8 text-slate-900 shadow-2xl print:rounded-none print:shadow-none", className)}>
        <div className="overflow-hidden rounded-[24px] border border-slate-300 bg-white">
          <div className="border-b border-slate-300 px-8 py-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-800">NADAS ERP SUITE</h1>
                <p className="mt-2 text-lg font-medium text-slate-600">{t("payroll.document.moduleSubtitle")}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">{t("payroll.document.payslip")}</p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{payslip.payrollPeriod?.periodName || t("payroll.document.payrollPeriod")}</h2>
                <p className="mt-2 text-sm text-slate-500">{t("payroll.document.generatedOn", { date: formatDate(payslip.paymentDate || payslip.updatedAt) })}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-300 px-8 py-5 text-center">
            <h3 className="text-3xl font-black tracking-tight text-slate-900">
              {t("payroll.document.monthTitle", { period: payslip.payrollPeriod?.periodName || "-" })}
            </h3>
          </div>

          <div className="grid grid-cols-[1.3fr_1fr] border-b border-slate-300">
            <div className="border-r border-slate-300 px-8 py-6">
              <p className="mb-5 text-lg font-black uppercase tracking-wide text-slate-900">{t("payroll.document.employeePaySummary")}</p>
              <div className="grid grid-cols-[220px_1fr] gap-y-3 text-[28px] leading-none text-slate-800 scale-[0.5] origin-top-left sm:scale-100 sm:text-lg">
                <span className="font-semibold">{t("payroll.document.employeeName")}</span>
                <span>: {employeeName}, {payslip.employee?.employeeNumber || "-"}</span>
                <span className="font-semibold">{t("payroll.document.designation")}</span>
                <span>: {payslip.employee?.position?.title || "-"}</span>
                <span className="font-semibold">{t("payroll.document.dateOfJoining")}</span>
                <span>: {formatDate(payslip.employee?.hireDate)}</span>
                <span className="font-semibold">{t("payroll.document.payPeriod")}</span>
                <span>: {payslip.payrollPeriod?.periodName || "-"}</span>
                <span className="font-semibold">{t("payroll.document.payDate")}</span>
                <span>: {formatDate(payslip.paymentDate || payslip.updatedAt)}</span>
                <span className="font-semibold">{t("payroll.document.department")}</span>
                <span>: {payslip.employee?.department?.name || "-"}</span>
                <span className="font-semibold">{t("payroll.document.cinCnss")}</span>
                <span>: {payslip.employee?.cin || "-"} / {payslip.employee?.cnssNumber || "-"}</span>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-2xl font-semibold text-slate-700">{t("payroll.document.employeeNetPay")}</p>
                <p className="mt-4 text-6xl font-black tracking-tight text-slate-900">{formatAmount(payslip.netSalary)}</p>
                <p className="mt-4 text-lg text-slate-600">
                  {t("payroll.document.grossEarnings")}: {formatAmount(payslip.totalEarnings)}
                </p>
                <p className="mt-1 text-lg text-slate-600">
                  {t("payroll.document.totalDeductions")}: {formatAmount(payslip.totalDeductions)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="border-r border-slate-300">
              <div className="grid grid-cols-[1fr_180px] border-b border-slate-300 bg-slate-50">
                <div className="border-r border-slate-300 px-5 py-4 text-xl font-black uppercase text-slate-900">{t("payroll.document.earnings")}</div>
                <div className="px-5 py-4 text-right text-xl font-black uppercase text-slate-900">{t("payroll.document.amount")}</div>
              </div>
              {Array.from({ length: maxRows }).map((_, index) => {
                const row = earnings[index];
                return (
                  <div key={`earning-${index}`} className="grid min-h-[66px] grid-cols-[1fr_180px] border-b border-slate-200">
                    <div className="border-r border-slate-200 px-5 py-4 text-lg font-medium text-slate-800">
                      {row?.component?.name || ""}
                    </div>
                    <div className="px-5 py-4 text-right text-lg font-semibold text-slate-900">
                      {row ? formatAmount(row.amount) : ""}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-[1fr_180px] bg-slate-50">
                <div className="border-r border-slate-300 px-5 py-4 text-xl font-black text-slate-900">{t("payroll.document.grossEarnings")}</div>
                <div className="px-5 py-4 text-right text-xl font-black text-slate-900">{formatAmount(payslip.totalEarnings)}</div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-[1fr_180px] border-b border-slate-300 bg-slate-50">
                <div className="border-r border-slate-300 px-5 py-4 text-xl font-black uppercase text-slate-900">{t("payroll.document.deductions")}</div>
                <div className="px-5 py-4 text-right text-xl font-black uppercase text-slate-900">{t("payroll.document.amount")}</div>
              </div>
              {Array.from({ length: maxRows }).map((_, index) => {
                const row = deductions[index];
                return (
                  <div key={`deduction-${index}`} className="grid min-h-[66px] grid-cols-[1fr_180px] border-b border-slate-200">
                    <div className="border-r border-slate-200 px-5 py-4 text-lg font-medium text-slate-800">
                      {row?.component?.name || ""}
                    </div>
                    <div className="px-5 py-4 text-right text-lg font-semibold text-slate-900">
                      {row ? formatAmount(Math.abs(Number(row.amount))) : ""}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-[1fr_180px] bg-slate-50">
                <div className="border-r border-slate-300 px-5 py-4 text-xl font-black text-slate-900">{t("payroll.document.totalDeductions")}</div>
                <div className="px-5 py-4 text-right text-xl font-black text-slate-900">{formatAmount(payslip.totalDeductions)}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300">
            <div className="grid grid-cols-[1fr_260px] border-b border-slate-300 bg-slate-50">
              <div className="border-r border-slate-300 px-5 py-4 text-xl font-black uppercase text-slate-900">{t("payroll.document.netPay")}</div>
              <div className="px-5 py-4 text-right text-xl font-black uppercase text-slate-900">{t("payroll.document.amount")}</div>
            </div>
            <div className="grid grid-cols-[1fr_260px] border-b border-slate-200">
              <div className="border-r border-slate-200 px-5 py-4 text-lg font-medium text-slate-800">{t("payroll.document.grossEarnings")}</div>
              <div className="px-5 py-4 text-right text-lg font-semibold text-slate-900">{formatAmount(payslip.totalEarnings)}</div>
            </div>
            <div className="grid grid-cols-[1fr_260px] border-b border-slate-200">
              <div className="border-r border-slate-200 px-5 py-4 text-lg font-medium text-slate-800">{t("payroll.document.totalDeductions")}</div>
              <div className="px-5 py-4 text-right text-lg font-semibold text-slate-900">(-) {formatAmount(payslip.totalDeductions)}</div>
            </div>
            <div className="grid grid-cols-[1fr_260px] bg-slate-50">
              <div className="border-r border-slate-300 px-5 py-5 text-3xl font-black text-slate-900">{t("payroll.document.totalNetPayable")}</div>
              <div className="px-5 py-5 text-right text-3xl font-black text-slate-900">{formatAmount(payslip.netSalary)}</div>
            </div>
          </div>

          <div className="border-t border-slate-300 px-8 py-8 text-center">
            <p className="text-2xl font-semibold text-slate-800">
              {t("payroll.document.totalNetPayable")} <span className="font-black">{formatAmount(payslip.netSalary)}</span>
            </p>
            <p className="mt-3 text-base text-slate-500">
              {t("payroll.document.footerNote")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-slate-300 px-8 py-8">
            <div className="space-y-3">
              <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-slate-600">{t("payroll.document.employeeSignature")}</p>
              {employeeSignatureSlot || (
                <div className="min-h-[108px] border-t border-slate-400 pt-4 text-center text-sm text-slate-500">
                  {t("payroll.document.employeeSignature")}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-slate-600">{rightSignatureLabel}</p>
              {managerSignatureSlot || (
                <div className="min-h-[108px] border-t border-slate-400 pt-4 text-center text-sm text-slate-500">
                  {rightSignatureLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PayslipDocument.displayName = "PayslipDocument";
