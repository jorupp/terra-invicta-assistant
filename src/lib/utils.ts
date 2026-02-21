import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "./savefile";
import { Materials } from "./templates";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function compareDateTime(a?: DateTime, b?: DateTime): number {
  if (!a?.day && !b?.day) {
    return 0;
  }
  if (!a?.day) {
    return -1;
  }
  if (!b?.day) {
    return 1;
  }

  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  if (a.day !== b.day) {
    return a.day - b.day;
  }
  if (a.hour !== b.hour) {
    return a.hour - b.hour;
  }
  if (a.minute !== b.minute) {
    return a.minute - b.minute;
  }
  if (a.second !== b.second) {
    return a.second - b.second;
  }
  if (a.millisecond !== b.millisecond) {
    return a.millisecond - b.millisecond;
  }
  return 0;
}
export function sortByDateTime<T>(items: T[], getDateTime: (item: T) => DateTime | undefined): T[] {
  return items.toSorted((a, b) => compareDateTime(getDateTime(a), getDateTime(b)));
}
export function diffDateTime(a: DateTime, b: DateTime): DateTime {
  if (!a || !b) {
    return null as any as DateTime;
  }
  let millisecond = a.millisecond - b.millisecond;
  let second = a.second - b.second;
  let minute = a.minute - b.minute;
  let hour = a.hour - b.hour;
  let day = a.day - b.day;
  let month = a.month - b.month;
  let year = a.year - b.year;
  if (millisecond < 0) {
    millisecond += 1000;
    second -= 1;
  }
  if (second < 0) {
    second += 60;
    minute -= 1;
  }
  if (minute < 0) {
    minute += 60;
    hour -= 1;
  }
  if (hour < 0) {
    hour += 24;
    day -= 1;
  }
  if (day < 0) {
    // Assuming 30 days in a month for simplicity
    day += 30;
    month -= 1;
  }
  if (month < 0) {
    month += 12;
    year -= 1;
  }

  return { year, month, day, hour, minute, second, millisecond };
}
export function toDays(dt: DateTime): number {
  if (!dt) return 0;
  return (
    dt.year * 365 +
    dt.month * 30 +
    dt.day +
    dt.hour / 24 +
    dt.minute / 1440 +
    dt.second / 86400 +
    dt.millisecond / 86400000
  );
}
export function formatDateTime(dt: DateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, "0")}-${String(dt.day).padStart(2, "0")} ${String(dt.hour).padStart(
    2,
    "0",
  )}:${String(dt.minute).padStart(2, "0")}:${String(dt.second).padStart(2, "0")}.${String(dt.millisecond).padStart(
    3,
    "0",
  )}`;
}
export const noDate = "0001-01-01T00:00:00.0000000";

export function smartRound(value: number): string {
  // Handle very small numbers with SI prefixes (below 0.001)
  if (value !== 0 && Math.abs(value) < 1e-3) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    // SI prefixes for small numbers (descending order)
    const prefixes = [
      { threshold: 1e-6, symbol: "μ", divisor: 1e-6 }, // micro
      { threshold: 1e-9, symbol: "n", divisor: 1e-9 }, // nano
      { threshold: 1e-12, symbol: "p", divisor: 1e-12 }, // pico
      { threshold: 1e-15, symbol: "f", divisor: 1e-15 }, // femto
      { threshold: 1e-18, symbol: "a", divisor: 1e-18 }, // atto
    ];

    for (const { threshold, symbol, divisor } of prefixes) {
      if (absValue >= threshold) {
        const scaled = absValue / divisor;
        // Use 3 significant figures, but avoid trailing zeros after decimal
        const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        const formatted = scaled.toFixed(digits);
        const trimmed = formatted.includes(".") ? formatted.replace(/\.?0+$/, "") : formatted;
        return `${sign}${trimmed}${symbol}`;
      }
    }
  }

  // Original logic for normal-sized numbers
  const digits = value === 0 || Math.round(value) === value ? 0 : Math.max(0, 3 - Math.log10(Math.abs(value)));
  const formatted = value.toFixed(digits);
  // Only remove trailing zeros if there's a decimal point
  return formatted.includes(".") ? formatted.replace(/\.?0+$/, "") : formatted;
}

export function formatPercent(value: number): string {
  // For values >= 100, show no decimals
  if (value >= 100) {
    return `${value.toFixed(0)}%`;
  }
  // For values < 100, show one decimal place
  return `${value.toFixed(1)}%`;
}

export function addMaterials(a: Materials | undefined, b: Materials | undefined, multiplier: number = 1): Materials {
  return {
    water: ((a?.water || 0) + (b?.water || 0)) * multiplier,
    volatiles: ((a?.volatiles || 0) + (b?.volatiles || 0)) * multiplier,
    metals: ((a?.metals || 0) + (b?.metals || 0)) * multiplier,
    nobleMetals: ((a?.nobleMetals || 0) + (b?.nobleMetals || 0)) * multiplier,
    fissiles: ((a?.fissiles || 0) + (b?.fissiles || 0)) * multiplier,
    antimatter: ((a?.antimatter || 0) + (b?.antimatter || 0)) * multiplier,
    exotics: ((a?.exotics || 0) + (b?.exotics || 0)) * multiplier,
  };
}
