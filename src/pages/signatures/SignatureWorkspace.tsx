import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, GripHorizontal, PenLine, Trash2 } from "lucide-react";
import { CRMLayout } from "@/components/crmlayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  clearSignatureZone,
  getSignatureTask,
  markSignatureTaskSigned,
  updateSignatureZoneArea,
  updateSignatureZone,
  type SignatureTask,
} from "@/lib/signatures";
import { SignatureAdoptDialog } from "@/components/signatures/SignatureAdoptDialog";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";

type DragState = {
  zoneId: string;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
} | null;

export default function SignatureWorkspace() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState<SignatureTask | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState>(null);
  const documentRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);

  useEffect(() => {
    if (!taskId) return;
    setTask(getSignatureTask(taskId));
  }, [taskId]);

  useEffect(() => {
    if (!task?.zones?.length) return;
    const firstPendingZone = task.zones.find((zone) => !zone.placement) || task.zones[0];
    setActiveZoneId((current) => current || firstPendingZone.id);
  }, [task]);

  const { data: payslip } = useQuery({
    queryKey: ["payslip", task?.documentId],
    queryFn: () => api.payroll.payslips.getOne(task!.documentId),
    enabled: Boolean(task?.documentId),
  });

  const activeZone = useMemo(
    () => task?.zones.find((zone) => zone.id === activeZoneId) || null,
    [activeZoneId, task],
  );

  const allZonesSigned = Boolean(task?.zones.every((zone) => zone.placement));

  const refreshTask = () => {
    if (!taskId) return;
    setTask(getSignatureTask(taskId));
  };

  const handleSign = async (payload: {
    signerName: string;
    dataUrl: string;
    width: number;
    height: number;
  }) => {
    if (!task || !activeZoneId) return;

    updateSignatureZone(task.id, activeZoneId, {
      dataUrl: payload.dataUrl,
      signerName: payload.signerName,
      x: 0,
      y: 0,
      width: payload.width,
      height: payload.height,
      placedAt: new Date().toISOString(),
    });
    refreshTask();
    setDialogOpen(false);
  };

  const handleAreaPointerDown = (event: React.PointerEvent<HTMLButtonElement>, zoneId: string) => {
    const zone = task?.zones.find((item) => item.id === zoneId);
    if (!zone?.area) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragMovedRef.current = false;
    setActiveZoneId(zoneId);
    setDragState({
      zoneId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: zone.area.x,
      originY: zone.area.y,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || !task || !documentRef.current) return;
    if (event.pointerId !== dragState.pointerId) return;

    const zone = task.zones.find((item) => item.id === dragState.zoneId);
    if (!zone) return;

    const zoneRect = documentRef.current.getBoundingClientRect();
    const nextX = dragState.originX + (event.clientX - dragState.startX);
    const nextY = dragState.originY + (event.clientY - dragState.startY);
    const boundedX = Math.max(16, Math.min(nextX, zoneRect.width - zone.area.width - 16));
    const boundedY = Math.max(16, Math.min(nextY, zoneRect.height - zone.area.height - 16));
    dragMovedRef.current = true;

    const updatedTask = updateSignatureZoneArea(task.id, zone.id, {
      ...zone.area,
      x: boundedX,
      y: boundedY,
    });
    setTask(updatedTask);
  };

  const handlePointerEnd = () => {
    setDragState(null);
    window.setTimeout(() => {
      dragMovedRef.current = false;
    }, 0);
  };

  const moveToNextSignatureField = () => {
    if (!task?.zones.length) return;
    const currentIndex = task.zones.findIndex((zone) => zone.id === activeZoneId);
    const nextZone = task.zones[(currentIndex + 1 + task.zones.length) % task.zones.length];
    setActiveZoneId(nextZone.id);
    documentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleRemoveSignature = (zoneId: string) => {
    if (!task) return;
    const updatedTask = clearSignatureZone(task.id, zoneId);
    setTask(updatedTask);
  };

  const renderSignatureField = (zoneId: string) => {
    const zone = task.zones.find((item) => item.id === zoneId);
    if (!zone) return null;

    const isActive = activeZoneId === zone.id;

    return (
      <div
        key={zone.id}
        className={[
          "absolute rounded-2xl border border-dashed transition shadow-lg backdrop-blur-sm",
          isActive
            ? "border-violet-400 bg-violet-500/12 ring-2 ring-violet-400/40"
            : "border-violet-300/50 bg-white/85",
        ].join(" ")}
        style={{
          left: zone.area.x,
          top: zone.area.y,
          width: zone.area.width,
          minHeight: zone.area.height,
        }}
        onClick={() => setActiveZoneId(zone.id)}
      >
        <div className="flex items-center justify-between rounded-t-2xl border-b border-violet-200/70 bg-violet-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-900">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2 py-1 text-[10px] font-bold text-violet-700"
              onPointerDown={(event) => handleAreaPointerDown(event, zone.id)}
            >
              <GripHorizontal className="h-3 w-3" />
              Move
            </button>
            <span>{zone.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {zone.placement ? (
              <button
                type="button"
                className="rounded-md border border-rose-200 bg-white p-1 text-rose-600 transition hover:bg-rose-50"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveSignature(zone.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
        {zone.placement ? (
          <button
            type="button"
            className="flex w-full items-center justify-center px-3 py-4"
            onClick={(event) => {
              event.stopPropagation();
              if (dragMovedRef.current) return;
              setActiveZoneId(zone.id);
              setDialogOpen(true);
            }}
          >
            <img
              src={zone.placement.dataUrl}
              alt={zone.label}
              className="select-none object-contain"
              draggable={false}
              style={{
                width: zone.placement.width,
                height: zone.placement.height,
              }}
            />
          </button>
        ) : (
          <button
            type="button"
            className="flex min-h-[68px] w-full items-center justify-center rounded-b-2xl px-4 py-5 text-center text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            onClick={() => {
              setActiveZoneId(zone.id);
              setDialogOpen(true);
            }}
          >
            Click to add {zone.label.toLowerCase()}
          </button>
        )}
      </div>
    );
  };

  const exportSignedPdf = async () => {
    if (!documentRef.current || !task) return;

    const canvas = await html2canvas(documentRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const safeTitle = task.title.replace(/[\\/:*?"<>|]/g, "-");
    const filename = `${safeTitle}-signed.pdf`;
    pdf.save(filename);
    markSignatureTaskSigned(task.id, filename);
    refreshTask();
    toast.success("Signed PDF saved");
    navigate(`/signatures/${task.id}`);
  };

  if (!task) {
    return (
      <CRMLayout title="Sign Document">
        <div className="p-6">
          <Card className="glass-morphism">
            <CardContent className="py-12 text-center text-slate-300">Signature task not found.</CardContent>
          </Card>
        </div>
      </CRMLayout>
    );
  }

  if (!payslip) {
    return (
      <CRMLayout title="Sign Document">
        <div className="p-6">
          <Card className="glass-morphism">
            <CardContent className="py-12 text-center text-slate-300">Loading signable document...</CardContent>
          </Card>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={`Sign - ${task.title}`}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/signatures/${task.id}`)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">Sign Document</h1>
              <p className="text-slate-400">Place your signature in the highlighted section, then validate the final PDF.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={moveToNextSignatureField}
            >
              Next Signature Field
            </Button>
            <Button
              disabled={!allZonesSigned}
              onClick={exportSignedPdf}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              Validate
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-200">
                <PenLine className="h-4 w-4 text-violet-300" />
                <span>{task.title}</span>
              </div>
            <span className="text-sm text-slate-400">
              {activeZone ? `${activeZone.label}${activeZone.placement ? " signed" : " waiting signature"}` : "Waiting signature"}
            </span>
          </div>

          <div
            className="overflow-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div ref={documentRef} className="relative mx-auto w-full max-w-4xl">
              <PayslipDocument
                payslip={payslip}
                className="mx-auto max-w-4xl"
              />
              {task.zones.map((zone) => renderSignatureField(zone.id))}
            </div>
          </div>
        </div>
      </div>

      <SignatureAdoptDialog
        open={dialogOpen}
        defaultName={activeZone?.signerRole === "employee" ? "" : activeZone?.label || ""}
        defaultWidth={activeZone?.placement?.width}
        defaultHeight={activeZone?.placement?.height}
        onClose={() => setDialogOpen(false)}
        onSign={handleSign}
      />
    </CRMLayout>
  );
}
