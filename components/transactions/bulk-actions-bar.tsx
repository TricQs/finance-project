"use client";

import { m, AnimatePresence } from "framer-motion";
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
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <m.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-3xl border border-border bg-background/80 backdrop-blur-xl px-5 py-3.5 shadow-2xl"
          style={{
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <CheckSquare className="size-4.5 text-primary" />
            <span>{selectedCount} transaksi terpilih</span>
          </div>

          <div className="h-5 w-[1px] bg-border" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={onDeleteSelected}
              disabled={loading}
              className="rounded-xl gap-1.5 h-9"
            >
              <Trash2 className="size-4" />
              <span>Hapus Masal</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={loading}
              className="rounded-xl size-9 p-0 hover:bg-muted"
            >
              <X className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
