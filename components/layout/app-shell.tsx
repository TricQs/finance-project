"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { OnboardingTour } from "@/components/shared/onboarding-tour";

type AppShellProps = {
  children: React.ReactNode;
  userId?: string;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
};

export function AppShell({
  children,
  userId,
  userName,
  userEmail,
  avatarUrl,
}: AppShellProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background font-sans">
      {/* Fixed Stationary Left Sidebar */}
      <AppSidebar
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
      />

      {/* Right Independent Scrolling Container */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col scrollbar-thin">
        <AppTopbar />
        <main className="flex-1 px-4 sm:px-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* GLOBAL ONBOARDING TOUR OVERLAY */}
      <OnboardingTour userId={userId} />
    </div>
  );
}
