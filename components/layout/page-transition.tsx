"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="w-full flex-1 flex flex-col min-h-full animate-page-entrance"
    >
      {children}
    </div>
  );
}
