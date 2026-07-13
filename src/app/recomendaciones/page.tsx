/** Ranking de oportunidades: score mecánico vs. agente con divergencia (5.3). */
"use client";

import Link from "next/link";
import { useState } from "react";

import { fmtDateTime, fmtNum, fmtPct } from "@/lib/format";
import { SIGNAL_META, scoreTone, signalMeta } from "@/lib/meta";
import { useRanking, useRunScoring } from "@/lib/queries";
import type { Signal } from "@/lib/types";

import { Select } from "@/components/ui/forms";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
  ScoreChip,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";

export default function RecomendacionesPage() {
  const ranking = useRanking();
  const runScoring = useRunScoring();
  const [signalFilter, setSignalFilter] = useState("");

  const items = (ranking.data ?? []).filter(
    (i) =>
      !signalFilter ||
      i.mechanical_signal === signalFilter ||
      i.agent_signal === signalFilter,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Motor de señales"
        title="Recomendaciones"
        description="Ranking auditable en dos etapas: score mecánico para todo el universo y análisis del agente sobre las mejores oportunidades."
        actions={<div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => runScoring.mutate(false)}
            disabled={runScoring.isPending}
            title="Etapa 1: score mecánico de todo el universo (sin costo de LLM)"
          >
            {runScoring.isPending ? <Spinner /> : "Correr scoring"}
          </Button>
          <Button
            variant="primary"
            onClick={() => runScoring.mutate(true)}
            disabled={runScoring.isPending}
            title="Además encola la etapa 2 (agente Anthropic) para el top N vía Celery — requiere ANTHROPIC_API_KEY y worker activo"
          >
            {runScoring.isPending ? <Spinner /> : "Scoring + escalar al agente"}
          </Button>
        </div>}
      />

      {runScoring.isError && <ErrorBox error={runScoring.error} />}
      {runScoring.isPending && (
        <div className="rounded-lg border border-line bg-surface-1 px-3 py-2 text-sm text-ink-2">
          Corriendo scoring sobre el universo… puede tardar un par de minutos si
          los datos no están en caché.
        </div>
      )}
      {runScoring.data && (
        <div className="space-y-2">
          <div className="rounded-lg border border-good/40 bg-good/10 px-3 py-2 text-sm text-good">
            ✓ Scoring completado: {runScoring.data.scored} activos evaluados,{" "}
            {runScoring.data.errors} errores
            {runScoring.data.escalated.length > 0 && (
              <> · escalados al agente: {runScoring.data.escalated.join(", ")}</>
            )}
          </div>
          {runScoring.data.note && (
            <div className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
              ⚠ {runScoring.data.note}
            </div>
          )}
        </div>
      )}

      <Card
        title="Ranking de oportunidades"
        subtitle="La divergencia mecánico vs. agente es una señal en sí misma — no se esconde (5.2 punto 5)"
        actions={
          <Select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            aria-label="Filtrar por señal"
            className="w-48"
          >
            <option value="">Todas las señales</option>
            {(Object.keys(SIGNAL_META) as Signal[]).map((s) => (
              <option key={s} value={s}>
                {SIGNAL_META[s].label}
              </option>
            ))}
          </Select>
        }
      >
        {ranking.isLoading && <Loading />}
        {ranking.isError && <ErrorBox error={ranking.error} onRetry={() => ranking.refetch()} />}
        {ranking.data && !items.length && (
          <EmptyState>
            Sin resultados. Corré el scoring para generar el ranking (también existe
            `python manage.py run_scoring`).
          </EmptyState>
        )}
        {items.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Activo</Th>
                <Th>Señal mecánica</Th>
                <Th right>Score mecánico</Th>
                <Th>Señal agente</Th>
                <Th right>Score agente</Th>
                <Th right>Confianza</Th>
                <Th right>Divergencia</Th>
                <Th>Contradicciones</Th>
                <Th>Actualizado</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.ticker} className="hover:bg-white/[0.03]">
                  <Td>
                    <span className="text-xs text-muted">{idx + 1}</span>
                  </Td>
                  <Td>
                    <Link
                      href={`/recomendaciones/${item.ticker}`}
                      className="font-semibold text-s1 hover:underline"
                    >
                      {item.ticker}
                    </Link>
                    <span className="ml-2 hidden text-xs text-muted xl:inline">{item.name}</span>
                  </Td>
                  <Td>
                    <Badge tone={signalMeta(item.mechanical_signal).tone}>
                      {signalMeta(item.mechanical_signal).label}
                    </Badge>
                  </Td>
                  <Td right>
                    <ScoreChip
                      score={item.mechanical_score}
                      tone={scoreTone(item.mechanical_score)}
                    />
                  </Td>
                  <Td>
                    {item.agent_signal ? (
                      <Badge tone={signalMeta(item.agent_signal).tone}>
                        {signalMeta(item.agent_signal).label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted">no escalado</span>
                    )}
                  </Td>
                  <Td right>
                    <ScoreChip score={item.agent_score} tone={scoreTone(item.agent_score)} />
                  </Td>
                  <Td right>
                    {item.agent_confidence !== null
                      ? fmtPct(item.agent_confidence * 100, 0)
                      : "—"}
                  </Td>
                  <Td right>
                    {item.divergence !== null ? (
                      <span
                        className={
                          Math.abs(item.divergence) >= 15
                            ? "font-semibold text-warn"
                            : "text-ink-2"
                        }
                      >
                        {fmtNum(item.divergence, 1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    {item.contradictions && item.contradictions.length > 0 ? (
                      <Badge tone="warn" title={item.contradictions.map(String).join(" · ")}>
                        {item.contradictions.length} ⚠
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </Td>
                  <Td>
                    <span className="text-xs text-muted">{fmtDateTime(item.scored_at)}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
