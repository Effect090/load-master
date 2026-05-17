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
        "shrink-0 border-r bg-card flex flex-col",
        "w-full md:w-64",
        className,
      )}
    >
      <Link
        href="/"
        className="px-5 h-16 flex items-center gap-2 border-b"
      >
        <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
          <Thermometer className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{t.appName}</div>
          <div className="text-[11px] text-muted-foreground">HVAC loads</div>
        </div>
      </Link>
      <nav className="p-3 flex flex-col gap-1">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname?.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <it.icon className="size-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 border-t">
        <UserMenu />
      </div>
      <div className="p-4 border-t text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground">Engineering disclaimer</p>
        <p className="mt-1">
          Transparent simplified engineering load calculation based on public
          heat-transfer and psychrometric formulas.
        </p>
      </div>
    </aside>
  );
}
