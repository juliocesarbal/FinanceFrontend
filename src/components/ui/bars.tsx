/**
 * Barras horizontales en HTML puro para magnitudes de una sola medida
 * (desglose de score, concentración por sector/tipo/país). Un solo tono —
 * la identidad la da la etiqueta del eje, no el color.
 */
"use client";

import { fmtNum } from "@/lib/format";

export function HBarList({
  items,
  max = 100,
  unit = "%",
  color = "var(--color-s1)",
}: {
  items: { label: string; value: number }[];
  max?: number;
  unit?: string;
  color?: string;
}) {
  if (!items.length) {
    return <p className="py-2 text-xs text-muted">Sin datos.</p>;
  }
  const cap = Math.max(max, ...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate text-ink-2">{item.label}</span>
            <span className="num shrink-0 text-muted">
              {fmtNum(item.value, 1)}
              {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-[4px] bg-surface-2">
            <div
              className="h-full rounded-r-[4px]"
              style={{
                width: `${Math.max(0, Math.min(100, (item.value / cap) * 100))}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Desglose del score mecánico 5.1 (técnico/noticias/fundamentos/riesgo). */
export function ScoreBreakdown({
  technical,
  news,
  fundamental,
  risk,
}: {
  technical: number | null;
  news: number | null;
  fundamental: number | null;
  risk: number | null;
}) {
  const rows = [
    { label: "Técnico (30 %)", value: technical },
    { label: "Noticias y sentimiento (25 %)", value: news },
    { label: "Fundamentos (25 %)", value: fundamental },
    { label: "Riesgo (20 %)", value: risk },
  ].filter((r): r is { label: string; value: number } => r.value !== null && r.value !== undefined);

  return <HBarList items={rows} max={100} unit="" />;
}
