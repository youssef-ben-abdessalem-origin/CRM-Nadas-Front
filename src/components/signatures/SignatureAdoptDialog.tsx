import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SignatureAdoptDialogProps = {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  defaultWidth?: number;
  defaultHeight?: number;
  onSign: (payload: {
    signerName: string;
    dataUrl: string;
    width: number;
    height: number;
  }) => void;
};

type SignatureMode = "type" | "draw";

const SIGNATURE_COLORS = [
  "#1d4ed8",
  "#2563eb",
  "#0f766e",
  "#166534",
  "#7c2d12",
  "#111827",
];

const DEFAULT_SIGNATURE_WIDTH = 220;
const DEFAULT_SIGNATURE_HEIGHT = 72;

export function SignatureAdoptDialog({
  open,
  defaultName,
  defaultWidth,
  defaultHeight,
  onClose,
  onSign,
}: SignatureAdoptDialogProps) {
  const [signerName, setSignerName] = useState(defaultName);
  const [mode, setMode] = useState<SignatureMode>("type");
  const [signatureColor, setSignatureColor] = useState(SIGNATURE_COLORS[0]);
  const [sizeScale, setSizeScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setSignerName(defaultName);
      setMode("type");
      setSignatureColor(SIGNATURE_COLORS[0]);
      const baseWidth = defaultWidth || DEFAULT_SIGNATURE_WIDTH;
      setSizeScale(Math.max(0.7, Math.min(2, baseWidth / DEFAULT_SIGNATURE_WIDTH)));
    }
  }, [defaultHeight, defaultName, defaultWidth, open]);

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [open, mode]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = signatureColor;
  }, [signatureColor]);

  const signatureDimensions = useMemo(
    () => ({
      width: Math.round((defaultWidth || DEFAULT_SIGNATURE_WIDTH) * sizeScale),
      height: Math.round((defaultHeight || DEFAULT_SIGNATURE_HEIGHT) * sizeScale),
    }),
    [defaultHeight, defaultWidth, sizeScale],
  );

  const typedSignatureMarkup = useMemo(
    () => (
      `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220">
        <text x="40" y="135" font-size="96" fill="${signatureColor}" font-family="cursive">${signerName || defaultName || "Signature"}</text>
      </svg>`
    ),
    [defaultName, signatureColor, signerName],
  );

  const typedSignatureDataUrl = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(typedSignatureMarkup)}`,
    [typedSignatureMarkup],
  );

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width,
      y: ((event.clientY - rect.top) / rect.height) * event.currentTarget.height,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || mode !== "draw") return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    drawingRef.current = true;
    const point = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || mode !== "draw" || !drawingRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const point = getCanvasPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const buildSignatureDataUrl = () => {
    if (mode === "type") return typedSignatureDataUrl;
    return canvasRef.current?.toDataURL("image/png") || typedSignatureDataUrl;
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="border-slate-700 bg-slate-950 text-slate-100 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Adopt Your Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Full Name</label>
            <Input
              value={signerName}
              onChange={(event) => setSignerName(event.target.value)}
              className="border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Signature Size</label>
              <input
                type="range"
                min="0.7"
                max="2"
                step="0.05"
                value={sizeScale}
                onChange={(event) => setSizeScale(Number(event.target.value))}
                className="w-full accent-violet-400"
              />
              <p className="text-xs text-slate-400">Scale: {Math.round(sizeScale * 100)}%</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Color</label>
              <div className="flex flex-wrap gap-2">
                {SIGNATURE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select ${color} signature color`}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition",
                      signatureColor === color ? "border-white scale-105" : "border-slate-700",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSignatureColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant={mode === "type" ? "default" : "outline"}
                onClick={() => setMode("type")}
              >
                Auto
              </Button>
              <Button
                type="button"
                variant={mode === "draw" ? "default" : "outline"}
                onClick={() => setMode("draw")}
              >
                Draw
              </Button>
              {mode === "draw" ? (
                <Button type="button" variant="outline" onClick={clearCanvas}>
                  Clear
                </Button>
              ) : null}
            </div>

            {mode === "type" ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-emerald-500/30 bg-slate-950 p-6">
                <div className="w-full rounded-xl border border-emerald-500/40 px-6 py-8 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Signed with Nadas Sign</p>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: "cursive",
                      color: signatureColor,
                      fontSize: `${Math.max(3.25, 4.25 * sizeScale)}rem`,
                    }}
                  >
                    {signerName || defaultName || "Signature"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={280}
                  className={cn("h-[260px] w-full touch-none rounded-xl border border-slate-700 bg-transparent")}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>
            )}
          </div>

          <p className="text-sm text-slate-400">
            By signing, you confirm that this electronic signature is valid for this document.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onSign({
                  signerName: signerName || defaultName || "Signature",
                  dataUrl: buildSignatureDataUrl(),
                  width: signatureDimensions.width,
                  height: signatureDimensions.height,
                })
              }
            >
              Sign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
