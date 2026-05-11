"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";

export function AppShell({
  title,
  actions,
  children,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex h-screen sticky top-0" />

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-64 bg-card border-r"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <button
                className="size-8 rounded-md hover:bg-accent grid place-items-center"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
          <button
            className="md:hidden size-9 rounded-md hover:bg-accent grid place-items-center"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
