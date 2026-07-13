/** Simulador de inversiones (4.6) y backtesting de cruce de medias (4.7). */
"use client";

import { useState } from "react";

import { fmtMoney, fmtNum, fmtPct } from "@/lib/format";
import { useAssets, useRunBacktest, useRunSimulation } from "@/lib/queries";
import type { BacktestResult, SimulationResult } from "@/lib/types";

import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { ScenarioChart } from "@/components/charts/ScenarioChart";
import { Field, Input, Select } from "@/components/ui/forms";
import {
  Button,
  Card,
  ErrorBox,
  PageHeader,
  Spinner,
  Stat,
} from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/tabs";

type TabKey = "simulacion" | "backtest";

export default function SimuladorPage() {
  const [tab, setTab] = useState<TabKey>("simulacion");

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Laboratorio de escenarios" title="Simulador" description="Modelá aportes y contrastá estrategias históricas. Los resultados son estimaciones estadísticas, no garantías." />

      <Tabs<TabKey>
        value={tab}
        onChange={setTab}
        options={[
          { value: "simulacion", label: "Simulación de aportes" },
          { value: "backtest", label: "Backtesting" },
        ]}
      />

      {tab === "simulacion" ? <SimulacionSection /> : <BacktestSection />}
    </div>
  );
}

// ---------------------------------------------------------------- simulación
function SimulacionSection() {
  const [initial, setInitial] = useState("10000");
  const [monthly, setMonthly] = useState("200");
  const [years, setYears] = useState("10");
  const [expectedReturn, setExpectedReturn] = useState("8");
  const [volatility, setVolatility] = useState("15");
  const [persist, setPersist] = useState(true);

  const run = useRunSimulation();
  const [result, setResult] = useState<SimulationResult | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run.mutate(
      {
        initial_capital: Number(initial) || 0,
        monthly_contribution: Number(monthly) || 0,
        years: Number(years) || 1,
        expected_return: (Number(expectedReturn) || 0) / 100,
        volatility: (Number(volatility) || 0) / 100,
        persist,
      },
      { onSuccess: setResult },
    );
  };

  const scenarios = result
    ? ([
        ["optimista", "Optimista", "up"],
        ["medio", "Medio", "flat"],
        ["pesimista", "Pesimista", "down"],
      ] as const)
    : null;

  return (
    <div className="space-y-4">
      <Card title="Parámetros" subtitle="“¿Qué pasa si invierto X en Y durante N años?”">
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Field label="Capital inicial (USD)">
            <Input type="number" min="0" step="any" value={initial} onChange={(e) => setInitial(e.target.value)} />
          </Field>
          <Field label="Aporte mensual (USD)">
            <Input type="number" min="0" step="any" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </Field>
          <Field label="Horizonte (años)">
            <Input type="number" min="0.5" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} />
          </Field>
          <Field label="Retorno anual %">
            <Input type="number" step="any" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
          </Field>
          <Field label="Volatilidad %">
            <Input type="number" min="0" step="any" value={volatility} onChange={(e) => setVolatility(e.target.value)} />
          </Field>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-xs text-ink-2">
              <input
                type="checkbox"
                checked={persist}
                onChange={(e) => setPersist(e.target.checked)}
                className="accent-[#3987e5]"
              />
              Guardar simulación
            </label>
            <Button type="submit" variant="primary" disabled={run.isPending}>
              {run.isPending ? <Spinner /> : "Simular"}
            </Button>
          </div>
        </form>
        {run.isError && (
          <div className="mt-3">
            <ErrorBox error={run.error} />
          </div>
        )}
      </Card>

      {result && scenarios && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scenarios.map(([key, label, tone]) => {
              const s = result.scenarios[key];
              return (
                <Stat
                  key={key}
                  label={`${label} (${fmtPct(s.annual_return_used * 100, 1, true)} anual)`}
                  value={fmtMoney(s.final_value)}
                  tone={tone}
                  hint={`ganancia ${fmtMoney(s.gain)} · ${fmtPct(s.cumulative_return_pct, 1, true)} acumulado${
                    s.approx_annualized_return_pct !== null
                      ? ` · ≈${fmtPct(s.approx_annualized_return_pct, 1)} anualizado`
                      : ""
                  }`}
                />
              );
            })}
          </div>

          <Card
            title="Proyección por escenario"
            subtitle={`Total aportado: ${fmtMoney(result.total_contributed)} · capitalización mensual (misma fórmula que el backend)`}
          >
            <ScenarioChart
              initial={result.initial_capital}
              monthly={result.monthly_contribution}
              years={result.years}
              expectedReturn={result.expected_return}
              volatility={result.volatility}
            />
            <p className="mt-3 border-t border-grid pt-2 text-[11px] italic text-muted">
              {result.disclaimer}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- backtest
