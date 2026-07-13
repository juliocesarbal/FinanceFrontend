/** Detalle de recomendación por ticker: mecánica + agente + evidencia. */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RecommendationPanel } from "@/components/recommendation/RecommendationPanel";
import { PageHeader } from "@/components/ui/primitives";

export default function RecomendacionDetallePage() {
  const params = useParams<{ ticker: string }>();
  const ticker = decodeURIComponent(params.ticker ?? "").toUpperCase();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Análisis auditable"
        title={<>Recomendación <span className="font-mono text-s1">{ticker}</span></>}
        description="Datos, fuentes, confiabilidad, divergencias y riesgos reunidos para explicar cada señal."
        actions={<><Link href="/recomendaciones" className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink-2 hover:bg-surface-2">Volver al ranking</Link><Link href={`/mercado/${ticker}`} className="rounded-lg border border-s1 bg-s1 px-3 py-2 text-xs font-semibold text-ink">Ver activo</Link></>}
      />
      <RecommendationPanel ticker={ticker} />
    </div>
  );
}
