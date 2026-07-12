/**
 * Panel completo de recomendación para un activo: score mecánico (5.1),
 * revisión del agente (5.2) con divergencia visible, riesgos y evidencia.
 */
"use client";

import { fmtDateTime, fmtNum, fmtPct } from "@/lib/format";
import { scoreTone, signalMeta } from "@/lib/meta";
import { useAgentReview, useRecommendation } from "@/lib/queries";

import { ScoreBreakdown } from "@/components/ui/bars";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  ScoreChip,
} from "@/components/ui/primitives";

import { EvidenceTable } from "./EvidenceTable";

export function RecommendationPanel({ ticker }: { ticker: string }) {
  const rec = useRecommendation(ticker);
  const agent = useAgentReview(ticker);

  if (rec.isLoading) return <Loading text="Cargando recomendación…" />;
  if (rec.isError) return <ErrorBox error={rec.error} onRetry={() => rec.refetch()} />;

  const r = rec.data;
  if (!r) {
    return (
      <EmptyState>
        Sin recomendación para {ticker} todavía. Corré el scoring desde la página
        de Recomendaciones (o `python manage.py run_scoring`).
      </EmptyState>
    );
  }

  const a = agent.data;
  const meta = signalMeta(r.signal);

  return (
    <div className="space-y-4">
      <Card
        title={
          <span className="flex items-center gap-2">
            Señal mecánica (capa 5.1)
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <ScoreChip score={r.score} tone={scoreTone(r.score)} />
          </span>
        }
        subtitle={`Calculada: ${fmtDateTime(r.created_at)}`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Desglose del puntaje
            </h3>
            <ScoreBreakdown
              technical={r.technical_score}
              news={r.news_score}
              fundamental={r.fundamental_score}
              risk={r.risk_score}
            />
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Motivos
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">
                {r.explanation}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-serious">
                Riesgos
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">{r.risks}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Revisión del agente (capa 5.2)"
        subtitle="Verificación con razonamiento sobre el snapshot completo — Anthropic API con tool use"
      >
        {agent.isLoading && <Loading text="Cargando revisión del agente…" />}
        {agent.isError && <ErrorBox error={agent.error} onRetry={() => agent.refetch()} />}
        {!agent.isLoading && !agent.isError && !a && (
          <EmptyState>
            Este activo aún no fue escalado al agente. Se escala automáticamente si
            entra al top N del ranking (etapa 5.3) con la API key configurada.
          </EmptyState>
        )}
        {a && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={signalMeta(a.signal).tone}>{signalMeta(a.signal).label}</Badge>
              <span className="text-xs text-muted">score mecánico</span>
              <ScoreChip score={a.mechanical_score} tone={scoreTone(a.mechanical_score)} />
              <span className="text-xs text-muted">→ score del agente</span>
              <ScoreChip score={a.agent_score} tone={scoreTone(a.agent_score)} />
              <Badge
                tone={Math.abs(a.divergence) >= 15 ? "warn" : "neutral"}
                title="Divergencia entre score mecánico y del agente: si es grande, es una señal en sí misma (sección 5.2)"
              >
                divergencia {fmtNum(a.divergence, 1)}
              </Badge>
              <Badge tone="neutral" title="Confianza declarada por el agente">
                confianza {fmtPct(a.confidence * 100, 0)}
              </Badge>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Justificación
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">
                {a.justification}
              </p>
            </div>
            {a.contradictions_detected.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-warn">
                  Contradicciones detectadas
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-ink-2">
                  {a.contradictions_detected.map((c, i) => (
                    <li key={i}>{String(c)}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[11px] text-muted">
              Modelo: {a.model_used} · {fmtDateTime(a.created_at)}
            </p>
            {a.evidence_sources.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Evidencia citada por el agente
                </h3>
                <EvidenceTable sources={a.evidence_sources} />
              </div>
            )}
          </div>
        )}
      </Card>

      <Card
        title="Fuentes de evidencia"
        subtitle="Ninguna recomendación se muestra sin fuentes explícitas y su confiabilidad (secciones 9 y 18)"
      >
        <EvidenceTable sources={r.evidence_sources} />
      </Card>
    </div>
  );
}
