/** Controles de formulario consistentes y accesibles. */
"use client";
import type { ReactNode } from "react";
const FIELD_CLS = "min-h-10 w-full rounded-xl border border-line bg-surface-0 px-3 py-2 text-sm text-ink placeholder:text-muted transition-colors hover:border-baseline focus:border-s1 focus:outline-none focus:ring-2 focus:ring-s1/20 disabled:cursor-not-allowed disabled:opacity-60";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { const { className = "", ...rest } = props; return <input className={`${FIELD_CLS} ${className}`} {...rest} />; }
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { const { className = "", children, ...rest } = props; return <select className={`${FIELD_CLS} ${className}`} {...rest}>{children}</select>; }
export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) { return <label className={`flex flex-col gap-1.5 ${className}`}><span className="text-xs font-semibold text-ink-2">{label}</span>{children}{hint ? <span className="text-[11px] leading-relaxed text-muted">{hint}</span> : null}</label>; }
