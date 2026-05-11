"use client";

import * as React from "react";
import type { EnvelopeElementResult } from "@/types";
import { formatPower } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

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
        Calculation breakdown · {breakdown.length} envelope element
        {breakdown.length > 1 ? "s" : ""}
      </summary>
      <div className="border-t divide-y">
        {breakdown.map((b) => (
          <div key={b.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{b.name}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Heating: {formatPower(b.heatingW)}</span>
                <span>·</span>
                <span>Cond.: {formatPower(b.coolingConductionW)}</span>
                <span>·</span>
                <span>Solar: {formatPower(b.coolingSolarW)}</span>
              </div>
            </div>
            <div className="grid gap-2">
              {b.trace.map((t, i) => (
                <div key={i} className="rounded-md bg-muted/40 p-2 text-xs">
                  <div className="font-semibold">{t.label}</div>
                  <div className="font-mono text-[11px] mt-0.5">
                    {t.formula}
                  </div>
                  <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {Object.entries(t.inputs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <span className="text-muted-foreground">{k}</span>
                        <span className="tabular-nums">
                          {typeof v === "number" ? Number(v).toFixed(2) : v}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 text-[11px] flex justify-between">
                    <span className="text-muted-foreground">= result</span>
                    <span className="tabular-nums font-semibold">
                      {formatPower(t.resultW)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
