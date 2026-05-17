"use client";

import * as React from "react";
import type { EnvelopeElementResult } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";

function fW(w: number): string {
  if (!Number.isFinite(w)) return "—";
  if (Math.abs(w) >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${Math.round(w)} W`;
}

export function FormulaBreakdown({
  breakdown,
}: {
  breakdown: EnvelopeElementResult[];
}) {
  if (breakdown.length === 0) return null;

  return (
    <details className="group rounded-md border" open={false}>
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <ChevronRight className="size-4 group-open:hidden" />
        <ChevronDown className="size-4 hidden group-open:block" />
        Envelope element breakdown · {breakdown.length} element
        {breakdown.length > 1 ? "s" : ""}
      </summary>

      <div className="border-t">
        {/* Summary table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <Th>Element</Th>
                <Th>Type</Th>
                <Th>ΔT_h (K)</Th>
                <Th>Transmission W</Th>
                <Th>Therm. bridge W</Th>
                <Th>Total heat W</Th>
                <Th>ΔT_c (K)</Th>
                <Th>Cond. W</Th>
                <Th>TB cool W</Th>
                <Th>Solar W</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {breakdown.map((b) => (
                <tr key={b.id} className="hover:bg-muted/20">
                  <Td className="font-medium">{b.name}</Td>
                  <Td>{b.type}</Td>
                  <Td>{b.heatingDeltaTK.toFixed(1)}</Td>
                  <Td>{fW(b.heatingTransmissionW)}</Td>
                  <Td>{fW(b.heatingThermalBridgeW)}</Td>
                  <Td className="font-semibold">{fW(b.heatingW)}</Td>
                  <Td>{b.coolingDeltaTK.toFixed(1)}</Td>
                  <Td>{fW(b.coolingTransmissionW)}</Td>
                  <Td>{fW(b.coolingThermalBridgeW)}</Td>
                  <Td>{fW(b.coolingSolarW)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formula traces per element */}
        <div className="divide-y border-t">
          {breakdown.map((b) => (
            <div key={b.id} className="p-4 space-y-2">
              <p className="text-sm font-semibold">{b.name}</p>
              <div className="grid gap-2">
                {b.trace.map((t, i) => (
                  <div key={i} className="rounded-md bg-muted/40 p-2 text-xs space-y-1">
                    <p className="font-semibold">{t.label}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {t.formula}
                    </p>
                    {t.expression && (
                      <p className="font-mono text-[11px]">{t.expression}</p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 mt-1 pt-1 border-t">
                      {Object.entries(t.inputs).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="tabular-nums">
                            {typeof v === "number" ? Number(v).toFixed(3) : v}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t font-semibold">
                      <span className="text-muted-foreground">= result</span>
                      <span className="tabular-nums">{fW(t.resultW)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="px-3 py-2 font-medium whitespace-nowrap">{children}</th>
);
const Td = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-3 py-1.5 tabular-nums whitespace-nowrap ${className ?? ""}`}>
    {children}
  </td>
);
