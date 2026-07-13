import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";

import { Providers } from "./providers";
import "./globals.css";

/* Tipografías de la landing (estilo COMPUTE): serif display + mono técnica.
 * El dashboard sigue en la sans del sistema (--font-sans en globals.css). */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Finance — Radar de inversiones",
  description:
    "Dashboard del Sistema Inteligente de Análisis, Simulación y Descubrimiento de Inversiones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
