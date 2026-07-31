"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndonesianDatePickerProps {
  value: string; // ISO format "YYYY-MM-DD" or empty ""
  onChange: (isoDate: string) => void;
  className?: string;
  placeholder?: string;
}

export function IndonesianDatePicker({
  value,
  onChange,
  className,
}: IndonesianDatePickerProps) {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Sync internal segments if prop value changes externally
  useEffect(() => {
    if (!value) {
      setDay("");
      setMonth("");
      setYear("");
      return;
    }
    const parts = value.split("-");
    if (parts.length === 3) {
      setYear(parts[0] || "");
      setMonth(parts[1] || "");
      setDay(parts[2] || "");
    }
  }, [value]);

  // Propagate valid date to parent
  const notifyChange = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const dNum = parseInt(d, 10);
      const mNum = parseInt(m, 10);
      const yNum = parseInt(y, 10);

      if (dNum >= 1 && dNum <= 31 && mNum >= 1 && mNum <= 12 && yNum >= 1900 && yNum <= 2100) {
        onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
        return;
      }
    }
    if (!d && !m && !y) {
      onChange("");
    }
  };

  // DAY HANDLERS
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 2) val = val.slice(0, 2);

    if (val.length === 1) {
      const num = parseInt(val, 10);
      if (num > 3) {
        val = `0${num}`;
        setDay(val);
        notifyChange(val, month, year);

        requestAnimationFrame(() => {
          monthRef.current?.focus();
          monthRef.current?.select();
        });

        return;
      }
    }

    setDay(val);
    notifyChange(val, month, year);

    if (val.length === 2) {
      const dNum = parseInt(val, 10);
      if (dNum > 31) val = "31";

      setDay(val);
      notifyChange(val, month, year);

      requestAnimationFrame(() => {
        monthRef.current?.focus();
        monthRef.current?.select();
      });
    }
  };

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowRight") {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  // MONTH HANDLERS
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 2) val = val.slice(0, 2);

    if (val.length === 1) {
      const num = parseInt(val, 10);
      if (num > 1) {
        val = `0${num}`;
        setMonth(val);
        notifyChange(day, val, year);

        requestAnimationFrame(() => {
          yearRef.current?.focus();
          yearRef.current?.select();
        });

        return;
      }
    }

    setMonth(val);
    notifyChange(day, val, year);

    if (val.length === 2) {
      const mNum = parseInt(val, 10);
      if (mNum > 12) val = "12";

      setMonth(val);
      notifyChange(day, val, year);

      requestAnimationFrame(() => {
        yearRef.current?.focus();
        yearRef.current?.select();
      });
    }
  };

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && month === "") {
      setDay("");
      notifyChange("", "", year);
      dayRef.current?.focus();
      dayRef.current?.select();
    } else if (e.key === "ArrowLeft") {
      dayRef.current?.focus();
      dayRef.current?.select();
    } else if (e.key === "ArrowRight") {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  // YEAR HANDLERS
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 4) val = val.slice(0, 4);

    setYear(val);
    notifyChange(day, month, val);
  };

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && year === "") {
      setMonth("");
      notifyChange(day, "", "");
      monthRef.current?.focus();
      monthRef.current?.select();
    } else if (e.key === "ArrowLeft") {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  const handleNativeDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    onChange(iso);
    if (iso) {
      const parts = iso.split("-");
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  };

  const handleMonthFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!day || day.length < 2) {
      dayRef.current?.focus();
      dayRef.current?.select();
      return;
    }
    e.target.select();
  };

  const handleYearFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!day || day.length < 2) {
      dayRef.current?.focus();
      dayRef.current?.select();
      return;
    }
    if (!month || month.length < 2) {
      monthRef.current?.focus();
      monthRef.current?.select();
      return;
    }
    e.target.select();
  };

  const handleContainerClick = () => {
    if (!day || day.length < 2) {
      dayRef.current?.focus();
      dayRef.current?.select();
    } else if (!month || month.length < 2) {
      monthRef.current?.focus();
      monthRef.current?.select();
    } else if (!year || year.length < 4) {
      yearRef.current?.focus();
      yearRef.current?.select();
    } else {
      dayRef.current?.focus();
      dayRef.current?.select();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={cn("relative flex items-center justify-between w-full rounded-2xl border-2 border-border bg-background px-3.5 py-1.5 focus-within:border-primary transition-colors font-sans cursor-text h-10 select-none", className)}
    >
      {/* 3 SEGMENTS: DAY / MONTH / YEAR */}
      <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-foreground z-10">
        {/* DAY (DD) */}
        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          placeholder="dd"
          value={day}
          onChange={handleDayChange}
          onKeyDown={handleDayKeyDown}
          onFocus={(e) => e.target.select()}
          className="w-6 text-center bg-transparent outline-none focus:bg-blue-500/20 focus:text-blue-600 dark:focus:text-blue-400 focus:rounded-md placeholder:text-muted-foreground transition-all"
        />
        <span className="text-muted-foreground select-none">/</span>

        {/* MONTH (MM) */}
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          placeholder="mm"
          value={month}
          onChange={handleMonthChange}
          onKeyDown={handleMonthKeyDown}
          onFocus={handleMonthFocus}
          className="w-6 text-center bg-transparent outline-none focus:bg-blue-500/20 focus:text-blue-600 dark:focus:text-blue-400 focus:rounded-md placeholder:text-muted-foreground transition-all"
        />
        <span className="text-muted-foreground select-none">/</span>

        {/* YEAR (YYYY) */}
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          placeholder="yyyy"
          value={year}
          onChange={handleYearChange}
          onKeyDown={handleYearKeyDown}
          onFocus={handleYearFocus}
          className="w-10 text-center bg-transparent outline-none focus:bg-blue-500/20 focus:text-blue-600 dark:focus:text-blue-400 focus:rounded-md placeholder:text-muted-foreground transition-all"
        />
      </div>

      {/* CALENDAR ICON & OVERLAY PICKER */}
      <div className="relative flex items-center justify-center text-muted-foreground z-20 pointer-events-none">
        <CalendarIcon className="size-4" />
      </div>

      <input
        type="date"
        value={value}
        onChange={handleNativeDatePickerChange}
        className="absolute right-1 top-1/2 -translate-y-1/2 size-8 opacity-0 cursor-pointer z-30"
        title="Pilih dari Kalender"
      />
    </div>
  );
}
