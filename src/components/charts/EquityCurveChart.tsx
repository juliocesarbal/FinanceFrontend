/** Curva de equity del backtest (una sola serie: el título la nombra). */
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmtMoney, fmtMoneyCompact } from "@/lib/format";

import { CHART, DarkTooltip } from "./theme";

export function EquityCurveChart({ curve }: { curve: [string, number][] }) {
  const data = curve.map(([date, value]) => ({ date, value }));
  if (!data.length) {
    return <p className="py-4 text-xs text-muted">Sin curva de equity.</p>;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.s1} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART.s1} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: CHART.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART.baseline }}
            minTickGap={48}
            tickFormatter={(d: string) => d.slice(0, 7)}
          />
          <YAxis
            tick={{ fill: CHART.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v: number) => fmtMoneyCompact(v)}
          />
          <Tooltip
            content={
              <DarkTooltip
                labelFormatter={(l) => String(l)}
                valueFormatter={(v) => fmtMoney(v)}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Equity"
            stroke={CHART.s1}
            strokeWidth={2}
            fill="url(#equityFill)"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
