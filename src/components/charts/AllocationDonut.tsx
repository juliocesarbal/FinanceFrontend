/**
 * Donut de composición de cartera. Slots categóricos en orden fijo;
 * a partir del 7.º segmento se pliega en "Otros" (gris). Gaps de 2 px
 * entre segmentos (stroke del color de la superficie) y leyenda con
 * etiqueta + porcentaje — la identidad nunca depende solo del color.
 */
"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { fmtMoneyCompact, fmtNum } from "@/lib/format";

import { CATEGORICAL, CHART, DarkTooltip } from "./theme";

const OTHER_COLOR = CHART.muted;

export interface DonutSlice {
  label: string;
  /** porcentaje 0-100 */
  value: number;
  /** monto opcional en USD para el tooltip */
  amount?: number;
}

export function AllocationDonut({
  slices,
  centerLabel,
  centerSub,
}: {
  slices: DonutSlice[];
  centerLabel?: string;
  centerSub?: string;
}) {
  const sorted = [...slices].sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, 6);
  const tail = sorted.slice(6);
  const data = [...head];
  if (tail.length) {
    data.push({
      label: `Otros (${tail.length})`,
      value: tail.reduce((acc, s) => acc + s.value, 0),
      amount: tail.reduce((acc, s) => acc + (s.amount ?? 0), 0),
    });
  }
  const colorFor = (i: number) => (i < head.length ? CATEGORICAL[i] : OTHER_COLOR);

  if (!data.length) {
    return <p className="py-4 text-xs text-muted">Sin posiciones para graficar.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              stroke={CHART.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={colorFor(i)} />
              ))}
            </Pie>
            <Tooltip
              content={
                <DarkTooltip
                  valueFormatter={(v) => `${fmtNum(v, 1)}%`}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-lg font-semibold text-ink">{centerLabel}</span>
            {centerSub && <span className="text-[10px] text-muted">{centerSub}</span>}
          </div>
        )}
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {data.map((entry, i) => (
          <li key={entry.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: colorFor(i) }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-ink-2">{entry.label}</span>
            <span className="num text-ink">{fmtNum(entry.value, 1)}%</span>
            {entry.amount !== undefined && entry.amount > 0 && (
              <span className="num w-16 text-right text-muted">
                {fmtMoneyCompact(entry.amount)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
