/** Detalle de activo: velas + SMA + volumen, y pestañas de análisis. */
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { fmtMoney } from "@/lib/format";
import { assetTypeLabel, scoreTone } from "@/lib/meta";
import {
  useAsset,
  useIndicators,
  usePrices,
  useTechnical,
} from "@/lib/queries";
import { useUiStore } from "@/lib/store";

import { ConsensusTab } from "@/components/asset/ConsensusTab";
import { FundamentalsTab } from "@/components/asset/FundamentalsTab";
import { NewsTab } from "@/components/asset/NewsTab";
import { RiskTab } from "@/components/asset/RiskTab";
import { TechnicalTab } from "@/components/asset/TechnicalTab";
import { PriceChart } from "@/components/charts/PriceChart";
import { RecommendationPanel } from "@/components/recommendation/RecommendationPanel";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  ScoreChip,
} from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/tabs";

const RANGES = [
  { days: 90, label: "3M" },
  { days: 180, label: "6M" },
  { days: 365, label: "1A" },
  { days: 730, label: "2A" },
];

type TabKey = "tecnico" | "fundamentales" | "noticias" | "consenso" | "riesgo" | "recomendacion";

export default function AssetDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = decodeURIComponent(params.ticker ?? "").toUpperCase();

  const { chartDays, setChartDays } = useUiStore();
  const [tab, setTab] = useState<TabKey>("tecnico");

  const asset = useAsset(ticker);
  const prices = usePrices(ticker, chartDays);
  const indicators = useIndicators(ticker, chartDays);
  const technical = useTechnical(ticker);

  if (asset.isLoading) return <Loading text={`Cargando ${ticker}…`} />;
  if (asset.isError) {
    return (
      <div className="space-y-3">
        <ErrorBox error={asset.error} onRetry={() => asset.refetch()} />
        <EmptyState>
          Si el activo no existe todavía, agregalo desde la página Mercado y el
          sistema sincroniza sus metadatos y precios.
        </EmptyState>
      </div>
    );
  }
  const a = asset.data;
  if (!a) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight">{a.ticker}</h1>
        <span className="text-sm text-muted">{a.name}</span>
        <Badge tone="neutral">{assetTypeLabel(a.asset_type)}</Badge>
        {a.sector && <Badge tone="neutral">{a.sector}</Badge>}
        {technical.data && (
          <>
            <span className="num text-lg font-semibold">{fmtMoney(technical.data.price)}</span>
            <ScoreChip score={technical.data.score} tone={scoreTone(technical.data.score)} />
          </>
        )}
      </div>

      <Card
        title="Precio y tendencia"
        subtitle="Velas diarias con SMA 20/50/200 y volumen"
        actions={
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setChartDays(r.days)}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  chartDays === r.days
                    ? "bg-surface-2 text-ink"
                    : "text-muted hover:text-ink-2"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      >
        {prices.isLoading && <Loading text="Cargando precios…" />}
        {prices.isError && <ErrorBox error={prices.error} onRetry={() => prices.refetch()} />}
        {prices.data && prices.data.length === 0 && (
          <EmptyState>
            Sin histórico guardado. El backend intenta ingerirlo en caliente al pedir
            precios; reintentá en unos segundos.
          </EmptyState>
        )}
        {prices.data && prices.data.length > 0 && (
          <PriceChart prices={prices.data} indicators={indicators.data ?? []} />
        )}
      </Card>

      <Tabs<TabKey>
        value={tab}
        onChange={setTab}
        options={[
          { value: "tecnico", label: "Técnico" },
          { value: "fundamentales", label: "Fundamentales" },
          { value: "noticias", label: "Noticias" },
          { value: "consenso", label: "Consenso" },
          { value: "riesgo", label: "Riesgo" },
          { value: "recomendacion", label: "Recomendación" },
        ]}
      />

      {tab === "tecnico" && <TechnicalTab ticker={ticker} days={chartDays} />}
      {tab === "fundamentales" && <FundamentalsTab ticker={ticker} />}
      {tab === "noticias" && <NewsTab ticker={ticker} />}
      {tab === "consenso" && <ConsensusTab ticker={ticker} />}
      {tab === "riesgo" && <RiskTab ticker={ticker} />}
      {tab === "recomendacion" && <RecommendationPanel ticker={ticker} />}
    </div>
  );
}
