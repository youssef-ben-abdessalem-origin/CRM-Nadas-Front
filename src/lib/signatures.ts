import type { Payslip } from "@/lib/api";

const STORAGE_KEY = "nadas-signature-tasks";

export type SignatureTaskStatus = "pending" | "signed";

export type SignaturePlacement = {
  dataUrl: string;
  signerName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  placedAt: string;
};

export type SignatureZoneArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SignatureZone = {
  id: string;
  label: string;
  placement: SignaturePlacement | null;
  signerRole?: "employee" | "hr_manager";
  area: SignatureZoneArea;
};

export type SignatureTask = {
  id: string;
  kind: "payslip";
  documentId: number;
  title: string;
  subtitle: string;
  employeeName: string;
  employeeNumber: string;
  signerName: string;
  signerEmail?: string;
  signerPhone?: string;
  status: SignatureTaskStatus;
  createdAt: string;
  signedAt?: string;
  signedFileName?: string;
  zones: SignatureZone[];
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getDefaultZoneArea(zoneId: string): SignatureZoneArea {
  if (zoneId === "manager-signature") {
    return { x: 520, y: 1090, width: 240, height: 120 };
  }

  return { x: 110, y: 1090, width: 240, height: 120 };
}

function normalizeSignatureTask(task: SignatureTask): SignatureTask {
  const existingZoneIds = new Set(task.zones.map((zone) => zone.id));
  const normalizedZones = task.zones.map((zone) => ({
    ...zone,
    signerRole:
      zone.signerRole ||
      (zone.id === "manager-signature" ? "hr_manager" : "employee"),
    area: zone.area || getDefaultZoneArea(zone.id),
  }));

  if (!existingZoneIds.has("manager-signature")) {
    normalizedZones.push({
      id: "manager-signature",
      label: "HR & Payroll Manager",
      placement: null,
      signerRole: "hr_manager",
      area: getDefaultZoneArea("manager-signature"),
    });
  }

  if (!existingZoneIds.has("employee-signature")) {
    normalizedZones.unshift({
      id: "employee-signature",
      label: "Employee Signature",
      placement: null,
      signerRole: "employee",
      area: getDefaultZoneArea("employee-signature"),
    });
  }

  return {
    ...task,
    zones: normalizedZones,
  };
}

export function listSignatureTasks(): SignatureTask[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SignatureTask[];
    return Array.isArray(parsed) ? parsed.map(normalizeSignatureTask) : [];
  } catch {
    return [];
  }
}

function saveSignatureTasks(tasks: SignatureTask[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getSignatureTask(taskId: string) {
  const task = listSignatureTasks().find((item) => item.id === taskId) || null;
  return task ? normalizeSignatureTask(task) : null;
}

export function upsertSignatureTask(task: SignatureTask) {
  const tasks = listSignatureTasks();
  const existingIndex = tasks.findIndex((item) => item.id === task.id);

  if (existingIndex >= 0) {
    tasks[existingIndex] = task;
  } else {
    tasks.unshift(task);
  }

  saveSignatureTasks(tasks);
  return task;
}

export function createPayslipSignatureTask(payslip: Payslip) {
  const existing = listSignatureTasks().find(
    (task) => task.kind === "payslip" && task.documentId === payslip.id,
  );

  if (existing) {
    return existing;
  }

  const employeeName = `${payslip.employee?.firstName || ""} ${payslip.employee?.lastName || ""}`.trim() || "Employee";
  const task: SignatureTask = {
    id: `payslip-${payslip.id}`,
    kind: "payslip",
    documentId: payslip.id,
    title: `${employeeName} - ${payslip.payrollPeriod?.periodName || "Payslip"}`,
    subtitle: "Payroll payslip awaiting employee signature",
    employeeName,
    employeeNumber: payslip.employee?.employeeNumber || "-",
    signerName: employeeName,
    signerEmail: payslip.employee?.workEmail || payslip.employee?.email || undefined,
    signerPhone: payslip.employee?.phone || undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
    zones: [
      {
        id: "employee-signature",
        label: "Employee Signature",
        placement: null,
        signerRole: "employee",
        area: getDefaultZoneArea("employee-signature"),
      },
      {
        id: "manager-signature",
        label: "HR & Payroll Manager",
        placement: null,
        signerRole: "hr_manager",
        area: getDefaultZoneArea("manager-signature"),
      },
    ],
  };

  upsertSignatureTask(task);
  return task;
}

export function updateSignatureZone(
  taskId: string,
  zoneId: string,
  placement: SignaturePlacement | null,
) {
  const task = getSignatureTask(taskId);
  if (!task) return null;

  const updated: SignatureTask = {
    ...task,
    zones: task.zones.map((zone) =>
      zone.id === zoneId ? { ...zone, placement } : zone,
    ),
  };
  upsertSignatureTask(updated);
  return updated;
}

export function updateSignatureZoneArea(
  taskId: string,
  zoneId: string,
  area: SignatureZoneArea,
) {
  const task = getSignatureTask(taskId);
  if (!task) return null;

  const updated: SignatureTask = {
    ...task,
    zones: task.zones.map((zone) =>
      zone.id === zoneId ? { ...zone, area } : zone,
    ),
  };
  upsertSignatureTask(updated);
  return updated;
}

export function clearSignatureZone(taskId: string, zoneId: string) {
  return updateSignatureZone(taskId, zoneId, null);
}

export function applySignatureToAllZones(
  taskId: string,
  signerName: string,
  dataUrl: string,
  dimensions?: { width: number; height: number },
) {
  const task = getSignatureTask(taskId);
  if (!task) return null;

  const updated: SignatureTask = {
    ...task,
    zones: task.zones.map((zone) => ({
      ...zone,
      placement: zone.placement || {
        dataUrl,
        signerName,
        x: 12,
        y: 16,
        width: dimensions?.width || 220,
        height: dimensions?.height || 72,
        placedAt: new Date().toISOString(),
      },
    })),
  };
  upsertSignatureTask(updated);
  return updated;
}

export function markSignatureTaskSigned(taskId: string, signedFileName?: string) {
  const task = getSignatureTask(taskId);
  if (!task) return null;

  const updated: SignatureTask = {
    ...task,
    status: "signed",
    signedAt: new Date().toISOString(),
    signedFileName: signedFileName || task.signedFileName,
  };
  upsertSignatureTask(updated);
  return updated;
}
