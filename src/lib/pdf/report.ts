"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Project, ProjectResult } from "@/types";
import { computeProjectResult } from "@/lib/calculations";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import { formatPower, formatNumber, slug } from "@/lib/utils";

export function exportProjectPdf(project: Project): void {
  const result: ProjectResult = computeProjectResult(project);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // ── Title block ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Load Master — HVAC report", margin, y);
  y += 22;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(project.name, margin, y);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    `Generated: ${new Date().toLocaleString()}   ·   Building type: ${
      BUILDING_TYPE_LABELS[project.buildingType]
    }`,
    margin,
    y,
  );
  y += 18;
  doc.setTextColor(0);

  // ── Project info table ────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235] },
    head: [["Project info", "Value"]],
    body: [
      ["Project name", project.name],
      ["City / location", project.climate.city],
      ["Building type", BUILDING_TYPE_LABELS[project.buildingType]],
      ["Number of zones", String(project.zones.length)],
      ["Total floor area", `${formatNumber(result.totalArea, 1)} m²`],
      ["Safety margin", `${(project.safetyMargin * 100).toFixed(0)} %`],
      ["Diversity factor", project.diversityFactor.toFixed(2)],
    ],
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── Climate ───────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235] },
    head: [["Climate", "Value"]],
    body: [
      ["Outdoor winter design °C", project.climate.outdoorWinterDb.toString()],
      ["Outdoor summer design °C", project.climate.outdoorSummerDb.toString()],
      ["Outdoor summer RH %", project.climate.outdoorSummerRh.toString()],
      ["Indoor winter set-point °C", project.climate.indoorWinterDb.toString()],
      ["Indoor summer set-point °C", project.climate.indoorSummerDb.toString()],
      ["Indoor summer RH %", project.climate.indoorSummerRh.toString()],
      ["Altitude m", String(project.climate.altitudeM ?? 0)],
    ],
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── Project totals ────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [22, 163, 74] },
    head: [["Project totals", "Value"]],
    body: [
      ["Total heating load", formatPower(result.totalHeatingW)],
      ["Total cooling load", formatPower(result.totalCoolingW)],
      ["Recommended heating capacity", formatPower(result.recommendedHeatingW)],
      ["Recommended cooling capacity", formatPower(result.recommendedCoolingW)],
      ["Heating intensity W/m²", formatNumber(result.heatingPerM2, 1)],
      ["Cooling intensity W/m²", formatNumber(result.coolingPerM2, 1)],
    ],
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── Per-zone results ──────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [55, 65, 81] },
    head: [
      [
        "Zone",
        "Area m²",
        "Heat W",
        "Cool sens. W",
        "Cool lat. W",
        "Cool total W",
        "Reco heat W",
        "Reco cool W",
      ],
    ],
    body: result.zones.map((z) => [
      z.zoneName,
      formatNumber(z.floorArea, 1),
      formatNumber(z.totalHeatingW, 0),
      formatNumber(z.totalSensibleCoolingW, 0),
      formatNumber(z.totalLatentCoolingW, 0),
      formatNumber(z.totalCoolingW, 0),
      formatNumber(z.recommendedHeatingW, 0),
      formatNumber(z.recommendedCoolingW, 0),
    ]),
  });
  y = doc.lastAutoTable.finalY + 14;

  // ── Method ────────────────────────────────────────────────────────────
  if (y > 700) {
    doc.addPage();
    y = margin;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Calculation method", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const text =
    "Transparent simplified engineering load calculation based on public " +
    "heat-transfer and psychrometric formulas:\n" +
    "  Heating transmission: Q = U × A × (T_in - T_out)\n" +
    "  Heating ventilation:  Q = 0.335 × airflow_m3h × ΔT\n" +
    "  Cooling conduction:   Q = U × A × (T_out - T_in)\n" +
    "  Cooling solar gain:   Q = A_glass × SHGC × I × shading\n" +
    "  Latent ventilation:   Q = 0.83 × airflow_m3h × Δw (g/kg)\n" +
    "  Internal gains: lighting + equipment + people sens/lat from presets.";
  doc.text(text, margin, y, { maxWidth: pageWidth - margin * 2 });
  y += 110;

  doc.setFont("helvetica", "italic");
  doc.setTextColor(120);
  doc.setFontSize(8);
  doc.text(
    "Disclaimer: This tool uses transparent engineering formulas and " +
      "user-defined assumptions. It is not a certified regulatory calculation " +
      "unless validated by a qualified engineer.",
    margin,
    y,
    { maxWidth: pageWidth - margin * 2 },
  );

  doc.save(`${slug(project.name, "report")}-loadmaster.pdf`);
}
