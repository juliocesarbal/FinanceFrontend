/** Barra superior: navegación móvil, buscador, salud del sistema y sesión. */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/primitives";
import { useHealth, useLogout, useSession } from "@/lib/queries";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const health = useHealth();
  const session = useSession();
  const logout = useLogout();
  const email = session.data?.user?.email;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;
    router.push(`/mercado/${encodeURIComponent(ticker)}`);
    setQuery("");
  };

  const h = health.data;
  const statusColor = health.isError ? "bg-critical" : h?.status === "ok" ? "bg-good" : "bg-warn";
  const statusText = health.isError ? "Backend sin conexión" : h ? `BD ${h.database ? "ok" : "caída"} · caché ${h.cache ? "ok" : "caída"} · 429s: ${h.yfinance_rate_limit_errors}` : "Consultando salud…";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface-0/95 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} aria-label="Abrir navegación" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line text-ink-2 hover:bg-surface-2 hover:text-ink md:hidden">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <form onSubmit={submit} role="search" className="relative min-w-0 flex-1 md:max-w-md">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M16 16l4 4" /></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ticker o cripto…" aria-label="Buscar ticker" autoComplete="off" className="h-10 w-full rounded-xl border border-line bg-surface-1 pl-10 pr-14 text-sm text-ink placeholder:text-muted hover:border-baseline focus:border-s1 focus:outline-none" />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">↵</kbd>
        </form>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1.5 text-xs text-muted sm:flex" title={statusText} role="status">
          <span className={`size-2 rounded-full ${statusColor}`} aria-hidden />
          <span className="max-w-52 truncate">{statusText}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 border-l border-line pl-3">
          {email ? <div className="hidden text-right lg:block"><div className="max-w-[20ch] truncate text-xs font-medium text-ink-2" title={email}>{email}</div><div className="text-[10px] text-muted">Cuenta activa</div></div> : null}
          <Button size="sm" variant="ghost" onClick={() => logout.mutate()} disabled={logout.isPending} title="Cerrar sesión">
            {logout.isPending ? "Saliendo…" : "Salir"}
          </Button>
        </div>
      </div>
    </header>
  );
}
