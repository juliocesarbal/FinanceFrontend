/**
 * Hooks de TanStack Query: un hook por endpoint del backend.
 * Las claves siguen el patrón [dominio, recurso, params].
 */
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api, qs } from "./api";
import { useUiStore } from "./store";
import type {
  AgentReview,
  Asset,
  AssetIn,
  AssetRisk,
  BacktestIn,
  BacktestResult,
  Concentration,
  Consensus,
  CredentialsIn,
  DiscoveryRun,
  Health,
  IndicatorRow,
  IngestResult,
  NewsDigest,
  NewsItem,
  OpportunityReport,
  Portfolio,
  PortfolioDetail,
  PositionIn,
  PositionUpdateIn,
  PricePoint,
  Ratios,
  RankingItem,
  Rebalance,
  Recommendation,
  ScoringRun,
  SessionInfo,
  SimulationIn,
  SimulationResult,
  Statement,
  TechnicalSnapshot,
  Topic,
  User,
} from "./types";

// ---------------------------------------------------------------- auth
const SESSION_KEY = ["session"];

/** Sesión actual. También siembra la cookie CSRF (el backend la setea en /auth/me). */
export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: () => api.get<SessionInfo>("/auth/me"),
    staleTime: 5 * 60_000,
    retry: 0,
  });
}

/** Al entrar o salir un usuario no puede quedar caché del anterior. */
function useResetOnAuthChange() {
  const qc = useQueryClient();
  return (user: User | null) => {
    qc.clear();
    qc.setQueryData(SESSION_KEY, { authenticated: user !== null, user } satisfies SessionInfo);
    useUiStore.setState({ portfolioId: null });
  };
}

export function useLogin() {
  const reset = useResetOnAuthChange();
  return useMutation({
    mutationFn: (payload: CredentialsIn) => api.post<User>("/auth/login", payload),
    onSuccess: (user) => reset(user),
  });
}

export function useRegister() {
  const reset = useResetOnAuthChange();
  return useMutation({
    mutationFn: (payload: CredentialsIn) => api.post<User>("/auth/register", payload),
    onSuccess: (user) => reset(user),
  });
}

export function useLogout() {
  const reset = useResetOnAuthChange();
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSuccess: () => reset(null),
  });
}

// ---------------------------------------------------------------- health
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<Health>("/health"),
    refetchInterval: 60_000,
    retry: 0,
  });
}

// ---------------------------------------------------------------- market
export function useAssets(assetType?: string) {
  return useQuery({
    queryKey: ["assets", assetType ?? "all"],
    queryFn: () => api.get<Asset[]>(`/market/assets${qs({ asset_type: assetType })}`),
  });
}

export function useAsset(ticker: string | undefined) {
  return useQuery({
    queryKey: ["asset", ticker],
    queryFn: () => api.get<Asset>(`/market/assets/${ticker}`),
    enabled: !!ticker,
  });
}

export function usePrices(ticker: string | undefined, days: number) {
  return useQuery({
    queryKey: ["prices", ticker, days],
    queryFn: () => api.get<PricePoint[]>(`/market/assets/${ticker}/prices${qs({ days })}`),
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  });
}

export function useIndicators(ticker: string | undefined, days: number) {
  return useQuery({
    queryKey: ["indicators", ticker, days],
    queryFn: () =>
      api.get<IndicatorRow[]>(`/market/assets/${ticker}/indicators${qs({ days })}`),
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  });
}

