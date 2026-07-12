/** Noticias y sentimiento (4.4): feed con filtros por ticker, categoría y días. */
"use client";

import { useState } from "react";

import { CATEGORY_LABELS } from "@/lib/meta";
import { useNews } from "@/lib/queries";

import { NewsList } from "@/components/news/NewsList";
import { Input, Select } from "@/components/ui/forms";
import { Card, ErrorBox, Loading } from "@/components/ui/primitives";

export default function NoticiasPage() {
  const [ticker, setTicker] = useState("");
  const [category, setCategory] = useState("");
  const [days, setDays] = useState(30);

  const news = useNews({
    ticker: ticker.trim().toUpperCase() || undefined,
    category: category || undefined,
    days,
    limit: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Noticias</h1>
        <p className="text-xs text-muted">
          Ingesta yfinance + Google News RSS con sentimiento, impacto y confiabilidad
          de fuente (secciones 4.4 y 9)
        </p>
      </div>

      <Card
        title="Feed"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Ticker…"
              aria-label="Filtrar por ticker"
              className="w-28"
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filtrar por categoría"
              className="w-52"
            >
              <option value="">Todas las categorías</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              aria-label="Rango de días"
              className="w-32"
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={365}>1 año</option>
            </Select>
          </div>
        }
      >
        {news.isLoading && <Loading />}
        {news.isError && <ErrorBox error={news.error} onRetry={() => news.refetch()} />}
        {news.data && <NewsList items={news.data} />}
      </Card>
    </div>
  );
}
