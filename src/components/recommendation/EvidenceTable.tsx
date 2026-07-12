/** Fuentes de evidencia con nivel de confiabilidad (regla central 18). */
"use client";

import { fmtDate, fmtNum } from "@/lib/format";
import { reliabilityTone } from "@/lib/meta";
import type { EvidenceSource } from "@/lib/types";

import { Badge, Table, Td, Th } from "@/components/ui/primitives";

export function EvidenceTable({ sources }: { sources: EvidenceSource[] }) {
  if (!sources.length) {
    return <p className="text-xs text-muted">Sin fuentes registradas.</p>;
  }
  return (
    <Table>
      <thead>
        <tr>
          <Th>Fuente</Th>
          <Th>Tipo</Th>
          <Th>Confiabilidad</Th>
          <Th right>Score</Th>
          <Th>Publicada</Th>
          <Th>Consultada</Th>
        </tr>
      </thead>
      <tbody>
        {sources.map((s) => (
          <tr key={s.id} className="hover:bg-white/[0.03]">
            <Td>
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-s1 hover:underline"
                >
                  {s.source_name || s.url} ↗
                </a>
              ) : (
                s.source_name
              )}
            </Td>
            <Td>
              <span className="text-xs text-ink-2">{s.source_type}</span>
            </Td>
            <Td>
              <Badge tone={reliabilityTone(s.reliability_level)}>{s.reliability_level}</Badge>
            </Td>
            <Td right>{fmtNum(s.reliability_score, 0)}</Td>
            <Td>
              <span className="text-xs text-muted">{fmtDate(s.published_at)}</span>
            </Td>
            <Td>
              <span className="text-xs text-muted">{fmtDate(s.retrieved_at)}</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
