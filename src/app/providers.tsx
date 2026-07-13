"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/lib/api";

/** Rutas donde un 401 NO debe redirigir: la landing (el login es un modal
 *  ahí — un intento fallido devuelve 401 y debe mostrarse en el form) y los
 *  stubs de compatibilidad. */
const SKIP_401_PATHS = ["/", "/login", "/register"];

/** Sesión vencida a mitad de uso: cualquier 401 manda a la landing con el
 *  modal de login abierto. */
function redirectOn401(err: unknown) {
  if (
    err instanceof ApiError &&
    err.status === 401 &&
    typeof window !== "undefined" &&
    !SKIP_401_PATHS.includes(window.location.pathname)
  ) {
    window.location.assign("/?auth=login");
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: redirectOn401 }),
        mutationCache: new MutationCache({ onError: redirectOn401 }),
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
