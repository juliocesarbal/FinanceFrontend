/** Navegación de la landing: fija, se encoge a píldora flotante al scrollear.
 *  El botón de la esquina lleva al sistema (dashboard si hay sesión, login si no). */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useSession } from "@/lib/queries";
import { useUiStore } from "@/lib/store";

const NAV_LINKS = [
  { name: "Capacidades", href: "#capacidades" },
  { name: "Proceso", href: "#proceso" },
  { name: "Métricas", href: "#metricas" },
  { name: "Módulos", href: "#modulos" },
];

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const session = useSession();
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const authenticated = session.data?.authenticated === true;

  const systemLabel = authenticated ? "Ir al dashboard" : "Acceder al sistema";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || menuOpen
            ? "max-w-[1200px] rounded-2xl border border-white/10 bg-surface-0/80 shadow-lg backdrop-blur-xl"
            : "max-w-[1400px] bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-500 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          <Link href="/" className="group flex items-baseline gap-2">
            <span
              className={`font-display tracking-tight text-white transition-all duration-500 ${
                isScrolled ? "text-xl" : "text-2xl"
              }`}
            >
              FINANCE
            </span>
            <span className="font-mono text-[10px] text-white/50">radar</span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group relative text-sm text-white/50 transition-colors duration-300 hover:text-white"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {!authenticated && (
              <button
                onClick={() => setAuthModal("login")}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                Iniciar sesión
              </button>
            )}
            {authenticated ? (
              <Link
                href="/dashboard"
                className={`rounded-full bg-white font-medium text-black transition-all duration-500 hover:bg-white/90 ${
                  isScrolled ? "px-4 py-1.5 text-xs" : "px-6 py-2.5 text-sm"
                }`}
              >
                {systemLabel}
              </Link>
            ) : (
              <button
                onClick={() => setAuthModal("login")}
                className={`rounded-full bg-white font-medium text-black transition-all duration-500 hover:bg-white/90 ${
                  isScrolled ? "px-4 py-1.5 text-xs" : "px-6 py-2.5 text-sm"
                }`}
              >
                {systemLabel}
              </button>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-white md:hidden"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Menú móvil a pantalla completa */}
      <div
        className={`fixed inset-0 z-40 bg-surface-0 transition-all duration-500 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-70" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-8 pb-8 pt-28">
          <div className="flex flex-1 flex-col justify-center gap-7">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-display text-5xl text-white transition-all duration-500 hover:text-muted ${
                  menuOpen ? "translate-y-0 opacity-70" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: menuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div
            className={`flex gap-4 border-t border-white/10 pt-8 transition-all duration-500 ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? "300ms" : "0ms" }}
          >
            {!authenticated && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAuthModal("register");
                }}
                className="flex h-14 flex-1 items-center justify-center rounded-full border border-white/20 text-base text-white"
              >
                Crear cuenta
              </button>
            )}
            {authenticated ? (
              <Link
                href="/dashboard"
                className="flex h-14 flex-1 items-center justify-center rounded-full bg-white text-base font-medium text-black"
              >
                {systemLabel}
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAuthModal("login");
                }}
                className="flex h-14 flex-1 items-center justify-center rounded-full bg-white text-base font-medium text-black"
              >
                {systemLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
