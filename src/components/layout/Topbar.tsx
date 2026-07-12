/** Barra superior: buscador de ticker + estado de salud del backend. */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useHealth } from "@/lib/queries";

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const health = useHealth();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;
    router.push(`/mercado/${encodeURIComponent(ticker)}`);
    setQuery("");
  };

  const h = health.data;
  const statusColor = health.isError
    ? "bg-critical"
    : h?.status === "ok"
      ? "bg-good"
      : "bg-warn";
  const statusText = health.isError
    ? "Backend sin conexión"
    : h
      ? `BD ${h.database ? "ok" : "caída"} · caché ${h.cache ? "ok" : "caída"} · 429s: ${h.yfinance_rate_limit_errors}`
      : "Consultando salud…";

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-line bg-surface-0/90 px-4 py-2.5 backdrop-blur md:px-6">
      <form onSubmit={submit} className="flex min-w-0 flex-1 items-center md:max-w-xs">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ticker (AAPL, BTC-USD…)"
          aria-label="Buscar ticker"
          className="w-full rounded-lg border border-baseline bg-surface-1 px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-s1 focus:outline-none"
        />
      </form>
      <div className="flex items-center gap-2 text-xs text-muted" title={statusText}>
        <span className={`h-2 w-2 rounded-full ${statusColor}`} aria-hidden />
        <span className="hidden sm:inline">{statusText}</span>
      </div>
    </header>
  );
}
