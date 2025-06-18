import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { OmnichainBridgeVisualization } from "./OmnichainBridgeVisualization";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-20 pb-32">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-15% h-15% rounded-full mb-6">
            <img
              width={"100%"}
              height={"100%"}
              src="/logos/lotus-glass-1.png"
              alt="Lotus Bridge Logo"
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent">
            {t.hero.title}
          </span>
          <br />
          <span className="text-2xl md:text-3xl text-gray-600 font-normal">
            {t.hero.subtitle}
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t.hero.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-lg px-8 py-4"
          >
            {t.hero.exploreButton}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-pink-300 text-pink-600 hover:bg-pink-50 text-lg px-8 py-4"
          >
            <Link href="https://lotus-bridge-documentation.vercel.app/">
              {t.hero.readDocs}
            </Link>
            <ExternalLink className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <OmnichainBridgeVisualization />
      </div>
    </section>
  );
};
