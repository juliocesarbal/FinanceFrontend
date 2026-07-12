/** Pestaña de análisis fundamental: los 5 bloques de la sección 4.3. */
"use client";

import {
  fmtDateTime,
  fmtFracPct,
  fmtMoney,
  fmtMoneyCompact,
  fmtNum,
} from "@/lib/format";
import { scoreTone } from "@/lib/meta";
import { useFundamentals } from "@/lib/queries";
import type { Ratios } from "@/lib/types";

import {
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  ScoreChip,
} from "@/components/ui/primitives";

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-grid py-1.5 last:border-0">
      <span className="text-xs text-muted" title={hint}>
        {label}
      </span>
      <span className="num text-sm text-ink-2">{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-grid bg-surface-0/40 p-3">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-2">{title}</h3>
      {children}
    </div>
  );
}

export function FundamentalsTab({ ticker }: { ticker: string }) {
  const q = useFundamentals(ticker);

  if (q.isLoading) return <Loading text="Cargando fundamentales…" />;
  if (q.isError) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />;
  const r: Ratios | null | undefined = q.data;
  if (r == null) {
    return (
      <EmptyState>
        Sin fundamentales disponibles: los criptoactivos no tienen estados contables
        (sección 12). Para cripto pesan más la adopción, liquidez y seguridad.
      </EmptyState>
    );
  }

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Tablero fundamental
          <ScoreChip score={r.fundamental_score} tone={scoreTone(r.fundamental_score)} />
        </span>
      }
      subtitle={`Datos al ${fmtDateTime(r.as_of)} · precio usado ${fmtMoney(r.price_used)}`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Block title="1 · Múltiplos de precio">
          <Row label="PER (trailing)" value={fmtNum(r.per)} hint="Precio / beneficio por acción" />
          <Row label="PER forward" value={fmtNum(r.forward_per)} />
          <Row label="PEG" value={fmtNum(r.peg)} hint="≈1 precio justo; <1 sugiere infravaloración" />
          <Row label="P/VC (P/B)" value={fmtNum(r.price_to_book)} />
          <Row label="P/Ventas" value={fmtNum(r.price_to_sales)} />
          <Row label="Dividend yield" value={fmtFracPct(r.dividend_yield)} />
          <Row label="FCF yield" value={fmtFracPct(r.fcf_yield)} />
        </Block>

        <Block title="2 · Enterprise value">
          <Row label="EV" value={fmtMoneyCompact(r.enterprise_value)} hint="Capitalización + deuda − caja" />
          <Row label="EV/EBITDA" value={fmtNum(r.ev_ebitda)} hint="El ratio rey en M&A" />
          <Row label="EV/EBIT" value={fmtNum(r.ev_ebit)} />
          <Row label="EV/FCF" value={fmtNum(r.ev_fcf)} hint="El más estricto: caja real por año" />
          <Row label="EV/Ventas" value={fmtNum(r.ev_sales)} />
        </Block>

        <Block title="3 · Rentabilidad">
          <Row label="ROE" value={fmtFracPct(r.roe)} hint=">15% sostenido = ventaja competitiva" />
          <Row label="ROA" value={fmtFracPct(r.roa)} />
          <Row label="ROIC" value={fmtFracPct(r.roic)} />
          <Row label="Margen bruto" value={fmtFracPct(r.gross_margin)} />
          <Row label="Margen operativo" value={fmtFracPct(r.operating_margin)} />
          <Row label="Margen neto" value={fmtFracPct(r.net_margin)} />
        </Block>

        <Block title="4 · Liquidez y solvencia">
          <Row label="Current ratio" value={fmtNum(r.current_ratio)} hint="Debe ser mayor a 1" />
          <Row label="Quick ratio" value={fmtNum(r.quick_ratio)} />
          <Row
            label="Deuda neta / EBITDA"
            value={fmtNum(r.net_debt_to_ebitda)}
            hint="Mayor a 3–4 empieza a ser peligroso"
          />
          <Row
            label="Cobertura de intereses"
            value={fmtNum(r.interest_coverage)}
            hint="Menor a 2 es señal de alerta"
          />
          <Row label="Deuda / Patrimonio" value={fmtNum(r.debt_to_equity)} />
        </Block>

        <Block title="5 · Valoración intrínseca (DCF)">
          <Row label="WACC" value={fmtFracPct(r.wacc)} />
          <Row label="Fair value DCF" value={fmtMoney(r.dcf_fair_value)} />
          <Row
            label="Upside vs. precio"
            value={fmtFracPct(r.dcf_upside)}
            hint="Positivo: potencialmente infravalorada según los supuestos"
          />
          {Object.keys(r.dcf_assumptions ?? {}).length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-s1 hover:underline">
                Supuestos del modelo (auditables — sección 18)
              </summary>
              <pre className="num mt-2 overflow-x-auto rounded bg-surface-2 p-2 text-[11px] leading-relaxed text-ink-2">
                {JSON.stringify(r.dcf_assumptions, null, 2)}
              </pre>
            </details>
          )}
        </Block>
      </div>
    </Card>
  );
}
