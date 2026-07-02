import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle2, CreditCard, FileBadge2, Globe2, Plus, Save, ShieldCheck, Trash2, Upload, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api, CostCenter, Employee } from "@/lib/api";
import { useTranslation } from "react-i18next";

type StepId = "identity" | "employment" | "contract" | "payroll" | "compliance" | "review";

type EmployeeFormState = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  cin: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  childrenCount: number;
  disabledDependents: number;
  email: string;
  workEmail: string;
  phone: string;
  passportNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  city: string;
  postalCode: string;
  hireDate: string;
  workLocation: string;
  costCenter: string;
  employmentCategory: string;
  attendanceMode: string;
  departmentId: string;
  positionId: string;
  managerId: string;
  status: string;
  education: string;
  skills: string;
  certifications: string;
  contractNumber: string;
  contractType: string;
  cddReason: string;
  contractStartDate: string;
  contractEndDate: string;
  probationEndDate: string;
  baseSalary: string;
  workingHoursPerWeek: string;
  contractStatus: string;
  socialRegime: string;
  cnssNumber: string;
  cnrpsNumber: string;
  cnssRegistrationDate: string;
  cnssStatus: string;
  taxStatus: string;
  taxExemptions: string;
  paymentMethod: string;
  bankName: string;
  bankAccount: string;
  rib: string;
  shiftId: string;
  shiftAssignmentStartDate: string;
  shiftAssignmentEndDate: string;
  shiftNotes: string;
  leaveTypeId: string;
  leaveBalanceYear: string;
  leaveTotalDays: string;
  accrualRate: string;
  maxAccrual: string;
  accrualEffectiveDate: string;
  residenceCardNumber: string;
  residenceCardExpiry: string;
  workPermitType: string;
  workPermitNumber: string;
  workPermitStatus: string;
  workPermitExpiry: string;
};

type ComponentAssignmentState = {
  localId: number;
  componentId: string;
  amount: string;
  effectiveDate: string;
};

type DocumentUploadState = {
  key: string;
  label: string;
  documentType: string;
  required: boolean;
  file: File | null;
  expiryDate: string;
  notes: string;
};

const INITIAL_FORM: EmployeeFormState = {
  employeeNumber: "",
  firstName: "",
  lastName: "",
  cin: "",
  dateOfBirth: "",
  placeOfBirth: "",
  gender: "Male",
  nationality: "Tunisian",
  maritalStatus: "Single",
  childrenCount: 0,
  disabledDependents: 0,
  email: "",
  workEmail: "",
  phone: "",
  passportNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  address: "",
  city: "",
  postalCode: "",
  hireDate: "",
  workLocation: "",
  costCenter: "",
  employmentCategory: "Employee",
  attendanceMode: "On Site",
  departmentId: "",
  positionId: "",
  managerId: "",
  status: "Draft",
  education: "",
  skills: "",
  certifications: "",
  contractNumber: "",
  contractType: "CDI",
  cddReason: "",
  contractStartDate: "",
  contractEndDate: "",
  probationEndDate: "",
  baseSalary: "",
  workingHoursPerWeek: "40",
  contractStatus: "Active",
  socialRegime: "CNSS",
  cnssNumber: "",
  cnrpsNumber: "",
  cnssRegistrationDate: "",
  cnssStatus: "Active",
  taxStatus: "Single",
  taxExemptions: "0",
  paymentMethod: "Bank Transfer",
  bankName: "",
  bankAccount: "",
  rib: "",
  shiftId: "",
  shiftAssignmentStartDate: "",
  shiftAssignmentEndDate: "",
  shiftNotes: "",
  leaveTypeId: "",
  leaveBalanceYear: String(new Date().getFullYear()),
  leaveTotalDays: "",
  accrualRate: "2.5",
  maxAccrual: "30",
  accrualEffectiveDate: "",
  residenceCardNumber: "",
  residenceCardExpiry: "",
  workPermitType: "Contract Visa",
  workPermitNumber: "",
  workPermitStatus: "Pending",
  workPermitExpiry: "",
};

const STEPS: { id: StepId; title: string; description: string; icon: typeof Users }[] = [
  { id: "identity", title: "hr.employeeForm.steps.identity", description: "hr.employeeForm.steps.identityDesc", icon: Users },
  { id: "employment", title: "hr.employeeForm.steps.employment", description: "hr.employeeForm.steps.employmentDesc", icon: Briefcase },
  { id: "contract", title: "hr.employeeForm.steps.contract", description: "hr.employeeForm.steps.contractDesc", icon: FileBadge2 },
  { id: "payroll", title: "hr.employeeForm.steps.payroll", description: "hr.employeeForm.steps.payrollDesc", icon: CreditCard },
  { id: "compliance", title: "hr.employeeForm.steps.compliance", description: "hr.employeeForm.steps.complianceDesc", icon: ShieldCheck },
  { id: "review", title: "hr.employeeForm.steps.review", description: "hr.employeeForm.steps.reviewDesc", icon: CheckCircle2 },
];

function buildDocumentUploads(isForeignEmployee: boolean): DocumentUploadState[] {
  const base: DocumentUploadState[] = [
    { key: "cin", label: "hr.employeeForm.documents.cin", documentType: "CIN", required: true, file: null, expiryDate: "", notes: "" },
    { key: "contract", label: "hr.employeeForm.documents.contract", documentType: "Contract", required: true, file: null, expiryDate: "", notes: "" },
    { key: "rib", label: "hr.employeeForm.documents.rib", documentType: "Other", required: true, file: null, expiryDate: "", notes: "RIB proof" },
    { key: "diploma", label: "hr.employeeForm.documents.diploma", documentType: "Diploma", required: false, file: null, expiryDate: "", notes: "" },
  ];

  if (isForeignEmployee) {
    base.push(
      { key: "passport", label: "hr.employeeForm.documents.passport", documentType: "Passport", required: true, file: null, expiryDate: "", notes: "" },
      { key: "permit", label: "hr.employeeForm.documents.permit", documentType: "Work Permit", required: true, file: null, expiryDate: "", notes: "" },
    );
  }

  return base;
}

const NON_ASSIGNABLE_COMPONENT_CODES = new Set([
  "BASIC_SALARY",
  "GROSS_SALARY",
  "BASE_SALARY",
  "CNSS_EMPLOYEE",
  "CNSS",
  "INCOME_TAX",
  "IRPP",
  "CNSS_EMPLOYER",
  "TRAINING_TAX",
  "TFP",
  "FOPROLOS",
  "WORK_ACCIDENT",
  "ACCIDENT_INSURANCE",
]);

function isTunisianNationality(nationality: string) {
  const normalized = nationality.trim().toLowerCase();
  return normalized === "tunisian" || normalized === "tunisie" || normalized === "tunisienne";
}

function parseTimeToMinutes(value?: string) {
  if (!value || !value.includes(":")) return null;

  const [hoursPart, minutesPart] = value.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function calculateShiftWeeklyHours(shift?: {
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
}) {
  if (!shift) return null;

  const startMinutes = parseTimeToMinutes(shift.startTime);
  const endMinutes = parseTimeToMinutes(shift.endTime);

  if (startMinutes == null || endMinutes == null) return null;

  const rawDuration = endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : (24 * 60 - startMinutes) + endMinutes;
  const netDailyMinutes = Math.max(rawDuration - (shift.breakDuration || 0), 0);
  const weeklyHours = netDailyMinutes / 60 * 5;

  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0) return null;
  return weeklyHours % 1 === 0 ? String(weeklyHours) : weeklyHours.toFixed(1);
}

