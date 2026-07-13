/** Cáscara de la app con guardia de sesión: exige login para todo el
 *  dashboard; /login y /register se renderizan sin cromo y sin sesión. */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/primitives";
import { DISCLAIMER } from "@/lib/meta";
import { useSession } from "@/lib/queries";

const AUTH_ROUTES = new Set(["/login", "/register"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const authenticated = session.data?.authenticated === true;

  useEffect(() => {
    if (session.isPending) return;
    if (!authenticated && !isAuthRoute) router.replace("/login");
    else if (authenticated && isAuthRoute) router.replace("/");
  }, [session.isPending, authenticated, isAuthRoute, router]);

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
