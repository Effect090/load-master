"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Settings,
  Thermometer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "./I18nProvider";
import { UserMenu } from "./UserMenu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const items: NavItem[] = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/projects/new", label: t.nav.newProject, icon: Plus },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "shrink-0 border-r bg-card/60 backdrop-blur flex flex-col",
        "w-full md:w-64",
        className,
      )}
    >
      <Link
        href="/"
        className="px-5 h-16 flex items-center gap-3 border-b"
      >
        <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center shadow-card ring-1 ring-primary/20">
          <Thermometer className="size-5" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold tracking-tight truncate">
            Load Master
          </div>
          <div className="text-[11px] text-muted-foreground">
            HVAC engineering suite
          </div>
        </div>
      </Link>

      <nav className="p-3 flex flex-col gap-0.5">
        <p className="label px-2 py-1.5">Navigate</p>
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname?.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-all duration-200 ease-out-expo",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary"
                />
              )}
              <it.icon className="size-4 shrink-0" />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t">
        <UserMenu />
      </div>

      <div className="p-4 border-t text-[11px] text-muted-foreground bg-muted/20">
        <p className="font-medium text-foreground/90">Engineering disclaimer</p>
        <p className="mt-1 leading-relaxed">
          Transparent simplified load calculation based on public heat-transfer
          and psychrometric formulas. Not a certified regulatory method.
        </p>
      </div>
    </aside>
  );
}
