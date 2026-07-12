/** Pestaña de consenso de analistas (sección 11): distribución y precio objetivo. */
"use client";

import { fmtDateTime, fmtMoney, fmtNum } from "@/lib/format";
import { useConsensus } from "@/lib/queries";

import { HBarList } from "@/components/ui/bars";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  Stat,
} from "@/components/ui/primitives";

export function ConsensusTab({ ticker }: { ticker: string }) {
  const q = useConsensus(ticker);

  if (q.isLoading) return <Loading text="Cargando consenso…" />;
  if (q.isError) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />;
  const c = q.data;
  if (c == null) {
    return (
      <EmptyState>
        Sin consenso de analistas disponible para {ticker} (habitual en cripto e
        índices).
      </EmptyState>
    );
  }

  const distribution = [
    { label: "Compra fuerte", value: c.strong_buy },
    { label: "Compra", value: c.buy },
    { label: "Mantener", value: c.hold },
    { label: "Venta", value: c.sell },
    { label: "Venta fuerte", value: c.strong_sell },
  ];
  const maxCount = Math.max(1, ...distribution.map((d) => d.value));

  // posición relativa del precio actual dentro del rango objetivo
  const range =
    c.low_target !== null && c.high_target !== null && c.high_target > c.low_target
      ? { low: c.low_target, high: c.high_target }
      : null;
  const pos = (v: number | null) =>
    range && v !== null
      ? Math.max(0, Math.min(100, ((v - range.low) / (range.high - range.low)) * 100))
      : null;

  return (
    <div className="space-y-4">
      {c.change_alert && (
        <div className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
          ⚠ {c.change_alert}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Analistas" value={fmtNum(c.total_analysts, 0)} hint={`fuente: ${c.source}`} />
        <Stat
          label="Rating medio"
          value={fmtNum(c.rating_mean)}
          hint="1 = compra fuerte · 5 = venta"
        />
        <Stat
          label="Dispersión"
          value={fmtNum(c.dispersion)}
          hint="alta dispersión = sin consenso claro (señal en sí misma)"
        />
        <Stat label="Precio objetivo medio" value={fmtMoney(c.mean_target)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Distribución de recomendaciones">
          <HBarList
            items={distribution}
            max={maxCount}
            unit=""
            color="var(--color-s1)"
          />
        </Card>

        <Card title="Rango de precio objetivo" subtitle={`Actualizado: ${fmtDateTime(c.as_of)}`}>
          {range ? (
            <div className="space-y-4 py-2">
              <div className="relative mx-2 h-2 rounded-full bg-surface-2">
                {pos(c.mean_target) !== null && (
                  <span
                    className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-s1"
                    style={{ left: `${pos(c.mean_target)}%` }}
                    title={`Objetivo medio ${fmtMoney(c.mean_target)}`}
                  />
                )}
                {pos(c.current_price) !== null && (
                  <span
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-1 bg-ink"
                    style={{ left: `${pos(c.current_price)}%` }}
                    title={`Precio actual ${fmtMoney(c.current_price)}`}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span className="num">min {fmtMoney(c.low_target)}</span>
                <span className="num">mediana {fmtMoney(c.median_target)}</span>
                <span className="num">max {fmtMoney(c.high_target)}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge tone="neutral">
                  <span className="h-2 w-2 rounded-full bg-ink" aria-hidden /> precio actual{" "}
                  <span className="num">{fmtMoney(c.current_price)}</span>
                </Badge>
                <Badge tone="info">
                  objetivo medio <span className="num">{fmtMoney(c.mean_target)}</span>
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted">Sin rango de precio objetivo publicado.</p>
          )}
        </Card>
      </div>

      <p className="text-[11px] text-muted">
        El consenso es un insumo más, no un veredicto: una dispersión alta entre analistas se
        muestra explícitamente en lugar de promediarse y esconderse (sección 11).
      </p>
    </div>
  );
}
