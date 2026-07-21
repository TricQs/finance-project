import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        userName={profile?.full_name || user.email?.split("@")[0]}
        userEmail={user.email ?? ""}
        avatarUrl={profile?.avatar_url ?? undefined}
      />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <AppTopbar />
        <main className="flex-1 px-4 sm:px-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}