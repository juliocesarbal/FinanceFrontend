# FinanceFrontend

Dashboard web del **Sistema Inteligente de Análisis, Simulación y Descubrimiento de
Inversiones** (sección 16.3 de `Finance/sistema_inversiones_inteligente_v2.md`).
Consume la API Django Ninja del backend `Finance/`.

## Stack

- **Next.js 15 (App Router) + TypeScript**
- **TanStack Query** — fetching y caché de datos del cliente
- **Zustand** — estado global ligero (cartera seleccionada, rango del gráfico)
- **TradingView Lightweight Charts** — velas, SMA, volumen, RSI, MACD
- **Recharts** — donut de cartera, curva de equity, proyección de escenarios
- **Tailwind CSS v4** — tema oscuro único con paleta de datos validada (CVD-safe)

## Requisitos

- Node.js 18.18+ (recomendado 20+)
- El backend `Finance/` corriendo (por defecto en `http://127.0.0.1:8000`)

## Cómo correr en desarrollo

```bash
# 1. Backend (en Finance/)
cd ../Finance
.venv\Scripts\activate
python manage.py runserver

# 2. Frontend (en esta carpeta)
npm install
npm run dev
```

Abrí <http://localhost:3000>.

**No hace falta configurar CORS**: `next.config.ts` hace proxy de `/api/*` hacia el
backend, así el navegador siempre habla con el mismo origen. Si el backend corre en
otra dirección, copiá `.env.example` a `.env` y ajustá `BACKEND_URL`.

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Landing pública (estilo COMPUTE: video, serif display, métricas en vivo) con botón de acceso en la esquina. Login/registro abren en un **modal translúcido** sobre la landing (`?auth=login\|register`) |
| `/login` · `/register` | Stubs de compatibilidad: redirigen a la landing con el modal abierto |
| `/dashboard` | Dashboard: salud del sistema (incl. métrica 429 de yfinance), top del ranking, watchlist, últimas noticias |
| `/mercado` | Universo de activos, filtro por tipo, alta de tickers nuevos |
| `/mercado/[ticker]` | Velas + SMA 20/50/200 + volumen, y pestañas: técnico (RSI/MACD), fundamentales (5 bloques de la sección 4.3), noticias, consenso de analistas, riesgo, recomendación |
| `/recomendaciones` | Ranking mecánico vs. agente con divergencia y contradicciones; botones para correr el scoring (etapa 1) y escalar al agente (etapa 2) |
| `/recomendaciones/[ticker]` | Detalle explicable: desglose del score, motivos, riesgos, revisión del agente y evidencia con confiabilidad A+–E |
| `/cartera` | Carteras y posiciones (CRUD), valorización, donut de composición, concentración/HHI/exposiciones, rebalanceo por peso objetivo |
| `/simulador` | Simulación de aportes (escenarios optimista/medio/pesimista con proyección) y backtesting de cruce de medias con curva de equity |
| `/noticias` | Feed con filtros por ticker/categoría/días, sentimiento, impacto y confiabilidad de fuente |
| `/descubrimiento` | Temas emergentes con momentum, escaneo a demanda y reportes de oportunidad con el desglose del Emerging Market Score (sección 13) |

## Notas de diseño

- Tema oscuro único; paleta de series y estados validada con el validador de
  accesibilidad (contraste ≥3:1 sobre la superficie, separación CVD).
- Las señales usan el lenguaje prudente de la sección 20 y cada score muestra su
  desglose y fuentes: nada se recomienda sin poder auditarse (sección 18).
- El disclaimer educativo es permanente (pie de página y sidebar).

## Build de producción

```bash
npm run build
npm start
```

## Autenticación

Sesión de Django por cookies (same-origin gracias al proxy, sin JWT ni CORS).
`AppShell` consulta `GET /api/auth/me` al cargar: si no hay sesión redirige a
`/login`; el cliente HTTP (`lib/api.ts`) manda `X-CSRFToken` (leído de la cookie
`csrftoken`) en cada mutación, y ante cualquier 401 se vuelve al login. Carteras
y simulaciones son **por usuario**: al cambiar de cuenta se limpia la caché de
TanStack Query.

## Pendientes conocidos

- Recuperación/cambio de contraseña y verificación de email.
- WebSockets (Django Channels) para precios/alertas en vivo — roadmap V7; hoy
  TanStack Query refresca por intervalos/interacción.
