import { getInvestments } from "@/lib/investments/actions";
import { getAccounts } from "@/lib/accounts/actions";
import { InvestmentsClientPage } from "./investments-client";

export const metadata = {
  title: "Portofolio Investasi — Uangku",
  description: "Pantau performa saham, emas, crypto, dan reksa dana Anda dalam satu dashboard terintegrasi.",
};

export default async function InvestmentsPage() {
  const initialInvestments = await getInvestments();
  const accounts = await getAccounts();

  return (
    <InvestmentsClientPage 
      initialInvestments={initialInvestments} 
      accounts={accounts} 
    />
  );
}
