/** Pestaña de noticias del activo: digest con score + ingesta a demanda. */
"use client";

import { fmtNum } from "@/lib/format";
import { scoreTone } from "@/lib/meta";
import { useIngestNews, useNews, useNewsDigest } from "@/lib/queries";

import { NewsList } from "@/components/news/NewsList";
import {
  Button,
  Card,
  ErrorBox,
  Loading,
  ScoreChip,
  Spinner,
} from "@/components/ui/primitives";

export function NewsTab({ ticker }: { ticker: string }) {
  const digest = useNewsDigest(ticker);
  const news = useNews({ ticker, days: 30, limit: 30 });
  const ingest = useIngestNews();

  return (
    <div className="space-y-4">
      <Card
        title={
          <span className="flex items-center gap-2">
            Digest de noticias (14 días)
            {digest.data && (
              <ScoreChip
                score={digest.data.news_score}
                tone={scoreTone(digest.data.news_score)}
              />
            )}
          </span>
        }
        subtitle={
          digest.data
            ? `${digest.data.item_count} noticias consideradas en el score`
            : undefined
        }
        actions={
          <Button
            size="sm"
            onClick={() => ingest.mutate(ticker)}
            disabled={ingest.isPending}
            title="Trae noticias nuevas de yfinance y Google News RSS"
          >
            {ingest.isPending ? <Spinner /> : "Ingerir ahora"}
          </Button>
        }
      >
        {ingest.data && (
          <p className="mb-2 text-xs text-good">✓ {ingest.data.detail}</p>
        )}
        {ingest.isError && <ErrorBox error={ingest.error} />}
        {digest.isLoading && <Loading />}
        {digest.isError && <ErrorBox error={digest.error} onRetry={() => digest.refetch()} />}
        {digest.data && digest.data.top_items.length > 0 && (
          <>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Mayor impacto
            </h3>
            <NewsList items={digest.data.top_items} />
          </>
        )}
      </Card>

      <Card title="Todas las noticias (30 días)">
        {news.isLoading && <Loading />}
        {news.isError && <ErrorBox error={news.error} onRetry={() => news.refetch()} />}
        {news.data && <NewsList items={news.data} />}
        {news.data && news.data.length > 0 && (
          <p className="mt-2 text-[11px] text-muted">
            {fmtNum(news.data.length, 0)} noticias · sentimiento VADER (los titulares en
            español tienden a neutral — mejora prevista en V4)
          </p>
        )}
      </Card>
    </div>
  );
}
