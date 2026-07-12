/** Controles de formulario con el estilo del tema. */
"use client";

import type { ReactNode } from "react";

const FIELD_CLS =
  "w-full rounded-lg border border-baseline bg-surface-0 px-2.5 py-1.5 text-sm text-ink " +
  "placeholder:text-muted focus:border-s1 focus:outline-none focus:ring-1 focus:ring-s1/50 " +
  "disabled:opacity-60";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${FIELD_CLS} ${className}`} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select className={`${FIELD_CLS} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}
