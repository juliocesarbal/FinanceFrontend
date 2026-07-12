/**
 * Tema compartido de gráficos (paleta dark validada) y tooltip de Recharts.
 * Los slots categóricos van SIEMPRE en este orden fijo.
 */
"use client";

import type { TooltipProps } from "recharts";

export const CHART = {
  surface: "#1a1a19",
  grid: "#2c2c2a",
  baseline: "#383835",
  muted: "#898781",
  ink: "#ffffff",
  ink2: "#c3c2b7",
  // slots categóricos (dark)
  s1: "#3987e5",
  s2: "#199e70",
  s3: "#c98500",
  s4: "#008300",
  s5: "#9085e9",
  s6: "#e66767",
  // estados (solo dirección/estado, nunca series)
  up: "#0ca30c",
  down: "#d03b3b",
} as const;

export const CATEGORICAL = [CHART.s1, CHART.s2, CHART.s3, CHART.s4, CHART.s5, CHART.s6];

/** Punto de leyenda: identidad por color + texto (nunca color solo). */
export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

/** Tooltip oscuro para Recharts (texto en tinta, dot con el color de la serie). */
export function DarkTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: TooltipProps<number, string> & {
  labelFormatter?: (label: unknown) => string;
  valueFormatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs shadow-xl">
      {label !== undefined && (
        <div className="mb-1 font-medium text-ink">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </div>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-ink-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="num text-ink">
              {valueFormatter && typeof entry.value === "number"
                ? valueFormatter(entry.value, String(entry.name))
                : String(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