function calculateReadinessStatus(params: {
  hrComplete: boolean;
  documentsComplete: boolean;
  payrollReady: boolean;
  legallyActive: boolean;
}) {
  if (params.legallyActive) return "Legally Active";
  if (params.payrollReady) return "Payroll Ready";
  if (params.documentsComplete) return "Documents Complete";
  if (params.hrComplete) return "HR Complete";
  return "Draft";
}

function getComputedTaxStatus(maritalStatus: string, childrenCount: number) {
  const normalizedMaritalStatus = maritalStatus.trim().toLowerCase();

  if (childrenCount > 0) {
    return "Married + Children";
  }

  if (normalizedMaritalStatus === "married") {
    return "Married";
  }

  return "Single";
}

function buildEmployeeFormState(employee?: Employee | null): EmployeeFormState {
  if (!employee) return INITIAL_FORM;

  return {
    ...INITIAL_FORM,
    employeeNumber: employee.employeeNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    cin: employee.cin,
    dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
    placeOfBirth: employee.placeOfBirth || "",
    gender: employee.gender,
    nationality: employee.nationality,
    maritalStatus: employee.maritalStatus,
    childrenCount: employee.childrenCount || 0,
    email: employee.email || "",
    workEmail: employee.workEmail || "",
    phone: employee.phone,
    passportNumber: employee.passportNumber || "",
    emergencyContactName: employee.emergencyContactName || "",
    emergencyContactPhone: employee.emergencyContactPhone || "",
    address: employee.address || "",
    city: employee.city || "",
    postalCode: employee.postalCode || "",
    hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
    workLocation: employee.workLocation || "",
    costCenter: employee.costCenter || "",
    employmentCategory: employee.employmentCategory || "Employee",
    attendanceMode: employee.attendanceMode || "On Site",
    departmentId: employee.departmentId ? String(employee.departmentId) : "",
    positionId: employee.positionId ? String(employee.positionId) : "",
    managerId: employee.managerId ? String(employee.managerId) : "",
    status: employee.status,
    education: employee.education || "",
    skills: employee.skills ? employee.skills.join(", ") : "",
    certifications: employee.certifications ? employee.certifications.join(", ") : "",
    residenceCardNumber: employee.residenceCardNumber || "",
    residenceCardExpiry: employee.residenceCardExpiry ? employee.residenceCardExpiry.split("T")[0] : "",
    workPermitType: employee.workPermitType || "Contract Visa",
    workPermitNumber: employee.workPermitNumber || "",
    workPermitStatus: employee.workPermitStatus || "Pending",
    workPermitExpiry: employee.workPermitExpiry ? employee.workPermitExpiry.split("T")[0] : "",
  };
}

