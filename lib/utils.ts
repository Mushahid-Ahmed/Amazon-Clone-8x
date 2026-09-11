import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatPriceWithCommas(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getDeliveryDateString(daysFromNow = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(0, daysFromNow));
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function getStarArray(rating: number): boolean[] {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => index < rounded);
}

export function generateOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORDER-${stamp}-${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
