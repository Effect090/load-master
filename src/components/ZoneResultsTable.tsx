"use client";

import * as React from "react";
import type { AirLoadsDetail, FormulaTrace, InternalGainsDetail, ZoneResult } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadBreakdownPie } from "./LoadBreakdownChart";
import { FormulaBreakdown } from "./FormulaBreakdown";
import { WarningBanner } from "./WarningBanner";
import { ChevronDown, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers: show kW to 2 dp for values ≥ 1 kW, otherwise round W
// ─────────────────────────────────────────────────────────────────────────────

function fW(w: number): string {
  if (!Number.isFinite(w)) return "—";
  if (Math.abs(w) >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${Math.round(w)} W`;
}

function fkW(w: number): string {
  if (!Number.isFinite(w)) return "—";
  return `${(w / 1000).toFixed(2)} kW`;
}

// ─────────────────────────────────────────────────────────────────────────────

export function ZoneResultsTable({ result }: { result: ZoneResult }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle>{result.zoneName}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatNumber(result.floorArea, 1)} m² ·{" "}
            {formatNumber(result.heatingPerM2, 1)} W/m² heating ·{" "}
            {formatNumber(result.coolingPerM2, 1)} W/m² cooling
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">
            Heat {fkW(result.totalHeatingW)}
          </Badge>
          <Badge variant="warning">
            Cool {fkW(result.totalCoolingW)}
          </Badge>
          <Badge variant="outline">
            Reco heat {fkW(result.recommendedHeatingW)}
          </Badge>
          <Badge variant="outline">
            Reco cool {fkW(result.recommendedCoolingW)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* ── Loads side-by-side ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Heating */}
          <div className="flex flex-col gap-3">
            <SectionTitle>Heating loads</SectionTitle>
            <LoadTable
              rows={[
                { name: "Envelope transmission", value: result.heatingTransmissionW },
                { name: "Ventilation sensible", value: result.heatingVentilationW },
                { name: "Infiltration sensible", value: result.heatingInfiltrationW },
              ]}
            />
            <TotalRow label="Raw total heating" value={result.totalHeatingW} />
            <TotalRow
              label={`Recommended (+ safety)`}
              value={result.recommendedHeatingW}
              highlight
              note="raw × (1 + safety margin)"
            />
            <LoadBreakdownPie
              data={[
                { name: "Transmission", value: result.heatingTransmissionW },
                { name: "Ventilation", value: result.heatingVentilationW },
                { name: "Infiltration", value: result.heatingInfiltrationW },
              ]}
            />
          </div>

          {/* Cooling */}
          <div className="flex flex-col gap-3">
            <SectionTitle>Cooling loads</SectionTitle>
            <SectionTitle sub>Sensible</SectionTitle>
            <LoadTable
              rows={[
                { name: "Envelope conduction", value: result.coolingConductionW },
                { name: "Solar gain (windows)", value: result.coolingSolarW },
                { name: "Ventilation sensible", value: result.coolingVentilationSensibleW },
                { name: "Infiltration sensible", value: result.coolingInfiltrationSensibleW },
                { name: "People sensible", value: result.peopleSensibleW },
                { name: "Lighting", value: result.lightingW },
                { name: "Equipment", value: result.equipmentW },
              ]}
            />
            <TotalRow label="Total sensible" value={result.totalSensibleCoolingW} />

            <SectionTitle sub>Latent</SectionTitle>
            <LoadTable
              rows={[
                { name: "Ventilation latent", value: result.coolingVentilationLatentW },
                { name: "Infiltration latent", value: result.coolingInfiltrationLatentW },
                { name: "People latent", value: result.peopleLatentW },
              ]}
            />
            <TotalRow label="Total latent" value={result.totalLatentCoolingW} />
            <TotalRow label="Total cooling (S+L)" value={result.totalCoolingW} />
            <TotalRow
              label={`Recommended (+ safety)`}
              value={result.recommendedCoolingW}
              highlight
              note="raw × (1 + safety margin)"
            />
            <LoadBreakdownPie
              data={[
                { name: "Conduction", value: result.coolingConductionW },
                { name: "Solar", value: result.coolingSolarW },
                { name: "Vent. sens.", value: result.coolingVentilationSensibleW },
                { name: "Inf. sens.", value: result.coolingInfiltrationSensibleW },
                { name: "People sens.", value: result.peopleSensibleW },
                { name: "Lighting", value: result.lightingW },
                { name: "Equipment", value: result.equipmentW },
                { name: "Vent. lat.", value: result.coolingVentilationLatentW },
                { name: "Inf. lat.", value: result.coolingInfiltrationLatentW },
                { name: "People lat.", value: result.peopleLatentW },
              ]}
            />
          </div>
        </div>

        {/* ── Warnings ──────────────────────────────────────────────── */}
        {result.warnings.length > 0 && (
          <WarningBanner warnings={result.warnings} />
        )}

        {/* ── Psychrometric summary ─────────────────────────────────── */}
        <PsychrometricCard psych={result.psychrometrics} />

        {/* ── Audit sections ─────────────────────────────────────────── */}
        <FormulaBreakdown breakdown={result.envelopeBreakdown} />
        <AirLoadsAudit detail={result.airLoadsDetail} />
        <InternalGainsAudit detail={result.internalGainsDetail} />
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Psychrometric summary card
// ─────────────────────────────────────────────────────────────────────────────

function PsychrometricCard({
  psych,
}: {
  psych: ZoneResult["psychrometrics"];
}) {
  return (
    <details className="group rounded-md border">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <ChevronRight className="size-4 group-open:hidden" />
        <ChevronDown className="size-4 hidden group-open:block" />
        Psychrometric conditions
      </summary>
      <div className="border-t p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <InfoRow label="Atmospheric pressure" value={`${psych.pressurePa.toLocaleString()} Pa`} />
        <InfoRow label="w indoor (g/kg)" value={psych.wIndoorGPerKg.toFixed(3)} />
        <InfoRow label="w outdoor (g/kg)" value={psych.wOutdoorGPerKg.toFixed(3)} />
        <InfoRow
          label="Δw (g/kg)"
          value={psych.deltaWGPerKg.toFixed(3)}
          note="used for latent loads"
        />
        {psych.deltaWRawGPerKg < 0 && (
          <InfoRow
            label="Δw before clamp (g/kg)"
            value={psych.deltaWRawGPerKg.toFixed(3)}
            warn
          />
        )}
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Air loads audit section
// ─────────────────────────────────────────────────────────────────────────────

function AirLoadsAudit({ detail }: { detail: AirLoadsDetail }) {
  const traces = [
    detail.heatingVentTrace,
    detail.heatingInfilTrace,
    detail.coolingVentSensibleTrace,
    detail.coolingVentLatentTrace,
    detail.coolingInfilSensibleTrace,
    detail.coolingInfilLatentTrace,
  ];
  return (
    <details className="group rounded-md border">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <ChevronRight className="size-4 group-open:hidden" />
        <ChevronDown className="size-4 hidden group-open:block" />
        Ventilation & infiltration breakdown
      </summary>
      <div className="border-t p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-2">
          <InfoRow label="Vent. flow" value={`${detail.ventilationFlowM3h} m³/h`} />
          <InfoRow label="Infil. flow" value={`${detail.infiltrationFlowM3h.toFixed(1)} m³/h`} />
          <InfoRow label="HR sensible" value={`${(detail.heatRecoverySensible * 100).toFixed(0)} %`} />
          <InfoRow label="HR latent" value={`${(detail.heatRecoveryLatent * 100).toFixed(0)} %`} />
          <InfoRow label="ΔT heating (K)" value={detail.heatingDeltaTK.toFixed(1)} />
          <InfoRow label="ΔT cooling (K)" value={detail.coolingDeltaTK.toFixed(1)} />
        </div>
        {traces.map((t, i) => (
          <TraceCard key={i} trace={t} />
        ))}
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal gains audit section
// ─────────────────────────────────────────────────────────────────────────────

function InternalGainsAudit({ detail }: { detail: InternalGainsDetail }) {
  return (
    <details className="group rounded-md border">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <ChevronRight className="size-4 group-open:hidden" />
        <ChevronDown className="size-4 hidden group-open:block" />
        Internal gains breakdown
      </summary>
      <div className="border-t p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-2">
          <InfoRow label="Occupancy" value={detail.occupancyLabel} />
          <InfoRow label="People" value={String(detail.peopleCount)} />
          <InfoRow label="Sensible W/person" value={`${detail.peopleSensibleWPerPerson} W`} />
          <InfoRow label="Latent W/person" value={`${detail.peopleLatentWPerPerson} W`} />
          <InfoRow label="Lighting method" value={detail.lightingMethodLabel} />
          <InfoRow label="Diversity" value={detail.diversity.toFixed(2)} />
        </div>
        {detail.traces.map((t, i) => (
          <TraceCard key={i} trace={t} />
        ))}
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: boolean;
}) {
  return (
    <h4
      className={`font-semibold uppercase tracking-wide text-muted-foreground ${
        sub ? "text-[10px]" : "text-xs"
      }`}
    >
      {children}
    </h4>
  );
}

function LoadTable({ rows }: { rows: { name: string; value: number }[] }) {
  return (
    <div className="rounded-md border divide-y">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between px-3 py-1.5 text-sm"
        >
          <span className="text-muted-foreground">{r.name}</span>
          <span className="tabular-nums font-mono text-xs">{fW(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

function TotalRow({
  label,
  value,
  highlight,
  note,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  note?: string;
}) {
  return (
    <div
      className={`rounded-md px-3 py-2 ${
        highlight
          ? "bg-primary/10 text-primary"
          : "bg-muted/40 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{fW(value)}</span>
      </div>
      {note && (
        <p className="text-[10px] opacity-70 mt-0.5">{note}</p>
      )}
    </div>
  );
}

function TraceCard({ trace }: { trace: FormulaTrace }) {
  return (
    <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
      <p className="font-semibold">{trace.label}</p>
      <p className="font-mono text-[11px] text-muted-foreground">{trace.formula}</p>
      {trace.expression && (
        <p className="font-mono text-[11px]">{trace.expression}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 mt-1 pt-1 border-t">
        {Object.entries(trace.inputs).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-muted-foreground">{k}</span>
            <span className="tabular-nums">
              {typeof v === "number" ? Number(v).toFixed(3) : v}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t font-semibold">
        <span className="text-muted-foreground">= result</span>
        <span className="tabular-nums">{fW(trace.resultW)}</span>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  note,
  warn,
}: {
  label: string;
  value: string;
  note?: string;
  warn?: boolean;
}) {
  return (
    <div className={`flex flex-col ${warn ? "text-destructive" : ""}`}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
      {note && <span className="text-[10px] text-muted-foreground">{note}</span>}
    </div>
  );
}
