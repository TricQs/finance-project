"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        transition={{
          duration: 0.38,
          ease: [0.175, 0.885, 0.32, 1.275], // Premium BackIn / BackOut Easing Curve
        }}
        className="w-full flex-1 flex flex-col min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
