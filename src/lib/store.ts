/** Estado global ligero (Zustand): selección de cartera y rango del gráfico. */
import { create } from "zustand";

interface UiState {
  /** Rango en días para el gráfico de precios del detalle de activo. */
  chartDays: number;
  setChartDays: (days: number) => void;
  /** Cartera seleccionada en la página de cartera. */
  portfolioId: number | null;
  setPortfolioId: (id: number | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  chartDays: 365,
  setChartDays: (chartDays) => set({ chartDays }),
  portfolioId: null,
  setPortfolioId: (portfolioId) => set({ portfolioId }),
}));
