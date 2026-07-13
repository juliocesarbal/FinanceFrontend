"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/lib/api";

const AUTH_PATHS = ["/login", "/register"];

/** Sesión vencida a mitad de uso: cualquier 401 manda al login
 *  (salvo que ya estemos ahí, p. ej. un login con credenciales malas). */
function redirectOn401(err: unknown) {
  if (
    err instanceof ApiError &&
    err.status === 401 &&
    typeof window !== "undefined" &&
    !AUTH_PATHS.includes(window.location.pathname)
  ) {
    window.location.assign("/login");
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
