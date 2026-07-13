/** Lista de noticias con sentimiento, impacto, categoría y confiabilidad. */
"use client";

import { fmtNum, timeAgo } from "@/lib/format";
import {
  CATEGORY_LABELS,
  SENTIMENT_META,
  reliabilityTone,
} from "@/lib/meta";
import type { NewsItem } from "@/lib/types";

import { Badge, EmptyState } from "@/components/ui/primitives";

export function NewsList({ items }: { items: NewsItem[] }) {
  if (!items.length) {
    return (
      <EmptyState>
        Sin noticias para los filtros elegidos. Probá ingerir noticias desde el
        detalle de un activo.
      </EmptyState>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-grid">
      {items.map((n) => (
        <li key={n.id} className="group py-4 first:pt-0 last:pb-0">
          <article className="flex flex-col gap-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <a
                href={n.url || undefined}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 text-pretty text-sm font-semibold leading-relaxed text-ink decoration-s1 underline-offset-4 hover:text-s1 hover:underline"
              >
                {n.title}
              </a>
              <span className="shrink-0 text-[11px] text-muted">
                {n.source || "fuente desconocida"} · {timeAgo(n.published_at)}
              </span>
            </div>
            {n.summary && (
              <p className="line-clamp-2 max-w-4xl text-xs leading-relaxed text-ink-2">{n.summary}</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={SENTIMENT_META[n.sentiment_label]?.tone ?? "neutral"}>
              {SENTIMENT_META[n.sentiment_label]?.label ?? n.sentiment_label}
              <span className="num opacity-70">{fmtNum(n.sentiment, 2)}</span>
            </Badge>
            <Badge tone="neutral">{CATEGORY_LABELS[n.category] ?? n.category}</Badge>
            <Badge tone="neutral" title="Impacto estimado 0-100">
              impacto <span className="num">{fmtNum(n.impact_score, 0)}</span>
            </Badge>
            {n.reliability_level && (
              <Badge
                tone={reliabilityTone(n.reliability_level)}
                title={`Confiabilidad de la fuente (sección 9): ${fmtNum(n.reliability_score, 0)}/100`}
              >
                fuente {n.reliability_level}
              </Badge>
            )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
