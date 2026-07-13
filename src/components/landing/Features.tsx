/** Capacidades: tarjeta grande numerada con partículas + grilla de tres,
 *  con los pilares reales del sistema (secciones 5.1, 5.2, 4.5-4.9). */
"use client";

import { useEffect, useRef, useState } from "react";

import { ParticleField } from "./canvases";

const FEATURES = [
  {
    number: "02",
    title: "Agente de verificación con IA",
    description:
      "Un agente revisa el top del ranking: cruza técnico, fundamentos, noticias y consenso, detecta contradicciones y cita evidencia con confiabilidad A+–E. Su veredicto nunca pisa al score mecánico — la divergencia entre ambos es una señal en sí misma.",
    stat: { value: "A+–E", label: "confiabilidad de cada evidencia" },
  },
  {
    number: "03",
    title: "Cartera y riesgo",
    description:
      "Valorización con P/L por posición, concentración HHI, exposición cripto y tecnología, y sugerencias de rebalanceo por desvío del peso objetivo.",
    stat: { value: "HHI", label: "concentración medida" },
  },
  {
    number: "04",
    title: "Simulación y backtesting",
    description:
      "Aportes proyectados en escenarios optimista, medio y pesimista, y backtesting de cruce de medias con curva de equity. Estimaciones hipotéticas, jamás garantías.",
    stat: { value: "3", label: "escenarios por simulación" },
  },
];

export function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="capacidades"
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Encabezado */}
        <div className="relative mb-20 lg:mb-28">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted">
                <span className="h-px w-12 bg-white/30" />
                Capacidades
              </span>
              <h2
                className={`font-display text-6xl leading-[0.9] tracking-tight transition-all duration-1000 md:text-7xl lg:text-[110px] ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                Análisis
                <br />
                <span className="text-muted">explicable.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p
                className={`text-xl leading-relaxed text-muted transition-all delay-200 duration-1000 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                Nada se recomienda sin poder auditarse: cada score muestra su
                desglose, sus motivos, sus riesgos y sus fuentes.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta grande: score mecánico (partículas + imagen espejada) */}
        <div
          className={`group relative mb-4 flex min-h-[460px] overflow-hidden border border-white/10 bg-black transition-all duration-700 lg:mb-6 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="relative flex-1 bg-black p-8 lg:p-12">
            <ParticleField count={60} />
            <div className="relative z-10">
              <span className="font-mono text-sm text-muted">01</span>
              <h3 className="mb-6 mt-4 font-display text-3xl transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
                Score mecánico transparente
              </h3>
              <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted">
                Cada activo se puntúa de 0 a 100 combinando análisis técnico,
                fundamental (5 bloques de ratios + DCF), noticias con sentimiento,
                riesgo y consenso de analistas. Fórmula fija y auditable sobre todo
                el universo: cambiarla es una decisión explícita, no un accidente.
              </p>
              <div>
                <span className="font-display text-5xl lg:text-6xl">0–100</span>
                <span className="mt-2 block font-mono text-sm text-muted">
                  score con desglose por componente
                </span>
              </div>
            </div>
          </div>

          {/* Imagen espejada a la derecha, altura completa (como el template) */}
          <div className="relative hidden w-[42%] shrink-0 overflow-hidden lg:block">
            <img
              src="/landing/workers.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
          </div>
        </div>

        {/* Tres tarjetas */}
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.number}
              className={`group border border-white/10 bg-white/[0.02] p-8 transition-all duration-700 hover:border-white/25 lg:p-10 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${(i + 1) * 120}ms` }}
            >
              <span className="font-mono text-sm text-muted">{feature.number}</span>
              <h3 className="mb-4 mt-4 font-display text-2xl transition-transform duration-500 group-hover:translate-x-1 lg:text-3xl">
                {feature.title}
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
              <div>
                <span className="font-display text-4xl">{feature.stat.value}</span>
                <span className="mt-1 block font-mono text-xs text-muted">
                  {feature.stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
