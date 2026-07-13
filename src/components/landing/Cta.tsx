/** CTA final: caja enmarcada con spotlight que sigue al mouse y
 *  esquinas decorativas, botones hacia el sistema y el registro. */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useSession } from "@/lib/queries";
import { useUiStore } from "@/lib/store";

export function Cta() {
  const [isVisible, setIsVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const sectionRef = useRef<HTMLElement>(null);
  const session = useSession();
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const authenticated = session.data?.authenticated === true;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          className={`relative border border-white/60 transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight que sigue al mouse */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(236,168,214,0.12), transparent 40%)`,
            }}
          />

          <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex-1">
                <h2 className="mb-8 font-display text-5xl leading-[0.95] tracking-tight md:text-6xl lg:text-[72px]">
                  ¿Listo para analizar
                  <br />
                  con evidencia?
                </h2>

                <p className="mb-12 max-w-xl text-xl leading-relaxed text-muted">
                  Creá tu cuenta, armá tu watchlist y corré el pipeline completo:
                  scoring, agente de verificación, cartera y simulaciones.
                </p>

                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  {authenticated ? (
                    <Link
                      href="/dashboard"
                      className="group flex h-14 items-center gap-2 rounded-full bg-white px-8 text-base font-medium text-black transition-colors hover:bg-white/90"
                    >
                      Ir al dashboard
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setAuthModal("login")}
                      className="group flex h-14 items-center gap-2 rounded-full bg-white px-8 text-base font-medium text-black transition-colors hover:bg-white/90"
                    >
                      Acceder al sistema
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  )}
                  {!authenticated && (
                    <button
                      onClick={() => setAuthModal("register")}
                      className="flex h-14 items-center rounded-full border border-white/20 px-8 text-base text-ink transition-colors hover:bg-white/5"
                    >
                      Crear cuenta
                    </button>
                  )}
                </div>

                <p className="mt-8 max-w-xl font-mono text-xs leading-relaxed text-muted">
                  Herramienta educativa y de apoyo: no constituye asesoramiento
                  financiero profesional.
                </p>
              </div>

              {/* Puente del template, pegado al borde inferior derecho */}
              <div className="-mr-16 hidden h-[520px] w-[480px] items-end justify-center lg:flex">
                <img
                  src="/landing/bridge.png"
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-contain object-bottom"
                />
              </div>
            </div>
          </div>

          {/* Esquinas decorativas */}
          <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-white/10" />
          <div className="absolute bottom-0 left-0 h-32 w-32 border-r border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}
