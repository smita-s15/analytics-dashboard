import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
}

export function formatCtr(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n.toFixed(1)}%`;
}

export function formatRankDelta(current: number, previous: number | null): {
  label: string;
  direction: "up" | "down" | "same" | "new";
} {
  if (previous == null) return { label: "New", direction: "new" };
  const delta = previous - current; // positive = improved (lower rank number = better)
  if (delta === 0) return { label: "—", direction: "same" };
  if (delta > 0) return { label: `+${delta}`, direction: "up" };
  return { label: `${delta}`, direction: "down" };
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
