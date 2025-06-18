import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Zap } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const vietnameseTokens = [
  {
    symbol: "VNST",
    name: "vnst",
    image: "/token-icons/vnst.png",
    category: "Stablecoin",
    featured: true,
  },
  {
    symbol: "VNDC",
    name: "vndc",
    image: "/token-icons/vndc.png",
    category: "Stablecoin",
    featured: true,
  },
  {
    symbol: "C98",
    name: "c98",
    image: "/token-icons/c98.png",
    category: "DeFi",
    featured: true,
  },
  {
    symbol: "AXS",
    name: "axs",
    image: "/token-icons/axs.png",
    category: "Gaming",
    featured: true,
  },
  {
    symbol: "SLP",
    name: "slp",
    image: "/token-icons/slp.png",
    category: "Gaming",
    featured: false,
  },
  {
    symbol: "SIPHER",
    name: "sipher",
    image: "/token-icons/sipher.png",
    category: "Gaming",
    featured: false,
  },
  {
    symbol: "KNC",
    name: "knc",
    image: "/token-icons/knc.png",
    category: "DeFi",
    featured: false,
  },
  {
    symbol: "KAI",
    name: "kai",
    image: "/token-icons/kai.png",
    category: "Infrastructure",
    featured: false,
  },
  {
    symbol: "RON",
    name: "ron",
    image: "/token-icons/ron.png",
    category: "Gaming",
    featured: false,
  },
];

export const VietnameseTokensSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          {/* Refined Vietnamese badge */}
          <div className="inline-flex items-center gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.vietnameseTokens.title}
            </h2>
          </div>
          <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 border border-white/20 max-w-4xl mx-auto">
            <p className="text-xl text-slate-700 leading-relaxed">
              {t.vietnameseTokens.description.split('{lowest}')[0]}
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {t.vietnameseTokens.lowestFees}
              </span>
              {t.vietnameseTokens.description.split('{lowest}')[1].split('{priority}')[0]}
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {t.vietnameseTokens.priorityProcessing}
              </span>
              {t.vietnameseTokens.description.split('{priority}')[1]}
            </p>
          </div>
        </div>

        {/* Featured Vietnamese Tokens */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-center mb-8 text-gray-700">
            {t.vietnameseTokens.featuredTokens}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                symbol: "VNST",
                image: "/token-icons/vnst.png",
                nameKey: "vnst",
                category: t.vietnameseTokens.categories.stablecoin,
                color: "bg-green-500",
              },
              {
                symbol: "VNDC",
                image: "/token-icons/vndc.png",
                nameKey: "vndc",
                category: t.vietnameseTokens.categories.stablecoin,
                color: "bg-blue-500",
              },
              {
                symbol: "C98",
                image: "/token-icons/c98.png",
                nameKey: "c98",
                category: t.vietnameseTokens.categories.defi,
                color: "bg-yellow-500",
              },
              {
                symbol: "AXS",
                image: "/token-icons/axs.png",
                nameKey: "axs",
                category: t.vietnameseTokens.categories.gaming,
                color: "bg-purple-500",
              },
            ].map((token, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden backdrop-blur-md bg-white/70 border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/80"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <Image
                      src={token.image}
                      alt={`${token.symbol} logo`}
                      width={50}
                      height={50}
                      className="object-contain rounded-full"
                    />
                  </div>

                  <h4 className="font-bold text-lg text-gray-900 mb-1">
                    {token.symbol}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{t.vietnameseTokens.tokens[token.nameKey as keyof typeof t.vietnameseTokens.tokens].name}</p>

                  <div className="mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        token.category === t.vietnameseTokens.categories.stablecoin
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : token.category === t.vietnameseTokens.categories.gaming
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {token.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t.vietnameseTokens.tokens[token.nameKey as keyof typeof t.vietnameseTokens.tokens].description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Vietnamese Tokens */}
        <div className="text-center">
          <Card className="backdrop-blur-md bg-white/60 border border-slate-200/50 max-w-4xl mx-auto shadow-lg">
            <CardContent className="p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                {t.vietnameseTokens.allTokensTitle}
              </h4>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {vietnameseTokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 backdrop-blur-sm bg-slate-50/80 rounded-full px-4 py-2 hover:bg-blue-50/80 transition-colors duration-200 border border-slate-200/50"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
                      <Image
                        src={token.image}
                        alt="token"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {token.symbol}
                    </span>
                  </div>
                ))}
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-xl p-6 mb-6 border border-emerald-100/50">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-700 text-lg">
                    {t.vietnameseTokens.benefits.title}
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700">{t.vietnameseTokens.benefits.items.reducedFees}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700">{t.vietnameseTokens.benefits.items.priority}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700">{t.vietnameseTokens.benefits.items.support}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 backdrop-blur-sm"
              >
                <ExternalLink className="mr-2 w-4 h-4" />
                {t.vietnameseTokens.viewAll}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
