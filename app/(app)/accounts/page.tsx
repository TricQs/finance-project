import { getAccounts } from "@/lib/accounts/actions";
import { AccountsClientPage } from "./accounts-client";

export const metadata = {
  title: "Kelola Rekening & Dompet — Uangku",
  description: "Kelola seluruh rekening bank, dompet digital, dan kas tunai Anda secara terpusat.",
};

export default async function AccountsPage() {
  const initialAccounts = await getAccounts(true); // Fetch all (including archived)
  return <AccountsClientPage initialAccounts={initialAccounts} />;
}
