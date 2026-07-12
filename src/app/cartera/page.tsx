/** Cartera: posiciones, valorización, composición, concentración y rebalanceo. */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fmtMoney, fmtNum, fmtPct } from "@/lib/format";
import { assetTypeLabel } from "@/lib/meta";
import {
  useAddPosition,
  useConcentration,
  useCreatePortfolio,
  useDeletePortfolio,
  useDeletePosition,
  usePortfolioDetail,
  usePortfolios,
  useRebalance,
  useUpdatePosition,
} from "@/lib/queries";
import { useUiStore } from "@/lib/store";
import type { Position } from "@/lib/types";

import { AllocationDonut } from "@/components/charts/AllocationDonut";
import { HBarList } from "@/components/ui/bars";
import { Field, Input, Select } from "@/components/ui/forms";
import { Modal } from "@/components/ui/modal";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  Spinner,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";

export default function CarteraPage() {
  const { portfolioId, setPortfolioId } = useUiStore();
  const portfolios = usePortfolios();

  // selecciona la primera cartera disponible por defecto
  useEffect(() => {
    if (portfolioId === null && portfolios.data?.length) {
      setPortfolioId(portfolios.data[0].id);
    }
  }, [portfolioId, portfolios.data, setPortfolioId]);

  const [newName, setNewName] = useState("");
  const createPortfolio = useCreatePortfolio();
  const deletePortfolio = useDeletePortfolio();

  const detail = usePortfolioDetail(portfolioId);
  const concentration = useConcentration(portfolioId);
  const [threshold, setThreshold] = useState(1);
  const rebalance = useRebalance(portfolioId, threshold);

  const addPosition = useAddPosition(portfolioId);
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);

  const createNew = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    createPortfolio.mutate(
      { name },
      {
        onSuccess: (p) => {
          setNewName("");
          setPortfolioId(p.id);
        },
      },
    );
  };

  const d = detail.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Cartera</h1>
          <p className="text-xs text-muted">
            Registro y análisis de posiciones (secciones 4.5, 4.8 y 4.9)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {portfolios.data && portfolios.data.length > 0 && (
            <Select
              value={portfolioId ?? ""}
              onChange={(e) => setPortfolioId(Number(e.target.value))}
              aria-label="Elegir cartera"
              className="w-48"
            >
              {portfolios.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.base_currency})
                </option>
              ))}
            </Select>
          )}
          <form onSubmit={createNew} className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nueva cartera…"
              className="w-40"
            />
            <Button type="submit" variant="primary" disabled={createPortfolio.isPending}>
              {createPortfolio.isPending ? <Spinner /> : "Crear"}
            </Button>
          </form>
        </div>
      </div>

      {portfolios.isLoading && <Loading text="Cargando carteras…" />}
      {portfolios.isError && (
        <ErrorBox error={portfolios.error} onRetry={() => portfolios.refetch()} />
      )}
      {portfolios.data && portfolios.data.length === 0 && (
        <EmptyState>
          Todavía no hay carteras: creá la primera con el formulario de arriba.
        </EmptyState>
      )}

      {portfolioId !== null && (
        <>
          {detail.isLoading && <Loading text="Valorizando cartera…" />}
          {detail.isError && <ErrorBox error={detail.error} onRetry={() => detail.refetch()} />}

          {d && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Valor actual" value={fmtMoney(d.total_value)} />
                <Stat label="Costo total" value={fmtMoney(d.total_cost)} />
                <Stat
                  label="Ganancia / pérdida"
                  value={fmtMoney(d.total_profit_loss)}
                  tone={d.total_profit_loss > 0 ? "up" : d.total_profit_loss < 0 ? "down" : "flat"}
                />
                <Stat
                  label="Rendimiento"
                  value={fmtPct(d.total_profit_loss_pct, 2, true)}
                  tone={
                    (d.total_profit_loss_pct ?? 0) > 0
                      ? "up"
                      : (d.total_profit_loss_pct ?? 0) < 0
                        ? "down"
                        : "flat"
                  }
                />
              </div>

              <Card
                title="Posiciones"
                actions={
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                      + Agregar posición
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar la cartera "${d.name}" y todas sus posiciones?`,
                          )
                        ) {
                          deletePortfolio.mutate(d.id, {
                            onSuccess: () => setPortfolioId(null),
                          });
                        }
                      }}
                    >
                      Eliminar cartera
                    </Button>
                  </div>
                }
              >
                {d.positions.length === 0 ? (
                  <EmptyState>Sin posiciones: agregá la primera.</EmptyState>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Activo</Th>
                        <Th right>Cantidad</Th>
                        <Th right>Precio prom.</Th>
                        <Th right>Precio actual</Th>
                        <Th right>Valor</Th>
                        <Th right>Peso</Th>
                        <Th right>Objetivo</Th>
                        <Th right>G/P</Th>
                        <Th right>G/P %</Th>
                        <Th />
                      </tr>
                    </thead>
                    <tbody>
                      {d.positions.map((p) => {
                        const up = (p.profit_loss ?? 0) >= 0;
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.03]">
                            <Td>
                              <Link
                                href={`/mercado/${p.ticker}`}
                                className="font-semibold text-s1 hover:underline"
                              >
                                {p.ticker}
                              </Link>
                              <span className="ml-2 hidden text-xs text-muted lg:inline">
                                {assetTypeLabel(p.asset_type)}
                              </span>
                            </Td>
                            <Td right>{fmtNum(p.quantity, 6)}</Td>
                            <Td right>{fmtMoney(p.average_price)}</Td>
                            <Td right>{fmtMoney(p.current_price)}</Td>
                            <Td right>{fmtMoney(p.current_value)}</Td>
                            <Td right>{fmtPct(p.weight, 1)}</Td>
                            <Td right>
                              {p.target_weight !== null ? fmtPct(p.target_weight, 1) : "—"}
                            </Td>
                            <Td right className={up ? "text-good" : "text-critical-text"}>
                              {fmtMoney(p.profit_loss)}
                            </Td>
                            <Td right className={up ? "text-good" : "text-critical-text"}>
                              {fmtPct(p.profit_loss_pct, 2, true)}
                            </Td>
                            <Td right>
                              <div className="flex justify-end gap-1">
                                <Button size="sm" onClick={() => setEditing(p)}>
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => {
                                    if (window.confirm(`¿Eliminar la posición en ${p.ticker}?`)) {
                                      deletePosition.mutate(p.id);
                                    }
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Composición" subtitle="Peso por activo sobre el valor total">
                  <AllocationDonut
                    slices={d.positions
                      .filter((p) => (p.weight ?? 0) > 0)
                      .map((p) => ({
                        label: p.ticker,
                        value: p.weight ?? 0,
                        amount: p.current_value ?? 0,
                      }))}
                    centerLabel={fmtMoney(d.total_value)}
                    centerSub="valor total"
                  />
                </Card>

                <Card
                  title="Concentración y exposiciones"
                  subtitle="HHI y exposición cripto / tecnología / emergentes (4.8)"
                >
                  {concentration.isLoading && <Loading />}
                  {concentration.isError && (
                    <ErrorBox
                      error={concentration.error}
                      onRetry={() => concentration.refetch()}
                    />
                  )}
                  {concentration.data && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="neutral" title="Índice Herfindahl-Hirschman de concentración">
                          HHI <span className="num">{fmtNum(concentration.data.hhi, 0)}</span>
                        </Badge>
                        <Badge
                          tone={concentration.data.crypto_exposure_pct > 25 ? "warn" : "neutral"}
                        >
                          cripto{" "}
                          <span className="num">
                            {fmtPct(concentration.data.crypto_exposure_pct, 1)}
                          </span>
                        </Badge>
                        <Badge tone="neutral">
                          tecnología{" "}
                          <span className="num">
                            {fmtPct(concentration.data.tech_exposure_pct, 1)}
                          </span>
                        </Badge>
                        <Badge tone="neutral">
                          emergentes{" "}
                          <span className="num">
                            {fmtPct(concentration.data.emerging_exposure_pct, 1)}
                          </span>
                        </Badge>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                            Por sector
                          </h3>
                          <HBarList
                            items={Object.entries(concentration.data.by_sector).map(
                              ([label, value]) => ({ label, value }),
                            )}
                          />
                        </div>
                        <div>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                            Por tipo de activo
                          </h3>
                          <HBarList
                            items={Object.entries(concentration.data.by_type).map(
                              ([label, value]) => ({ label: assetTypeLabel(label), value }),
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              <Card
                title="Rebalanceo sugerido"
                subtitle="Compara pesos actuales vs. objetivo por posición (4.9) — definí pesos objetivo editando cada posición"
                actions={
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Umbral
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value) || 1)}
                      className="w-20"
                    />
                    %
                  </label>
                }
              >
                {rebalance.isLoading && <Loading />}
                {rebalance.isError && (
                  <ErrorBox error={rebalance.error} onRetry={() => rebalance.refetch()} />
                )}
                {rebalance.data && (
                  <>
                    {rebalance.data.warning && (
                      <p className="mb-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">
                        ⚠ {rebalance.data.warning}
                      </p>
                    )}
                    {rebalance.data.suggestions.length === 0 ? (
                      <EmptyState>
                        Sin desvíos por encima del umbral (o sin pesos objetivo definidos).
                      </EmptyState>
                    ) : (
                      <Table>
                        <thead>
                          <tr>
                            <Th>Activo</Th>
                            <Th>Acción</Th>
                            <Th right>Peso actual</Th>
                            <Th right>Objetivo</Th>
                            <Th right>Desvío</Th>
                            <Th right>Monto aprox.</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {rebalance.data.suggestions.map((s) => (
                            <tr key={s.ticker} className="hover:bg-white/[0.03]">
                              <Td>
                                <span className="font-semibold">{s.ticker}</span>
                              </Td>
                              <Td>
                                <Badge tone={s.delta_pct > 0 ? "good" : "serious"}>
                                  {s.action}
                                </Badge>
                              </Td>
                              <Td right>{fmtPct(s.current_weight, 1)}</Td>
                              <Td right>{fmtPct(s.target_weight, 1)}</Td>
                              <Td right>{fmtPct(s.delta_pct, 1, true)}</Td>
                              <Td right>{fmtMoney(s.approx_amount)}</Td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </>
                )}
              </Card>
            </>
          )}
        </>
      )}

      <PositionModal
        open={modalOpen || editing !== null}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onCreate={(payload) =>
          addPosition.mutate(payload, {
            onSuccess: () => setModalOpen(false),
          })
        }
        onUpdate={(id, payload) =>
          updatePosition.mutate(
            { id, ...payload },
            { onSuccess: () => setEditing(null) },
          )
        }
        pending={addPosition.isPending || updatePosition.isPending}
        error={addPosition.error ?? updatePosition.error}
      />
    </div>
  );
}

// ------------------------------------------------------------ modal de posición
function PositionModal({
  open,
  editing,
  onClose,
  onCreate,
  onUpdate,
  pending,
  error,
}: {
  open: boolean;
  editing: Position | null;
  onClose: () => void;
  onCreate: (payload: {
    ticker: string;
    quantity: number;
    average_price: number;
    fees: number;
    purchased_at: string | null;
    target_weight: number | null;
  }) => void;
  onUpdate: (
    id: number,
    payload: { quantity: number; average_price: number; fees: number; target_weight: number | null },
  ) => void;
  pending: boolean;
  error: unknown;
}) {
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [fees, setFees] = useState("0");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  // precarga al editar
  useEffect(() => {
    if (editing) {
      setTicker(editing.ticker);
      setQuantity(String(editing.quantity));
      setAvgPrice(String(editing.average_price));
      setFees(String(editing.fees));
      setPurchasedAt(editing.purchased_at ?? "");
      setTargetWeight(editing.target_weight !== null ? String(editing.target_weight) : "");
    } else {
      setTicker("");
      setQuantity("");
      setAvgPrice("");
      setFees("0");
      setPurchasedAt("");
      setTargetWeight("");
    }
  }, [editing, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = {
      quantity: Number(quantity),
      average_price: Number(avgPrice),
      fees: Number(fees) || 0,
      target_weight: targetWeight === "" ? null : Number(targetWeight),
    };
    if (!Number.isFinite(base.quantity) || !Number.isFinite(base.average_price)) return;
    if (editing) {
      onUpdate(editing.id, base);
    } else {
      if (!ticker.trim()) return;
      onCreate({
        ...base,
        ticker: ticker.trim().toUpperCase(),
        purchased_at: purchasedAt || null,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Editar posición · ${editing.ticker}` : "Agregar posición"}
    >
      <form onSubmit={submit} className="space-y-3">
        {!editing && (
          <Field label="Ticker" hint="Se crea el activo si no existe (sincroniza metadatos)">
            <Input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="AAPL, BTC-USD…"
              required
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cantidad">
            <Input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </Field>
          <Field label="Precio promedio (USD)">
            <Input
              type="number"
              step="any"
              min="0"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              required
            />
          </Field>
          <Field label="Comisiones (USD)">
            <Input
              type="number"
              step="any"
              min="0"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
            />
          </Field>
          <Field label="Peso objetivo %" hint="Para el rebalanceo (opcional)">
            <Input
              type="number"
              step="any"
              min="0"
              max="100"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </Field>
        </div>
        {!editing && (
          <Field label="Fecha de compra (opcional)">
            <Input
              type="date"
              value={purchasedAt}
              onChange={(e) => setPurchasedAt(e.target.value)}
            />
          </Field>
        )}
        {error != null && <ErrorBox error={error} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? <Spinner /> : editing ? "Guardar cambios" : "Agregar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
