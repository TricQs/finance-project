import { getBudgets } from "@/lib/budgets/actions";
import { BudgetsClientPage } from "./budgets-client";

export const metadata = {
  title: "Anggaran Keuangan — Uangku",
  description: "Atur limit anggaran pengeluaran bulanan Anda agar keuangan tetap sehat.",
};

export default async function BudgetsPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentYear = now.getFullYear();

  const initialBudgets = await getBudgets(currentMonth, currentYear);

  return (
    <BudgetsClientPage 
      initialBudgets={initialBudgets} 
      initialMonth={currentMonth}
      initialYear={currentYear}
    />
  );
}
