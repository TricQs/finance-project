import { getInsightsData } from "@/lib/insights/actions";
import { InsightsClientPage } from "./insights-client";

export const metadata = {
  title: "Analisis & Insights Keuangan — Uangku",
  description: "Analisis mendalam arus kas, tren pengeluaran, rasio tabungan, dan rekomendasi keuangan cerdas.",
};

export default async function InsightsPage() {
  const initialData = await getInsightsData("this_month");
  return <InsightsClientPage initialData={initialData} />;
}
