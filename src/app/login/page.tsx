"use client";

import Link from "next/link";
import { useState } from "react";

import { Field, Input } from "@/components/ui/forms";
import { Button, ErrorBox } from "@/components/ui/primitives";
import { DISCLAIMER } from "@/lib/meta";
import { useLogin } from "@/lib/queries";

export default function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || login.isPending) return;
    login.mutate({ email: email.trim(), password });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold tracking-tight">Finance — Radar de inversiones</h1>
        <p className="mt-1 text-xs text-muted">
          Iniciá sesión para ver tus carteras y simulaciones.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-3 rounded-xl border border-line bg-surface-1 p-5"
      >
        <Field label="Correo electrónico">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
          />
        </Field>
        <Field label="Contraseña">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        {login.isError && <ErrorBox error={login.error} />}

        <Button type="submit" variant="primary" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Ingresando…" : "Iniciar sesión"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-s1 hover:underline">
          Creá una
        </Link>
      </p>
      <p className="mt-6 text-center text-[10px] leading-snug text-muted">{DISCLAIMER}</p>
    </div>
  );
}
