/** Pestaña de riesgo (sección 4.8): volatilidad, drawdown, beta, correlaciones. */
"use client";

import { fmtFracPct, fmtNum } from "@/lib/format";
import { scoreTone } from "@/lib/meta";
import { useRisk } from "@/lib/queries";

import {
  Card,
  ErrorBox,
  Loading,
  ScoreChip,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";

export function RiskTab({ ticker }: { ticker: string }) {
  const q = useRisk(ticker);

  if (q.isLoading) return <Loading text="Calculando métricas de riesgo…" />;
  if (q.isError) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />;
  const r = q.data;
  if (!r) return null;

  const correlations = Object.entries(r.correlations ?? {});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Volatilidad anual"
          value={fmtFracPct(r.volatility_annual)}
          hint="desviación estándar anualizada"
        />
        <Stat
          label="Máx. drawdown"
          value={fmtFracPct(r.max_drawdown)}
          hint="mayor caída desde un máximo"
        />
        <Stat label="Beta" value={fmtNum(r.beta)} hint="sensibilidad vs. mercado (SPY)" />
        <div className="rounded-xl border border-line bg-surface-1 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-muted">Score de riesgo</div>
          <div className="mt-1.5">
            <ScoreChip score={r.risk_score} tone={scoreTone(r.risk_score)} />
          </div>
          <div className="mt-0.5 text-xs text-muted">más alto = menos riesgoso</div>
        </div>
      </div>

      {r.notes.length > 0 && (
        <Card title="Notas de riesgo">
          <ul className="list-inside list-disc space-y-1 text-sm text-ink-2">
            {r.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Card>
      )}

      {correlations.length > 0 && (
        <Card
          title="Correlación con otros activos"
          subtitle="1 = se mueven igual · 0 = independientes · −1 = opuestos"
        >
          <Table>
            <thead>
              <tr>
                <Th>Activo</Th>
                <Th right>Correlación</Th>
              </tr>
            </thead>
            <tbody>
              {correlations
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([other, value]) => (
                  <tr key={other} className="hover:bg-white/[0.03]">
                    <Td>{other}</Td>
                    <Td right>{fmtNum(value, 2)}</Td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
