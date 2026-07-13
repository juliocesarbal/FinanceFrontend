/** Cáscara de la app con guardia de sesión y navegación responsive. */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

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
  const [navigationOpen, setNavigationOpen] = useState(false);

  const isLanding = pathname === LANDING_ROUTE;
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const authenticated = session.data?.authenticated === true;

  useEffect(() => {
    if (session.isPending || isLanding) return;
    if (!authenticated && !isAuthRoute) router.replace("/?auth=login");
    else if (authenticated && isAuthRoute) router.replace("/dashboard");
  }, [session.isPending, authenticated, isAuthRoute, isLanding, router]);

  useEffect(() => setNavigationOpen(false), [pathname]);

  if (isLanding) return <>{children}</>;

  if (isAuthRoute) {
    return <main className="flex min-h-screen items-center justify-center px-4 py-8">{children}</main>;
  }

  if (session.isPending || !authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted" role="status" aria-live="polite">
        <Spinner className="size-5" />
        {session.isError ? "No se pudo consultar la sesión. ¿Está corriendo el backend?" : "Verificando sesión…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <a href="#contenido-principal" className="fixed left-3 top-3 z-50 -translate-y-20 rounded-lg bg-s1 px-3 py-2 font-semibold text-ink transition-transform focus:translate-y-0">
        Saltar al contenido
      </a>
      <Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      <div className="min-w-0 md:pl-64">
        <Topbar onMenu={() => setNavigationOpen(true)} />
        <main id="contenido-principal" tabIndex={-1} className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-line px-4 py-4 text-center text-xs leading-relaxed text-muted sm:px-6">
          {DISCLAIMER}
        </footer>
      </div>
    </div>
  );
}
