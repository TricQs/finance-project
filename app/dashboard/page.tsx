"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

export default function DashboardPage() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold">Dashboard — Coming Soon</h1>
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        style={{
          color: "var(--auth-error-text, #ef4444)",
          border: "1px solid var(--auth-error-border, #fca5a5)",
          backgroundColor: "var(--auth-error-bg, #fef2f2)",
        }}
      >
        <LogOut size={16} />
        {isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}