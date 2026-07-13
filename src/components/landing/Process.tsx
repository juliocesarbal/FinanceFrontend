/** Proceso: el pipeline real en dos etapas (sección 5.3) como pasos
 *  clickeables con auto-avance y barra de progreso rosa. */
"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    number: "01",
    title: "Ingerir",
    subtitle: "los datos",
    description:
      "Precios OHLCV e indicadores técnicos vía yfinance, noticias de Google News RSS clasificadas con sentimiento, estados contables, consenso de analistas y métricas de riesgo — todo persistido con su evidencia.",
  },
  {
    number: "02",
    title: "Puntuar",
    subtitle: "todo el universo",
    description:
      "El score mecánico 0–100 corre sobre todos los activos con una fórmula fija: barato, rápido y transparente. Cada señal usa lenguaje prudente y muestra su desglose completo.",
  },
  {
    number: "03",
    title: "Verificar",
    subtitle: "con el agente",
    description:
      "Solo el top del ranking escala al agente con IA: costo acotado por diseño. El agente investiga con herramientas, cita únicamente evidencia que vio y su divergencia con el score mecánico queda visible.",
  },
];

export function Process() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="proceso"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#111113] py-24 text-white lg:py-32"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Encabezado: título a la izquierda, árbol apoyado sobre los pasos */}
        <div className="relative grid items-end gap-4 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden pb-0 lg:pb-24">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <span className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-white/40">
                <span className="h-px w-12 bg-white/20" />
                Proceso — dos etapas, costo acotado
              </span>
            </div>

            <h2
              className={`font-display text-6xl leading-[0.85] tracking-tight transition-all delay-100 duration-1000 md:text-7xl lg:text-[110px] ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
              }`}
            >
              <span className="block">Ingerir.</span>
              <span className="block text-white/30">Puntuar.</span>
              <span className="block text-white/10">Verificar.</span>
            </h2>
          </div>

          <div
            className={`relative h-[300px] overflow-hidden transition-all delay-200 duration-1000 lg:h-[560px] ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="/landing/tree.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-full w-full object-contain object-bottom"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#111113] via-transparent to-transparent" />
          </div>
        </div>

        <div className="grid gap-4 pt-8 lg:grid-cols-3 lg:pt-0">
          {STEPS.map((step, index) => (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`relative border bg-black p-8 text-left transition-all duration-500 lg:p-12 ${
                activeStep === index
                  ? "border-white/60"
                  : "border-white/20 hover:border-white/50"
              }`}
            >
              <div className="mb-8 flex items-center gap-4">
                <span
                  className={`font-display text-4xl transition-colors duration-300 ${
                    activeStep === index ? "text-[#eca8d6]" : "text-white/20"
                  }`}
                >
                  {step.number}
                </span>
                <div className="h-px flex-1 overflow-hidden bg-white/10">
                  {activeStep === index && (
                    <div className="animate-step-progress h-full bg-[#eca8d6]/50" />
                  )}
                </div>
              </div>

              <h3 className="mb-1 font-display text-3xl lg:text-4xl">{step.title}</h3>
              <span className="mb-6 block font-display text-xl text-white/40">
                {step.subtitle}
              </span>

              <p
                className={`text-sm leading-relaxed text-white/60 transition-opacity duration-300 ${
                  activeStep === index ? "opacity-100" : "opacity-60"
                }`}
              >
                {step.description}
              </p>

              <div
                className={`absolute bottom-0 left-0 right-0 h-1 origin-left bg-[#eca8d6] transition-transform duration-500 ${
                  activeStep === index ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
