/** Pestaña técnica: snapshot (score, señales, soporte/resistencia) + RSI/MACD. */
"use client";

import { fmtMoney, fmtNum } from "@/lib/format";
import { scoreTone } from "@/lib/meta";
import { useIndicators, useTechnical } from "@/lib/queries";

import { MacdChart, RsiChart } from "@/components/charts/OscillatorChart";
import {
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  ScoreChip,
} from "@/components/ui/primitives";

const INDICATOR_LABELS: Record<string, string> = {
  sma_20: "SMA 20",
  sma_50: "SMA 50",
  sma_200: "SMA 200",
  rsi: "RSI",
  macd: "MACD",
  macd_signal: "Señal MACD",
  macd_hist: "Hist. MACD",
  bb_upper: "Bollinger sup.",
  bb_middle: "Bollinger media",
  bb_lower: "Bollinger inf.",
  volatility: "Volatilidad",
  relative_volume: "Volumen relativo",
};

export function TechnicalTab({ ticker, days }: { ticker: string; days: number }) {
  const technical = useTechnical(ticker);
  const indicators = useIndicators(ticker, days);

  return (
    <div className="space-y-4">
      <Card
        title="Snapshot técnico"
        subtitle="Score 0-100 según la regla de señal positiva (sección 4.2)"
      >
        {technical.isLoading && <Loading />}
        {technical.isError && (
          <ErrorBox error={technical.error} onRetry={() => technical.refetch()} />
        )}
        {technical.data === null && (
          <EmptyState>
            Histórico insuficiente: hace falta ingerir precios primero (mínimo 20 barras).
          </EmptyState>
        )}
        {technical.data && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <ScoreChip score={technical.data.score} tone={scoreTone(technical.data.score)} />
              <span className="num text-sm text-ink-2">
                Precio: <span className="text-ink">{fmtMoney(technical.data.price)}</span>
              </span>
              {technical.data.support !== null && (
                <span className="num text-sm text-ink-2">
                  Soporte: <span className="text-ink">{fmtMoney(technical.data.support)}</span>
                </span>
              )}
              {technical.data.resistance !== null && (
                <span className="num text-sm text-ink-2">
                  Resistencia:{" "}
                  <span className="text-ink">{fmtMoney(technical.data.resistance)}</span>
                </span>
              )}
            </div>
            {technical.data.signals.length > 0 && (
              <ul className="list-inside list-disc space-y-0.5 text-sm text-ink-2">
                {technical.data.signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(technical.data.indicators).map(([key, value]) => (
                <div key={key} className="flex items-baseline justify-between gap-2 text-xs">
                  <dt className="text-muted">{INDICATOR_LABELS[key] ?? key}</dt>
                  <dd className="num text-ink-2">{fmtNum(value, 2)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="RSI (14)">
          {indicators.isLoading ? <Loading /> : <RsiChart rows={indicators.data ?? []} />}
        </Card>
        <Card title="MACD">
          {indicators.isLoading ? <Loading /> : <MacdChart rows={indicators.data ?? []} />}
        </Card>
      </div>
    </div>
  );
}
