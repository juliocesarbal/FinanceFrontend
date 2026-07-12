/** Navegación lateral (horizontal en móvil). */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DISCLAIMER } from "@/lib/meta";

const NAV = [
  { href: "/", label: "Dashboard", icon: IconGrid },
  { href: "/mercado", label: "Mercado", icon: IconTrend },
  { href: "/recomendaciones", label: "Recomendaciones", icon: IconTarget },
  { href: "/cartera", label: "Cartera", icon: IconPie },
  { href: "/simulador", label: "Simulador", icon: IconFlask },
  { href: "/noticias", label: "Noticias", icon: IconNews },
  { href: "/descubrimiento", label: "Descubrimiento", icon: IconRadar },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="flex shrink-0 flex-col border-line max-md:border-b md:h-screen md:w-60 md:border-r md:sticky md:top-0">
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-s1/15 text-s1">
          <IconLogo />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">Finance</div>
          <div className="text-[10px] text-muted">Radar de inversiones</div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(href)
                ? "bg-surface-2 font-medium text-ink"
                : "text-muted hover:bg-white/5 hover:text-ink-2"
            }`}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden border-t border-grid px-4 py-3 md:block">
        <div className="mb-2 flex gap-3 text-[11px]">
          <a href="/api/docs" target="_blank" rel="noreferrer" className="text-muted hover:text-ink-2">
            API docs ↗
          </a>
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-ink-2"
          >
            Admin ↗
          </a>
        </div>
        <p className="text-[10px] leading-snug text-muted">{DISCLAIMER}</p>
      </div>
    </aside>
  );
}

const ICON = "h-4 w-4 shrink-0";

function IconLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17l5-6 4 3 6-8" />
      <path d="M15 6h3v3" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17l5-6 4 3 6-8" />
      <path d="M15 6h3v3" />
      <path d="M3 21h18" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}
function IconPie() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a9 9 0 1 0 9 9h-9V3z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z" />
    </svg>
  );
}
function IconFlask() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path d="M8 3h8" />
      <path d="M7.5 15h9" />
    </svg>
  );
}
function IconNews() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
      <path d="M19 9h2v9a2 2 0 0 1-2 2" />
      <path d="M8 9h6M8 13h6M8 17h4" />
    </svg>
  );
}
function IconRadar() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l6-6" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}
