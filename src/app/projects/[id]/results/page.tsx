"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectSummaryCards } from "@/components/ProjectSummaryCards";
import { CalculationSummary } from "@/components/CalculationSummary";
import { ZoneResultsTable } from "@/components/ZoneResultsTable";
import {
  ZoneCompareBars,
  LoadBreakdownPie,
} from "@/components/LoadBreakdownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { WarningBanner } from "@/components/WarningBanner";
import { useProject } from "@/features/projects/useProject";
import { computeProjectResult } from "@/lib/calculations";
import { ExportButtons } from "@/components/ExportButtons";
import { useI18n } from "@/components/I18nProvider";
import {
  AlertCircle,
  BarChart3,
  Layers,
  Sun,
  Wind,
  Users,
  Lightbulb,
  Cpu,
} from "lucide-react";

function fkW(w: number): string {
  if (!Number.isFinite(w)) return "—";
  return (w / 1000).toFixed(2);
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { project, setProject, notFound } = useProject(id);
  const { t } = useI18n();

  const result = React.useMemo(
    () => (project ? computeProjectResult(project) : null),
    [project],
  );

  const { zoneRows, heatingByZone, coolingByZone, componentTotals } =
    React.useMemo(() => {
      if (!result)
        return {
          zoneRows: [],
          heatingByZone: [],
          coolingByZone: [],
          componentTotals: {
            transmission: 0,
            solar: 0,
            ventilationSens: 0,
            ventilationLat: 0,
            people: 0,
            lighting: 0,
            equipment: 0,
          },
        };

      const componentTotals = result.zones.reduce(
        (acc, z) => ({
          transmission: acc.transmission + z.coolingConductionW,
          solar: acc.solar + z.coolingSolarW,
          ventilationSens:
            acc.ventilationSens +
            z.coolingVentilationSensibleW +
            z.coolingInfiltrationSensibleW,
          ventilationLat:
            acc.ventilationLat +
            z.coolingVentilationLatentW +
            z.coolingInfiltrationLatentW,
          people: acc.people + z.peopleSensibleW + z.peopleLatentW,
          lighting: acc.lighting + z.lightingW,
          equipment: acc.equipment + z.equipmentW,
        }),
        {
          transmission: 0,
          solar: 0,
          ventilationSens: 0,
          ventilationLat: 0,
          people: 0,
          lighting: 0,
          equipment: 0,
        },
      );

      return {
        zoneRows: result.zones.map((z) => ({
          zone: z.zoneName,
          heating: Math.round(z.totalHeatingW),
          cooling: Math.round(z.totalCoolingW),
        })),
        heatingByZone: result.zones.map((z) => ({
          name: z.zoneName,
          value: Math.round(z.totalHeatingW),
        })),
        coolingByZone: result.zones.map((z) => ({
          name: z.zoneName,
          value: Math.round(z.totalCoolingW),
        })),
        componentTotals,
      };
    }, [result]);

  if (notFound) {
    return (
      <AppShell title={t.project.results}>
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title="Project not found"
          action={
            <Link href="/dashboard">
              <Button>Back to dashboard</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }
  if (!project || !result) {
    return (
      <AppShell title={t.project.results}>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-12" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px]" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </AppShell>
    );
  }

  if (project.zones.length === 0) {
    return (
      <AppShell title={project.name}>
        <div className="flex flex-col gap-6">
          <ProjectHeader project={project} result={result} />
          <ProjectTabs projectId={project.id} />
          <EmptyState
            icon={<Layers className="size-6" />}
            title="No zones to calculate yet"
            description="Add at least one zone with envelope and ventilation data to see heating and cooling load results."
            action={
              <Link href={`/projects/${project.id}/zones`}>
                <Button>
                  Define zones
                </Button>
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={project.name}
      actions={
        <ExportButtons
          project={project}
          onImport={(p) => void setProject({ ...p, id: project.id })}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <ProjectHeader project={project} result={result} />
        <ProjectTabs projectId={project.id} />

        <ProjectSummaryCards
          result={result}
          safetyMargin={project.safetyMargin}
          diversityFactor={project.diversityFactor}
        />

        {result.warnings.length > 0 && (
          <WarningBanner warnings={result.warnings} />
        )}

        <CalculationSummary project={project} result={result} />

        {/* Cooling component breakdown — shows what is driving the cooling load */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                <BarChart3 className="size-4" />
              </span>
              <CardTitle>Cooling load components</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ComponentMetric
              icon={<Layers className="size-4" />}
              label="Transmission"
              w={componentTotals.transmission}
              total={result.totalCoolingW}
              tone="primary"
            />
            <ComponentMetric
              icon={<Sun className="size-4" />}
              label="Solar gain"
              w={componentTotals.solar}
              total={result.totalCoolingW}
              tone="warning"
            />
            <ComponentMetric
              icon={<Wind className="size-4" />}
              label="Ventilation + Infil"
              w={componentTotals.ventilationSens + componentTotals.ventilationLat}
              total={result.totalCoolingW}
              tone="info"
            />
            <ComponentMetric
              icon={<Users className="size-4" />}
              label="People"
              w={componentTotals.people}
              total={result.totalCoolingW}
              tone="success"
            />
            <ComponentMetric
              icon={<Lightbulb className="size-4" />}
              label="Lighting"
              w={componentTotals.lighting}
              total={result.totalCoolingW}
              tone="default"
            />
            <ComponentMetric
              icon={<Cpu className="size-4" />}
              label="Equipment"
              w={componentTotals.equipment}
              total={result.totalCoolingW}
              tone="default"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.results.breakdown}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="label mb-2">Heating by zone</p>
              <LoadBreakdownPie data={heatingByZone} />
            </div>
            <div>
              <p className="label mb-2">Cooling by zone</p>
              <LoadBreakdownPie data={coolingByZone} />
            </div>
            <div className="lg:col-span-2">
              <p className="label mb-2">Zone comparison</p>
              <ZoneCompareBars data={zoneRows} />
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="flex flex-col gap-6"
        >
          {result.zones.map((z) => (
            <motion.div
              key={z.zoneId}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <ZoneResultsTable result={z} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppShell>
  );
}

function ComponentMetric({
  icon,
  label,
  w,
  total,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  w: number;
  total: number;
  tone: React.ComponentProps<typeof MetricCard>["tone"];
}) {
  const pct = total > 0 ? Math.round((w / total) * 100) : 0;
  return (
    <MetricCard
      icon={icon}
      label={label}
      value={fkW(w)}
      unit="kW"
      sub={`${pct}% of total cooling`}
      tone={tone}
    />
  );
}
