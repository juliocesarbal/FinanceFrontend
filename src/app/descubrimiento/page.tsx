/** Descubrimiento de mercados emergentes (secciones 6, 13 y 14). */
"use client";

import Link from "next/link";
import { useState } from "react";

import { fmtDateTime, fmtNum } from "@/lib/format";
import { riskLevelTone, scoreTone } from "@/lib/meta";
import {
  useCreateTopic,
  useOpportunities,
  useRunDiscovery,
  useTopics,
} from "@/lib/queries";
import type { OpportunityReport } from "@/lib/types";

import { HBarList } from "@/components/ui/bars";
import { Input } from "@/components/ui/forms";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  ScoreChip,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";

const BREAKDOWN_LABELS: Record<string, string> = {
  sector_growth: "Crecimiento del sector (20 %)",
  adoption_signals: "Señales de adopción (15 %)",
  institutional_investment: "Inversión institucional (15 %)",
  fundamentals: "Fundamentos (15 %)",
  price_momentum: "Momentum de precio (10 %)",
  news_regulation: "Noticias y regulación (10 %)",
  tech_activity: "Actividad tecnológica (10 %)",
  risk: "Riesgo (5 %)",
};

/** El backend guarda {weights, features}: las barras muestran los features 0-100. */
function breakdownFeatures(raw: Record<string, unknown>): { label: string; value: number }[] {
  const features =
    raw && typeof raw.features === "object" && raw.features !== null
      ? (raw.features as Record<string, unknown>)
      : raw;
  return Object.entries(features ?? {})
    .filter(([, v]) => typeof v === "number" && Number.isFinite(v))
    .map(([key, value]) => ({
      label: BREAKDOWN_LABELS[key] ?? key,
      value: value as number,
    }));
}

export default function DescubrimientoPage() {
  const topics = useTopics();
  const opportunities = useOpportunities();
  const scan = useRunDiscovery();
  const createTopic = useCreateTopic();

  const [newName, setNewName] = useState("");
  const [newQuery, setNewQuery] = useState("");

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQuery.trim()) return;
    createTopic.mutate(
      { name: newName.trim(), query: newQuery.trim() },
      {
        onSuccess: () => {
          setNewName("");
          setNewQuery("");
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Descubrimiento</h1>
          <p className="text-xs text-muted">
            Búsqueda de mercados emergentes vía Google News RSS con operadores
            avanzados (sección 6)
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => scan.mutate()}
          disabled={scan.isPending}
          title="Descarga y analiza los RSS de todos los temas activos — puede tardar"
        >
          {scan.isPending ? (
            <>
              <Spinner /> Escaneando…
            </>
          ) : (
            "Escanear ahora"
          )}
        </Button>
      </div>

      {scan.isError && <ErrorBox error={scan.error} />}
      {scan.data && (
        <div className="rounded-lg border border-good/40 bg-good/10 px-3 py-2 text-sm text-good">
          ✓ Escaneo completado: {scan.data.scanned} temas, {scan.data.errors} errores,{" "}
          {scan.data.reports.length} reportes generados
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card
          title="Temas monitoreados"
          subtitle="Frecuencia de menciones y momentum por tema"
          className="xl:col-span-2"
        >
          <form onSubmit={addTopic} className="mb-3 flex flex-wrap items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nuevo tema (ej. computación cuántica)"
              className="min-w-0 flex-1"
            />
            <Input
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder='Query (ej. "quantum computing" AND investment)'
              className="min-w-0 flex-1"
            />
            <Button type="submit" size="sm" disabled={createTopic.isPending}>
              {createTopic.isPending ? <Spinner /> : "Agregar"}
            </Button>
          </form>
          {createTopic.isError && <ErrorBox error={createTopic.error} />}
          {topics.isLoading && <Loading />}
          {topics.isError && <ErrorBox error={topics.error} onRetry={() => topics.refetch()} />}
          {topics.data && (
            <Table>
              <thead>
                <tr>
                  <Th>Tema</Th>
                  <Th right>Menciones</Th>
                  <Th right>Momentum</Th>
                  <Th>Último escaneo</Th>
                </tr>
              </thead>
              <tbody>
                {topics.data.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.03]">
                    <Td>
                      <span className="font-medium">{t.name}</span>
                      <span className="ml-2 text-[11px] text-muted">{t.category}</span>
                    </Td>
                    <Td right>{fmtNum(t.mention_count, 0)}</Td>
                    <Td right>
                      <span
                        className={
                          t.momentum > 0
                            ? "text-good"
                            : t.momentum < 0
                              ? "text-critical-text"
                              : "text-ink-2"
                        }
                      >
                        {fmtNum(t.momentum, 2)}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-muted">
                        {t.last_scanned_at ? fmtDateTime(t.last_scanned_at) : "nunca"}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <div className="space-y-4 xl:col-span-3">
          <h2 className="text-sm font-semibold text-ink">
            Reportes de oportunidad emergente
          </h2>
          {opportunities.isLoading && <Loading />}
          {opportunities.isError && (
            <ErrorBox error={opportunities.error} onRetry={() => opportunities.refetch()} />
          )}
          {opportunities.data && !opportunities.data.length && (
            <EmptyState>
              Sin reportes todavía: corré un escaneo para generar los primeros.
            </EmptyState>
          )}
          {(opportunities.data ?? []).map((r) => (
            <OpportunityCard key={r.id} report={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ report }: { report: OpportunityReport }) {
  const breakdown = breakdownFeatures(report.score_breakdown ?? {});

  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          {report.name}
          <ScoreChip score={report.score} tone={scoreTone(report.score)} />
          <Badge tone={riskLevelTone(report.risk_level)}>riesgo {report.risk_level}</Badge>
          <Badge tone="neutral">{report.horizon}</Badge>
        </span>
      }
      subtitle={`${report.opportunity_type} · ${fmtDateTime(report.created_at)}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Tesis
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">
              {report.thesis}
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-serious">
              Riesgos
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">
              {report.risks}
            </p>
          </div>
          {report.conclusion && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Conclusión
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">
                {report.conclusion}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {breakdown.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Desglose del Emerging Market Score (sección 13)
              </h3>
              <HBarList items={breakdown} max={100} unit="" />
            </div>
          )}
          {report.related_tickers.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Activos relacionados
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {report.related_tickers.map((t) => (
                  <Link key={t} href={`/mercado/${t}`}>
                    <Badge tone="info">{t}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
