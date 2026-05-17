"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Thermometer, Wind, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/I18nProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useProjectsStore } from "@/features/projects/store";
import {
  createDemoProject,
  createEmptyProject,
} from "@/features/projects/factory";

export default function LandingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const upsert = useProjectsStore((s) => s.upsert);

  async function startNew() {
    const p = createEmptyProject();
    await upsert(p);
    router.push(`/projects/${p.id}/setup`);
  }

  async function openDemo() {
    const p = createDemoProject();
    await upsert(p);
    router.push(`/projects/${p.id}/results`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center px-4 md:px-8 gap-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <Thermometer className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t.appName}</div>
            <div className="text-[11px] text-muted-foreground">HVAC loads</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <section className="text-center flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-[11px] tracking-widest font-semibold uppercase text-primary">
            Engineering · HVAC · Free &amp; open
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight max-w-3xl">
            {t.tagline}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Build multi-zone projects, enter envelope and ventilation data,
            and get transparent heating &amp; cooling load results with
            formulas you can verify.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button size="lg" onClick={startNew}>
              {t.cta.start} <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={openDemo}>
              {t.cta.demo}
            </Button>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Cpu className="size-5" />}
            title={t.sections.transparency}
            text={t.landing.transparencyText}
          />
          <Feature
            icon={<Wind className="size-5" />}
            title={t.sections.multizone}
            text={t.landing.multizoneText}
          />
          <Feature
            icon={<Thermometer className="size-5" />}
            title={t.sections.report}
            text={t.landing.reportText}
          />
        </section>

        <section className="mt-20">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.sections.features}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-sm">
            {t.landing.featuresList.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-md border bg-card px-4 py-3"
              >
                <Check className="size-4 text-success" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 text-xs text-muted-foreground border-t pt-8">
          <p>
            {t.appName} uses{" "}
            <em>
              transparent simplified engineering load calculation based on
              public heat-transfer and psychrometric formulas
            </em>
            . It is not a certified regulatory calculation method.
          </p>
        </section>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 flex flex-col gap-2 hover:shadow-card-lg transition-shadow">
      <div className="size-9 rounded-md bg-primary/10 text-primary grid place-items-center">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
