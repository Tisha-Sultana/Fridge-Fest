// src/components/theme-toggle-button.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggleButton() {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setMounted(true);

    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      setCurrentTheme(newTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = (isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light";
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setCurrentTheme(newTheme);
  };

  if (!mounted) {
    // Render a placeholder to avoid hydration mismatch
    return (
      <div className="flex items-center space-x-2 h-10">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <Switch id="theme-switch-placeholder" disabled aria-label="Toggle theme" />
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-colors ${currentTheme === 'light' ? 'text-accent' : 'text-muted-foreground'}`} />
      <Switch
        id="theme-switch"
        checked={currentTheme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label={currentTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      />
      <Moon className={`h-[1.2rem] w-[1.2rem] transition-colors ${currentTheme === 'dark' ? 'text-accent' : 'text-muted-foreground'}`} />
    </div>
  );
}

