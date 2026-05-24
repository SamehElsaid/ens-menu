"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
};

export default function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  error,
  disabled = false,
  id = "verificationCode",
  label,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusInput = (index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  const updateValue = useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join("").slice(0, length));
    },
    [length, onChange],
  );

  useEffect(() => {
    focusInput(0);
  }, []);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    updateValue(next);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (digits[index]) {
        next[index] = "";
        updateValue(next);
        return;
      }
      if (index > 0) {
        next[index - 1] = "";
        updateValue(next);
        focusInput(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;

    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    updateValue(next);

    const focusIndex = Math.min(pasted.length, length - 1);
    focusInput(focusIndex);
  };

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={`${id}-0`}
          className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300 text-center"
        >
          {label}
        </label>
      ) : null}

      <div
        className="flex justify-center gap-2 sm:gap-3"
        dir="ltr"
        role="group"
        aria-label={label}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            id={index === 0 ? `${id}-0` : undefined}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 bg-white text-center text-xl font-bold text-slate-900 outline-none transition-all
              dark:bg-slate-900 dark:text-white
              ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-500/70 dark:focus:ring-red-900/40"
                  : digit
                    ? "border-accent-purple focus:border-accent-purple focus:ring-2 focus:ring-purple-200 dark:border-purple-500 dark:focus:ring-purple-900/40"
                    : "border-slate-200 focus:border-accent-purple focus:ring-2 focus:ring-purple-200 dark:border-slate-700 dark:focus:ring-purple-900/40"
              }
              disabled:cursor-not-allowed disabled:opacity-50`}
          />
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-center text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