export default function EmployeeFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [draftEmployeeId, setDraftEmployeeId] = useState<number | null>(
    id ? Number(id) : null,
  );
  const effectiveEmployeeId = id ? Number(id) : draftEmployeeId;
  const isEdit = Boolean(effectiveEmployeeId);
  const draftSnapshotRef = useRef("");
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFilledWorkingHoursRef = useRef(INITIAL_FORM.workingHoursPerWeek);

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<EmployeeFormState>(INITIAL_FORM);
  const [componentAssignments, setComponentAssignments] = useState<ComponentAssignmentState[]>([]);
  const [documentUploads, setDocumentUploads] = useState<DocumentUploadState[]>(buildDocumentUploads(false));

  const { data: employeeData, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ["employee", effectiveEmployeeId],
    queryFn: () => api.hr.employees.getOne(Number(effectiveEmployeeId)),
    enabled: isEdit,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.departments.getAll(),
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: () => api.hr.positions.getAll(),
  });

  const { data: costCenters = [] } = useQuery({
    queryKey: ["costCenters"],
    queryFn: () => api.costCenters.getAll(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => api.hr.shifts.getAll(),
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => api.hr.leaveTypes.getAll(),
  });

  const { data: allSalaryComponents = [] } = useQuery({
    queryKey: ["components"],
    queryFn: () => api.payroll.components.getAll(),
  });

  const { data: existingContracts = [] } = useQuery({
    queryKey: ["contracts", effectiveEmployeeId],
    queryFn: () => api.hr.contracts.getAll(Number(effectiveEmployeeId)),
    enabled: isEdit,
  });

  const { data: existingPayrollProfile } = useQuery({
    queryKey: ["payrollProfile", effectiveEmployeeId],
    queryFn: () => api.payroll.profiles.getOne(Number(effectiveEmployeeId)).catch(() => null),
    enabled: isEdit,
  });

  const { data: existingCnssProfile } = useQuery({
    queryKey: ["cnssProfile", effectiveEmployeeId],
    queryFn: () => api.hr.cnssProfiles.getByEmployee(Number(effectiveEmployeeId)).catch(() => null),
    enabled: isEdit,
  });

  const { data: existingIrppProfile } = useQuery({
    queryKey: ["irppProfile", effectiveEmployeeId],
    queryFn: () => api.hr.irppTaxProfiles.getByEmployee(Number(effectiveEmployeeId)).catch(() => null),
    enabled: isEdit,
  });

  const { data: existingShiftAssignments = [] } = useQuery({
    queryKey: ["shiftAssignments", effectiveEmployeeId],
    queryFn: () => api.hr.shiftAssignments.getAll(Number(effectiveEmployeeId)),
    enabled: isEdit,
  });

  const { data: existingLeaveBalances = [] } = useQuery({
    queryKey: ["leaveBalances", effectiveEmployeeId],
    queryFn: () => api.hr.leaveBalances.getAll(Number(effectiveEmployeeId), new Date().getFullYear()),
    enabled: isEdit,
  });

  const { data: existingAccrualRules = [] } = useQuery({
    queryKey: ["accrualRules", effectiveEmployeeId],
    queryFn: () => api.hr.accrualRules.getAll(Number(effectiveEmployeeId)),
    enabled: isEdit,
  });

  const { data: existingEmployeeComponents = [] } = useQuery({
    queryKey: ["employeeComponents", effectiveEmployeeId],
    queryFn: () => api.payroll.employeeComponents.getAll(Number(effectiveEmployeeId)),
    enabled: isEdit,
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      ...buildEmployeeFormState(employeeData ?? null),
    }));
  }, [employeeData]);

  useEffect(() => {
    if (employeeData?.id) {
      setDraftEmployeeId(employeeData.id);
    }
  }, [employeeData]);

  useEffect(() => {
    const contract = existingContracts[0];
    if (!contract) return;

    setForm((current) => ({
      ...current,
      contractNumber: contract.contractNumber || "",
      contractType: contract.contractType || "CDI",
      cddReason: current.cddReason,
      contractStartDate: contract.startDate ? contract.startDate.split("T")[0] : "",
      contractEndDate: contract.endDate ? contract.endDate.split("T")[0] : "",
      probationEndDate: contract.probationEndDate ? contract.probationEndDate.split("T")[0] : "",
      baseSalary: contract.baseSalary ? String(contract.baseSalary) : "",
      workingHoursPerWeek: contract.workingHoursPerWeek ? String(contract.workingHoursPerWeek) : "40",
      contractStatus: contract.status || "Active",
    }));
  }, [existingContracts]);

  useEffect(() => {
    if (!existingPayrollProfile) return;

    setForm((current) => ({
      ...current,
      socialRegime: existingPayrollProfile.socialRegime || "CNSS",
      cnssNumber: existingPayrollProfile.cnssNumber || current.cnssNumber,
      cnrpsNumber: existingPayrollProfile.cnrpsNumber || "",
      taxStatus: existingPayrollProfile.taxStatus || "Single",
      paymentMethod: existingPayrollProfile.paymentMethod || "Bank Transfer",
      bankName: existingPayrollProfile.bankName || "",
      bankAccount: existingPayrollProfile.bankAccount || "",
      rib: existingPayrollProfile.rib || "",
    }));
  }, [existingPayrollProfile]);

  useEffect(() => {
    if (!existingCnssProfile) return;

    setForm((current) => ({
      ...current,
      cnssNumber: existingCnssProfile.cnssNumber || current.cnssNumber,
      cnssRegistrationDate: existingCnssProfile.registrationDate ? existingCnssProfile.registrationDate.split("T")[0] : "",
      cnssStatus: existingCnssProfile.status || "Active",
      socialRegime: existingCnssProfile.regime || current.socialRegime,
    }));
  }, [existingCnssProfile]);

  useEffect(() => {
    if (!existingIrppProfile) return;

    setForm((current) => ({
      ...current,
      disabledDependents: existingIrppProfile.disabledDependents || 0,
      taxExemptions: existingIrppProfile.taxExemptions ? String(existingIrppProfile.taxExemptions) : "0",
    }));
  }, [existingIrppProfile]);

  const isForeignEmployee = useMemo(() => !isTunisianNationality(form.nationality), [form.nationality]);

  useEffect(() => {
    setDocumentUploads((current) => {
      const next = buildDocumentUploads(isForeignEmployee);
      return next.map((item) => {
        const existing = current.find((currentItem) => currentItem.key === item.key);
        return existing ? { ...item, file: existing.file, expiryDate: existing.expiryDate, notes: existing.notes } : item;
      });
    });
  }, [isForeignEmployee]);

  useEffect(() => {
    const assignment = existingShiftAssignments[0];
    if (!assignment) return;

    setForm((current) => ({
      ...current,
      shiftId: assignment.shiftId ? String(assignment.shiftId) : "",
      shiftAssignmentStartDate: assignment.startDate ? assignment.startDate.split("T")[0] : "",
      shiftAssignmentEndDate: assignment.endDate ? assignment.endDate.split("T")[0] : "",
      shiftNotes: assignment.notes || "",
    }));
  }, [existingShiftAssignments]);

  useEffect(() => {
    if (!form.shiftId) return;

    const selectedShift = shifts.find((shift: any) => String(shift.id) === form.shiftId);
    const autoWorkingHours = calculateShiftWeeklyHours(selectedShift);

    if (!autoWorkingHours) return;

    setForm((current) => {
      const shouldAutofill =
        !current.workingHoursPerWeek ||
        current.workingHoursPerWeek === INITIAL_FORM.workingHoursPerWeek ||
        current.workingHoursPerWeek === autoFilledWorkingHoursRef.current;

      autoFilledWorkingHoursRef.current = autoWorkingHours;

      if (!shouldAutofill || current.workingHoursPerWeek === autoWorkingHours) {
        return current;
      }

      return {
        ...current,
        workingHoursPerWeek: autoWorkingHours,
      };
    });
  }, [form.shiftId, shifts]);

  useEffect(() => {
    const balance = existingLeaveBalances[0];
    if (!balance) return;

    setForm((current) => ({
      ...current,
      leaveTypeId: balance.leaveTypeId ? String(balance.leaveTypeId) : "",
      leaveBalanceYear: balance.year ? String(balance.year) : current.leaveBalanceYear,
      leaveTotalDays: balance.totalDays ? String(balance.totalDays) : "",
    }));
  }, [existingLeaveBalances]);

  useEffect(() => {
    const rule = existingAccrualRules[0];
    if (!rule) return;

    setForm((current) => ({
      ...current,
      leaveTypeId: current.leaveTypeId || (rule.leaveTypeId ? String(rule.leaveTypeId) : ""),
      accrualRate: rule.accrualRate ? String(rule.accrualRate) : current.accrualRate,
      maxAccrual: rule.maxAccrual ? String(rule.maxAccrual) : current.maxAccrual,
      accrualEffectiveDate: rule.effectiveDate ? rule.effectiveDate.split("T")[0] : "",
    }));
  }, [existingAccrualRules]);

  useEffect(() => {
    if (!existingEmployeeComponents.length) return;

    setComponentAssignments(
      existingEmployeeComponents.map((item: any, index: number) => ({
        localId: index + 1,
        componentId: String(item.componentId),
        amount: String(item.amount ?? ""),
        effectiveDate: item.effectiveDate ? item.effectiveDate.split("T")[0] : "",
      })),
    );
  }, [existingEmployeeComponents]);

  const hasMeaningfulDraftData = useMemo(
    () =>
      Boolean(
        form.firstName ||
        form.lastName ||
        form.cin ||
        form.phone ||
        form.email ||
        form.workEmail ||
        form.departmentId ||
        form.positionId ||
        form.hireDate ||
        form.workLocation ||
        form.address ||
        form.city ||
        form.contractNumber ||
        form.baseSalary,
      ),
    [form],
  );

  const buildDraftPayload = () => ({
    firstName: form.firstName || null,
    lastName: form.lastName || null,
    cin: form.cin || null,
    dateOfBirth: form.dateOfBirth || null,
    placeOfBirth: form.placeOfBirth || null,
    gender: form.gender || null,
    nationality: form.nationality || null,
    maritalStatus: form.maritalStatus || null,
    childrenCount: Number(form.childrenCount) || 0,
    email: form.email || null,
    workEmail: form.workEmail || null,
    phone: form.phone || null,
    passportNumber: form.passportNumber || null,
    emergencyContactName: form.emergencyContactName || null,
    emergencyContactPhone: form.emergencyContactPhone || null,
    education: form.education || null,
    skills: form.skills
      ? form.skills.split(",").map((item) => item.trim()).filter(Boolean)
      : null,
    certifications: form.certifications
      ? form.certifications.split(",").map((item) => item.trim()).filter(Boolean)
      : null,
    address: form.address || null,
    city: form.city || null,
    postalCode: form.postalCode || null,
    hireDate: form.hireDate || null,
    workLocation: form.workLocation || null,
    costCenter: form.costCenter || null,
    employmentCategory: form.employmentCategory || null,
    attendanceMode: form.attendanceMode || null,
    departmentId: form.departmentId ? Number(form.departmentId) : null,
    positionId: form.positionId ? Number(form.positionId) : null,
    managerId: form.managerId ? Number(form.managerId) : null,
    status: "Draft",
    readinessStatus: "Draft",
    cnssNumber: form.cnssNumber || null,
    residenceCardNumber: form.residenceCardNumber || null,
    residenceCardExpiry: form.residenceCardExpiry || null,
    workPermitType: form.workPermitType || null,
    workPermitNumber: form.workPermitNumber || null,
    workPermitStatus: form.workPermitStatus || null,
    workPermitExpiry: form.workPermitExpiry || null,
  });

  const persistDraft = async ({
    silent = true,
  }: {
    silent?: boolean;
  } = {}) => {
    if (!hasMeaningfulDraftData) return null;

    const payload = buildDraftPayload();
    const snapshot = JSON.stringify(payload);

    if (silent && effectiveEmployeeId && draftSnapshotRef.current === snapshot) {
      return effectiveEmployeeId;
    }

    const employee = effectiveEmployeeId
      ? await api.hr.employees.updateDraft(effectiveEmployeeId, payload)
      : await api.hr.employees.createDraft(payload);

    draftSnapshotRef.current = snapshot;

    if (!effectiveEmployeeId) {
      setDraftEmployeeId(employee.id);
      navigate(`/hr/employees/edit/${employee.id}`, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      if (!silent) {
        toast.success(t("hr.statusUpdates.draftCreated"));
      }
    } else if (!silent) {
      toast.success(t("hr.statusUpdates.draftUpdated"));
    }

    return employee.id as number;
  };

  useEffect(() => {
    if (!hasMeaningfulDraftData) return;

    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }

    draftTimerRef.current = setTimeout(() => {
      void persistDraft();
    }, 1200);

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [form, hasMeaningfulDraftData, effectiveEmployeeId]);

  const requiredDocumentUploads = documentUploads.filter((document) => document.required);
  const validDocumentUploads = requiredDocumentUploads.filter((document) => document.file);
  const hasValidComponentAssignments = componentAssignments.some(
    (assignment) => assignment.componentId && assignment.amount && assignment.effectiveDate,
  );
  const identityRequiredComplete = Boolean(
    form.firstName && form.lastName && form.cin && form.dateOfBirth && form.phone && form.nationality,
  );
  const employmentRequiredComplete = Boolean(form.hireDate && form.departmentId && form.positionId);
  const contractRequiredComplete = form.contractType === "CDD"
    ? Boolean(form.contractType && form.cddReason && form.contractStartDate && form.contractEndDate && form.baseSalary)
    : Boolean(form.contractType && form.contractStartDate && form.baseSalary);
  const payrollRequiredComplete = Boolean(
    form.socialRegime &&
    form.paymentMethod &&
    form.taxStatus &&
    form.shiftId &&
    form.shiftAssignmentStartDate &&
    form.leaveTypeId &&
    hasValidComponentAssignments,
  );
  const complianceRequiredComplete = requiredDocumentUploads.every((document) => document.file)
    && (!isForeignEmployee || Boolean(form.passportNumber || form.residenceCardNumber || form.workPermitNumber));
  const employeeStatus = identityRequiredComplete
    && employmentRequiredComplete
    && contractRequiredComplete
    && payrollRequiredComplete
    && complianceRequiredComplete
    ? "Active"
    : "Draft";
  const todayIso = new Date().toISOString().split("T")[0];
  const contractStatus = contractRequiredComplete
    ? (form.contractEndDate && form.contractEndDate < todayIso ? "Inactive" : "Active")
    : "Inactive";
  const cnssStatus = form.socialRegime === "CNSS" && form.cnssNumber ? "Active" : "Inactive";
  const taxStatus = getComputedTaxStatus(form.maritalStatus, Number(form.childrenCount) || 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const onboardingSteps = {
        employee: false,
        contract: false,
        payroll: false,
        cnss: false,
        irpp: false,
        components: false,
        attendance: false,
        documents: false,
      };

      const componentReady = hasValidComponentAssignments;
      const attendanceReady = Boolean(form.shiftId && form.shiftAssignmentStartDate && form.leaveTypeId);
      const hrComplete = Boolean(
        form.firstName &&
        form.lastName &&
        form.cin &&
        form.dateOfBirth &&
        form.phone &&
        form.hireDate &&
        form.departmentId &&
        form.positionId &&
        form.contractType &&
        form.contractStartDate &&
        form.baseSalary,
      );
      const documentsComplete = requiredDocumentUploads.length > 0 && validDocumentUploads.length === requiredDocumentUploads.length;
      const payrollReady = Boolean(
        hrComplete &&
        documentsComplete &&
        form.socialRegime &&
        form.taxStatus &&
        form.paymentMethod &&
        form.cnssNumber &&
        form.rib &&
        form.bankName &&
        form.bankAccount &&
        componentReady &&
        attendanceReady,
      );
      const legallyActive = Boolean(
        payrollReady &&
        (!isForeignEmployee || ((form.passportNumber || form.residenceCardNumber) && form.workPermitNumber && form.workPermitStatus === "Approved")),
      );
      const readinessStatus = calculateReadinessStatus({
        hrComplete,
        documentsComplete,
        payrollReady,
        legallyActive,
      });

      const employeePayload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        cin: form.cin,
        dateOfBirth: form.dateOfBirth,
        placeOfBirth: form.placeOfBirth || null,
        gender: form.gender,
        nationality: form.nationality,
        maritalStatus: form.maritalStatus,
        childrenCount: Number(form.childrenCount) || 0,
        email: form.email || null,
        workEmail: form.workEmail || null,
        phone: form.phone,
        passportNumber: form.passportNumber || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
        education: form.education || null,
        skills: form.skills ? form.skills.split(",").map((item) => item.trim()).filter(Boolean) : null,
        certifications: form.certifications ? form.certifications.split(",").map((item) => item.trim()).filter(Boolean) : null,
        address: form.address || null,
        city: form.city || null,
        postalCode: form.postalCode || null,
        hireDate: form.hireDate,
        workLocation: form.workLocation || null,
        costCenter: form.costCenter || null,
        employmentCategory: form.employmentCategory || null,
        attendanceMode: form.attendanceMode || null,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        positionId: form.positionId ? Number(form.positionId) : null,
        managerId: form.managerId ? Number(form.managerId) : null,
        status: employeeStatus,
        readinessStatus,
        cnssNumber: form.cnssNumber || null,
        residenceCardNumber: form.residenceCardNumber || null,
        residenceCardExpiry: form.residenceCardExpiry || null,
        workPermitType: form.workPermitType || null,
        workPermitNumber: form.workPermitNumber || null,
        workPermitStatus: form.workPermitStatus || null,
        workPermitExpiry: form.workPermitExpiry || null,
      };

      if (effectiveEmployeeId) {
        employeePayload.employeeNumber = form.employeeNumber;
      }

      const employee = effectiveEmployeeId
        ? await api.hr.employees.update(effectiveEmployeeId, employeePayload)
        : await api.hr.employees.create(employeePayload);
      onboardingSteps.employee = true;

      const employeeId = employee.id;
      const existingContract = existingContracts[0];
      const contractPayload = {
        employeeId,
        contractNumber: form.contractNumber || undefined,
        contractType: form.contractType === "CDD" && form.cddReason ? `CDD - ${form.cddReason}` : form.contractType,
        startDate: form.contractStartDate,
        endDate: form.contractEndDate || null,
        probationEndDate: form.probationEndDate || null,
        baseSalary: Number(form.baseSalary),
        workingHoursPerWeek: Number(form.workingHoursPerWeek) || 40,
        status: contractStatus,
      };

      if (existingContract) {
        await api.hr.contracts.update(existingContract.id, contractPayload);
      } else {
        await api.hr.contracts.create(contractPayload);
      }
      onboardingSteps.contract = true;

      await api.payroll.profiles.createOrUpdate(employeeId, {
        socialRegime: form.socialRegime,
        cnssNumber: form.cnssNumber || null,
        cnrpsNumber: form.cnrpsNumber || null,
        taxStatus: taxStatus || null,
        paymentMethod: form.paymentMethod,
        bankName: form.bankName || null,
        bankAccount: form.bankAccount || null,
        rib: form.rib || null,
        active: true,
      });
      onboardingSteps.payroll = true;

      if (form.cnssNumber) {
        await api.hr.cnssProfiles.createOrUpdate(employeeId, {
          cnssNumber: form.cnssNumber,
          registrationDate: form.cnssRegistrationDate || null,
          regime: form.socialRegime,
          status: cnssStatus,
        });
        onboardingSteps.cnss = true;
      }

      await api.hr.irppTaxProfiles.createOrUpdate(employeeId, {
        maritalStatus: form.maritalStatus,
        childrenCount: Number(form.childrenCount) || 0,
        disabledDependents: Number(form.disabledDependents) || 0,
        taxExemptions: Number(form.taxExemptions) || 0,
      });
      onboardingSteps.irpp = true;

      const validComponentAssignments = componentAssignments.filter((assignment) => assignment.componentId && assignment.amount && assignment.effectiveDate);
      if (validComponentAssignments.length > 0) {
        const existingByComponentId = new Map(existingEmployeeComponents.map((component: any) => [String(component.componentId), component]));
        for (const assignment of validComponentAssignments) {
          const payload = {
            employeeId,
            componentId: Number(assignment.componentId),
            amount: Number(assignment.amount),
            effectiveDate: assignment.effectiveDate,
            active: true,
          };
          const existingAssignment = existingByComponentId.get(assignment.componentId);
          if (existingAssignment) {
            await api.payroll.employeeComponents.update(existingAssignment.id, payload);
          } else {
            await api.payroll.employeeComponents.create(payload);
          }
        }
        onboardingSteps.components = true;
      }

      if (form.shiftId && form.shiftAssignmentStartDate) {
        const shiftPayload = {
          employeeId,
          shiftId: Number(form.shiftId),
          startDate: form.shiftAssignmentStartDate,
          endDate: form.shiftAssignmentEndDate || null,
          notes: form.shiftNotes || null,
        };
        const existingShift = existingShiftAssignments[0];
        if (existingShift) {
          await api.hr.shiftAssignments.update(existingShift.id, shiftPayload);
        } else {
          await api.hr.shiftAssignments.create(shiftPayload);
        }
        onboardingSteps.attendance = true;
      }

      if (form.leaveTypeId) {
        const leavePayload = {
          employeeId,
          year: Number(form.leaveBalanceYear),
          leaveTypeId: Number(form.leaveTypeId),
          totalDays: Number(form.leaveTotalDays) || 0,
          usedDays: 0,
          remainingDays: Number(form.leaveTotalDays) || 0,
        };
        const existingBalance = existingLeaveBalances.find((balance: any) => String(balance.leaveTypeId) === form.leaveTypeId);
        if (existingBalance) {
          await api.hr.leaveBalances.update(existingBalance.id, leavePayload);
        } else {
          await api.hr.leaveBalances.create(leavePayload);
        }

        const accrualPayload = {
          employeeId,
          leaveTypeId: Number(form.leaveTypeId),
          accrualRate: Number(form.accrualRate) || 0,
          maxAccrual: Number(form.maxAccrual) || 0,
          effectiveDate: form.accrualEffectiveDate || form.hireDate,
          active: true,
        };
        const existingRule = existingAccrualRules.find((rule: any) => String(rule.leaveTypeId) === form.leaveTypeId);
        if (existingRule) {
          await api.hr.accrualRules.update(existingRule.id, accrualPayload);
        } else {
          await api.hr.accrualRules.create(accrualPayload);
        }
        onboardingSteps.attendance = true;
      }

      if (validDocumentUploads.length > 0) {
        for (const document of validDocumentUploads) {
          const payload = new FormData();
          payload.append("employeeId", String(employeeId));
          payload.append("documentType", document.documentType);
          if (document.expiryDate) payload.append("expiryDate", document.expiryDate);
          if (document.notes) payload.append("notes", document.notes);
          payload.append("file", document.file as File);
          await api.hr.documents.create(payload);
        }
        onboardingSteps.documents = true;
      }

      const missingItems: string[] = [];

      if (!form.cnssNumber) missingItems.push(t("hr.statusUpdates.missingCnss"));
      if (!form.rib) missingItems.push(t("hr.statusUpdates.missingRib"));
      if (!form.bankName) missingItems.push(t("hr.statusUpdates.missingBankName"));
      if (!form.bankAccount) missingItems.push(t("hr.statusUpdates.missingBankAccount"));
      if (!form.workEmail) missingItems.push(t("hr.statusUpdates.missingWorkEmail"));
      if (!form.address || !form.city) missingItems.push(t("hr.statusUpdates.missingAddress"));
      if (!form.emergencyContactName || !form.emergencyContactPhone) missingItems.push(t("hr.statusUpdates.missingEmergencyContact"));
      if (!form.education) missingItems.push(t("hr.statusUpdates.missingEducation"));
      if (!form.skills) missingItems.push(t("hr.statusUpdates.missingSkills"));
      if (isForeignEmployee && !form.passportNumber && !form.residenceCardNumber) {
        missingItems.push(t("hr.statusUpdates.missingPassportOrResidence"));
      }
      if (isForeignEmployee && !form.workPermitNumber) {
        missingItems.push(t("hr.statusUpdates.missingWorkPermit"));
      }
      if (!form.shiftId) missingItems.push(t("hr.statusUpdates.missingShift"));
      if (!form.leaveTypeId) missingItems.push(t("hr.statusUpdates.missingLeavePolicy"));
      if (componentAssignments.filter((assignment) => assignment.componentId && assignment.amount && assignment.effectiveDate).length === 0) {
        missingItems.push(t("hr.statusUpdates.missingComponents"));
      }
      documentUploads.filter((document) => document.required && !document.file).forEach((document) => {
        missingItems.push(t("hr.statusUpdates.missingUpload", { label: t(document.label) }));
      });

      return {
        employee,
        onboardingSteps,
        missingItems,
        readinessStatus,
      };
    },
    onSuccess: ({ employee, onboardingSteps, missingItems, readinessStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["contracts", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["payrollProfile", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["cnssProfile", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["irppProfile", employee.id] });
      toast.success(isEdit ? t("hr.statusUpdates.onboardingUpdated") : t("hr.statusUpdates.onboardingCreated"));
      navigate(`/hr/employees/${employee.id}`, {
        state: {
            onboardingResult: {
              mode: isEdit ? "updated" : "created",
              steps: onboardingSteps,
              missingItems,
              readinessStatus,
            },
          },
        });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("hr.statusUpdates.saveError"));
    },
  });

  const filteredManagers = employees.filter((employee) => String(employee.id) !== id);
  const selectedManager = filteredManagers.find((employee) => String(employee.id) === form.managerId);
  const selectedDepartment = departments.find((department: any) => String(department.id) === form.departmentId);
  const selectedPosition = positions.find((position: any) => String(position.id) === form.positionId);
  const selectedShift = shifts.find((shift: any) => String(shift.id) === form.shiftId);
  const selectedLeaveType = leaveTypes.find((leaveType: any) => String(leaveType.id) === form.leaveTypeId);

  const setField = <K extends keyof EmployeeFormState>(key: K, value: EmployeeFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addComponentAssignment = () => {
    setComponentAssignments((current) => [
      ...current,
      {
        localId: Date.now(),
        componentId: "",
        amount: "",
        effectiveDate: form.hireDate || "",
      },
    ]);
  };

  const updateComponentAssignment = (localId: number, key: keyof ComponentAssignmentState, value: string | number) => {
    setComponentAssignments((current) =>
      current.map((assignment) => assignment.localId === localId ? { ...assignment, [key]: value } : assignment),
    );
  };

  const removeComponentAssignment = (localId: number) => {
    setComponentAssignments((current) => current.filter((assignment) => assignment.localId !== localId));
  };

  const updateDocumentUpload = (key: string, patch: Partial<DocumentUploadState>) => {
    setDocumentUploads((current) =>
      current.map((document) => document.key === key ? { ...document, ...patch } : document),
    );
  };

  const stepIsValid = (stepIndex: number) => {
    if (stepIndex === 0) {
      return identityRequiredComplete;
    }
    if (stepIndex === 1) {
      return employmentRequiredComplete;
    }
    if (stepIndex === 2) {
      return contractRequiredComplete;
    }
    if (stepIndex === 3) {
      return payrollRequiredComplete;
    }
    if (stepIndex === 4) {
      return complianceRequiredComplete;
    }
    return true;
  };

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;
  const canGoNext = stepIsValid(currentStep);
  const currentStepMeta = STEPS[currentStep];

  const summaryItems = [
    { label: t("hr.employeeForm.summary.employee"), value: `${form.firstName} ${form.lastName}`.trim() || "-" },
    { label: t("hr.employeeForm.summary.department"), value: selectedDepartment?.name || "-" },
    { label: t("hr.employeeForm.summary.position"), value: selectedPosition?.title || "-" },
    { label: t("hr.employeeForm.summary.manager"), value: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : "-" },
    { label: t("hr.employeeForm.summary.contract"), value: `${form.contractType === "CDD" && form.cddReason ? `CDD (${form.cddReason})` : form.contractType || "-"} / ${form.contractNumber || t("hr.employeeForm.summary.autoGenerated")}` },
    { label: t("hr.employeeForm.summary.baseSalary"), value: form.baseSalary ? `${form.baseSalary} ${t("hr.employeeForm.summary.tnd")}` : "-" },
    { label: t("hr.employeeForm.summary.cnss"), value: form.cnssNumber || "-" },
    { label: t("hr.employeeForm.summary.payment"), value: `${form.paymentMethod || "-"}${form.rib ? ` / ${form.rib}` : ""}` },
    { label: t("hr.employeeForm.summary.shift"), value: selectedShift ? `${selectedShift.name} (${selectedShift.startTime}-${selectedShift.endTime})` : "-" },
    { label: t("hr.employeeForm.summary.leavePolicy"), value: selectedLeaveType ? `${selectedLeaveType.name} / ${form.leaveTotalDays || 0} ${t("hr.employeeForm.summary.days")}` : "-" },
    { label: t("hr.employeeForm.summary.payrollComponents"), value: `${componentAssignments.filter((assignment) => assignment.componentId && assignment.amount).length} ${t("hr.employeeForm.summary.configured")}` },
    { label: t("hr.employeeForm.summary.documents"), value: `${documentUploads.filter((document) => document.file).length} ${t("hr.employeeForm.summary.uploaded")}` },
  ];

  if (isEdit && isEmployeeLoading) {
    return (
      <CRMLayout title={t("hr.employeeForm.loadingTitle")}>
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
            <p className="text-sm text-muted-foreground">{t("hr.employeeForm.loadingText")}</p>
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? t("hr.employeeForm.editTitle") : t("hr.employeeForm.newTitle")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-fit gap-2 px-0 text-muted-foreground"
              onClick={async () => {
                await persistDraft();
                navigate("/hr/employees");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("hr.employeeForm.actions.backToEmployees")}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{isEdit ? t("hr.employeeForm.editEmployee") : t("hr.employeeForm.createEmployee")}</h1>
              <p className="text-muted-foreground">{t("hr.employeeForm.description")}</p>
            </div>
          </div>
          <Card className="w-full max-w-sm border-primary/20 bg-primary/5 lg:w-auto">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{isEdit ? t("hr.employeeForm.updatingDossier") : t("hr.employeeForm.newDossier")}</p>
                <p className="text-xs text-muted-foreground">{t("hr.employeeForm.stepOf", { current: currentStep + 1, total: STEPS.length })}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t("hr.employeeForm.progress")}</span>
                <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const active = index === currentStep;
                const completed = index < currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (index <= currentStep) setCurrentStep(index);
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-primary bg-primary/10 shadow-sm"
                        : completed
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-border/60 bg-background"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`rounded-xl p-2 ${active ? "bg-primary/15 text-primary" : completed ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                    </div>
                    <p className="font-semibold">{t(step.title)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t(step.description)}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>{t(currentStepMeta.title)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.employeeId")}</label>
                    <Input readOnly disabled value={isEdit ? form.employeeNumber : t("hr.employeeForm.autoGenerated")} className="cursor-not-allowed bg-muted text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.cin")} *</label>
                    <Input value={form.cin} onChange={(e) => setField("cin", e.target.value)} placeholder={t("hr.employeeForm.placeholders.cin")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.firstName")} *</label>
                    <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.lastName")} *</label>
                    <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.dateOfBirth")} *</label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.placeOfBirth")}</label>
                    <Input value={form.placeOfBirth} onChange={(e) => setField("placeOfBirth", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.gender")} *</label>
                    <Select value={form.gender} onValueChange={(value) => setField("gender", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t("hr.employeeForm.options.male")}</SelectItem>
                        <SelectItem value="Female">{t("hr.employeeForm.options.female")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.nationality")} *</label>
                    <Select value={form.nationality} onValueChange={(value) => setField("nationality", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tunisian">{t("hr.employeeForm.options.tunisian")}</SelectItem>
                        <SelectItem value="Non Tunisian">{t("hr.employeeForm.options.nonTunisian")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.maritalStatus")} *</label>
                    <Select value={form.maritalStatus} onValueChange={(value) => setField("maritalStatus", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">{t("hr.employeeForm.options.single")}</SelectItem>
                        <SelectItem value="Married">{t("hr.employeeForm.options.married")}</SelectItem>
                        <SelectItem value="Divorced">{t("hr.employeeForm.options.divorced")}</SelectItem>
                        <SelectItem value="Widowed">{t("hr.employeeForm.options.widowed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.childrenCount")}</label>
                    <Input type="number" min={0} value={form.childrenCount} onChange={(e) => setField("childrenCount", Number(e.target.value) || 0)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.disabledDependents")}</label>
                    <Input type="number" min={0} value={form.disabledDependents} onChange={(e) => setField("disabledDependents", Number(e.target.value) || 0)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.phone")} *</label>
                    <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.personalEmail")}</label>
                    <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workEmail")}</label>
                    <Input type="email" value={form.workEmail} onChange={(e) => setField("workEmail", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.passportNumber")}</label>
                    <Input value={form.passportNumber} onChange={(e) => setField("passportNumber", e.target.value)} placeholder={t("hr.employeeForm.placeholders.passportNumber")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.emergencyContactName")}</label>
                    <Input value={form.emergencyContactName} onChange={(e) => setField("emergencyContactName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.emergencyContactPhone")}</label>
                    <Input value={form.emergencyContactPhone} onChange={(e) => setField("emergencyContactPhone", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.address")}</label>
                    <Input value={form.address} onChange={(e) => setField("address", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.city")}</label>
                    <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.postalCode")}</label>
                    <Input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.hireDate")} *</label>
                    <Input type="date" value={form.hireDate} onChange={(e) => setField("hireDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.employeeStatus")} *</label>
                    <Input value={t("common.status." + employeeStatus.toLowerCase())} readOnly />
                    <p className="text-xs text-muted-foreground">{t("hr.employeeForm.hints.employeeStatus")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.department")} *</label>
                    <Select value={form.departmentId} onValueChange={(value) => setField("departmentId", value)}>
                      <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectDepartment")} /></SelectTrigger>
                      <SelectContent>
                        {departments.map((department: any) => (
                          <SelectItem key={department.id} value={String(department.id)}>{department.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.position")} *</label>
                    <Select value={form.positionId} onValueChange={(value) => setField("positionId", value)}>
                      <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectPosition")} /></SelectTrigger>
                      <SelectContent>
                        {positions.map((position: any) => (
                          <SelectItem key={position.id} value={String(position.id)}>{position.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.manager")}</label>
                    <Select value={form.managerId || "__none__"} onValueChange={(value) => setField("managerId", value === "__none__" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectManager")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{t("hr.employeeForm.options.noManager")}</SelectItem>
                        {filteredManagers.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>{employee.firstName} {employee.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workLocation")}</label>
                    <Input value={form.workLocation} onChange={(e) => setField("workLocation", e.target.value)} placeholder={t("hr.employeeForm.placeholders.workLocation")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.costCenter")}</label>
                    <Select value={form.costCenter || "none"} onValueChange={(value) => setField("costCenter", value === "none" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectCostCenter")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("hr.employeeForm.options.noCostCenter")}</SelectItem>
                        {costCenters.map((costCenter: CostCenter) => (
                          <SelectItem key={costCenter.id} value={costCenter.code}>
                            {costCenter.code} - {costCenter.name}
                          </SelectItem>
                        ))}
                        {form.costCenter && !costCenters.some((costCenter: CostCenter) => costCenter.code === form.costCenter) ? (
                          <SelectItem value={form.costCenter}>
                            {form.costCenter} {t("hr.employeeForm.options.legacy")}
                          </SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.employmentCategory")}</label>
                    <Select value={form.employmentCategory} onValueChange={(value) => setField("employmentCategory", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">{t("hr.employeeForm.options.employeeCategory")}</SelectItem>
                        <SelectItem value="Cadre">{t("hr.employeeForm.options.cadre")}</SelectItem>
                        <SelectItem value="Agent de maitrise">{t("hr.employeeForm.options.agentDeMaitrise")}</SelectItem>
                        <SelectItem value="Ouvrier">{t("hr.employeeForm.options.ouvrier")}</SelectItem>
                        <SelectItem value="Intern">{t("hr.employeeForm.options.intern")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.attendanceMode")}</label>
                    <Select value={form.attendanceMode} onValueChange={(value) => setField("attendanceMode", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On Site">{t("hr.employeeForm.options.onSite")}</SelectItem>
                        <SelectItem value="Hybrid">{t("hr.employeeForm.options.hybrid")}</SelectItem>
                        <SelectItem value="Remote">{t("hr.employeeForm.options.remote")}</SelectItem>
                        <SelectItem value="Shift Based">{t("hr.employeeForm.options.shiftBased")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.education")}</label>
                    <Input value={form.education} onChange={(e) => setField("education", e.target.value)} placeholder={t("hr.employeeForm.placeholders.education")} />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.skills")}</label>
                    <Input value={form.skills} onChange={(e) => setField("skills", e.target.value)} placeholder={t("hr.employeeForm.placeholders.skills")} />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.certifications")}</label>
                    <Input value={form.certifications} onChange={(e) => setField("certifications", e.target.value)} placeholder={t("hr.employeeForm.placeholders.certifications")} />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.contractNumber")}</label>
                    <Input
                      value={form.contractNumber || t("hr.employeeForm.autoGeneratedBySystem")}
                      readOnly
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.contractType")} *</label>
                    <Select value={form.contractType} onValueChange={(value) => setField("contractType", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI">{t("hr.employeeForm.options.cdi")}</SelectItem>
                        <SelectItem value="CDD">{t("hr.employeeForm.options.cdd")}</SelectItem>
                        <SelectItem value="SIVP">{t("hr.employeeForm.options.sivp")}</SelectItem>
                        <SelectItem value="Stage">{t("hr.employeeForm.options.stage")}</SelectItem>
                        <SelectItem value="Part Time">{t("hr.employeeForm.options.partTime")}</SelectItem>
                        <SelectItem value="Freelance">{t("hr.employeeForm.options.freelance")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.contractType === "CDD" && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm md:col-span-2">
                      <p className="font-semibold text-foreground">{t("hr.employeeForm.validation.cddRestrictedTitle")}</p>
                      <p className="mt-1 text-muted-foreground">
                        {t("hr.employeeForm.validation.cddRestrictedDesc")}
                      </p>
                    </div>
                  )}
                  {form.contractType === "CDD" && (
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-semibold">{t("hr.employeeForm.forms.cddLegalReason")} *</label>
                      <Select value={form.cddReason} onValueChange={(value) => setField("cddReason", value)}>
                        <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectLegalReason")} /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Replacement of absent employee">{t("hr.employeeForm.options.replacement")}</SelectItem>
                        <SelectItem value="Temporary increase in activity">{t("hr.employeeForm.options.temporaryIncrease")}</SelectItem>
                        <SelectItem value="Seasonal work">{t("hr.employeeForm.options.seasonalWork")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.contractStartDate")} *</label>
                    <Input type="date" value={form.contractStartDate} onChange={(e) => setField("contractStartDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.contractEndDate")}{form.contractType === "CDD" ? " *" : ""}</label>
                    <Input type="date" value={form.contractEndDate} onChange={(e) => setField("contractEndDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.probationEndDate")}</label>
                    <Input type="date" value={form.probationEndDate} onChange={(e) => setField("probationEndDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.contractStatus")}</label>
                    <Input value={t("common.status." + contractStatus.toLowerCase())} readOnly />
                    <p className="text-xs text-muted-foreground">{t("hr.employeeForm.hints.contractStatus")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.baseSalary")} *</label>
                    <Input type="number" step="0.001" value={form.baseSalary} onChange={(e) => setField("baseSalary", e.target.value)} placeholder={t("hr.employeeForm.placeholders.baseSalary")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workingHours")} *</label>
                    <Input type="number" min={1} step="0.5" value={form.workingHoursPerWeek} readOnly />
                    <p className="text-xs text-muted-foreground">{t("hr.employeeForm.hints.workingHours")}</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.socialRegime")} *</label>
                    <Select value={form.socialRegime} onValueChange={(value) => setField("socialRegime", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNSS">{t("hr.employeeForm.options.cnss")}</SelectItem>
                        <SelectItem value="CNRPS">{t("hr.employeeForm.options.cnrps")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.cnssNumber")}</label>
                    <Input value={form.cnssNumber} onChange={(e) => setField("cnssNumber", e.target.value)} placeholder={t("hr.employeeForm.placeholders.cnssNumber")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.cnssRegistrationDate")}</label>
                    <Input type="date" value={form.cnssRegistrationDate} onChange={(e) => setField("cnssRegistrationDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.cnssStatus")}</label>
                    <Input value={t("common.status." + cnssStatus.toLowerCase())} readOnly />
                    <p className="text-xs text-muted-foreground">{t("hr.employeeForm.hints.cnssStatus")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.cnrpsNumber")}</label>
                    <Input value={form.cnrpsNumber} onChange={(e) => setField("cnrpsNumber", e.target.value)} placeholder={t("hr.employeeForm.placeholders.cnrpsNumber")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.taxStatus")} *</label>
                    <Input value={taxStatus === "Married + Children" ? t("hr.employeeForm.options.marriedWithChildren") : t("hr.employeeForm.options." + taxStatus.toLowerCase())} readOnly />
                    <p className="text-xs text-muted-foreground">{t("hr.employeeForm.hints.taxStatus")}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.taxExemptions")}</label>
                    <Input type="number" min={0} step="0.001" value={form.taxExemptions} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.paymentMethod")} *</label>
                    <Select value={form.paymentMethod} onValueChange={(value) => setField("paymentMethod", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">{t("hr.employeeForm.options.bankTransfer")}</SelectItem>
                        <SelectItem value="Cash">{t("hr.employeeForm.options.cash")}</SelectItem>
                        <SelectItem value="Check">{t("hr.employeeForm.options.check")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.bankName")}</label>
                    <Input value={form.bankName} onChange={(e) => setField("bankName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.bankAccount")}</label>
                    <Input value={form.bankAccount} onChange={(e) => setField("bankAccount", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.rib")}</label>
                    <Input value={form.rib} onChange={(e) => setField("rib", e.target.value)} placeholder={t("hr.employeeForm.placeholders.rib")} />
                  </div>

                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <p className="font-semibold">{t("hr.employeeForm.forms.attendanceLeaveInit")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("hr.employeeForm.hints.attendanceLeaveInit")}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.defaultShift")} *</label>
                    <Select value={form.shiftId} onValueChange={(value) => setField("shiftId", value)}>
                      <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectShift")} /></SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift: any) => (
                          <SelectItem key={shift.id} value={String(shift.id)}>{shift.name} ({shift.startTime} - {shift.endTime})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.shiftStartDate")} *</label>
                    <Input type="date" value={form.shiftAssignmentStartDate} onChange={(e) => setField("shiftAssignmentStartDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.shiftEndDate")}</label>
                    <Input type="date" value={form.shiftAssignmentEndDate} onChange={(e) => setField("shiftAssignmentEndDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.shiftNotes")}</label>
                    <Input value={form.shiftNotes} onChange={(e) => setField("shiftNotes", e.target.value)} placeholder={t("hr.employeeForm.placeholders.shiftNotes")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.leaveType")} *</label>
                    <Select
                      value={form.leaveTypeId}
                      onValueChange={(value) => {
                        setField("leaveTypeId", value);
                        const leaveType = leaveTypes.find((item: any) => String(item.id) === value);
                        if (leaveType?.annualLimit != null && !form.leaveTotalDays) {
                          setField("leaveTotalDays", String(leaveType.annualLimit));
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectLeavePolicy")} /></SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((leaveType: any) => (
                          <SelectItem key={leaveType.id} value={String(leaveType.id)}>{leaveType.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.leaveBalanceYear")} *</label>
                    <Input type="number" min={2020} value={form.leaveBalanceYear} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.initialLeaveDays")} *</label>
                    <Input type="number" min={0} step="0.5" value={form.leaveTotalDays} onChange={(e) => setField("leaveTotalDays", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.accrualRate")} *</label>
                    <Input type="number" min={0} step="0.1" value={form.accrualRate} onChange={(e) => setField("accrualRate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.maxAccrual")} *</label>
                    <Input type="number" min={0} step="0.5" value={form.maxAccrual} onChange={(e) => setField("maxAccrual", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.accrualEffectiveDate")}</label>
                    <Input type="date" value={form.accrualEffectiveDate} onChange={(e) => setField("accrualEffectiveDate", e.target.value)} />
                  </div>

                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{t("hr.employeeForm.forms.payrollComponentsInit")}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t("hr.employeeForm.hints.payrollComponentsInit")}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addComponentAssignment}>
                        <Plus className="h-4 w-4" />
                        {t("hr.employeeForm.actions.addComponent")}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    {componentAssignments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                        {t("hr.employeeForm.hints.noComponents")}
                      </div>
                    ) : (
                      componentAssignments.map((assignment) => (
                        <div key={assignment.localId} className="grid gap-3 rounded-2xl border border-border/60 p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">{t("hr.employeeForm.forms.component")}</label>
                            <Select value={assignment.componentId} onValueChange={(value) => updateComponentAssignment(assignment.localId, "componentId", value)}>
                              <SelectTrigger><SelectValue placeholder={t("hr.employeeForm.placeholders.selectComponent")} /></SelectTrigger>
                              <SelectContent>
                                {allSalaryComponents
                                  .filter((component: any) => !NON_ASSIGNABLE_COMPONENT_CODES.has(component.code))
                                  .map((component: any) => (
                                    <SelectItem key={component.id} value={String(component.id)}>{component.name} ({component.type})</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">{t("hr.employeeForm.forms.amount")}</label>
                            <Input type="number" step="0.001" value={assignment.amount} onChange={(e) => updateComponentAssignment(assignment.localId, "amount", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">{t("hr.employeeForm.forms.effectiveDate")}</label>
                            <Input type="date" value={assignment.effectiveDate} onChange={(e) => updateComponentAssignment(assignment.localId, "effectiveDate", e.target.value)} />
                          </div>
                          <div className="flex items-end">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeComponentAssignment(assignment.localId)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <div className="flex items-start gap-3">
                      <Globe2 className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold">{t("hr.employeeForm.forms.foreignCompliance")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("hr.employeeForm.hints.foreignCompliance")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.residenceCardNumber")}</label>
                    <Input value={form.residenceCardNumber} onChange={(e) => setField("residenceCardNumber", e.target.value)} disabled={!isForeignEmployee} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.residenceCardExpiry")}</label>
                    <Input type="date" value={form.residenceCardExpiry} onChange={(e) => setField("residenceCardExpiry", e.target.value)} disabled={!isForeignEmployee} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workPermitType")}</label>
                    <Select value={form.workPermitType} onValueChange={(value) => setField("workPermitType", value)} disabled={!isForeignEmployee}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contract Visa">{t("hr.employeeForm.options.contractVisa")}</SelectItem>
                        <SelectItem value="Detachment">{t("hr.employeeForm.options.detachment")}</SelectItem>
                        <SelectItem value="Investment Exemption">{t("hr.employeeForm.options.investmentExemption")}</SelectItem>
                        <SelectItem value="Seasonal">{t("hr.employeeForm.options.seasonalPermit")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workPermitNumber")}</label>
                    <Input value={form.workPermitNumber} onChange={(e) => setField("workPermitNumber", e.target.value)} disabled={!isForeignEmployee} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workPermitStatus")}</label>
                    <Select value={form.workPermitStatus} onValueChange={(value) => setField("workPermitStatus", value)} disabled={!isForeignEmployee}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">{t("hr.employeeForm.options.pending")}</SelectItem>
                        <SelectItem value="Approved">{t("hr.employeeForm.options.approved")}</SelectItem>
                        <SelectItem value="Renewal Needed">{t("hr.employeeForm.options.renewalNeeded")}</SelectItem>
                        <SelectItem value="Expired">{t("hr.employeeForm.options.expired")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t("hr.employeeForm.forms.workPermitExpiry")}</label>
                    <Input type="date" value={form.workPermitExpiry} onChange={(e) => setField("workPermitExpiry", e.target.value)} disabled={!isForeignEmployee} />
                  </div>

                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <div className="flex items-start gap-3">
                      <Upload className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold">{t("hr.employeeForm.forms.mandatoryDocuments")}</p>
                        <p className="text-sm text-muted-foreground">{t("hr.employeeForm.hints.mandatoryDocuments")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    {documentUploads.map((document) => (
                      <div key={document.key} className="grid gap-3 rounded-2xl border border-border/60 p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">
                            {t(document.label)}
                            {document.required ? " *" : ""}
                          </p>
                          <Input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => updateDocumentUpload(document.key, { file: e.target.files?.[0] || null })}
                          />
                          {document.file ? (
                            <p className="text-xs text-muted-foreground">{document.file.name}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">{t("hr.employeeForm.documents.noFile")}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">{t("hr.employeeForm.forms.expiryDate")}</label>
                          <Input type="date" value={document.expiryDate} onChange={(e) => updateDocumentUpload(document.key, { expiryDate: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">{t("hr.employeeForm.forms.notes")}</label>
                          <Input value={document.notes} onChange={(e) => updateDocumentUpload(document.key, { notes: e.target.value })} placeholder={t("hr.employeeForm.placeholders.optionalNote")} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                    <p className="font-semibold text-foreground">{t("hr.employeeForm.review.readyTitle")}</p>
                    <p className="text-muted-foreground">
                      {t("hr.employeeForm.review.readyDesc")}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {summaryItems.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-sm font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep((step) => Math.max(0, step - 1))} disabled={currentStep === 0} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("hr.employeeForm.actions.previous")}
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      await persistDraft();
                      navigate("/hr/employees");
                    }}
                  >
                    {t("hr.employeeForm.actions.cancel")}
                  </Button>
                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={() => setCurrentStep((step) => Math.min(STEPS.length - 1, step + 1))} disabled={!canGoNext} className="gap-2">
                      {t("hr.employeeForm.actions.next")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isEdit ? t("hr.employeeForm.actions.save") : t("hr.employeeForm.actions.create")}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{t("hr.employeeForm.sidebar.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">{t("hr.employeeForm.sidebar.employeeMaster")}</p>
                <p>{t("hr.employeeForm.sidebar.employeeMasterDesc")}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("hr.employeeForm.sidebar.employmentContract")}</p>
                <p>{t("hr.employeeForm.sidebar.employmentContractDesc")}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("hr.employeeForm.sidebar.payrollAndTax")}</p>
                <p>{t("hr.employeeForm.sidebar.payrollAndTaxDesc")}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("hr.employeeForm.sidebar.foreignWorker")}</p>
                <p>{t("hr.employeeForm.sidebar.foreignWorkerDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
