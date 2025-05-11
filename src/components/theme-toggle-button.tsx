// src/components/theme-toggle-button.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggleButton() {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This effect runs once on the client after the component mounts.
    // It correctly sets the initial theme based on the <html> class (set by inline script)
    // and marks the component as mounted.
    setCurrentTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setMounted(true);

    // Optional: Observe class changes on <html> if other parts of the app might change it.
    // For this app, it's likely only this button changes it.
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      setCurrentTheme(newTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setCurrentTheme(newTheme); // Update local state for icon change
  };

  if (!mounted) {
    // Render a placeholder or disabled button to avoid hydration mismatch for the icon.
    // The button structure itself is static, so it's mainly the icon that could mismatch.
    return (
      <Button variant="outline" size="icon" className="rounded-full" disabled aria-label="Toggle theme">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={currentTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="rounded-full"
    >
      {currentTheme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
