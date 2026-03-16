import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export function getSignalColor(signal: string | undefined): string {
  if (!signal) return "text-muted-foreground"
  const s = signal.toUpperCase()
  if (s.includes("STRONG_BUY") || s.includes("STRONG BUY")) return "text-success text-glow-success"
  if (s.includes("BUY") || s.includes("BULLISH")) return "text-success"
  if (s.includes("STRONG_SELL") || s.includes("STRONG SELL")) return "text-destructive text-glow-destructive"
  if (s.includes("SELL") || s.includes("BEARISH")) return "text-destructive"
  return "text-warning"
}

export function getSignalBgColor(signal: string | undefined): string {
  if (!signal) return "bg-muted text-muted-foreground"
  const s = signal.toUpperCase()
  if (s.includes("STRONG_BUY") || s.includes("STRONG BUY")) return "bg-success/20 text-success border-success/30"
  if (s.includes("BUY") || s.includes("BULLISH")) return "bg-success/10 text-success border-success/20"
  if (s.includes("STRONG_SELL") || s.includes("STRONG SELL")) return "bg-destructive/20 text-destructive border-destructive/30"
  if (s.includes("SELL") || s.includes("BEARISH")) return "bg-destructive/10 text-destructive border-destructive/20"
  return "bg-warning/10 text-warning border-warning/20"
}
