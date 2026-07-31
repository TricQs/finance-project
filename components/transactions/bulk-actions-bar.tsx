"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  loading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  loading = false,
}: BulkActionsBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 110, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 110, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 md:left-[calc(50%+120px)] z-35 md:z-[9999] flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl px-4 sm:px-6 py-2.5 sm:py-3.5 shadow-2xl max-w-[92vw] sm:max-w-none pointer-events-auto"
          style={{
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.22)",
          }}
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground shrink-0">
            <CheckSquare className="size-4 sm:size-5 text-primary" />
            <span>{selectedCount} <span className="hidden sm:inline">transaksi</span> terpilih</span>
          </div>

          <div className="h-4 sm:h-5 w-[1px] bg-border shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={onDeleteSelected}
              disabled={loading}
              className="rounded-xl sm:rounded-2xl gap-1.5 h-8 sm:h-9 px-3 sm:px-4 text-xs font-extrabold shadow-xs cursor-pointer"
            >
              <Trash2 className="size-3.5 sm:size-4" />
              <span>Hapus</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={loading}
              className="rounded-xl sm:rounded-2xl size-8 sm:size-9 p-0 hover:bg-muted cursor-pointer shrink-0"
            >
              <X className="size-3.5 sm:size-4 text-muted-foreground" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
