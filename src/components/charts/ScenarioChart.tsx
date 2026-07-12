/**
 * Proyección mensual de los tres escenarios del simulador (misma fórmula que
 * el backend: capitalización mensual con aportes a fin de mes). El trazo es
 * ilustrativo; los valores finales exactos vienen de la API.
 * Polaridad de escenarios: optimista aqua / medio azul / pesimista rojo,
 * con leyenda y etiquetas directas al final de cada línea.
 */
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmtMoney, fmtMoneyCompact } from "@/lib/format";

import { CHART, DarkTooltip, LegendDot } from "./theme";

const SERIES = [
  { key: "optimista", label: "Optimista", color: CHART.s2 },
  { key: "medio", label: "Medio", color: CHART.s1 },
  { key: "pesimista", label: "Pesimista", color: CHART.s6 },
] as const;

interface Point {
  month: number;
  aportado: number;
  pesimista: number;
  medio: number;
  optimista: number;
}

function project(
  initial: number,
  monthly: number,
  annualReturn: number,
  months: number,
): number[] {
  // Espeja _future_value del backend: r_m = (1+r)^(1/12) - 1, aporte a fin de mes.
  if (annualReturn <= -1) return Array(months + 1).fill(0);
  const rm = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const values: number[] = [initial];
  let v = initial;
  for (let m = 1; m <= months; m += 1) {
    v = v * (1 + rm) + monthly;
    values.push(v);
  }
  return values;
}

export function ScenarioChart({
  initial,
  monthly,
  years,
  expectedReturn,
  volatility,
}: {
  initial: number;
  monthly: number;
  years: number;
  expectedReturn: number;
  volatility: number;
}) {
  const months = Math.max(1, Math.round(years * 12));
  const medio = project(initial, monthly, expectedReturn, months);
  const optimista = project(initial, monthly, expectedReturn + volatility, months);
  const pesimista = project(initial, monthly, expectedReturn - volatility, months);

  const step = Math.max(1, Math.floor(months / 160));
  const data: Point[] = [];
  for (let m = 0; m <= months; m += step) {
    data.push({
      month: m,
      aportado: initial + monthly * m,
      pesimista: pesimista[m],
      medio: medio[m],
      optimista: optimista[m],
    });
  }
  if (data[data.length - 1].month !== months) {
    data.push({
      month: months,
      aportado: initial + monthly * months,
      pesimista: pesimista[months],
      medio: medio[months],
      optimista: optimista[months],
    });
  }

  const yearTicks = Array.from(
    { length: Math.floor(years) + 1 },
    (_, i) => i * 12,
  ).filter((m) => m <= months);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        {SERIES.map(({ label, color }) => (
          <LegendDot key={label} color={color} label={label} />
        ))}
        <LegendDot color={CHART.muted} label="Total aportado" />
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 68, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="month"
              type="number"
              domain={[0, months]}
              ticks={yearTicks}
              tick={{ fill: CHART.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART.baseline }}
              tickFormatter={(m: number) => (m === 0 ? "0" : `${Math.round(m / 12)} a`)}
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
                  labelFormatter={(m) => `Mes ${m} (${(Number(m) / 12).toFixed(1)} años)`}
                  valueFormatter={(v) => fmtMoney(v)}
                />
              }
            />
            <Line
              dataKey="aportado"
              name="Total aportado"
              stroke={CHART.muted}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
            {SERIES.map(({ key, label, color }) => (
              <Line
                key={key}
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 0 }}
                isAnimationActive={false}
                label={(props: {
                  x?: number | string;
                  y?: number | string;
                  index?: number;
                  value?: number | string;
                }) => {
                  if (props.index !== data.length - 1) return <g />;
                  return (
                    <text
                      x={Number(props.x) + 6}
                      y={Number(props.y) + 3}
                      fill={color}
                      fontSize={11}
                      className="num"
                    >
                      {fmtMoneyCompact(Number(props.value))}
                    </text>
                  );
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
