/**
 * Centralized formatters for currency, numbers, dates, percentages.
 */

const DEFAULT_LOCALE = "en-NG";
const DEFAULT_CURRENCY = "NGN";

export function formatCurrency(
  value: number | null | undefined,
  options: { currency?: string; locale?: string; maximumFractionDigits?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, maximumFractionDigits = 2 } = options;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `₦${value.toLocaleString()}`;
  }
}

export function formatNumber(
  value: number | null | undefined,
  options: { locale?: string; maximumFractionDigits?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const { locale = DEFAULT_LOCALE, maximumFractionDigits = 2 } = options;
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  options: { locale?: string; maximumFractionDigits?: number; alreadyPercent?: boolean } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const { locale = DEFAULT_LOCALE, maximumFractionDigits = 1, alreadyPercent = false } = options;
  const v = alreadyPercent ? value / 100 : value;
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits,
  }).format(v);
}

export type DateStyle = "short" | "medium" | "long" | "iso" | "datetime";

export function formatDate(
  input: string | number | Date | null | undefined,
  style: DateStyle = "medium",
): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  switch (style) {
    case "iso":
      return d.toISOString().slice(0, 10);
    case "short":
      return d.toLocaleDateString(DEFAULT_LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
    case "long":
      return d.toLocaleDateString(DEFAULT_LOCALE, { day: "numeric", month: "long", year: "numeric" });
    case "datetime":
      return d.toLocaleString(DEFAULT_LOCALE, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "medium":
    default:
      return d.toLocaleDateString(DEFAULT_LOCALE, { day: "numeric", month: "short", year: "numeric" });
  }
}

export function formatRelative(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (Math.abs(sec) < 60) return "just now";
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 7) return `${day}d ago`;
  return formatDate(d, "medium");
}
