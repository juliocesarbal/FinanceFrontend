/**
 * Tipos que espejan los esquemas de Django Ninja del backend Finance
 * (apps market, news, fundamentals, portfolio, simulation, risk,
 * recommendation, experts, discovery). Mantener sincronizado con
 * /api/docs del backend.
 */

// ---------------------------------------------------------------- market
export type AssetType =
  | "stock"
  | "index"
  | "etf"
  | "crypto"
  | "bond"
  | "commodity";

export interface Asset {
  id: number;
  ticker: string;
  name: string;
  asset_type: AssetType;
  sector: string;
  country: string;
  currency: string;
  exchange: string;
  is_active: boolean;
}

export interface AssetIn {
  ticker: string;
  name?: string;
  asset_type?: AssetType;
  sector?: string;
  country?: string;
  currency?: string;
  exchange?: string;
  description?: string;
}

export interface PricePoint {
  datetime: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface IndicatorRow {
  datetime: string;
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;
  volatility: number | null;
  relative_volume: number | null;
}

export interface TechnicalSnapshot {
  score: number;
  price: number;
  signals: string[];
  support: number | null;
  resistance: number | null;
  indicators: Record<string, number | null>;
}

// ---------------------------------------------------------------- news
export type NewsCategory =
  | "earnings"
  | "products"
  | "regulation"
  | "legal"
  | "mna"
  | "management"
  | "contracts"
  | "geopolitics"
  | "technology"
  | "other";

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: NewsCategory;
  sentiment: number;
  sentiment_label: SentimentLabel;
  impact_score: number;
  published_at: string | null;
  reliability_level: string | null;
  reliability_score: number | null;
}

export interface NewsDigest {
  ticker: string;
  days: number;
  news_score: number;
  item_count: number;
  top_items: NewsItem[];
}

export interface IngestResult {
  created: number;
  detail: string;
}

// ---------------------------------------------------------------- fundamentals
export interface Ratios {
  ticker: string;
  as_of: string;
  price_used: number | null;
  // Bloque 1 — múltiplos de precio
  per: number | null;
  forward_per: number | null;
  peg: number | null;
  price_to_book: number | null;
  price_to_sales: number | null;
  dividend_yield: number | null; // fracción (0.05 = 5 %)
  fcf_yield: number | null; // fracción
  // Bloque 2 — enterprise value
  enterprise_value: number | null;
  ev_ebitda: number | null;
  ev_ebit: number | null;
  ev_fcf: number | null;
  ev_sales: number | null;
  // Bloque 3 — rentabilidad (fracciones)
  roe: number | null;
  roa: number | null;
  roic: number | null;
  gross_margin: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  // Bloque 4 — liquidez y solvencia
  current_ratio: number | null;
  quick_ratio: number | null;
  net_debt_to_ebitda: number | null;
  interest_coverage: number | null;
  debt_to_equity: number | null;
  // Bloque 5 — valoración intrínseca
  wacc: number | null;
  dcf_fair_value: number | null;
  dcf_upside: number | null; // fracción
  dcf_assumptions: Record<string, unknown>;
  fundamental_score: number | null;
}

