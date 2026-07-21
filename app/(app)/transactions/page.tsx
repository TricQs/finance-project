import { getTransactions } from "@/lib/transactions/actions";
import { getAccounts } from "@/lib/accounts/actions";
import { TransactionsClientPage } from "./transactions-client";

export const metadata = {
  title: "Riwayat Transaksi — Uangku",
  description: "Lihat, filter, cari, dan kelola seluruh pemasukan, pengeluaran, serta transfer dana Anda.",
};

export default async function TransactionsPage() {
  const initialTransactions = await getTransactions();
  const accounts = await getAccounts();

  return (
    <TransactionsClientPage 
      initialTransactions={initialTransactions} 
      accounts={accounts} 
    />
  );
}
