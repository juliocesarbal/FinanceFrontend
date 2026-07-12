/**
 * Metadatos de dominio: etiquetas en español y tonos visuales para señales,
 * categorías, sentimiento, confiabilidad y tipos de activo. Los tonos son
 * los de la paleta de estados (reservada — nunca se usa para series).
 */
import type { AssetType, NewsCategory, SentimentLabel, Signal } from "./types";

export type Tone =
  | "good"
  | "goodTint"
  | "neutral"
  | "info"
  | "warn"
  | "serious"
  | "critical";

export const SIGNAL_META: Record<Signal, { label: string; tone: Tone }> = {
  strong_buy: { label: "Compra fuerte", tone: "good" },
  moderate_buy: { label: "Compra moderada", tone: "goodTint" },
  hold: { label: "Mantener / observar", tone: "neutral" },
  high_risk: { label: "Riesgo alto", tone: "serious" },
  avoid: { label: "Evitar / venta", tone: "critical" },
};

export function signalMeta(signal: string | null | undefined) {
  if (signal && signal in SIGNAL_META) return SIGNAL_META[signal as Signal];
  return { label: signal ?? "—", tone: "neutral" as Tone };
}

/** Bandas de la sección 5.1 del documento. */
export function scoreTone(score: number | null | undefined): Tone {
  if (score === null || score === undefined) return "neutral";
  if (score >= 80) return "good";
  if (score >= 65) return "goodTint";
  if (score >= 50) return "neutral";
  if (score >= 35) return "serious";
  return "critical";
}

export const SENTIMENT_META: Record<SentimentLabel, { label: string; tone: Tone }> = {
  positive: { label: "Positivo", tone: "good" },
  neutral: { label: "Neutral", tone: "neutral" },
  negative: { label: "Negativo", tone: "critical" },
};

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  earnings: "Resultados financieros",
  products: "Nuevos productos",
  regulation: "Regulación",
  legal: "Demandas / investigaciones",
  mna: "Fusiones y adquisiciones",
  management: "Cambios de directiva",
  contracts: "Contratos importantes",
  geopolitics: "Riesgo geopolítico",
  technology: "Innovación tecnológica",
  other: "Otros",
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: "Acción",
  index: "Índice",
  etf: "ETF",
  crypto: "Cripto",
  bond: "Bono / renta fija",
  commodity: "Commodity",
};

export function assetTypeLabel(t: string): string {
  return (ASSET_TYPE_LABELS as Record<string, string>)[t] ?? t;
}

/** Niveles de confiabilidad de fuentes (sección 9): A+ … E. */
export function reliabilityTone(level: string | null | undefined): Tone {
  switch (level) {
    case "A+":
    case "A":
      return "info";
    case "B":
      return "goodTint";
    case "C":
      return "neutral";
    case "D":
      return "serious";
    case "E":
      return "critical";
    default:
      return "neutral";
  }
}

export function riskLevelTone(level: string | null | undefined): Tone {
  const l = (level ?? "").toLowerCase();
  if (l.includes("extremo")) return "critical";
  if (l.includes("muy alto")) return "critical";
  if (l.includes("alto")) return "serious";
  if (l.includes("medio")) return "warn";
  if (l.includes("bajo")) return "good";
  return "neutral";
}

/** Disclaimer central (sección 20) — visible en todo el sitio. */
export const DISCLAIMER =
  "Herramienta educativa y de apoyo: no constituye asesoramiento financiero profesional. Las simulaciones son estimaciones estadísticas hipotéticas, no garantías de rendimiento.";
