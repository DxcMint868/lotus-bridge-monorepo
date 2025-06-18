import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WalletConnection from "./WalletConnection";

const Header = () => {
  const [language, setLanguage] = useState<"EN" | "VI">("EN");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "EN" ? "VI" : "EN"));
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="lotus-animate">
              <img
                src="/logos/petals-glass-2.png"
                alt="Lotus Logo"
                width={100}
                height={100}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold lotus-text-gradient">
                Lotus Bridge
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Vietnamese Multichain Bridge
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex border-border/50 hover:bg-muted/50"
            >
              <span className="text-sm">{isDark ? "☀️" : "🌙"}</span>
            </Button>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex border-border/50 hover:bg-muted/50"
            >
              <span className="text-sm font-medium">{language}</span>
            </Button>

            {/* Wallet Connection */}
            <WalletConnection />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
