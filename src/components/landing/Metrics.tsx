/** Métricas en vivo: reloj + badge LIVE, contadores animados con datos
 *  reales de la API pública (activos, ranking, noticias) y dot-graphs. */
"use client";

import { useEffect, useRef, useState } from "react";

import { useAssets, useNews, useRanking } from "@/lib/queries";

import { DotGraph, GridDots } from "./canvases";

function AnimatedNumber({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [scrambling, setScrambling] = useState(true);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    animatedRef.current = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animatedRef.current) return;
        animatedRef.current = true;
        const duration = 2000;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(eased * end));
          setScrambling(progress < 0.8);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <span className="num">
        {count.toLocaleString("es-AR").split("").map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-all duration-150 ${
              scrambling && char !== "." ? "blur-[1px]" : ""
            }`}
          >
            {char}
          </span>
        ))}
      </span>
      <span className="text-muted">{suffix}</span>
    </span>
  );
}

export function Metrics() {
  const [time, setTime] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const assets = useAssets();
  const ranking = useRanking();
  const news = useNews({ days: 30, limit: 100 });

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const metrics = [
    {
      count: assets.data?.length,
      suffix: "",
      label: "Activos en el universo",
      sublabel: "acciones, ETFs y cripto seguidos",
      accent: false,
      big: true,
    },
    {
      count: ranking.data?.length,
      suffix: "",
      label: "Señales en el ranking",
      sublabel: "con score mecánico vigente",
      accent: true,
      big: false,
    },
    {
      count: news.data?.length,
      suffix: news.data?.length === 100 ? "+" : "",
      label: "Noticias analizadas",
      sublabel: "últimos 30 días · sentimiento e impacto",
      accent: false,
      big: false,
    },
  ];

  return (
    <section
      id="metricas"
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-36"
    >
      <GridDots />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex items-center gap-2 bg-[#eca8d6]/10 px-3 py-1 font-mono text-xs text-[#eca8d6]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#eca8d6]" />
              EN VIVO
            </span>
            <span className="num font-mono text-sm text-muted">
              {time ? time.toLocaleTimeString("es-AR") : ""}
            </span>
          </div>

          <h2
            className={`font-display text-6xl leading-[0.95] tracking-tight transition-all duration-1000 md:text-7xl lg:text-[110px] ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            Datos vivos
            <br />
            <span className="text-muted">del sistema.</span>
          </h2>
        </div>

        {/* Gráfico orgánico del template, ancho completo */}
        <div
          className={`mb-10 w-full transition-all delay-200 duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src="/landing/graph.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`flex flex-col justify-between gap-6 border border-white/10 bg-white/[0.02] p-8 transition-all duration-700 lg:p-10 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-full">
                <div className="mb-2 font-mono text-sm text-muted">{metric.sublabel}</div>
                <div className="mb-4 text-base text-ink">{metric.label}</div>
                <DotGraph
                  accent={metric.accent}
                  height={metric.big ? 36 : 26}
                  freq1={metric.accent ? 0.45 : 0.26}
                  freq2={metric.accent ? 0.16 : 0.08}
                  speed={metric.accent ? 0.03 : 0.016}
                />
              </div>
              <div className="w-full font-display text-5xl tracking-tight lg:text-6xl">
                {metric.count !== undefined ? (
                  <AnimatedNumber end={metric.count} suffix={metric.suffix} />
                ) : (
                  <span className="text-muted">—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ticker de fuentes y tecnologías */}
        <div
          className={`mt-16 flex flex-wrap items-center gap-x-12 gap-y-4 border-t border-white/10 pt-8 font-mono text-sm text-muted transition-all delay-500 duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span>yfinance</span>
          <span>Google News RSS</span>
          <span>Claude · Anthropic</span>
          <span>VADER</span>
          <span>pandas</span>
          <span className="text-ink">PostgreSQL + Django</span>
        </div>
      </div>
    </section>
  );
}
