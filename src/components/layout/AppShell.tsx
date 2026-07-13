/** Cáscara de la app con guardia de sesión.
 *  - "/" es la landing pública: se renderiza sin cromo y sin exigir sesión.
 *  - /login y /register se renderizan centradas; con sesión redirigen a /dashboard.
 *  - Todo lo demás exige sesión y lleva el cromo (sidebar + topbar). */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/primitives";
import { DISCLAIMER } from "@/lib/meta";
import { useSession } from "@/lib/queries";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const LANDING_ROUTE = "/";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const isLanding = pathname === LANDING_ROUTE;
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const authenticated = session.data?.authenticated === true;

  useEffect(() => {
    if (session.isPending || isLanding) return;
    // Sin sesión: a la landing con el modal de login abierto.
    if (!authenticated && !isAuthRoute) router.replace("/?auth=login");
    else if (authenticated && isAuthRoute) router.replace("/dashboard");
  }, [session.isPending, authenticated, isAuthRoute, isLanding, router]);

  // Landing: página completa, maneja su propio layout y footer.
  if (isLanding) {
    return <>{children}</>;
  }

  if (isAuthRoute) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        {children}
      </main>
    );
  }

  if (session.isPending || !authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted">
        <Spinner className="h-5 w-5" />
        {session.isError
          ? "No se pudo consultar la sesión. ¿Está corriendo el backend?"
          : "Verificando sesión…"}
      </div>
    );
  }

  return (
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
  );
}
