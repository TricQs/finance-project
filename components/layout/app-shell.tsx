"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { OnboardingTour } from "@/components/shared/onboarding-tour";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
};

export function AppShell({
  children,
  userName,
  userEmail,
  avatarUrl,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("uangku_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("uangku_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background font-sans">
      {/* Fixed Stationary Left Sidebar */}
      <AppSidebar
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        isCollapsed={mounted ? isCollapsed : false}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Right Independent Scrolling Container */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col scrollbar-thin">
        <AppTopbar />
        <main className="flex-1 px-4 sm:px-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* GLOBAL ONBOARDING TOUR OVERLAY */}
      <OnboardingTour />
    </div>
  );
}
