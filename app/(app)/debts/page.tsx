import { getDebts } from "@/lib/debts/actions";
import { DebtsClientPage } from "./debts-client";

export const metadata = {
  title: "Utang & Piutang — Uangku",
  description: "Kelola utang Anda kepada orang lain atau pinjaman yang Anda berikan kepada kerabat.",
};

export default async function DebtsPage() {
  const initialDebts = await getDebts();

  return (
    <DebtsClientPage 
      initialDebts={initialDebts} 
    />
  );
}
