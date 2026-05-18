"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Stepper, type StepperItem } from "@/components/ui/Stepper";
import { useI18n } from "./I18nProvider";

/**
 * Project workflow stepper — replaces the old underline tab strip.
 * Visually communicates the engineering flow:
 *   Setup → Zones → Results → Report
 */
export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const steps: StepperItem[] = [
    { id: "setup", label: t.project.setup, href: `/projects/${projectId}/setup` },
    { id: "zones", label: t.project.zones, href: `/projects/${projectId}/zones` },
    { id: "results", label: t.project.results, href: `/projects/${projectId}/results` },
    { id: "report", label: t.project.report, href: `/projects/${projectId}/report` },
  ];

  const current =
    steps.find((s) => pathname?.startsWith(s.href!))?.id ?? "setup";

  return <Stepper steps={steps} current={current} />;
}
