"use client";

import * as React from "react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/Button";
import { Download, FileText, Upload } from "lucide-react";
import { parseProjectJson } from "@/lib/projects/io";
import { slug } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ExportButtons({
  project,
  onImport,
  className,
}: {
  project: Project;
  onImport?: (p: Project) => void;
  className?: string;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = React.useState(false);

  async function exportPdf() {
    setExporting(true);
    try {
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
    <div
      className={cn(
        "flex flex-wrap gap-2 w-full",
        /* Full-width stacked buttons on narrow screens for easier tapping */
        "[&_button]:flex-1 [&_button]:min-w-[calc(50%-0.25rem)] sm:[&_button]:flex-none sm:[&_button]:min-w-0",
        className,
      )}
    >
      <Button
        onClick={exportPdf}
        variant="default"
        disabled={exporting}
        size="sm"
        className="md:h-9 md:px-4 md:text-sm"
      >
        <FileText className="size-4 shrink-0" />
        <span className="truncate">
          {exporting ? "Exportingâ€¦" : "Export PDF"}
        </span>
      </Button>
      <Button
        onClick={exportJson}
        variant="outline"
        size="sm"
        className="md:h-9 md:px-4 md:text-sm"
      >
        <Download className="size-4 shrink-0" />
        <span className="truncate">Export JSON</span>
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
          <Button
            onClick={() => fileRef.current?.click()}
            variant="outline"
            size="sm"
            className="md:h-9 md:px-4 md:text-sm"
          >
            <Upload className="size-4 shrink-0" />
            <span className="truncate">Import JSON</span>
          </Button>
        </>
      )}
    </div>
  );
}

