import jsPDF from "jspdf";
import type { UnifiedTransaction } from "@/lib/transactions/actions";
import { formatCurrency } from "@/lib/format-currency";
import { translateCategory } from "@/lib/i18n/dictionary";

interface ExportPdfOptions {
  transactions: UnifiedTransaction[];
  userName?: string;
  language?: "id" | "en" | "ja";
  dateRangeLabel?: string;
}

export function generateFinancialReportPDF({
  transactions,
  userName = "Pengguna Uangku",
  language = "id",
  dateRangeLabel = "Semua Periode",
}: ExportPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const isId = language === "id";
  const isJa = language === "ja";

  // Calculate Summary
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.category === "Saldo Awal" || tx.category === "Initial Balance") return;
    if (tx.type === "income") totalIncome += Number(tx.amount);
    else if (tx.type === "expense") totalExpense += Number(tx.amount);
  });

  const netSavings = totalIncome - totalExpense;

  // Colors
  const primaryColor = "#4f46e5"; // Indigo 600
  const darkTextColor = "#1e293b"; // Slate 800
  const lightTextColor = "#64748b"; // Slate 500
  const successColor = "#059669"; // Emerald 600
  const dangerColor = "#dc2626"; // Red 600

  // 1. Top Header Banner
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("UANGKU", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const reportTitle = isJa
    ? "財務レポート (Financial Statement)"
    : isId
    ? "Laporan Keuangan Pribadi"
    : "Personal Financial Statement";
  doc.text(reportTitle, 210 - 14, 15, { align: "right" });

  // 2. Report Meta Info
  doc.setTextColor(darkTextColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(isId ? "Ringkasan Laporan" : "Financial Overview", 14, 34);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor);
  const nowStr = new Date().toLocaleDateString(isId ? "id-ID" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.text(`${isId ? "Nama Pengguna" : "User Name"}: ${userName}`, 14, 40);
  doc.text(`${isId ? "Periode" : "Period"}: ${dateRangeLabel}`, 14, 45);
  doc.text(`${isId ? "Tanggal Dibuat" : "Generated On"}: ${nowStr}`, 210 - 14, 40, { align: "right" });
  doc.text(`${isId ? "Total Transaksi" : "Total Items"}: ${transactions.length}`, 210 - 14, 45, { align: "right" });

  // 3. Stat Summary Boxes (Income, Expense, Net Cashflow)
  const boxY = 52;
  const boxWidth = 58;
  const boxHeight = 22;

  // Box 1: Total Income
  doc.setFillColor("#ecfdf5"); // Emerald 50
  doc.setDrawColor("#a7f3d0");
  doc.roundedRect(14, boxY, boxWidth, boxHeight, 3, 3, "FD");
  doc.setFontSize(8);
  doc.setTextColor(successColor);
  doc.setFont("helvetica", "bold");
  doc.text(isId ? "TOTAL PEMASUKAN" : "TOTAL INCOME", 18, boxY + 7);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalIncome), 18, boxY + 16);

  // Box 2: Total Expense
  doc.setFillColor("#fef2f2"); // Red 50
  doc.setDrawColor("#fecaca");
  doc.roundedRect(14 + boxWidth + 4, boxY, boxWidth, boxHeight, 3, 3, "FD");
  doc.setFontSize(8);
  doc.setTextColor(dangerColor);
  doc.setFont("helvetica", "bold");
  doc.text(isId ? "TOTAL PENGELUARAN" : "TOTAL EXPENSE", 18 + boxWidth + 4, boxY + 7);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalExpense), 18 + boxWidth + 4, boxY + 16);

  // Box 3: Net Cashflow
  doc.setFillColor("#eef2ff"); // Indigo 50
  doc.setDrawColor("#c7d2fe");
  doc.roundedRect(14 + (boxWidth + 4) * 2, boxY, boxWidth, boxHeight, 3, 3, "FD");
  doc.setFontSize(8);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(isId ? "SISA UANG / TABUNGAN" : "NET CASHFLOW", 18 + (boxWidth + 4) * 2, boxY + 7);
  doc.setFontSize(11);
  doc.text(formatCurrency(netSavings), 18 + (boxWidth + 4) * 2, boxY + 16);

  // 4. Transaction Details Header
  const startY = 84;
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(isId ? "Rincian Transaksi" : "Transaction Details", 14, startY);

  // Table Headers
  const tableHeaderY = startY + 4;
  doc.setFillColor("#f1f5f9"); // Slate 100
  doc.rect(14, tableHeaderY, 182, 7, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkTextColor);
  doc.text(isId ? "TANGGAL" : "DATE", 17, tableHeaderY + 5);
  doc.text(isId ? "KATEGORI / KETERANGAN" : "CATEGORY / DESCRIPTION", 45, tableHeaderY + 5);
  doc.text(isId ? "REKENING" : "ACCOUNT", 115, tableHeaderY + 5);
  doc.text(isId ? "TIPE" : "TYPE", 152, tableHeaderY + 5);
  doc.text(isId ? "JUMLAH" : "AMOUNT", 193, tableHeaderY + 5, { align: "right" });

  // Table Rows
  let currentY = tableHeaderY + 7;
  const rowHeight = 7;
  const pageHeight = 297;
  const maxY = pageHeight - 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  transactions.forEach((tx, index) => {
    if (currentY + rowHeight > maxY) {
      doc.addPage();
      currentY = 20;

      // Repeat Table Header on new page
      doc.setFillColor("#f1f5f9");
      doc.rect(14, currentY, 182, 7, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkTextColor);
      doc.text(isId ? "TANGGAL" : "DATE", 17, currentY + 5);
      doc.text(isId ? "KATEGORI / KETERANGAN" : "CATEGORY / DESCRIPTION", 45, currentY + 5);
      doc.text(isId ? "REKENING" : "ACCOUNT", 115, currentY + 5);
      doc.text(isId ? "TIPE" : "TYPE", 152, currentY + 5);
      doc.text(isId ? "JUMLAH" : "AMOUNT", 193, currentY + 5, { align: "right" });

      currentY += 7;
      doc.setFont("helvetica", "normal");
    }

    // Alternating Row Background
    if (index % 2 === 1) {
      doc.setFillColor("#f8fafc");
      doc.rect(14, currentY, 182, rowHeight, "F");
    }

    const isIncome = tx.type === "income";
    const isExpense = tx.type === "expense";
    const isTransfer = tx.type === "transfer";

    // Date
    doc.setTextColor(darkTextColor);
    doc.text(tx.date || "-", 17, currentY + 4.8);

    // Category / Description
    const catName = translateCategory(tx.category, language);
    const descText = tx.description ? `${catName} (${tx.description})` : catName;
    const truncatedDesc = descText.length > 35 ? descText.substring(0, 32) + "..." : descText;
    doc.text(truncatedDesc, 45, currentY + 4.8);

    // Account Name
    const accText = isTransfer
      ? `${tx.from_account_name || ""} -> ${tx.to_account_name || ""}`
      : tx.account_name || "-";
    const truncatedAcc = accText.length > 18 ? accText.substring(0, 16) + "..." : accText;
    doc.text(truncatedAcc, 115, currentY + 4.8);

    // Type Tag
    doc.setFont("helvetica", "bold");
    if (isIncome) doc.setTextColor(successColor);
    else if (isExpense) doc.setTextColor(dangerColor);
    else doc.setTextColor(primaryColor);
    doc.text(tx.type.toUpperCase(), 152, currentY + 4.8);

    // Amount
    const prefix = isIncome ? "+" : isExpense ? "-" : "";
    const amountStr = `${prefix}${formatCurrency(Number(tx.amount))}`;
    doc.text(amountStr, 193, currentY + 4.8, { align: "right" });

    currentY += rowHeight;
  });

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor("#e2e8f0");
    doc.line(14, 287, 196, 287);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightTextColor);
    doc.text("© Uangku — Intelligent Financial Management", 14, 292);
    doc.text(`Halaman ${i} dari ${totalPages}`, 196, 292, { align: "right" });
  }

  // Save PDF
  const filename = `Laporan-Keuangan-Uangku-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
