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
  title: {
    default: "Finance — Radar de inversiones",
    template: "%s | Finance",
  },
  description:
    "Sistema inteligente de análisis, simulación y descubrimiento de inversiones.",
};

export const viewport = {
  themeColor: "#090b0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-surface-0">
      <body className={`${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
