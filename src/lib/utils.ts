import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "./savefile";

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
    "0"
  )}:${String(dt.minute).padStart(2, "0")}:${String(dt.second).padStart(2, "0")}.${String(dt.millisecond).padStart(
    3,
    "0"
  )}`;
}