export function useTechnical(ticker: string | undefined) {
  return useQuery({
    queryKey: ["technical", ticker],
    queryFn: () => api.getOrNull<TechnicalSnapshot>(`/market/assets/${ticker}/technical`),
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetIn) => api.post<Asset>("/market/assets", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

// ---------------------------------------------------------------- news
export function useNews(filters: { ticker?: string; category?: string; days?: number; limit?: number }) {
  return useQuery({
    queryKey: ["news", filters],
    queryFn: () => api.get<NewsItem[]>(`/news${qs(filters)}`),
  });
}

export function useNewsDigest(ticker: string | undefined, days = 14) {
  return useQuery({
    queryKey: ["news-digest", ticker, days],
    queryFn: () => api.get<NewsDigest>(`/news/digest/${ticker}${qs({ days })}`),
    enabled: !!ticker,
  });
}

export function useIngestNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticker: string) => api.post<IngestResult>(`/news/ingest/${ticker}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      qc.invalidateQueries({ queryKey: ["news-digest"] });
    },
  });
}

// ---------------------------------------------------------------- fundamentals
export function useFundamentals(ticker: string | undefined) {
  return useQuery({
    queryKey: ["fundamentals", ticker],
    queryFn: () => api.getOrNull<Ratios>(`/fundamentals/${ticker}`),
    enabled: !!ticker,
    staleTime: 30 * 60_000,
  });
}

export function useStatements(ticker: string | undefined) {
  return useQuery({
    queryKey: ["statements", ticker],
    queryFn: () => api.get<Statement[]>(`/fundamentals/${ticker}/statements`),
    enabled: !!ticker,
    staleTime: 30 * 60_000,
  });
}

// ---------------------------------------------------------------- portfolio
export function usePortfolios() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: () => api.get<Portfolio[]>("/portfolio"),
  });
}

export function usePortfolioDetail(id: number | null) {
  return useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => api.get<PortfolioDetail>(`/portfolio/${id}`),
    enabled: id !== null,
  });
}

export function useConcentration(id: number | null) {
  return useQuery({
    queryKey: ["concentration", id],
    queryFn: () => api.get<Concentration>(`/portfolio/${id}/concentration`),
    enabled: id !== null,
  });
}

export function useRebalance(id: number | null, threshold: number) {
  return useQuery({
    queryKey: ["rebalance", id, threshold],
    queryFn: () => api.get<Rebalance>(`/portfolio/${id}/rebalance${qs({ threshold })}`),
    enabled: id !== null,
  });
}

function usePortfolioInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["portfolios"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
    qc.invalidateQueries({ queryKey: ["concentration"] });
    qc.invalidateQueries({ queryKey: ["rebalance"] });
  };
}

export function useCreatePortfolio() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({
    mutationFn: (payload: { name: string; base_currency?: string }) =>
      api.post<Portfolio>("/portfolio", payload),
    onSuccess: invalidate,
  });
}

export function useDeletePortfolio() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({
    mutationFn: (id: number) => api.del(`/portfolio/${id}`),
    onSuccess: invalidate,
  });
}

export function useAddPosition(portfolioId: number | null) {
  const invalidate = usePortfolioInvalidation();
  return useMutation({
    mutationFn: (payload: PositionIn) =>
      api.post(`/portfolio/${portfolioId}/positions`, payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePosition() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({
    mutationFn: ({ id, ...payload }: PositionUpdateIn & { id: number }) =>
      api.patch(`/portfolio/positions/${id}`, payload),
    onSuccess: invalidate,
  });
}

export function useDeletePosition() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({
    mutationFn: (id: number) => api.del(`/portfolio/positions/${id}`),
    onSuccess: invalidate,
  });
}

// ---------------------------------------------------------------- simulation
export function useRunSimulation() {
  return useMutation({
    mutationFn: (payload: SimulationIn) =>
      api.post<SimulationResult>("/simulation/run", payload),
  });
}

export function useRunBacktest() {
  return useMutation({
    mutationFn: (payload: BacktestIn) =>
      api.post<BacktestResult>("/simulation/backtest", payload),
  });
}

// ---------------------------------------------------------------- risk
export function useRisk(ticker: string | undefined) {
  return useQuery({
    queryKey: ["risk", ticker],
    queryFn: () => api.get<AssetRisk>(`/risk/${ticker}`),
    enabled: !!ticker,
    staleTime: 30 * 60_000,
  });
}

// ---------------------------------------------------------------- recommendation
export function useRecommendations(signal?: string) {
  return useQuery({
    queryKey: ["recommendations", signal ?? "all"],
    queryFn: () => api.get<Recommendation[]>(`/recommendation${qs({ signal })}`),
  });
}

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: () => api.get<RankingItem[]>("/recommendation/ranking"),
    // Las revisiones del agente llegan en segundo plano (Celery o fallback):
    // el refetch periódico las hace aparecer sin recargar la página.
    refetchInterval: 45_000,
  });
}

export function useRecommendation(ticker: string | undefined) {
  return useQuery({
    queryKey: ["recommendation", ticker],
    queryFn: () => api.getOrNull<Recommendation>(`/recommendation/${ticker}`),
    enabled: !!ticker,
  });
}

export function useAgentReview(ticker: string | undefined) {
  return useQuery({
    queryKey: ["agent-review", ticker],
    queryFn: () => api.getOrNull<AgentReview>(`/recommendation/${ticker}/agent`),
    enabled: !!ticker,
  });
}

export function useRunScoring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (escalate: boolean) =>
      api.post<ScoringRun>(`/recommendation/run${qs({ escalate })}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ranking"] });
      qc.invalidateQueries({ queryKey: ["recommendations"] });
      qc.invalidateQueries({ queryKey: ["recommendation"] });
    },
  });
}

// ---------------------------------------------------------------- experts
export function useConsensus(ticker: string | undefined) {
  return useQuery({
    queryKey: ["consensus", ticker],
    queryFn: () => api.getOrNull<Consensus>(`/experts/consensus/${ticker}`),
    enabled: !!ticker,
    staleTime: 30 * 60_000,
  });
}

// ---------------------------------------------------------------- discovery
export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: () => api.get<Topic[]>("/discovery/topics"),
  });
}

export function useOpportunities(minScore = 0) {
  return useQuery({
    queryKey: ["opportunities", minScore],
    queryFn: () =>
      api.get<OpportunityReport[]>(`/discovery/opportunities${qs({ min_score: minScore })}`),
  });
}

export function useRunDiscovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<DiscoveryRun>("/discovery/scan"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; query: string; category?: string }) =>
      api.post<Topic>("/discovery/topics", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}
