export function formatCurrency(amount: number, currency = "IDR") {
  const localeMap: Record<string, string> = {
    IDR: "id-ID",
    USD: "en-US",
    JPY: "ja-JP",
    EUR: "de-DE",
  };
  const locale = localeMap[currency] || "id-ID";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number) {
  if (amount >= 1_000_000_000) return `Rp${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}K`;
  return formatCurrency(amount);
}