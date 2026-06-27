"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  onFocusChange?: (focused: boolean) => void;
}

export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required,
  autoComplete,
  onFocusChange,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const errorId = useId();

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const hasError = Boolean(error);

  function handleFocus() {
    setFocused(true);
    onFocusChange?.(true);
  }

  function handleBlur() {
    setFocused(false);
    onFocusChange?.(false);
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium"
          style={{ color: "var(--auth-label-color)" }}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative rounded-xl transition-all duration-200",
          hasError
            ? "ring-2 ring-red-500/50"
            : focused
              ? "ring-2 ring-(--auth-primary)/50"
              : "",
        )}
        style={{
          backgroundColor: "var(--auth-input-bg)",
          border: `1px solid ${hasError ? "transparent" : "var(--auth-input-border)"}`,
        }}
      >
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="w-full h-11 px-4 rounded-xl text-sm bg-transparent outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: "var(--auth-input-color)" }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
            style={{ color: "var(--auth-input-icon-color)" }}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
