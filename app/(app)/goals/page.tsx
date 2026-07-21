import { getGoals } from "@/lib/goals/actions";
import { getAccounts } from "@/lib/accounts/actions";
import { GoalsClientPage } from "./goals-client";

export const metadata = {
  title: "Target Menabung — Uangku",
  description: "Buat target tabungan impian Anda dan pantau kemajuannya secara real-time.",
};

export default async function GoalsPage() {
  const initialGoals = await getGoals();
  const accounts = await getAccounts();

  return (
    <GoalsClientPage 
      initialGoals={initialGoals} 
      accounts={accounts} 
    />
  );
}
