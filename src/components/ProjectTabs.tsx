"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "./I18nProvider";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const tabs = [
    { href: `/projects/${projectId}/setup`, label: t.project.setup },
    { href: `/projects/${projectId}/zones`, label: t.project.zones },
    { href: `/projects/${projectId}/results`, label: t.project.results },
    { href: `/projects/${projectId}/report`, label: t.project.report },
  ];
  return (
    <div className="border-b">
      <nav className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "h-9 px-4 inline-flex items-center text-sm rounded-t-md border-b-2 -mb-px transition-colors",
                active
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
