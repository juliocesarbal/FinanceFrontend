/** Estado global ligero (Zustand): selección de cartera, rango del gráfico
 *  y modal de autenticación de la landing. */
import { create } from "zustand";

export type AuthModalMode = "login" | "register" | null;

interface UiState {
  /** Rango en días para el gráfico de precios del detalle de activo. */
  chartDays: number;
  setChartDays: (days: number) => void;
  /** Cartera seleccionada en la página de cartera. */
  portfolioId: number | null;
  setPortfolioId: (id: number | null) => void;
  /** Modal de login/registro abierto sobre la landing. */
  authModal: AuthModalMode;
  setAuthModal: (mode: AuthModalMode) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  chartDays: 365,
  setChartDays: (chartDays) => set({ chartDays }),
  portfolioId: null,
  setPortfolioId: (portfolioId) => set({ portfolioId }),
  authModal: null,
  setAuthModal: (authModal) => set({ authModal }),
}));
