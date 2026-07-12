/** Primitivas de UI: tarjetas, badges, botones, stats, estados de carga/error. */
"use client";

import type { ReactNode } from "react";

import { ApiError } from "@/lib/api";
import type { Tone } from "@/lib/meta";

// ---------------------------------------------------------------- Card
export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface-1 ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- Badge
const TONE_CLASSES: Record<Tone, string> = {
  good: "bg-good/15 text-good border-good/40",
  goodTint: "bg-transparent text-good border-good/40",
  neutral: "bg-white/5 text-ink-2 border-line",
  info: "bg-s1/15 text-s1 border-s1/40",
  warn: "bg-warn/10 text-warn border-warn/40",
  serious: "bg-serious/10 text-serious border-serious/40",
  critical: "bg-critical/15 text-critical-text border-critical-text/40",
};

export function Badge({
  tone = "neutral",
  children,
  title,
}: {
  tone?: Tone;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Chip numérico 0-100 coloreado por banda (sección 5.1). */
export function ScoreChip({ score, tone }: { score: number | null | undefined; tone: Tone }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-muted">—</span>;
  }
  return (
    <Badge tone={tone}>
      <span className="num font-semibold">{score.toFixed(0)}</span>
      <span className="opacity-60">/100</span>
    </Badge>
  );
}

// ---------------------------------------------------------------- Button
type ButtonVariant = "primary" | "ghost" | "danger";

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-s1 text-white hover:bg-s1/85 border-transparent disabled:bg-s1/40",
  ghost:
    "bg-transparent text-ink-2 hover:bg-white/5 hover:text-ink border-line",
  danger:
    "bg-transparent text-critical-text hover:bg-critical/10 border-critical-text/40",
};

export function Button({
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}) {
  const sizeCls = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${sizeCls} ${BUTTON_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

// ---------------------------------------------------------------- Stat
export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "up" | "down" | "flat";
}) {
  const valueColor =
    tone === "up" ? "text-good" : tone === "down" ? "text-critical-text" : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-surface-1 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`num mt-1 text-xl font-semibold ${valueColor}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- Estados
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="cargando"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-baseline border-t-ink-2 ${className}`}
    />
  );
}

export function Loading({ text = "Cargando…" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-6 text-sm text-muted">
      <Spinner /> {text}
    </div>
  );
}

export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Error inesperado";
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-critical-text/30 bg-critical/10 px-3 py-2 text-sm text-critical-text">
      <span aria-hidden>⚠</span>
      <span className="min-w-0 flex-1">{message}</span>
      {onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-baseline px-4 py-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Tabla
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, right = false }: { children?: ReactNode; right?: boolean }) {
  return (
    <th
      className={`border-b border-baseline px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted ${right ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right = false,
  className = "",
}: {
  children?: ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-grid px-3 py-2 align-middle ${right ? "num text-right" : ""} ${className}`}
    >
      {children}
    </td>
  );
}
