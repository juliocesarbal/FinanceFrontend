/** Navegación principal de las vistas autenticadas. */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DISCLAIMER } from "@/lib/meta";

const NAV = [
  { href: "/dashboard", label: "Resumen", description: "Visión general", icon: IconGrid },
  { href: "/mercado", label: "Mercado", description: "Activos y precios", icon: IconTrend },
  { href: "/recomendaciones", label: "Recomendaciones", description: "Señales y ranking", icon: IconTarget },
  { href: "/cartera", label: "Cartera", description: "Posiciones y riesgo", icon: IconPie },
  { href: "/simulador", label: "Simulador", description: "Escenarios y backtest", icon: IconFlask },
  { href: "/noticias", label: "Noticias", description: "Contexto de mercado", icon: IconNews },
  { href: "/descubrimiento", label: "Descubrimiento", description: "Nuevas oportunidades", icon: IconRadar },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {open ? <button type="button" aria-label="Cerrar navegación" onClick={onClose} className="fixed inset-0 z-40 bg-surface-0/80 backdrop-blur-sm md:hidden" /> : null}
      <aside aria-label="Navegación principal" className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface-1 transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg" title="Ir al resumen">
            <span className="flex size-9 items-center justify-center rounded-xl border border-s1/30 bg-s1/10 text-s1"><IconLogo /></span>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-ink">Finance</div>
              <div className="text-[11px] text-muted">Radar de inversiones</div>
            </div>
          </Link>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-surface-2 hover:text-ink md:hidden" aria-label="Cerrar menú"><IconClose /></button>
        </div>

        <div className="px-4 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Espacio de análisis</div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
          {NAV.map(({ href, label, description, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${active ? "border-s1/25 bg-s1/10 text-ink" : "border-transparent text-ink-2 hover:border-line hover:bg-surface-2 hover:text-ink"}`}>
                <span className={active ? "text-s1" : "text-muted group-hover:text-ink-2"}><Icon /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block truncate text-[11px] text-muted">{description}</span>
                </span>
                {active ? <span className="ml-auto size-1.5 rounded-full bg-s1" aria-hidden /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-4">
          <div className="flex gap-4 text-xs">
            <a href="/api/docs" target="_blank" rel="noreferrer" className="text-ink-2 hover:text-ink">API docs <span aria-hidden>↗</span></a>
            <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="text-ink-2 hover:text-ink">Admin <span aria-hidden>↗</span></a>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted">{DISCLAIMER}</p>
        </div>
      </aside>
    </>
  );
}

const ICON = "size-4 shrink-0";
function IconLogo() { return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 17l5-6 4 3 6-8" /><path d="M15 6h3v3" /></svg>; }
function IconClose() { return <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>; }
function IconGrid() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>; }
function IconTrend() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 17l5-6 4 3 6-8" /><path d="M15 6h3v3" /><path d="M3 21h18" /></svg>; }
function IconTarget() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".5" fill="currentColor" /></svg>; }
function IconPie() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d="M12 3a9 9 0 1 0 9 9h-9V3z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z" /></svg>; }
function IconFlask() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M8 3h8M7.5 15h9" /></svg>; }
function IconNews() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" /><path d="M19 9h2v9a2 2 0 0 1-2 2M8 9h6M8 13h6M8 17h4" /></svg>; }
function IconRadar() { return <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12l6-6" /><circle cx="12" cy="12" r=".5" fill="currentColor" /></svg>; }
