"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Project, ProjectResult, ZoneResult } from "@/types";
import { computeProjectResult } from "@/lib/calculations";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import { formatNumber, slug } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const BLUE = [37, 99, 235] as [number, number, number];
const GREEN = [22, 163, 74] as [number, number, number];
const GRAY = [55, 65, 81] as [number, number, number];
const AMBER = [180, 100, 0] as [number, number, number];

function fW(w: number): string {
  if (!Number.isFinite(w)) return "—";
  if (Math.abs(w) >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${Math.round(w)} W`;
}

function fkW(w: number): string {
  return `${(w / 1000).toFixed(2)} kW`;
}

function section(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  color: [number, number, number] = GRAY,
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(title.toUpperCase(), margin, y);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  return y + 12;
}

function addPageIfNeeded(doc: jsPDF, y: number, margin: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 60) {
    doc.addPage();
    return margin;
  }
  return y;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function exportProjectPdf(project: Project): void {
  const result: ProjectResult = computeProjectResult(project);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // ── Cover block ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Load Master — HVAC Preliminary Load Calculation", margin, y);
  y += 22;
  doc.setFontSize(13);
  doc.text(project.name, margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    `Generated: ${new Date().toLocaleString()}   ·   Building type: ${
      BUILDING_TYPE_LABELS[project.buildingType]
    }   ·   Zones: ${project.zones.length}`,
    margin,
    y,
  );
  y += 20;
  doc.setTextColor(0);

  // ── 1. Project summary ────────────────────────────────────────────────
  y = section(doc, "1. Project information", y, margin, BLUE);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BLUE },
    head: [["Parameter", "Value"]],
    body: [
      ["Project name", project.name],
      ["City / location", project.climate.city],
      ["Building type", BUILDING_TYPE_LABELS[project.buildingType]],
      ["Number of zones", String(project.zones.length)],
      ["Total floor area (m²)", formatNumber(result.totalArea, 1)],
      ["Safety margin", `${(project.safetyMargin * 100).toFixed(0)} %`],
      ["Diversity factor", project.diversityFactor.toFixed(2)],
    ],
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── 2. Climate assumptions ────────────────────────────────────────────
  y = addPageIfNeeded(doc, y, margin);
  y = section(doc, "2. Climate design conditions", y, margin, BLUE);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BLUE },
    head: [["Parameter", "Value"]],
    body: [
      ["Outdoor winter design temp (°C)", project.climate.outdoorWinterDb.toString()],
      ["Indoor winter set-point (°C)", project.climate.indoorWinterDb.toString()],
      ["Design ΔT heating (K)", (project.climate.indoorWinterDb - project.climate.outdoorWinterDb).toFixed(1)],
      ["Outdoor summer design dry-bulb (°C)", project.climate.outdoorSummerDb.toString()],
      ["Indoor summer set-point (°C)", project.climate.indoorSummerDb.toString()],
      ["Design ΔT cooling (K)", (project.climate.outdoorSummerDb - project.climate.indoorSummerDb).toFixed(1)],
      ["Outdoor summer RH (%)", project.climate.outdoorSummerRh.toString()],
      ["Indoor summer RH (%)", project.climate.indoorSummerRh.toString()],
      ["Altitude (m)", String(project.climate.altitudeM ?? 0)],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── 3. Psychrometric assumptions (from first zone) ────────────────────
  const firstZone = result.zones[0];
  if (firstZone) {
    const psych = firstZone.psychrometrics;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: GRAY },
      head: [["Psychrometric parameter", "Value", "Notes"]],
      body: [
        ["Atmospheric pressure (Pa)", psych.pressurePa.toLocaleString(), `P = 101325 × (1 − 2.256e-5 × z)^5.256`],
        ["w indoor (g/kg dry air)", psych.wIndoorGPerKg.toFixed(3), "Magnus formula"],
        ["w outdoor (g/kg dry air)", psych.wOutdoorGPerKg.toFixed(3), "Magnus formula"],
        ["Δw (g/kg)", psych.deltaWGPerKg.toFixed(3), psych.deltaWRawGPerKg < 0 ? "Clamped from " + psych.deltaWRawGPerKg.toFixed(3) : "Used for latent loads"],
      ],
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── 4. Solar irradiance table ─────────────────────────────────────────
  y = addPageIfNeeded(doc, y + 6, margin);
  y = section(doc, "3. Peak solar irradiance design values (W/m²)", y, margin, BLUE);
  const irr = project.climate.solarIrradiance;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: GRAY },
    head: [["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Horizontal"]],
    body: [[
      irr.N ?? "—", irr.NE ?? "—", irr.E ?? "—", irr.SE ?? "—",
      irr.S ?? "—", irr.SW ?? "—", irr.W ?? "—", irr.NW ?? "—",
      irr.horizontal ?? "—",
    ]],
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── 5. Project-level totals ───────────────────────────────────────────
  y = addPageIfNeeded(doc, y, margin);
  y = section(doc, "4. Project load summary", y, margin, GREEN);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: GREEN },
    head: [["Result", "Heating", "Cooling (total)", "Cool sensible", "Cool latent"]],
    body: [
      [
        "Raw load (Σ zones)",
        fW(result.totalHeatingW),
        fW(result.totalCoolingW),
        fW(result.totalSensibleW),
        fW(result.totalLatentW),
      ],
      [
        `+ Safety only (${(project.safetyMargin * 100).toFixed(0)}%)`,
        fW(result.rawRecommendedHeatingW),
        fW(result.rawRecommendedCoolingW),
        "—",
        "—",
      ],
      [
        `Recommended (× diversity ${project.diversityFactor.toFixed(2)})`,
        fW(result.recommendedHeatingW),
        fW(result.recommendedCoolingW),
        "—",
        "—",
      ],
      [
        "Intensity W/m²",
        `${formatNumber(result.heatingPerM2, 1)} W/m²`,
        `${formatNumber(result.coolingPerM2, 1)} W/m²`,
        "—",
        "—",
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── 6. Zone summary table ─────────────────────────────────────────────
  y = addPageIfNeeded(doc, y, margin);
  y = section(doc, "5. Zone load summary", y, margin, GRAY);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: GRAY },
    head: [["Zone", "Area m²", "Heat W", "Cool sens. W", "Cool lat. W", "Cool tot. W", "Reco heat W", "Reco cool W", "W/m² H", "W/m² C"]],
    body: result.zones.map((z) => [
      z.zoneName,
      formatNumber(z.floorArea, 1),
      Math.round(z.totalHeatingW),
      Math.round(z.totalSensibleCoolingW),
      Math.round(z.totalLatentCoolingW),
      Math.round(z.totalCoolingW),
      Math.round(z.recommendedHeatingW),
      Math.round(z.recommendedCoolingW),
      formatNumber(z.heatingPerM2, 1),
      formatNumber(z.coolingPerM2, 1),
    ]),
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── 7. Per-zone detailed tables ───────────────────────────────────────
  for (const z of result.zones) {
    doc.addPage();
    y = margin;
    y = section(doc, `Zone: ${z.zoneName}`, y, margin, BLUE);

    // Envelope element table
    y = section(doc, "Envelope elements — transmission / conduction", y, margin);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: GRAY },
      head: [["Element", "Type", "Area m²", "U W/m²K", "ψL W/K", "Boundary", "ΔT_h K", "Heat W", "TB heat W", "ΔT_c K", "Cond. W", "TB cool W", "Solar W"]],
      body: z.envelopeBreakdown.map((b) => [
        b.name,
        b.type,
        "—", // area not on result — shown in trace
        "—",
        "—",
        "—",
        b.heatingDeltaTK.toFixed(1),
        Math.round(b.heatingTransmissionW),
        Math.round(b.heatingThermalBridgeW),
        b.coolingDeltaTK.toFixed(1),
        Math.round(b.coolingTransmissionW),
        Math.round(b.coolingThermalBridgeW),
        Math.round(b.coolingSolarW),
      ]),
      foot: [[
        "TOTALS", "", "", "", "", "",
        "",
        Math.round(z.heatingTransmissionW),
        "",
        "",
        Math.round(z.coolingConductionW),
        "",
        Math.round(z.coolingSolarW),
      ]],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Ventilation & infiltration table
    y = addPageIfNeeded(doc, y, margin);
    y = section(doc, "Ventilation & infiltration", y, margin);
    const air = z.airLoadsDetail;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: GRAY },
      head: [["Stream", "Flow m³/h", "ΔT (K) / Δw (g/kg)", "Recovery", "Heat sens. W", "Cool sens. W", "Cool lat. W"]],
      body: [
        [
          "Ventilation",
          air.ventilationFlowM3h.toFixed(1),
          `ΔT_h=${air.heatingDeltaTK.toFixed(1)} / ΔT_c=${air.coolingDeltaTK.toFixed(1)}`,
          `HR_s=${(air.heatRecoverySensible * 100).toFixed(0)}% / HR_l=${(air.heatRecoveryLatent * 100).toFixed(0)}%`,
          Math.round(z.heatingVentilationW),
          Math.round(z.coolingVentilationSensibleW),
          Math.round(z.coolingVentilationLatentW),
        ],
        [
          "Infiltration",
          air.infiltrationFlowM3h.toFixed(1),
          `ΔT_h=${air.heatingDeltaTK.toFixed(1)} / ΔT_c=${air.coolingDeltaTK.toFixed(1)}`,
          "None (no HR on infiltration)",
          Math.round(z.heatingInfiltrationW),
          Math.round(z.coolingInfiltrationSensibleW),
          Math.round(z.coolingInfiltrationLatentW),
        ],
      ],
    });
    y = doc.lastAutoTable.finalY + 10;

    // Internal gains table
    y = addPageIfNeeded(doc, y, margin);
    y = section(doc, "Internal gains", y, margin);
    const ig = z.internalGainsDetail;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: GRAY },
      head: [["Source", "Detail", "Sensible W", "Latent W"]],
      body: [
        [
          "People",
          `${ig.peopleCount} persons × ${ig.peopleSensibleWPerPerson}/${ig.peopleLatentWPerPerson} W (sens/lat) · diversity ${ig.diversity}`,
          Math.round(ig.peopleSensibleW),
          Math.round(ig.peopleLatentW),
        ],
        [
          "Lighting",
          ig.lightingMethodLabel,
          Math.round(ig.lightingW),
          0,
        ],
        [
          "Equipment",
          `${ig.equipmentW.toFixed(0)} W · diversity ${ig.diversity}`,
          Math.round(ig.equipmentW),
          0,
        ],
      ],
    });
    y = doc.lastAutoTable.finalY + 10;

    // Zone totals
    y = addPageIfNeeded(doc, y, margin);
    y = section(doc, "Zone load totals", y, margin, GREEN);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: GREEN },
      head: [["Line item", "Heating W", "Cool sensible W", "Cool latent W", "Cool total W"]],
      body: [
        ["Envelope transmission", Math.round(z.heatingTransmissionW), Math.round(z.coolingConductionW), "—", "—"],
        ["Solar gain", "—", Math.round(z.coolingSolarW), "—", "—"],
        ["Ventilation", Math.round(z.heatingVentilationW), Math.round(z.coolingVentilationSensibleW), Math.round(z.coolingVentilationLatentW), "—"],
        ["Infiltration", Math.round(z.heatingInfiltrationW), Math.round(z.coolingInfiltrationSensibleW), Math.round(z.coolingInfiltrationLatentW), "—"],
        ["People", "—", Math.round(z.peopleSensibleW), Math.round(z.peopleLatentW), "—"],
        ["Lighting", "—", Math.round(z.lightingW), "—", "—"],
        ["Equipment", "—", Math.round(z.equipmentW), "—", "—"],
        ["RAW TOTAL", Math.round(z.totalHeatingW), Math.round(z.totalSensibleCoolingW), Math.round(z.totalLatentCoolingW), Math.round(z.totalCoolingW)],
        [`RECOMMENDED (+${(project.safetyMargin * 100).toFixed(0)}% safety)`, Math.round(z.recommendedHeatingW), "—", "—", Math.round(z.recommendedCoolingW)],
      ],
      bodyStyles: { fontSize: 8 },
      didParseCell: (data) => {
        if (data.row.index >= 7) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Warnings for this zone
    if (z.warnings.length > 0) {
      y = addPageIfNeeded(doc, y, margin);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(180, 90, 0);
      doc.text(`⚠ ${z.warnings.length} warning(s) for zone "${z.zoneName}"`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      y += 12;
      for (const w of z.warnings) {
        const lines = doc.splitTextToSize(`• ${w}`, pageWidth - margin * 2);
        doc.setFontSize(8);
        doc.text(lines, margin, y);
        y += lines.length * 11;
      }
    }
  }

  // ── 8. Calculation method reference ───────────────────────────────────
  doc.addPage();
  y = margin;
  y = section(doc, "Calculation formulas reference", y, margin, BLUE);
  const formulas = [
    ["Heating transmission", "Q = (U × A + ψL) × ΔT_h", "ΔT_h = T_indoor_winter − T_boundary"],
    ["Heating ventilation", "Q = 0.335 × airflow × (1 − HR_sens) × ΔT_h", "No HR applied to infiltration"],
    ["Cooling conduction", "Q = (U × A + ψL) × ΔT_c", "ΔT_c = T_boundary − T_indoor_summer"],
    ["Cooling solar (windows)", "Q = A_glass × SHGC × I × shading", "A_glass = glassArea if set, else area"],
    ["Cooling vent. sensible", "Q = 0.335 × airflow × (1 − HR_sens) × ΔT_c", "—"],
    ["Cooling vent. latent", "Q = 0.83 × airflow × (1 − HR_lat) × Δw", "Δw = max(0, w_out − w_in) g/kg"],
    ["Cooling infil. sensible", "Q = 0.335 × infil_flow × ΔT_c", "No HR on infiltration"],
    ["Cooling infil. latent", "Q = 0.83 × infil_flow × Δw", "No HR on infiltration"],
    ["People", "Q_s/l = count × W_s/l × diversity", "Preset or user-defined"],
    ["Lighting", "Q = (totalW or W/m²×A) × diversity", "—"],
    ["Equipment", "Q = equipmentW × diversity", "—"],
    ["Saturation vapor pressure", "p_ws = 610.94 × exp(17.625T / (T+243.04))", "Magnus form (Pa)"],
    ["Humidity ratio", "w = 0.62198 × p_w / (P − p_w)", "kg/kg dry air; ×1000 = g/kg"],
    ["Atmospheric pressure", "P = 101325 × (1 − 2.256e-5 × z)^5.256", "z = altitude in m"],
    ["Safety margin", "Q_reco_zone = Q_raw × (1 + safety)", "Applied per-zone"],
    ["Diversity + safety", "Q_reco_project = Σ Q_zone × diversity × (1 + safety)", "Applied to project total only"],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: GRAY },
    head: [["Load type", "Formula", "Notes"]],
    body: formulas,
    columnStyles: { 1: { font: "courier", fontSize: 7 } },
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── 9. Disclaimer ─────────────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120);
  const disclaimer =
    "DISCLAIMER: Load Master uses transparent simplified engineering formulas based on public heat-transfer and " +
    "psychrometric methods. This report is intended as a preliminary estimate only. It is NOT a certified " +
    "regulatory calculation and does not claim compliance with ASHRAE, Manual J, RT2012, RE2020 or any other " +
    "proprietary or regulatory standard unless independently validated by a qualified engineer. All inputs " +
    "and assumptions must be verified before equipment selection or permit submission.";
  const lines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(lines, margin, y);

  doc.save(`${slug(project.name, "report")}-loadmaster.pdf`);
}
