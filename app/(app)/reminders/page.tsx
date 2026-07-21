import { getReminders } from "@/lib/reminders/actions";
import { getAccounts } from "@/lib/accounts/actions";
import { RemindersClientPage } from "./reminders-client";

export const metadata = {
  title: "Pengingat & Tagihan — Uangku",
  description: "Pantau tagihan bulanan dan pengingat pembayaran keuangan penting Anda.",
};

export default async function RemindersPage() {
  const initialReminders = await getReminders();
  const accounts = await getAccounts();

  return (
    <RemindersClientPage 
      initialReminders={initialReminders} 
      accounts={accounts} 
    />
  );
}
