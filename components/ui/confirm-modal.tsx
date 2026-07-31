"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default";
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  variant = "destructive",
  loading = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] font-sans rounded-3xl border border-border/60 bg-background p-6 shadow-2xl transition-all">
        <DialogHeader className="flex flex-col items-center text-center gap-3 pt-2">
          {/* Animated Warning Icon with Glowing Aura */}
          <div className="size-14 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center border border-red-500/20 shadow-sm shrink-0">
            <Trash2 className="size-7" />
          </div>

          <div className="space-y-1">
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed px-2">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-2 gap-3 pt-4 sm:flex-row border-t-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-2xl w-full border-2 border-border text-xs font-semibold cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl w-full text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
          >
            {loading ? "Proses..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
