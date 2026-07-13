"use client";

import Link from "next/link";
import { useState } from "react";

import { Field, Input } from "@/components/ui/forms";
import { Button, ErrorBox } from "@/components/ui/primitives";
import { DISCLAIMER } from "@/lib/meta";
import { useRegister } from "@/lib/queries";

export default function RegisterPage() {
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || password !== confirm || register.isPending) return;
    register.mutate({ email: email.trim(), password });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold tracking-tight">Crear cuenta</h1>
        <p className="mt-1 text-xs text-muted">
          Tus carteras y simulaciones quedan asociadas a tu correo.
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
        <Field label="Contraseña" hint="Mínimo 8 caracteres; no puede ser solo números.">
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Field label="Repetir contraseña">
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        {mismatch && (
          <p className="text-xs text-critical-text">Las contraseñas no coinciden.</p>
        )}
        {register.isError && <ErrorBox error={register.error} />}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={register.isPending || mismatch}
        >
          {register.isPending ? "Creando cuenta…" : "Registrarme"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-s1 hover:underline">
          Iniciá sesión
        </Link>
      </p>
      <p className="mt-6 text-center text-[10px] leading-snug text-muted">{DISCLAIMER}</p>
    </div>
  );
}
