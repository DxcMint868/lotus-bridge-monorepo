"use client";

import { useState, useEffect } from "react";
import { FloatingPetals } from "@/components/sections/FloatingPetals";
import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { VietnameseTokensSection } from "@/components/sections/VietnameseTokensSection";
import { VietnameseInnovationSection } from "@/components/sections/VietnameseInnovationSection";
import { NetworksSection } from "@/components/sections/NetworksSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";

export default function LotusLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100/50 relative overflow-hidden">
      <FloatingPetals />
      <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <HeroSection />
      <FeaturesSection />
      <VietnameseTokensSection />
      <VietnameseInnovationSection />
      <NetworksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
