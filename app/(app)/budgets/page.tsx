import { getBudgets } from "@/lib/budgets/actions";
import { BudgetsClientPage } from "./budgets-client";

export const metadata = {
  title: "Anggaran Bulanan — Uangku",
  description: "Tetapkan dan kontrol batas anggaran belanja bulanan per kategori.",
};

export default async function BudgetsPage() {
  const initialSummary = await getBudgets();
  return <BudgetsClientPage initialSummary={initialSummary} />;
}
