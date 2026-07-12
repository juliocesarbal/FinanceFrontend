/** Detalle de recomendación por ticker: mecánica + agente + evidencia. */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RecommendationPanel } from "@/components/recommendation/RecommendationPanel";

export default function RecomendacionDetallePage() {
  const params = useParams<{ ticker: string }>();
  const ticker = decodeURIComponent(params.ticker ?? "").toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            Recomendación · {ticker}
          </h1>
          <p className="text-xs text-muted">
            Explicable y auditable: datos, fuentes, confiabilidad y riesgos (sección 18)
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <Link href="/recomendaciones" className="text-s1 hover:underline">
            ← Volver al ranking
          </Link>
          <Link href={`/mercado/${ticker}`} className="text-s1 hover:underline">
            Ver activo →
          </Link>
        </div>
      </div>
      <RecommendationPanel ticker={ticker} />
    </div>
  );
}
