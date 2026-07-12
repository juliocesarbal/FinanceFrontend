/** Paneles de osciladores: RSI (con guías 30/70) y MACD (histograma + líneas). */
"use client";

import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type HistogramData,
  type LineData,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import type { IndicatorRow } from "@/lib/types";

import { CHART, LegendDot } from "./theme";

function baseChart(el: HTMLDivElement) {
  return createChart(el, {
    autoSize: true,
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: CHART.muted,
      fontSize: 11,
    },
    grid: {
      vertLines: { color: CHART.grid },
      horzLines: { color: CHART.grid },
    },
    rightPriceScale: { borderColor: CHART.baseline },
    timeScale: { borderColor: CHART.baseline },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { labelBackgroundColor: CHART.baseline },
      horzLine: { labelBackgroundColor: CHART.baseline },
    },
    localization: { locale: "es" },
  });
}

function lineData(rows: IndicatorRow[], key: keyof IndicatorRow): LineData[] {
  return rows
    .filter((r) => r[key] !== null)
    .map((r) => ({ time: r.datetime.slice(0, 10) as Time, value: r[key] as number }));
}

export function RsiChart({ rows, height = 150 }: { rows: IndicatorRow[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = lineData(rows, "rsi");
    if (!data.length) return;

    const chart = baseChart(el);
    const series = chart.addLineSeries({
      color: CHART.s1,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    series.setData(data);
    for (const level of [70, 30]) {
      series.createPriceLine({
        price: level,
        color: CHART.muted,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "",
      });
    }
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [rows]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-4">
        <LegendDot color={CHART.s1} label="RSI 14" />
        <span className="text-[11px] text-muted">guías: 70 sobrecompra · 30 sobreventa</span>
      </div>
      <div ref={ref} style={{ height }} />
    </div>
  );
}

export function MacdChart({ rows, height = 150 }: { rows: IndicatorRow[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const macd = lineData(rows, "macd");
    if (!macd.length) return;

    const chart = baseChart(el);

    const hist: HistogramData[] = rows
      .filter((r) => r.macd_hist !== null)
      .map((r) => ({
        time: r.datetime.slice(0, 10) as Time,
        value: r.macd_hist as number,
        color:
          (r.macd_hist as number) >= 0
            ? "rgba(12, 163, 12, 0.55)"
            : "rgba(208, 59, 59, 0.55)",
      }));
    const histSeries = chart.addHistogramSeries({
      priceLineVisible: false,
      lastValueVisible: false,
    });
    histSeries.setData(hist);

    const macdSeries = chart.addLineSeries({
      color: CHART.s1,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    macdSeries.setData(macd);

    const signalSeries = chart.addLineSeries({
      color: CHART.s3,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    signalSeries.setData(lineData(rows, "macd_signal"));

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [rows]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <LegendDot color={CHART.s1} label="MACD" />
        <LegendDot color={CHART.s3} label="Señal" />
        <span className="text-[11px] text-muted">histograma: momento alcista/bajista</span>
      </div>
      <div ref={ref} style={{ height }} />
    </div>
  );
}
