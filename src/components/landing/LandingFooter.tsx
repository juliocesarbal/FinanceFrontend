/** Footer de la landing: banner panorámico del template fundido a negro,
 *  columnas de enlaces, disclaimer permanente y estado real del backend. */
"use client";

import Link from "next/link";

import { DISCLAIMER } from "@/lib/meta";
import { useHealth } from "@/lib/queries";
import { useUiStore, type AuthModalMode } from "@/lib/store";

const FOOTER_LINKS: Record<
  string,
  { name: string; href?: string; external?: boolean; modal?: AuthModalMode }[]
> = {
  Explorar: [
    { name: "Capacidades", href: "#capacidades" },
    { name: "Proceso", href: "#proceso" },
    { name: "Métricas", href: "#metricas" },
    { name: "Módulos", href: "#modulos" },
  ],
  Sistema: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Mercado", href: "/mercado" },
    { name: "Recomendaciones", href: "/recomendaciones" },
    { name: "Simulador", href: "/simulador" },
  ],
  Recursos: [
    { name: "Crear cuenta", modal: "register" },
    { name: "Iniciar sesión", modal: "login" },
    { name: "API docs", href: "/api/docs", external: true },
  ],
};

export function LandingFooter() {
  const health = useHealth();
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const ok = !health.isError && health.data?.status === "ok";

  return (
    <footer className="relative bg-black">
      {/* Banner panorámico fundido a negro */}
      <div className="relative h-[300px] w-full overflow-hidden md:h-[420px]">
        <img
          src="/landing/panorama.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-5 lg:gap-8">
            <div className="col-span-2">
              <Link href="/" className="mb-6 inline-flex items-baseline gap-2">
                <span className="font-display text-2xl text-white">FINANCE</span>
                <span className="font-mono text-xs text-white/40">radar</span>
              </Link>

              <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/50">
                Sistema inteligente de análisis, simulación y descubrimiento de
                inversiones: señales explicables con evidencia auditable.
              </p>

              <p className="max-w-xs text-[11px] leading-snug text-white/30">
                {DISCLAIMER}
              </p>
            </div>

            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-6 text-sm font-medium text-white">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) =>
                    link.modal ? (
                      <li key={link.name}>
                        <button
                          onClick={() => setAuthModal(link.modal!)}
                          className="text-sm text-white/40 transition-colors hover:text-white"
                        >
                          {link.name}
                        </button>
                      </li>
                    ) : link.external ? (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-white/40 transition-colors hover:text-white"
                        >
                          {link.name} ↗
                        </a>
                      </li>
                    ) : link.href!.startsWith("#") ? (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-sm text-white/40 transition-colors hover:text-white"
                        >
                          {link.name}
                        </a>
                      </li>
                    ) : (
                      <li key={link.name}>
                        <Link
                          href={link.href!}
                          className="text-sm text-white/40 transition-colors hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 md:flex-row">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Finance — proyecto educativo.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span
              className={`h-2 w-2 rounded-full ${ok ? "bg-[#eca8d6]" : "bg-white/20"}`}
            />
            {health.isPending
              ? "Consultando estado…"
              : health.isError
                ? "Backend sin conexión"
                : ok
                  ? "Sistema operativo"
                  : "Sistema degradado"}
          </div>
        </div>
      </div>
    </footer>
  );
}
