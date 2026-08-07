"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.175, 0.885, 0.32, 1.2], // Smooth BackOut Easing Curve
      }}
      className="w-full flex-1 flex flex-col min-h-full"
    >
      {children}
    </motion.div>
  );
}
