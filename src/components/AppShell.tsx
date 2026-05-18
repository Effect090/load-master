"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-72 bg-card border-r shadow-card-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-2">
                <button
                  className="size-9 rounded-md hover:bg-accent grid place-items-center transition-colors"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b bg-background/85 backdrop-blur sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
          <button
            className="md:hidden size-9 rounded-md hover:bg-accent grid place-items-center transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold tracking-tight truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <UserMenu compact />
            <ThemeToggle />
          </div>
        </header>

        <motion.main
          key={typeof title === "string" ? title : "page"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
