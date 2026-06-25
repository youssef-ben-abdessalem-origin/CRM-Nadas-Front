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
  { id: "identity", title: "Identity", description: "Civil identity and personal contact", icon: Users },
  { id: "employment", title: "Employment", description: "Department, manager, and work setup", icon: Briefcase },
  { id: "contract", title: "Contract", description: "Employment contract and salary basis", icon: FileBadge2 },
  { id: "payroll", title: "Payroll", description: "CNSS, IRPP, payment, and bank data", icon: CreditCard },
  { id: "compliance", title: "Compliance", description: "Foreign-worker and regulatory fields", icon: ShieldCheck },
  { id: "review", title: "Review", description: "Save the full Tunisia onboarding pack", icon: CheckCircle2 },
];

function buildDocumentUploads(isForeignEmployee: boolean): DocumentUploadState[] {
  const base: DocumentUploadState[] = [
    { key: "cin", label: "CIN Copy", documentType: "CIN", required: true, file: null, expiryDate: "", notes: "" },
    { key: "contract", label: "Signed Contract", documentType: "Contract", required: true, file: null, expiryDate: "", notes: "" },
    { key: "rib", label: "RIB Proof", documentType: "Other", required: true, file: null, expiryDate: "", notes: "RIB proof" },
    { key: "diploma", label: "Diploma Copy", documentType: "Diploma", required: false, file: null, expiryDate: "", notes: "" },
  ];

  if (isForeignEmployee) {
    base.push(
      { key: "passport", label: "Passport Copy", documentType: "Passport", required: true, file: null, expiryDate: "", notes: "" },
      { key: "permit", label: "Work Permit", documentType: "Work Permit", required: true, file: null, expiryDate: "", notes: "" },
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
        toast.success("Employee draft created");
      }
    } else if (!silent) {
      toast.success("Employee draft updated");
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

      if (!form.cnssNumber) missingItems.push("Add CNSS number");
      if (!form.rib) missingItems.push("Add employee RIB");
      if (!form.bankName) missingItems.push("Add bank name");
      if (!form.bankAccount) missingItems.push("Add bank account");
      if (!form.workEmail) missingItems.push("Add work email");
      if (!form.address || !form.city) missingItems.push("Complete home address");
      if (!form.emergencyContactName || !form.emergencyContactPhone) missingItems.push("Complete emergency contact");
      if (!form.education) missingItems.push("Add education background");
      if (!form.skills) missingItems.push("Add skills");
      if (isForeignEmployee && !form.passportNumber && !form.residenceCardNumber) {
        missingItems.push("Add passport or residence card details");
      }
      if (isForeignEmployee && !form.workPermitNumber) {
        missingItems.push("Add work permit number");
      }
      if (!form.shiftId) missingItems.push("Assign a work shift");
      if (!form.leaveTypeId) missingItems.push("Initialize leave policy");
      if (componentAssignments.filter((assignment) => assignment.componentId && assignment.amount && assignment.effectiveDate).length === 0) {
        missingItems.push("Assign payroll components");
      }
      documentUploads.filter((document) => document.required && !document.file).forEach((document) => {
        missingItems.push(`Upload ${document.label}`);
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
      toast.success(isEdit ? "Employee HR onboarding updated successfully" : "Employee created with HR onboarding successfully");
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
      toast.error(error.message || "Unable to save employee onboarding");
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
    { label: "Employee", value: `${form.firstName} ${form.lastName}`.trim() || "-" },
    { label: "Department", value: selectedDepartment?.name || "-" },
    { label: "Position", value: selectedPosition?.title || "-" },
      { label: "Manager", value: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : "-" },
      { label: "Contract", value: `${form.contractType === "CDD" && form.cddReason ? `CDD (${form.cddReason})` : form.contractType || "-"} / ${form.contractNumber || "Auto-generated"}` },
      { label: "Base Salary", value: form.baseSalary ? `${form.baseSalary} TND` : "-" },
      { label: "CNSS", value: form.cnssNumber || "-" },
      { label: "Payment", value: `${form.paymentMethod || "-"}${form.rib ? ` / ${form.rib}` : ""}` },
      { label: "Shift", value: selectedShift ? `${selectedShift.name} (${selectedShift.startTime}-${selectedShift.endTime})` : "-" },
      { label: "Leave Policy", value: selectedLeaveType ? `${selectedLeaveType.name} / ${form.leaveTotalDays || 0} days` : "-" },
      { label: "Payroll Components", value: `${componentAssignments.filter((assignment) => assignment.componentId && assignment.amount).length} configured` },
      { label: "Documents", value: `${documentUploads.filter((document) => document.file).length} uploaded` },
    ];

  if (isEdit && isEmployeeLoading) {
    return (
      <CRMLayout title="HR - Edit Employee">
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading Tunisia HR onboarding profile...</p>
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? "HR - Edit Employee" : "HR - New Employee"}>
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
              Back to employees
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit Employee" : "Create New Employee"}</h1>
              <p className="text-muted-foreground">Tunisia-ready HR onboarding with employee, contract, payroll, CNSS, and IRPP setup in one flow.</p>
            </div>
          </div>
          <Card className="w-full max-w-sm border-primary/20 bg-primary/5 lg:w-auto">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{isEdit ? "Updating Tunisia HR dossier" : "New Tunisia HR dossier"}</p>
                <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
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
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>{currentStepMeta.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Employee ID</label>
                    <Input readOnly disabled value={isEdit ? form.employeeNumber : "Auto-generated"} className="cursor-not-allowed bg-muted text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">CIN *</label>
                    <Input value={form.cin} onChange={(e) => setField("cin", e.target.value)} placeholder="09876543" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">First Name *</label>
                    <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Last Name *</label>
                    <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Date of Birth *</label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Place of Birth</label>
                    <Input value={form.placeOfBirth} onChange={(e) => setField("placeOfBirth", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Gender *</label>
                    <Select value={form.gender} onValueChange={(value) => setField("gender", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Nationality *</label>
                    <Select value={form.nationality} onValueChange={(value) => setField("nationality", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tunisian">Tunisian</SelectItem>
                        <SelectItem value="Non Tunisian">Non Tunisian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Marital Status *</label>
                    <Select value={form.maritalStatus} onValueChange={(value) => setField("maritalStatus", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Children Count</label>
                    <Input type="number" min={0} value={form.childrenCount} onChange={(e) => setField("childrenCount", Number(e.target.value) || 0)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Disabled Dependents</label>
                    <Input type="number" min={0} value={form.disabledDependents} onChange={(e) => setField("disabledDependents", Number(e.target.value) || 0)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Phone *</label>
                    <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Personal Email</label>
                    <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Work Email</label>
                    <Input type="email" value={form.workEmail} onChange={(e) => setField("workEmail", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Passport Number</label>
                    <Input value={form.passportNumber} onChange={(e) => setField("passportNumber", e.target.value)} placeholder="AB123456" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Emergency Contact Name</label>
                    <Input value={form.emergencyContactName} onChange={(e) => setField("emergencyContactName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Emergency Contact Phone</label>
                    <Input value={form.emergencyContactPhone} onChange={(e) => setField("emergencyContactPhone", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">Address</label>
                    <Input value={form.address} onChange={(e) => setField("address", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">City</label>
                    <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Postal Code</label>
                    <Input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Hire Date *</label>
                    <Input type="date" value={form.hireDate} onChange={(e) => setField("hireDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Employee Status *</label>
                    <Input value={employeeStatus} readOnly />
                    <p className="text-xs text-muted-foreground">System-managed. It becomes `Active` only when all required fields are completed. Otherwise it stays `Draft`.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Department *</label>
                    <Select value={form.departmentId} onValueChange={(value) => setField("departmentId", value)}>
                      <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((department: any) => (
                          <SelectItem key={department.id} value={String(department.id)}>{department.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Position *</label>
                    <Select value={form.positionId} onValueChange={(value) => setField("positionId", value)}>
                      <SelectTrigger><SelectValue placeholder="Select Position" /></SelectTrigger>
                      <SelectContent>
                        {positions.map((position: any) => (
                          <SelectItem key={position.id} value={String(position.id)}>{position.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Manager</label>
                    <Select value={form.managerId || "__none__"} onValueChange={(value) => setField("managerId", value === "__none__" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder="Select Manager" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No manager</SelectItem>
                        {filteredManagers.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>{employee.firstName} {employee.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Work Location</label>
                    <Input value={form.workLocation} onChange={(e) => setField("workLocation", e.target.value)} placeholder="Tunis HQ" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Cost Center</label>
                    <Select value={form.costCenter || "none"} onValueChange={(value) => setField("costCenter", value === "none" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder="Select Cost Center" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No cost center</SelectItem>
                        {costCenters.map((costCenter: CostCenter) => (
                          <SelectItem key={costCenter.id} value={costCenter.code}>
                            {costCenter.code} - {costCenter.name}
                          </SelectItem>
                        ))}
                        {form.costCenter && !costCenters.some((costCenter: CostCenter) => costCenter.code === form.costCenter) ? (
                          <SelectItem value={form.costCenter}>
                            {form.costCenter} (legacy)
                          </SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Employment Category</label>
                    <Select value={form.employmentCategory} onValueChange={(value) => setField("employmentCategory", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Cadre">Cadre</SelectItem>
                        <SelectItem value="Agent de maitrise">Agent de maitrise</SelectItem>
                        <SelectItem value="Ouvrier">Ouvrier</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Attendance Mode</label>
                    <Select value={form.attendanceMode} onValueChange={(value) => setField("attendanceMode", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On Site">On Site</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Shift Based">Shift Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">Education</label>
                    <Input value={form.education} onChange={(e) => setField("education", e.target.value)} placeholder="Bachelor in Computer Science" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">Skills</label>
                    <Input value={form.skills} onChange={(e) => setField("skills", e.target.value)} placeholder="Excel, Payroll, Recruitment" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">Certifications</label>
                    <Input value={form.certifications} onChange={(e) => setField("certifications", e.target.value)} placeholder="PMP, HR Analytics" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Contract Number</label>
                    <Input
                      value={form.contractNumber || "Auto-generated by the system"}
                      readOnly
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Contract Type *</label>
                    <Select value={form.contractType} onValueChange={(value) => setField("contractType", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="SIVP">SIVP</SelectItem>
                        <SelectItem value="Stage">Stage</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.contractType === "CDD" && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm md:col-span-2">
                      <p className="font-semibold text-foreground">CDD is restricted under Tunisia’s 2025 labor reform</p>
                      <p className="mt-1 text-muted-foreground">
                        Use `CDD` only for legally allowed exceptions such as replacement, temporary increase in activity, or seasonal work.
                      </p>
                    </div>
                  )}
                  {form.contractType === "CDD" && (
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-semibold">CDD Legal Reason *</label>
                      <Select value={form.cddReason} onValueChange={(value) => setField("cddReason", value)}>
                        <SelectTrigger><SelectValue placeholder="Select legal reason" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Replacement of absent employee">Replacement of absent employee</SelectItem>
                          <SelectItem value="Temporary increase in activity">Temporary increase in activity</SelectItem>
                          <SelectItem value="Seasonal work">Seasonal work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Contract Start Date *</label>
                    <Input type="date" value={form.contractStartDate} onChange={(e) => setField("contractStartDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Contract End Date{form.contractType === "CDD" ? " *" : ""}</label>
                    <Input type="date" value={form.contractEndDate} onChange={(e) => setField("contractEndDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Probation End Date</label>
                    <Input type="date" value={form.probationEndDate} onChange={(e) => setField("probationEndDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Contract Status</label>
                    <Input value={contractStatus} readOnly />
                    <p className="text-xs text-muted-foreground">System-managed from contract completeness and contract end date.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Base Salary (TND) *</label>
                    <Input type="number" step="0.001" value={form.baseSalary} onChange={(e) => setField("baseSalary", e.target.value)} placeholder="1500.000" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Working Hours / Week *</label>
                    <Input type="number" min={1} step="0.5" value={form.workingHoursPerWeek} readOnly />
                    <p className="text-xs text-muted-foreground">Auto-filled from the selected default shift on a standard 5-day work week.</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Social Regime *</label>
                    <Select value={form.socialRegime} onValueChange={(value) => setField("socialRegime", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNSS">CNSS</SelectItem>
                        <SelectItem value="CNRPS">CNRPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">CNSS Number</label>
                    <Input value={form.cnssNumber} onChange={(e) => setField("cnssNumber", e.target.value)} placeholder="123456789" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">CNSS Registration Date</label>
                    <Input type="date" value={form.cnssRegistrationDate} onChange={(e) => setField("cnssRegistrationDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">CNSS Status</label>
                    <Input value={cnssStatus} readOnly />
                    <p className="text-xs text-muted-foreground">System-managed from social regime and CNSS number availability.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">CNRPS Number</label>
                    <Input value={form.cnrpsNumber} onChange={(e) => setField("cnrpsNumber", e.target.value)} placeholder="Optional public-sector ref" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Tax Status *</label>
                    <Input value={taxStatus} readOnly />
                    <p className="text-xs text-muted-foreground">System-managed from marital status and number of children.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Tax Exemptions</label>
                    <Input type="number" min={0} step="0.001" value={form.taxExemptions} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Payment Method *</label>
                    <Select value={form.paymentMethod} onValueChange={(value) => setField("paymentMethod", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Bank Name</label>
                    <Input value={form.bankName} onChange={(e) => setField("bankName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Bank Account</label>
                    <Input value={form.bankAccount} onChange={(e) => setField("bankAccount", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">RIB</label>
                    <Input value={form.rib} onChange={(e) => setField("rib", e.target.value)} placeholder="20 digits" />
                  </div>

                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <p className="font-semibold">Attendance and leave initialization</p>
                    <p className="mt-1 text-sm text-muted-foreground">Assign the default shift and initialize the employee leave policy before payroll starts.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Default Shift *</label>
                    <Select value={form.shiftId} onValueChange={(value) => setField("shiftId", value)}>
                      <SelectTrigger><SelectValue placeholder="Select Shift" /></SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift: any) => (
                          <SelectItem key={shift.id} value={String(shift.id)}>{shift.name} ({shift.startTime} - {shift.endTime})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Shift Start Date *</label>
                    <Input type="date" value={form.shiftAssignmentStartDate} onChange={(e) => setField("shiftAssignmentStartDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Shift End Date</label>
                    <Input type="date" value={form.shiftAssignmentEndDate} onChange={(e) => setField("shiftAssignmentEndDate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Shift Notes</label>
                    <Input value={form.shiftNotes} onChange={(e) => setField("shiftNotes", e.target.value)} placeholder="Optional assignment note" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Leave Type *</label>
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
                      <SelectTrigger><SelectValue placeholder="Select Leave Policy" /></SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((leaveType: any) => (
                          <SelectItem key={leaveType.id} value={String(leaveType.id)}>{leaveType.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Leave Balance Year *</label>
                    <Input type="number" min={2020} value={form.leaveBalanceYear} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Initial Leave Days *</label>
                    <Input type="number" min={0} step="0.5" value={form.leaveTotalDays} onChange={(e) => setField("leaveTotalDays", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Accrual Rate / Month *</label>
                    <Input type="number" min={0} step="0.1" value={form.accrualRate} onChange={(e) => setField("accrualRate", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Maximum Accrual *</label>
                    <Input type="number" min={0} step="0.5" value={form.maxAccrual} onChange={(e) => setField("maxAccrual", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Accrual Effective Date</label>
                    <Input type="date" value={form.accrualEffectiveDate} onChange={(e) => setField("accrualEffectiveDate", e.target.value)} />
                  </div>

                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">Payroll components initialization</p>
                        <p className="mt-1 text-sm text-muted-foreground">Assign recurring earnings or deductions like transport allowance, meal allowance, or fixed deductions.</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addComponentAssignment}>
                        <Plus className="h-4 w-4" />
                        Add Component
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    {componentAssignments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                        No payroll components yet. Add at least one recurring component for a payroll-ready employee.
                      </div>
                    ) : (
                      componentAssignments.map((assignment) => (
                        <div key={assignment.localId} className="grid gap-3 rounded-2xl border border-border/60 p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Component</label>
                            <Select value={assignment.componentId} onValueChange={(value) => updateComponentAssignment(assignment.localId, "componentId", value)}>
                              <SelectTrigger><SelectValue placeholder="Select Component" /></SelectTrigger>
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
                            <label className="text-sm font-semibold">Amount</label>
                            <Input type="number" step="0.001" value={assignment.amount} onChange={(e) => updateComponentAssignment(assignment.localId, "amount", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Effective Date</label>
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
                        <p className="font-semibold">Foreign employee compliance</p>
                        <p className="text-sm text-muted-foreground">
                          These fields are especially relevant when the employee is not Tunisian. The Ministry of Employment has dedicated foreign-worker procedures and work authorization categories.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Residence Card Number</label>
                    <Input value={form.residenceCardNumber} onChange={(e) => setField("residenceCardNumber", e.target.value)} disabled={!isForeignEmployee} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Residence Card Expiry</label>
                    <Input type="date" value={form.residenceCardExpiry} onChange={(e) => setField("residenceCardExpiry", e.target.value)} disabled={!isForeignEmployee} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Work Permit Type</label>
                    <Select value={form.workPermitType} onValueChange={(value) => setField("workPermitType", value)} disabled={!isForeignEmployee}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contract Visa">Contract Visa</SelectItem>
                        <SelectItem value="Detachment">Detachment</SelectItem>
                        <SelectItem value="Investment Exemption">Investment Exemption</SelectItem>
                        <SelectItem value="Seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Work Permit Number</label>
                    <Input value={form.workPermitNumber} onChange={(e) => setField("workPermitNumber", e.target.value)} disabled={!isForeignEmployee} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Work Permit Status</label>
                    <Select value={form.workPermitStatus} onValueChange={(value) => setField("workPermitStatus", value)} disabled={!isForeignEmployee}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Renewal Needed">Renewal Needed</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Work Permit Expiry</label>
                    <Input type="date" value={form.workPermitExpiry} onChange={(e) => setField("workPermitExpiry", e.target.value)} disabled={!isForeignEmployee} />
                  </div>

                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <div className="flex items-start gap-3">
                      <Upload className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold">Mandatory onboarding documents</p>
                        <p className="text-sm text-muted-foreground">Upload the minimum HR/payroll documents before finishing onboarding.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    {documentUploads.map((document) => (
                      <div key={document.key} className="grid gap-3 rounded-2xl border border-border/60 p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">
                            {document.label}
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
                            <p className="text-xs text-muted-foreground">No file selected</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Expiry Date</label>
                          <Input type="date" value={document.expiryDate} onChange={(e) => updateDocumentUpload(document.key, { expiryDate: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Notes</label>
                          <Input value={document.notes} onChange={(e) => updateDocumentUpload(document.key, { notes: e.target.value })} placeholder="Optional note" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                    <p className="font-semibold text-foreground">Ready to save the full HR package</p>
                    <p className="text-muted-foreground">
                      This will create or update the employee record, the primary contract, the payroll profile, the CNSS profile when available, and the IRPP tax profile.
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
                  Previous
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
                    Cancel
                  </Button>
                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={() => setCurrentStep((step) => Math.min(STEPS.length - 1, step + 1))} disabled={!canGoNext} className="gap-2">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isEdit ? "Save HR Onboarding" : "Create HR Onboarding"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Tunisia HR Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Employee master</p>
                <p>Identity, civil status, contacts, work organization.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Employment contract</p>
                <p>Contract number, type, salary basis, hours, and probation.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Payroll and tax</p>
                <p>CNSS/CNRPS, IRPP family situation, bank transfer details, and exemptions.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Foreign worker fields</p>
                <p>Residence card and work permit tracking for non-Tunisian hires.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
