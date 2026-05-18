"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Thermometer,
  Wind,
  Cpu,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
      {/* Header */}
      <header className="h-16 border-b bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 md:px-8 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center shadow-card ring-1 ring-primary/20">
            <Thermometer className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              Load Master
            </div>
            <div className="text-[11px] text-muted-foreground">
              HVAC engineering suite
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 ml-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm">
              Open app
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="info" className="px-3 py-1 text-xs">
                <Sparkles className="size-3" />
                Engineering · HVAC · Free &amp; open
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-3xl"
            >
              {t.tagline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              Build multi-zone projects, enter envelope and ventilation data,
              and get transparent heating &amp; cooling load results with
              formulas you can verify.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap justify-center gap-3 mt-2"
            >
              <Button size="lg" onClick={startNew}>
                {t.cta.start}
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={openDemo}>
                {t.cta.demo}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-success" />
                Local-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" />
                Transparent formulas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" />
                Multi-zone, multi-envelope
              </span>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="max-w-5xl mx-auto px-4 md:px-8 pb-20"
        >
          <p className="label text-center mb-3">Built for engineers</p>
          <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-tight max-w-2xl mx-auto">
            A focused, premium calculation tool
          </h2>
          <p className="text-center text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            Designed for HVAC, mechanical and energy engineers who need
            quick, defensible peak-load estimates.
          </p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-10 grid gap-6 md:grid-cols-3"
          >
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
          </motion.div>
        </section>

        {/* Feature list */}
        <section id="how" className="max-w-5xl mx-auto px-4 md:px-8 pb-20">
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t.sections.features}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-sm">
            {t.landing.featuresList.map((f) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-card hover:shadow-card-lg transition-shadow"
              >
                <Check className="size-4 text-success shrink-0" />
                <span className="text-foreground/90">{f}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 pb-16 text-xs text-muted-foreground border-t pt-8">
          <p className="leading-relaxed">
            Load Master uses{" "}
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
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="rounded-xl border bg-card p-6 flex flex-col gap-2 hover:shadow-card-lg transition-shadow surface-soft"
    >
      <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center ring-1 ring-primary/15">
        {icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight mt-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </motion.div>
  );
}
