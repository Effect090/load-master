"use client";

import * as React from "react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/Button";
import { Download, FileText, Upload } from "lucide-react";
import { parseProjectJson } from "@/lib/projects/io";
import { slug } from "@/lib/utils";

export function ExportButtons({
  project,
  onImport,
}: {
  project: Project;
  onImport?: (p: Project) => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = React.useState(false);

  async function exportPdf() {
    setExporting(true);
    try {
      // Lazy-load jsPDF + autotable only when the user actually exports,
      // keeping ~200KB of code out of the initial bundle.
      const { exportProjectPdf } = await import("@/lib/pdf/report");
      await exportProjectPdf(project);
    } catch (e) {
      alert(`Could not export PDF: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(project.name)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseProjectJson(String(reader.result));
      if (!result.ok || !result.project) {
        alert(`Could not import: ${result.error}`);
        return;
      }
      onImport?.(result.project);
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={exportPdf} variant="default" disabled={exporting}>
        <FileText className="size-4" /> {exporting ? "Exporting…" : "Export PDF"}
      </Button>
      <Button onClick={exportJson} variant="outline">
        <Download className="size-4" /> Export JSON
      </Button>
      {onImport && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
          <Button onClick={() => fileRef.current?.click()} variant="outline">
            <Upload className="size-4" /> Import JSON
          </Button>
        </>
      )}
    </div>
  );
}
