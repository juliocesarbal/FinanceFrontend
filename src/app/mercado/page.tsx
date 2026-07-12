/** Mercado: universo de activos con filtro por tipo y alta de nuevos tickers. */
"use client";

import Link from "next/link";
import { useState } from "react";

import { assetTypeLabel, ASSET_TYPE_LABELS } from "@/lib/meta";
import { useAssets, useCreateAsset } from "@/lib/queries";

import { Input, Select } from "@/components/ui/forms";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";

export default function MercadoPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [newTicker, setNewTicker] = useState("");
  const assets = useAssets(typeFilter || undefined);
  const createAsset = useCreateAsset();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker) return;
    createAsset.mutate({ ticker }, { onSuccess: () => setNewTicker("") });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Mercado</h1>
          <p className="text-xs text-muted">
            Monitor de activos (sección 4.1) — precios vía yfinance con caché
          </p>
        </div>
        <form onSubmit={submit} className="flex items-center gap-2">
          <Input
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Agregar ticker (p. ej. AMZN)"
            className="w-48"
            aria-label="Nuevo ticker"
          />
          <Button type="submit" variant="primary" disabled={createAsset.isPending}>
            {createAsset.isPending ? <Spinner /> : "Agregar"}
          </Button>
        </form>
      </div>

      {createAsset.isError && <ErrorBox error={createAsset.error} />}

      <Card
        title="Universo de activos"
        actions={
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo"
            className="w-44"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        }
      >
        {assets.isLoading && <Loading />}
        {assets.isError && <ErrorBox error={assets.error} onRetry={() => assets.refetch()} />}
        {assets.data && !assets.data.length && (
          <EmptyState>Sin activos para este filtro.</EmptyState>
        )}
        {assets.data && assets.data.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Ticker</Th>
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th>Sector</Th>
                <Th>País</Th>
                <Th>Moneda</Th>
                <Th>Exchange</Th>
              </tr>
            </thead>
            <tbody>
              {assets.data.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.03]">
                  <Td>
                    <Link
                      href={`/mercado/${a.ticker}`}
                      className="font-semibold text-s1 hover:underline"
                    >
                      {a.ticker}
                    </Link>
                  </Td>
                  <Td>{a.name || <span className="text-muted">—</span>}</Td>
                  <Td>
                    <Badge tone="neutral">{assetTypeLabel(a.asset_type)}</Badge>
                  </Td>
                  <Td>{a.sector || <span className="text-muted">—</span>}</Td>
                  <Td>{a.country || <span className="text-muted">—</span>}</Td>
                  <Td>{a.currency}</Td>
                  <Td>{a.exchange || <span className="text-muted">—</span>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
