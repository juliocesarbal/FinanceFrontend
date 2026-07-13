/** Dashboard: salud, top del ranking, watchlist y últimas noticias. */
"use client";

import Link from "next/link";

import { fmtNum } from "@/lib/format";
import { assetTypeLabel, scoreTone, signalMeta } from "@/lib/meta";
import { useAssets, useHealth, useNews, useRanking } from "@/lib/queries";

import { NewsList } from "@/components/news/NewsList";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
  ScoreChip,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";

export default function DashboardPage() {
  const health = useHealth();
  const ranking = useRanking();
  const assets = useAssets();
  const news = useNews({ days: 7, limit: 8 });

  const top = (ranking.data ?? []).slice(0, 6);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Centro de control"
        title="Resumen de inversión"
        description="Seguimiento operativo del universo, señales recientes y salud de las fuentes de datos."
        actions={
          <Link href="/mercado" className="rounded-lg border border-line bg-surface-1 px-3 py-2 text-xs font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
            Explorar mercado <span aria-hidden>→</span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Backend"
          value={health.isError ? "Sin conexión" : health.data?.status === "ok" ? "OK" : "Degradado"}
          tone={health.isError ? "down" : health.data?.status === "ok" ? "up" : "flat"}
          hint={health.data ? `BD ${health.data.database ? "✓" : "✗"} · caché ${health.data.cache ? "✓" : "✗"}` : undefined}
        />
        <Stat
          label="Errores 429 yfinance"
          value={health.data ? fmtNum(health.data.yfinance_rate_limit_errors, 0) : "—"}
          hint="métrica de resiliencia (16.5)"
        />
        <Stat
          label="Activos seguidos"
          value={assets.data ? fmtNum(assets.data.length, 0) : "—"}
          hint="universo actual"
        />
        <Stat
          label="Activos rankeados"
          value={ranking.data ? fmtNum(ranking.data.length, 0) : "—"}
          hint="con score mecánico vigente"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Top oportunidades"
          subtitle="Score mecánico vs. ajustado por el agente (secciones 5.1–5.3)"
          className="xl:col-span-2"
          actions={
            <Link href="/recomendaciones" className="text-xs text-s1 hover:underline">
              Ver ranking completo →
            </Link>
          }
        >
          {ranking.isLoading && <Loading />}
          {ranking.isError && (
            <ErrorBox error={ranking.error} onRetry={() => ranking.refetch()} />
          )}
          {ranking.data && !top.length && (
            <EmptyState>
              Todavía no hay scores. Corré el scoring desde la página de
              Recomendaciones.
            </EmptyState>
          )}
          {top.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <Th>Activo</Th>
                  <Th>Señal</Th>
                  <Th right>Score mecánico</Th>
                  <Th right>Score agente</Th>
                </tr>
              </thead>
              <tbody>
                {top.map((item) => (
                  <tr key={item.ticker} className="hover:bg-white/[0.03]">
                    <Td>
                      <Link
                        href={`/mercado/${item.ticker}`}
                        className="font-semibold text-ink hover:text-s1"
                      >
                        {item.ticker}
                      </Link>
                      <span className="ml-2 hidden text-xs text-muted sm:inline">
                        {item.name}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={signalMeta(item.agent_signal ?? item.mechanical_signal).tone}>
                        {signalMeta(item.agent_signal ?? item.mechanical_signal).label}
                      </Badge>
                    </Td>
                    <Td right>
                      <ScoreChip
                        score={item.mechanical_score}
                        tone={scoreTone(item.mechanical_score)}
                      />
                    </Td>
                    <Td right>
                      <ScoreChip score={item.agent_score} tone={scoreTone(item.agent_score)} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card
          title="Watchlist"
          subtitle="Activos seguidos por el sistema"
          actions={
            <Link href="/mercado" className="text-xs text-s1 hover:underline">
              Mercado →
            </Link>
          }
        >
          {assets.isLoading && <Loading />}
          {assets.isError && <ErrorBox error={assets.error} onRetry={() => assets.refetch()} />}
          {assets.data && (
            <ul className="space-y-1">
              {assets.data.slice(0, 12).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/mercado/${a.ticker}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
                  >
                    <span className="min-w-0">
                      <span className="font-semibold">{a.ticker}</span>
                      <span className="ml-2 truncate text-xs text-muted">{a.name}</span>
                    </span>
                    <Badge tone="neutral">{assetTypeLabel(a.asset_type)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Últimas noticias"
        subtitle="Ingesta yfinance + Google News RSS, con sentimiento y confiabilidad"
        actions={
          <Link href="/noticias" className="text-xs text-s1 hover:underline">
            Todas las noticias →
          </Link>
        }
      >
        {news.isLoading && <Loading />}
        {news.isError && <ErrorBox error={news.error} onRetry={() => news.refetch()} />}
        {news.data && <NewsList items={news.data} />}
      </Card>
    </div>
  );
}
