/** Modal de login/registro sobre la landing: backdrop translúcido con blur
 *  (la landing queda visible detrás) y tarjeta vidriosa. Se abre desde los
 *  botones de la landing o por deep-link ?auth=login|register. */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Field, Input } from "@/components/ui/forms";
import { ErrorBox } from "@/components/ui/primitives";
import { useLogin, useRegister, useSession } from "@/lib/queries";
import { useUiStore } from "@/lib/store";

function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || login.isPending) return;
    login.mutate({ email: email.trim(), password });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Correo electrónico">
        <Input
          type="email"
          autoComplete="email"
          autoFocus
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

      <button
        type="submit"
        disabled={login.isPending}
        className="h-12 w-full rounded-full bg-white text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {login.isPending ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

function RegisterForm() {
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
    <form onSubmit={submit} className="space-y-4">
      <Field label="Correo electrónico">
        <Input
          type="email"
          autoComplete="email"
          autoFocus
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

      <button
        type="submit"
        disabled={register.isPending || mismatch}
        className="h-12 w-full rounded-full bg-white text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {register.isPending ? "Creando cuenta…" : "Registrarme"}
      </button>
    </form>
  );
}

function AuthModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authModal = useUiStore((s) => s.authModal);
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const session = useSession();
  const authenticated = session.data?.authenticated === true;

  // Deep-link: /?auth=login|register abre el modal.
  useEffect(() => {
    const q = searchParams.get("auth");
    if (q === "login" || q === "register") setAuthModal(q);
  }, [searchParams, setAuthModal]);

  const close = () => {
    setAuthModal(null);
    if (searchParams.get("auth")) router.replace("/", { scroll: false });
  };

  // Con sesión iniciada (login/registro exitoso o deep-link ya logueado):
  // cerrar y entrar al sistema.
  useEffect(() => {
    if (authenticated && authModal) {
      setAuthModal(null);
      router.push("/dashboard");
    }
  }, [authenticated, authModal, setAuthModal, router]);

  // Bloquear el scroll de la landing y cerrar con Escape.
  useEffect(() => {
    if (!authModal) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModal]);

  if (!authModal) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={authModal === "login" ? "Iniciar sesión" : "Crear cuenta"}
    >
      {/* Backdrop translúcido: la landing sigue visible detrás */}
      <button
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-surface-0/75 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-lg text-white">FINANCE</span>
            <span className="font-mono text-[10px] text-white/50">radar</span>
          </span>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          <h2 className="mb-1 font-display text-3xl tracking-tight">
            {authModal === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p className="mb-6 text-xs text-muted">
            {authModal === "login"
              ? "Accedé a tus carteras, simulaciones y señales."
              : "Tus carteras y simulaciones quedan asociadas a tu correo."}
          </p>

          {authModal === "login" ? <LoginForm /> : <RegisterForm />}

          <p className="mt-6 text-center text-xs text-muted">
            {authModal === "login" ? (
              <>
                ¿No tenés cuenta?{" "}
                <button
                  onClick={() => setAuthModal("register")}
                  className="text-s1 hover:underline"
                >
                  Creá una
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{" "}
                <button
                  onClick={() => setAuthModal("login")}
                  className="text-s1 hover:underline"
                >
                  Iniciá sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
