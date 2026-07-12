import type { Metadata } from "next";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DISCLAIMER } from "@/lib/meta";

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
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 md:px-6">
                {children}
              </main>
              <footer className="border-t border-grid px-4 py-3 text-center text-[11px] text-muted md:px-6">
                {DISCLAIMER}
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
