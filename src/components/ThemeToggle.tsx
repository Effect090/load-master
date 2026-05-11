"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function next() {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={next}
      title={`Theme: ${theme}`}
    >
      <Icon className="size-4" />
    </Button>
  );
}