export interface Statement {
  statement_type: string;
  period_ending: string;
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------- portfolio
export interface Portfolio {
  id: number;
  name: string;
  base_currency: string;
  created_at: string;
}

export interface Position {
  id: number;
  ticker: string;
  asset_name: string;
  asset_type: AssetType;
  quantity: number;
  average_price: number;
  fees: number;
  currency: string;
  purchased_at: string | null;
  target_weight: number | null;
  current_price: number | null;
  current_value: number | null;
  weight: number | null;
  profit_loss: number | null;
  profit_loss_pct: number | null;
}

export interface PortfolioDetail {
  id: number;
  name: string;
  base_currency: string;
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_pct: number | null;
  positions: Position[];
}

export interface PositionIn {
  ticker: string;
  quantity: number;
  average_price: number;
  fees?: number;
  currency?: string;
  purchased_at?: string | null;
  target_weight?: number | null;
}

export interface PositionUpdateIn {
  quantity?: number;
  average_price?: number;
  fees?: number;
  target_weight?: number | null;
}

export interface RebalanceSuggestion {
  ticker: string;
  current_weight: number;
  target_weight: number;
  delta_pct: number;
  action: string;
  approx_amount: number;
}

export interface Rebalance {
  portfolio_id: number;
  total_value: number;
  suggestions: RebalanceSuggestion[];
  warning: string | null;
}

export interface Concentration {
  by_asset: Record<string, number>;
  by_sector: Record<string, number>;
  by_country: Record<string, number>;
  by_type: Record<string, number>;
  hhi: number | null;
  crypto_exposure_pct: number;
  tech_exposure_pct: number;
  emerging_exposure_pct: number;
}

// ---------------------------------------------------------------- simulation
export interface SimulationIn {
  initial_capital: number;
  monthly_contribution?: number;
  years: number;
  expected_return?: number;
  volatility?: number;
  scenario_name?: string;
  ticker?: string | null;
  portfolio_id?: number | null;
  persist?: boolean;
}

export interface Scenario {
  annual_return_used: number;
  final_value: number;
  gain: number;
  cumulative_return_pct: number;
  approx_annualized_return_pct: number | null;
}

export type ScenarioKey = "pesimista" | "medio" | "optimista";

export interface SimulationResult {
  initial_capital: number;
  monthly_contribution: number;
  years: number;
  expected_return: number;
  volatility: number;
  total_contributed: number;
  scenarios: Record<ScenarioKey, Scenario>;
  disclaimer: string;
  simulation_id: number | null;
}

export interface BacktestIn {
  ticker: string;
  fast?: number;
  slow?: number;
  initial_capital?: number;
  persist?: boolean;
}

export interface BacktestResult {
  strategy: string;
  params: Record<string, unknown>;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_value: number;
  total_return_pct: number;
  cagr_pct: number;
  volatility_pct: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  sharpe_ratio: number;
  profit_factor: number | null;
  num_trades: number;
  equity_curve: [string, number][];
  disclaimer: string;
  backtest_id: number | null;
}

// ---------------------------------------------------------------- risk
export interface AssetRisk {
  ticker: string;
  volatility_annual: number | null;
  max_drawdown: number | null;
  beta: number | null;
  correlations: Record<string, number>;
  risk_score: number | null;
  notes: string[];
}

// ---------------------------------------------------------------- recommendation
export type Signal =
  | "strong_buy"
  | "moderate_buy"
  | "hold"
  | "high_risk"
  | "avoid";

export interface EvidenceSource {
  id: number;
  source_name: string;
  source_type: string;
  url: string;
  reliability_level: string;
  reliability_score: number;
  published_at: string | null;
  retrieved_at: string;
}

export interface Recommendation {
  id: number;
  ticker: string;
  signal: Signal;
  score: number;
  technical_score: number | null;
  news_score: number | null;
  fundamental_score: number | null;
  risk_score: number | null;
  explanation: string;
  risks: string;
  created_at: string;
  evidence_sources: EvidenceSource[];
}

export interface AgentReview {
  id: number;
  ticker: string;
  mechanical_score: number;
  agent_score: number;
  divergence: number;
  confidence: number;
  signal: Signal;
  justification: string;
  contradictions_detected: string[];
  model_used: string;
  created_at: string;
  evidence_sources: EvidenceSource[];
}

export interface RankingItem {
  ticker: string;
  name: string;
  asset_type: AssetType;
  mechanical_score: number;
  mechanical_signal: Signal;
  agent_score: number | null;
  agent_signal: Signal | null;
  agent_confidence: number | null;
  divergence: number | null;
  contradictions: string[] | null;
  scored_at: string;
}

export interface ScoringRun {
  scored: number;
  errors: number;
  escalated: string[];
  /** Aviso del backend, p. ej. etapa 2 omitida por broker Celery caído. */
  note: string | null;
  ranking: Record<string, unknown>[];
}

// ---------------------------------------------------------------- experts
export interface Consensus {
  ticker: string;
  as_of: string;
  source: string;
  strong_buy: number;
  buy: number;
  hold: number;
  sell: number;
  strong_sell: number;
  total_analysts: number;
  mean_target: number | null;
  high_target: number | null;
  low_target: number | null;
  median_target: number | null;
  current_price: number | null;
  rating_mean: number | null;
  dispersion: number | null;
  change_alert: string;
}

export interface Expert {
  id: number;
  name: string;
  firm: string;
  credentials: string;
  regulator_registry: string;
  registry_url: string;
  verified: boolean;
  verification_notes: string;
}

// ---------------------------------------------------------------- discovery
export interface Topic {
  id: number;
  name: string;
  query: string;
  category: string;
  mention_count: number;
  momentum: number;
  last_scanned_at: string | null;
  is_active: boolean;
}

export interface OpportunityReport {
  id: number;
  name: string;
  opportunity_type: string;
  score: number;
  /** El backend guarda {weights: {...}, features: {...}} (sección 13). */
  score_breakdown: Record<string, unknown>;
  risk_level: string;
  horizon: string;
  thesis: string;
  risks: string;
  conclusion: string;
  related_tickers: string[];
  created_at: string;
}

export interface DiscoveryRun {
  scanned: number;
  errors: number;
  reports: Record<string, unknown>[];
}

// ---------------------------------------------------------------- health
export interface Health {
  status: "ok" | "degraded";
  database: boolean;
  cache: boolean;
  yfinance_rate_limit_errors: number;
}

// ---------------------------------------------------------------- auth
export interface User {
  id: number;
  email: string;
}

export interface SessionInfo {
  authenticated: boolean;
  user: User | null;
}

export interface CredentialsIn {
  email: string;
  password: string;
}
