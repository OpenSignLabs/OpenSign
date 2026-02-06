import { useEffect, useMemo, useRef, useState } from "react";

/**
 * CellsInput (cells for a single word/value)
 *
 * Props:
 * - count: number (how many cells)
 * - value: string (controlled)
 * - onChange: (nextValue: string) => void
 * - hint
 * - textSize: number (px) default 12
 * - textColor: string default "#000000"
 * - only: "all" | "digits" | "letters" | "alphanumeric"
 * - autoFocus: boolean
 * - disabled: boolean
 */
export default function CellsInput({
  count = 1,
  value,
  onChange,
  hint = "",
  textSize = 12,
  textColor = "#000000",
  only = "all",
  autoFocus = false,
  disabled = false,
  className = ""
}) {
  const isControlled = value !== undefined && typeof onChange === "function";
  const [internal, setInternal] = useState("");

  const currentValue = isControlled ? value : internal;

  const safeCount = useMemo(() => clampInt(count, 1, 64, 6), [count]);

  // refs for focusing next/prev
  const inputsRef = useRef([]);

  // normalize value length
  useEffect(() => {
    const normalized = normalizeValue(currentValue, safeCount, only);
    if (normalized !== currentValue) emit(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCount, only]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      queueMicrotask(() => inputsRef.current?.[0]?.focus?.());
    }
  }, [autoFocus, disabled]);

  function emit(next) {
    if (isControlled) onChange(next);
    else setInternal(next);
  }

  const chars = useMemo(() => {
    const v = normalizeValue(currentValue, safeCount, only);
    const arr = Array.from({ length: safeCount }, (_, i) => v[i] || "");
    return arr;
  }, [currentValue, safeCount, only]);

  const inputStyle = {
    fontSize: `${Number(textSize || 12)}px`,
    color: textColor && String(textColor).trim() ? textColor : "#000000"
  };

  function focusIndex(i) {
    const el = inputsRef.current?.[i];
    if (el) {
      el.focus();
      el.select?.();
    }
  }

  function setCharAt(index, ch) {
    const v = normalizeValue(currentValue, safeCount, only);
    const nextArr = Array.from({ length: safeCount }, (_, i) => v[i] || "");
    nextArr[index] = ch;
    emit(nextArr.join(""));
  }

  function handleChange(index, raw) {
    if (disabled) return;

    // user typed multiple chars (mobile suggestions/paste) -> distribute
    const cleaned = filterString(raw, only);
    if (!cleaned) {
      setCharAt(index, "");
      return;
    }

    const v = normalizeValue(currentValue, safeCount, only);
    const nextArr = Array.from({ length: safeCount }, (_, i) => v[i] || "");

    let writeAt = index;
    for (const ch of cleaned) {
      if (writeAt >= safeCount) break;
      nextArr[writeAt] = ch;
      writeAt++;
    }
    emit(nextArr.join(""));

    // move focus
    const nextFocus = Math.min(writeAt, safeCount - 1);
    if (nextFocus !== index) focusIndex(nextFocus);
  }

  function handleKeyDown(index, e) {
    if (disabled) return;

    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      const v = normalizeValue(currentValue, safeCount, only);
      if (v[index]) {
        setCharAt(index, "");
        return;
      }
      // if empty, go previous
      if (index > 0) {
        focusIndex(index - 1);
        setCharAt(index - 1, "");
      }
      return;
    }

    if (key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) focusIndex(index - 1);
      return;
    }

    if (key === "ArrowRight") {
      e.preventDefault();
      if (index < safeCount - 1) focusIndex(index + 1);
      return;
    }

    if (key === " " && only !== "all") {
      e.preventDefault();
      return;
    }
  }

  function handlePaste(index, e) {
    if (disabled) return;
    e.preventDefault();
    const text = e.clipboardData?.getData("text") || "";
    const cleaned = filterString(text, only);
    if (!cleaned) return;

    const v = normalizeValue(currentValue, safeCount, only);
    const nextArr = Array.from({ length: safeCount }, (_, i) => v[i] || "");

    let writeAt = index;
    for (const ch of cleaned) {
      if (writeAt >= safeCount) break;
      nextArr[writeAt] = ch;
      writeAt++;
    }
    emit(nextArr.join(""));

    const nextFocus = Math.min(writeAt, safeCount - 1);
    focusIndex(nextFocus);
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center gap-0">
        {chars.map((ch, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode={only === "digits" ? "numeric" : "text"}
            autoComplete="one-time-code"
            className="op-input op-input-bordered op-input-sm w-9 text-center rounded-sm focus:outline-none hover:border-base-content disabled:opacity-60"
            style={inputStyle}
            value={ch}
            // maxLength={safeCount} // allows multi-char suggestions; we still distribute
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            placeholder={hint[i]}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function filterString(str, only) {
  const s = String(str ?? "");
  if (only === "digits") return s.replace(/[^0-9]/g, "");
  if (only === "letters") return s.replace(/[^a-zA-Z]/g, "");
  if (only === "alphanumeric") return s.replace(/[^a-zA-Z0-9]/g, "");
  return s.replace(/\s/g, ""); // for "all" we still drop spaces for OTP-like behavior
}

function normalizeValue(v, count, only) {
  const cleaned = filterString(v || "", only);
  return cleaned.slice(0, count);
}
