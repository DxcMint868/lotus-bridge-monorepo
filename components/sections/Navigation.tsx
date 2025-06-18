"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AlternativeLogo } from "@/components/decoration/AlternativeLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export const Navigation = ({ isMenuOpen, setIsMenuOpen }: NavigationProps) => {
  const { t } = useLanguage();

  return (
    <nav className="relative z-50 backdrop-blur-md bg-white/30 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <AlternativeLogo />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              Lotus Bridge
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              {t.nav.features}
            </a>
            <a
              href="#networks"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              {t.nav.networks}
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              {t.nav.about}
            </a>
            <LanguageSwitcher />
            <Button className="lotus-gradient hover:from-pink-600 hover:to-pink-700">
              {t.nav.connectWallet}
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
