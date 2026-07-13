import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance — Radar de inversiones",
  description:
    "Dashboard del Sistema Inteligente de Análisis, Simulación y Descubrimiento de Inversiones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
