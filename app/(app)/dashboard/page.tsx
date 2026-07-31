import { createClient } from "@/lib/supabase/server";
import { getAccounts } from "@/lib/accounts/actions";
import { getTransactions } from "@/lib/transactions/actions";
import { DashboardClientPage } from "./dashboard-client";

export const revalidate = 0;

export const metadata = {
  title: "Dasbor Keuangan — Uangku",
  description: "Snaphot ringkasan kekayaan bersih, pemasukan, pengeluaran, dan grafik arus kas.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Query Profile Name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name || user.email?.split("@")[0] || "Pengguna";

  // 2. Fetch Accounts
  const accounts = await getAccounts(false);

  // 3. Fetch All Transactions for current year
  const allYearTransactions = await getTransactions({});

  return (
    <DashboardClientPage
      userName={userName}
      accounts={accounts}
      allYearTransactions={allYearTransactions}
    />
  );
}