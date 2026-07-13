/** Marquee doble de los módulos del sistema, en serif gigante:
 *  una fila llena y una fila en outline, en direcciones opuestas. */
"use client";

const MODULES = [
  "Dashboard",
  "Mercado",
  "Recomendaciones",
  "Cartera",
  "Simulador",
  "Noticias",
  "Descubrimiento",
  "Riesgo",
  "Fundamentales",
  "Consenso",
];

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  const items = [...MODULES, ...MODULES];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex shrink-0 items-center gap-12 pr-12 ${
          reverse ? "marquee-reverse" : "marquee"
        }`}
      >
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className={`whitespace-nowrap font-display text-5xl tracking-tight lg:text-7xl ${
              outline ? "text-stroke text-white/40" : "text-white/80"
            }`}
          >
            {name}
            <span className="ml-12 inline-block h-2 w-2 rounded-full bg-[#eca8d6]/60 align-middle" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function ModulesMarquee() {
  return (
    <section id="modulos" className="overflow-hidden border-y border-white/10 bg-black py-16 lg:py-20">
      <div className="space-y-8">
        <Row />
        <Row reverse outline />
      </div>
    </section>
  );
}
