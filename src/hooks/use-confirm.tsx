import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title?: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ description: "" });
  const resolveRef = useRef<(value: boolean) => void>();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
    resolveRef.current?.(false);
  };

  const handleConfirm = () => {
    setOpen(false);
    resolveRef.current?.(true);
  };

  const contextValue = React.useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="shadow-2xl border-none p-6 animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              {options.title || "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground pt-2">
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2">
            <AlertDialogCancel asChild>
              <Button variant="ghost" className="font-semibold" onClick={handleClose}>
                {options.cancelText || "Cancel"}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant={options.variant === "destructive" ? "destructive" : "default"} 
                className={`font-semibold ${options.variant === "destructive" ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20" : "bg-primary shadow-lg shadow-primary/20"}`}
                onClick={handleConfirm}
              >
                {options.confirmText || "Confirm"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};
