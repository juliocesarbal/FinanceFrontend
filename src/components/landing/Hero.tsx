/** Hero a pantalla completa: video de fondo del template, titular serif
 *  gigante con palabra rotativa (blur + gradiente) y stats reales abajo. */
"use client";

import { useEffect, useRef, useState } from "react";

import { useAssets, useRanking } from "@/lib/queries";

const WORDS = ["verifican", "explican", "puntúan", "detectan"];
const GRADIENT = ["#eca8d6", "#a78bfa", "#67e8f9", "#fbbf24", "#eca8d6"];

function BlurWord({ word, trigger }: { word: string; trigger: number }) {
  const letters = word.split("");
  const STAGGER = 45;
  const DURATION = 500;
  const HOLD = STAGGER * letters.length + DURATION + 200;

  const [states, setStates] = useState<{ opacity: number; blur: number }[]>(
    letters.map(() => ({ opacity: 0, blur: 20 })),
  );
  const [showGradient, setShowGradient] = useState(true);
  const framesRef = useRef<number[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    framesRef.current.forEach(cancelAnimationFrame);
    timersRef.current.forEach(clearTimeout);
    framesRef.current = [];
    timersRef.current = [];

    setStates(letters.map(() => ({ opacity: 0, blur: 20 })));
    setShowGradient(true);

    letters.forEach((_, i) => {
      const t = setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setStates((prev) => {
            const next = [...prev];
            next[i] = { opacity: eased, blur: 20 * (1 - eased) };
            return next;
          });
          if (progress < 1) framesRef.current.push(requestAnimationFrame(tick));
        };
        framesRef.current.push(requestAnimationFrame(tick));
      }, i * STAGGER);
      timersRef.current.push(t);
    });

    const gt = setTimeout(() => setShowGradient(false), HOLD);
    timersRef.current.push(gt);

    return () => {
      framesRef.current.forEach(cancelAnimationFrame);
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const hex2rgb = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  return (
    <>
      {letters.map((char, i) => {
        const pos = (i / Math.max(letters.length - 1, 1)) * (GRADIENT.length - 1);
        const lower = Math.floor(pos);
        const upper = Math.min(lower + 1, GRADIENT.length - 1);
        const t = pos - lower;
        const [r1, g1, b1] = hex2rgb(GRADIENT[lower]);
        const [r2, g2, b2] = hex2rgb(GRADIENT[upper]);
        const rgb = `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;

        return (
          <span
            key={`${trigger}-${i}`}
            style={{
              display: "inline-block",
              opacity: states[i]?.opacity ?? 0,
              filter: `blur(${states[i]?.blur ?? 20}px)`,
              color: showGradient ? rgb : "white",
              transition: "color 0.4s ease",
            }}
          >
            {char}
          </span>
        );
      })}
    </>
  );
}

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const assets = useAssets();
  const ranking = useRanking();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      value: assets.data?.length ? String(assets.data.length) : "10+",
      label: "activos monitoreados en el universo",
    },
    {
      value: ranking.data?.length ? String(ranking.data.length) : "2",
      label: ranking.data?.length
        ? "señales activas en el ranking"
        : "etapas de análisis: score mecánico + agente IA",
    },
    { value: "A+–E", label: "confiabilidad calculada para cada evidencia" },
  ];

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-black">
      {/* Fondo: video del template (copiado a /public/landing) + degradados */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-80"
        >
          <source src="/landing/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Grilla sutil */}
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-white/10"
            style={{ top: `${12.5 * (i + 1)}%` }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute bottom-0 top-0 w-px bg-white/10"
            style={{ left: `${8.33 * (i + 1)}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-32 lg:px-12 lg:py-40">
        <div className="lg:max-w-[62%]">
          <div
            className={`mb-8 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-3 font-mono text-sm text-white/60">
              <span className="h-px w-8 bg-white/30" />
              Sistema inteligente de análisis de inversiones
            </span>
          </div>

          <h1
            className={`font-display text-left text-[clamp(2.6rem,7vw,7rem)] leading-[0.92] tracking-tight text-white transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <span className="block whitespace-nowrap">Datos que deciden,</span>
            <span className="block whitespace-nowrap">
              agentes que{" "}
              <span className="relative inline-block">
                <BlurWord word={WORDS[wordIndex]} trigger={wordIndex} />
              </span>
            </span>
          </h1>

          <p
            className={`mt-10 max-w-xl text-lg leading-relaxed text-white/60 transition-all delay-300 duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Precios, fundamentales, noticias y consenso en un solo pipeline: un
            score mecánico transparente sobre todo el universo y un agente con IA
            que verifica el top con evidencia citada.
          </p>
        </div>
      </div>

      {/* Stats al pie */}
      <div
        className={`absolute bottom-12 left-0 right-0 px-6 transition-all delay-500 duration-700 lg:px-12 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-start gap-10 lg:gap-20">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span className="font-display text-3xl text-white lg:text-4xl">
                {stat.value}
              </span>
              <span className="max-w-[180px] text-xs leading-tight text-white/50">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
