"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Wallet,
  Building2,
  PieChart,
  TrendingUp,
  PiggyBank,
  Calendar,
  CheckCircle,
  Sparkles,
  Star,
  ArrowRight,
  Zap,
  Award,
  Users,
  ShieldCheck,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView, useSpring, type Variants } from "framer-motion";

import InkReveal from "@/components/ui/ink-reveal";
import { useSystemLanguage } from "@/lib/i18n/use-system-language";

export default function AboutUsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.1 });
  const lang = useSystemLanguage();

  const t = {
    en: {
      aboutBadge: "OUR STORY & VISION",
      aboutTitle: "About UangKu",
      aboutDescription:
        "We are a modern personal finance management platform designed to help you track, analyze, and plan your financial future effortlessly.",
      walletTitle: "Wallets & Cash Funds",
      walletDesc:
        "Manage cash balances, e-wallets, and daily fund sources flexibly in one place.",
      bankTitle: "Bank Accounts",
      bankDesc:
        "Seamless transaction records across multiple bank accounts with transparent balance tracking.",
      budgetTitle: "Budget Allocation",
      budgetDesc:
        "Set monthly spending limits per category and receive notifications before budgets are exceeded.",
      analyticsTitle: "Financial Analytics",
      analyticsDesc:
        "Get automated daily burn rate calculations and real-time financial health scores.",
      goalsTitle: "Goals & Debts",
      goalsDesc:
        "Track savings goal progress and debt details to keep your financial status stable.",
      remindersTitle: "Bill Reminders",
      remindersDesc:
        "Automated reminders for recurring bill payments so you never pay late fees.",
      stat1: "Transactions Logged",
      stat2: "Active Users",
      stat3: "Data Security",
      stat4: "Satisfaction Rate",
      ctaTitle: "Ready to Manage Your Finances Smarter?",
      ctaSub: "Join thousands of UangKu users today.",
      ctaBtn: "Get Started Now",
    },
    id: {
      aboutBadge: "CERITA & VISI KAMI",
      aboutTitle: "Tentang UangKu",
      aboutDescription:
        "Kami adalah platform manajemen keuangan pribadi modern yang dirancang untuk mempermudah Anda mencatat, menganalisis, dan merencanakan masa depan finansial tanpa ribet.",
      walletTitle: "Dompet & Uang Kas",
      walletDesc:
        "Kelola saldo uang tunai, e-wallet, dan seluruh sumber dana harian Anda secara fleksibel dalam satu genggaman.",
      bankTitle: "Rekening Bank",
      bankDesc:
        "Integrasi catatan transaksi dari berbagai akun rekening bank dengan pencatatan saldo yang transparan.",
      budgetTitle: "Alokasi Anggaran",
      budgetDesc:
        "Tetapkan batas pengeluaran bulanan per kategori dan dapatkan notifikasi sebelum anggaran melampaui batas.",
      analyticsTitle: "Analisis Keuangan",
      analyticsDesc:
        "Dapatkan analisis laju pengeluaran harian (burn rate) dan skor kesehatan finansial riil secara otomatis.",
      goalsTitle: "Target & Utang",
      goalsDesc:
        "Pantau progres tabungan impian serta rincian utang-piutang agar kondisi finansial Anda tetap stabil.",
      remindersTitle: "Pengingat Tagihan",
      remindersDesc:
        "Pengingat otomatis untuk pembayaran tagihan berkala agar Anda tidak pernah terlambat membayar denda.",
      stat1: "Transaksi Dicatat",
      stat2: "Pengguna Aktif",
      stat3: "Keamanan Data",
      stat4: "Tingkat Kepuasan",
      ctaTitle: "Siap Kelola Keuangan Lebih Bijak?",
      ctaSub: "Bergabunglah dengan ribuan pengguna UangKu hari ini.",
      ctaBtn: "Get Started Now",
    },
  }[lang];

  // Parallax effect for decorative elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(24px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const services = [
    {
      icon: <Wallet className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-indigo-500" />,
      title: t.walletTitle,
      description: t.walletDesc,
      position: "left",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-emerald-500" />,
      title: t.bankTitle,
      description: t.bankDesc,
      position: "left",
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-amber-500" />,
      title: t.budgetTitle,
      description: t.budgetDesc,
      position: "left",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      secondaryIcon: <Zap className="w-4 h-4 absolute -top-1 -right-1 text-indigo-500" />,
      title: t.analyticsTitle,
      description: t.analyticsDesc,
      position: "right",
    },
    {
      icon: <PiggyBank className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-emerald-500" />,
      title: t.goalsTitle,
      description: t.goalsDesc,
      position: "right",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-amber-500" />,
      title: t.remindersTitle,
      description: t.remindersDesc,
      position: "right",
    },
  ];

  const stats = [
    { icon: <Award />, value: 10000, label: t.stat1, suffix: "+" },
    { icon: <Users />, value: 5000, label: t.stat2, suffix: "+" },
    { icon: <ShieldCheck />, value: 100, label: t.stat3, suffix: "%" },
    { icon: <TrendingUp />, value: 99, label: t.stat4, suffix: "%" },
  ];

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="w-full pt-20 pb-12 sm:pb-16 px-4 relative font-sans transition-colors duration-300 scroll-mt-10"
    >
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-indigo-500/30 pointer-events-none"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-blue-500/30 pointer-events-none"
        animate={{
          y: [0, 20, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <span
            className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2 flex items-center gap-2 text-xs uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full"
          >
            <Zap className="w-4 h-4 text-indigo-500" />
            {t.aboutBadge}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-center tracking-tight">
            {t.aboutTitle}
          </h2>
          <div
            className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
          />
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16 text-slate-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed" variants={itemVariants}>
          {t.aboutDescription}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Left Column */}
          <div className="space-y-12 md:space-y-16">
            {services
              .filter((service) => service.position === "left")
              .map((service, index) => (
                <ServiceItem
                  key={`left-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.1}
                  direction="left"
                />
              ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800"
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <img
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1000&auto=format&fit=crop"
                  alt="Modern Finance App Dashboard"
                  className="w-full h-80 object-cover"
                />
              </motion.div>
              <div
                className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl -m-3 z-[-1]"
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-12 md:space-y-16">
            {services
              .filter((service) => service.position === "right")
              .map((service, index) => (
                <ServiceItem
                  key={`right-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <StatCounter
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-14 sm:mt-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white p-8 sm:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
          initial={{ opacity: 0, y: 30, filter: "blur(24px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">{t.ctaTitle}</h3>
            <p className="text-white/80 text-sm">{t.ctaSub}</p>
          </div>
          <Link
            href="/auth"
            className="bg-white text-indigo-700 hover:bg-slate-100 px-7 py-3.5 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg hover:scale-105 cursor-pointer text-sm"
          >
            {t.ctaBtn} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

interface ServiceItemProps {
  icon: React.ReactNode;
  secondaryIcon: React.ReactNode;
  title: string;
  description: string;
  variants: Variants;
  delay: number;
  direction: "left" | "right";
}

function ServiceItem({ icon, secondaryIcon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center group"
      variants={variants}
    >
      <motion.div
        className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm"
        whileHover={{ scale: 1.1, rotate: direction === "left" ? -5 : 5 }}
      >
        {icon}
        {secondaryIcon}
      </motion.div>
      <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xs">{description}</p>
    </motion.div>
  );
}

interface StatCounterProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 1200; // 1.2s smooth count up animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic for realistic number generation count
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * value);

      if (numRef.current) {
        numRef.current.textContent = currentVal.toLocaleString();
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else if (numRef.current) {
        numRef.current.textContent = value.toLocaleString();
      }
    };

    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, delay * 1000 + 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={containerRef}
      className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 flex flex-col items-center text-center group hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm"
      variants={{
        hidden: { opacity: 0, y: 24, filter: "blur(24px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
        <span ref={numRef}>0</span>
        <span>{suffix}</span>
      </div>
      <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1 font-medium">{label}</p>
      <div className="w-8 h-0.5 bg-indigo-500 mt-3 group-hover:w-14 transition-all duration-300 rounded-full" />
    </motion.div>
  );
}
