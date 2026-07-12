/**
 * Gráfico de velas (TradingView Lightweight Charts) con SMA 20/50/200,
 * volumen y lectura OHLC bajo el crosshair.
 */
"use client";

import {
  ColorType,
  CrosshairMode,
  createChart,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

import { fmtCompact, fmtNum } from "@/lib/format";
import type { IndicatorRow, PricePoint } from "@/lib/types";

import { CHART, LegendDot } from "./theme";

const SMA_SERIES = [
  { key: "sma_20" as const, label: "SMA 20", color: CHART.s1 },
  { key: "sma_50" as const, label: "SMA 50", color: CHART.s3 },
  { key: "sma_200" as const, label: "SMA 200", color: CHART.s5 },
];

interface Readout {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export function PriceChart({
  prices,
  indicators,
  height = 380,
}: {
  prices: PricePoint[];
  indicators: IndicatorRow[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState<Readout | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const candles: CandlestickData[] = prices
      .filter(
        (p) => p.open !== null && p.high !== null && p.low !== null && p.close !== null,
      )
      .map((p) => ({
        time: p.datetime.slice(0, 10) as Time,
        open: p.open as number,
        high: p.high as number,
        low: p.low as number,
        close: p.close as number,
      }));
    if (!candles.length) return;

    const volumes: HistogramData[] = prices
      .filter((p) => p.volume !== null)
      .map((p) => ({
        time: p.datetime.slice(0, 10) as Time,
        value: p.volume as number,
        color: "rgba(137, 135, 129, 0.35)",
      }));

    const volumeByTime = new Map(volumes.map((v) => [v.time as string, v.value]));

    const chart = createChart(el, {
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

    const candleSeries = chart.addCandlestickSeries({
      upColor: CHART.up,
      downColor: CHART.down,
      wickUpColor: CHART.up,
      wickDownColor: CHART.down,
      borderVisible: false,
    });
    candleSeries.setData(candles);

    const volumeSeries = chart.addHistogramSeries({
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      lastValueVisible: false,
      priceLineVisible: false,
    });
    volumeSeries.setData(volumes);
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    for (const { key, color } of SMA_SERIES) {
      const data: LineData[] = indicators
        .filter((row) => row[key] !== null)
        .map((row) => ({
          time: row.datetime.slice(0, 10) as Time,
          value: row[key] as number,
        }));
      if (!data.length) continue;
      const line = chart.addLineSeries({
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerRadius: 3,
      });
      line.setData(data);
    }

    const last = candles[candles.length - 1];
    const defaultReadout: Readout = {
      time: last.time as string,
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      volume: volumeByTime.get(last.time as string) ?? null,
    };
    setReadout(defaultReadout);

    const onCrosshair = (param: MouseEventParams) => {
      const bar = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      if (!param.time || !bar) {
        setReadout(defaultReadout);
        return;
      }
      setReadout({
        time: param.time as string,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: volumeByTime.get(param.time as string) ?? null,
      });
    };
    chart.subscribeCrosshairMove(onCrosshair);
    chart.timeScale().fitContent();

    return () => {
      chart.unsubscribeCrosshairMove(onCrosshair);
      chart.remove();
    };
  }, [prices, indicators]);

  const changePct =
    readout && readout.open ? ((readout.close - readout.open) / readout.open) * 100 : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {SMA_SERIES.map(({ label, color }) => (
          <LegendDot key={label} color={color} label={label} />
        ))}
        <LegendDot color="rgba(137,135,129,0.6)" label="Volumen" />
        {readout && (
          <span className="num ml-auto text-xs text-muted">
            {readout.time} · O {fmtNum(readout.open)} · H {fmtNum(readout.high)} · L{" "}
            {fmtNum(readout.low)} · C{" "}
            <span className={changePct !== null && changePct < 0 ? "text-critical-text" : "text-good"}>
              {fmtNum(readout.close)}
            </span>
            {readout.volume !== null && <> · Vol {fmtCompact(readout.volume)}</>}
          </span>
        )}
      </div>
      <div ref={containerRef} style={{ height }} />
    </div>
  );
}