function BacktestSection() {
  const assets = useAssets();
  const [ticker, setTicker] = useState("");
  const [fast, setFast] = useState("50");
  const [slow, setSlow] = useState("200");
  const [capital, setCapital] = useState("10000");

  const run = useRunBacktest();
  const [result, setResult] = useState<BacktestResult | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    run.mutate(
      {
        ticker,
        fast: Number(fast) || 50,
        slow: Number(slow) || 200,
        initial_capital: Number(capital) || 10000,
      },
      { onSuccess: setResult },
    );
  };

  return (
    <div className="space-y-4">
      <Card
        title="Estrategia: cruce de medias (SMA)"
        subtitle="Compra cuando la SMA rápida cruza por encima de la lenta; vende al cruce inverso"
      >
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Field label="Activo">
            <Select value={ticker} onChange={(e) => setTicker(e.target.value)} required>
              <option value="">Elegir…</option>
              {(assets.data ?? []).map((a) => (
                <option key={a.id} value={a.ticker}>
                  {a.ticker}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="SMA rápida (días)">
            <Input type="number" min="2" value={fast} onChange={(e) => setFast(e.target.value)} />
          </Field>
          <Field label="SMA lenta (días)">
            <Input type="number" min="10" value={slow} onChange={(e) => setSlow(e.target.value)} />
          </Field>
          <Field label="Capital inicial (USD)">
            <Input type="number" min="100" step="any" value={capital} onChange={(e) => setCapital(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" variant="primary" disabled={run.isPending || !ticker} className="w-full">
              {run.isPending ? <Spinner /> : "Correr backtest"}
            </Button>
          </div>
        </form>
        {run.isError && (
          <div className="mt-3">
            <ErrorBox error={run.error} />
          </div>
        )}
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label="Valor final"
              value={fmtMoney(result.final_value)}
              hint={`desde ${fmtMoney(result.initial_capital)}`}
              tone={result.final_value >= result.initial_capital ? "up" : "down"}
            />
            <Stat
              label="Retorno total"
              value={fmtPct(result.total_return_pct, 1, true)}
              hint={`CAGR ${fmtPct(result.cagr_pct, 1)}`}
              tone={result.total_return_pct >= 0 ? "up" : "down"}
            />
            <Stat
              label="Máx. drawdown"
              value={fmtPct(result.max_drawdown_pct, 1)}
              hint={`volatilidad ${fmtPct(result.volatility_pct, 1)}`}
              tone="down"
            />
            <Stat
              label="Sharpe"
              value={fmtNum(result.sharpe_ratio, 2)}
              hint={`win rate ${fmtPct(result.win_rate_pct, 0)} · ${result.num_trades} operaciones · PF ${fmtNum(result.profit_factor, 2)}`}
            />
          </div>

          <Card
            title={`Curva de equity — ${result.strategy}`}
            subtitle={`${result.start_date} → ${result.end_date}`}
          >
            <EquityCurveChart curve={result.equity_curve} />
            <p className="mt-3 border-t border-grid pt-2 text-[11px] italic text-muted">
              {result.disclaimer} Sin costos de transacción ni slippage (mejora prevista).
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
