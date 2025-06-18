import Image from "next/image";
import { AlternativeLogo } from "@/components/decoration/AlternativeLogo";
import { useLanguage } from "@/contexts/LanguageContext";

export const OmnichainBridgeVisualization = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full">
      {/* immersive background */}
      <div className="relative bg-gradient-to-br from-slate-100 via-purple-50/30 to-pink-50/30 backdrop-blur-xl border-y border-purple-200/20 overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        {/* Subtle background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent"></div>
          <div
            className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-transparent via-pink-100/10 to-transparent animate-spin"
            style={{ animationDuration: "120s" }}
          ></div>
        </div>

        {/* Refined floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-300/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-12 mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                {t.hero.omnichain.title}
              </span>
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.hero.omnichain.subtitle}
            </p>
          </div>

          <div className="relative mx-auto">
            {/* Expanded container with clean design */}
            <div className="relative h-[600px] md:h-[700px] lg:h-[800px] flex items-center justify-center">
              {/* Enhanced Background Rings with pulsing */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className="w-48 h-48 rounded-full border border-pink-200/50 animate-ping"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute inset-0 w-72 h-72 rounded-full border border-purple-200/30 animate-ping"
                  style={{
                    animationDuration: "4s",
                    animationDelay: "1s",
                  }}
                ></div>
                <div
                  className="absolute inset-0 w-96 h-96 rounded-full border border-blue-200/20 animate-ping"
                  style={{
                    animationDuration: "5s",
                    animationDelay: "2s",
                  }}
                ></div>
                <div
                  className="absolute inset-0 w-[30rem] h-[30rem] rounded-full border border-pink-200/10 animate-ping"
                  style={{
                    animationDuration: "6s",
                    animationDelay: "3s",
                  }}
                ></div>
              </div>

              {/* Central Lotus Hub - Enhanced with slower pulsing */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="text-center">
                  <div className="relative">
                    {/* Multiple pulsing glow layers with slower animation */}
                    <div
                      className="absolute inset-0 w-36 h-36 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-2xl opacity-40 animate-pulse"
                      style={{ animationDuration: "4s" }}
                    ></div>
                    <div
                      className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse"
                      style={{
                        animationDelay: "2s",
                        animationDuration: "4s",
                      }}
                    ></div>

                    {/* Main hub with slower pulsing */}
                    <div
                      className="relative w-32 h-32 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/90 backdrop-blur-sm mx-auto mb-6 hover:scale-110 transition-all duration-500 cursor-pointer group animate-pulse"
                      style={{ animationDuration: "3s" }}
                    >
                      <div className="text-white transform group-hover:scale-110 transition-transform duration-500">
                        <AlternativeLogo />
                      </div>
                      {/* Multiple rotating and pulsing rings with slower timing */}
                      <div
                        className="absolute inset-0 rounded-full border-2 border-pink-300/60 animate-spin"
                        style={{ animationDuration: "12s" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border border-blue-300/30 animate-ping"
                        style={{ animationDuration: "4s" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border border-purple-300/20 animate-ping"
                        style={{
                          animationDelay: "2s",
                          animationDuration: "4s",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200/50 shadow-xl">
                      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text">
                        {t.hero.omnichain.hubLabel}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t.hero.omnichain.hubSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chain Positions */}
              {/* Ethereum - Top */}
              <div className="absolute top-12 md:top-16 left-1/2 transform -translate-x-1/2 text-center group z-20">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-125 transition-all duration-500 mx-auto border-4 border-white/90 backdrop-blur-sm">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Image
                        src="/chain-icons/ethereum.png"
                        width={32}
                        height={32}
                        alt="Ethereum"
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                      />
                    </div>
                  </div>{" "}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-gray-200/50">
                    <p className="font-bold text-gray-800 text-sm md:text-base">
                      Ethereum
                    </p>
                    <p className="text-xs text-gray-600">
                      {t.hero.omnichain.networkLabels.ethereum}
                    </p>
                  </div>
                </div>
              </div>

              {/* Polygon - Top Right */}
              <div className="absolute top-20 md:top-24 right-8 md:right-20 lg:right-32 text-center group z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-125 transition-all duration-500 mx-auto border-4 border-white/90 backdrop-blur-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Image
                      src="/chain-icons/polygon.png"
                      width={32}
                      height={32}
                      alt="Polygon"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-gray-200/50">
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    Polygon
                  </p>
                  <p className="text-xs text-gray-600">
                    {t.hero.omnichain.networkLabels.polygon}
                  </p>
                </div>
              </div>

              {/* Base - Right */}
              <div className="absolute top-1/2 right-4 md:right-12 lg:right-24 transform -translate-y-1/2 text-center group z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-125 transition-all duration-500 mx-auto border-4 border-white/90 backdrop-blur-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Image
                      src="/chain-icons/base.png"
                      width={32}
                      height={32}
                      alt="Base"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-gray-200/50">
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    Base
                  </p>
                  <p className="text-xs text-gray-600">
                    {t.hero.omnichain.networkLabels.base}
                  </p>
                </div>
              </div>

              {/* Optimism - Bottom Right */}
              <div className="absolute bottom-20 md:bottom-24 right-8 md:right-20 lg:right-32 text-center group z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-125 transition-all duration-500 mx-auto border-4 border-white/90 backdrop-blur-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Image
                      src="/chain-icons/optimism.png"
                      width={32}
                      height={32}
                      alt="Optimism"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-gray-200/50">
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    Optimism
                  </p>
                  <p className="text-xs text-gray-600">
                    {t.hero.omnichain.networkLabels.optimism}
                  </p>
                </div>
              </div>

              {/* Arbitrum - Bottom */}
              <div className="absolute bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 text-center group z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-125 transition-all duration-500 mx-auto border-4 border-white/90 backdrop-blur-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Image
                      src="/chain-icons/arbitrum.png"
                      width={32}
                      height={32}
                      alt="Arbitrum"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-gray-200/50">
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    Arbitrum
                  </p>
                  <p className="text-xs text-gray-600">
                    {t.hero.omnichain.networkLabels.arbitrum}
                  </p>
                </div>
              </div>

              {/* BSC - Left */}
              <div className="absolute top-1/2 left-4 md:left-12 lg:left-24 transform -translate-y-1/2 text-center group z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-125 transition-all duration-500 mx-auto border-4 border-white/90 backdrop-blur-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Image
                      src="/chain-icons/bsc.png"
                      width={32}
                      height={32}
                      alt="BSC"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-gray-200/50">
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    BSC
                  </p>
                  <p className="text-xs text-gray-600">
                    {t.hero.omnichain.networkLabels.bsc}
                  </p>
                </div>
              </div>

              {/* Enhanced Flow Particles with pulsing */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(18)].map((_, i) => {
                  const angle = i * 20 * (Math.PI / 180);
                  const radius = 140 + (i % 3) * 25;
                  const centerX = 50;
                  const centerY = 50;

                  return (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping opacity-60"
                      style={{
                        left: `${
                          centerX + Math.cos(angle) * ((radius / 100) * 35)
                        }%`,
                        top: `${
                          centerY + Math.sin(angle) * ((radius / 100) * 35)
                        }%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "3s",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clean Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text mb-2">
                  6+
                </div>
                <div className="text-sm text-gray-600">
                  {t.hero.omnichain.stats.networks}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text mb-2">
                  1
                </div>
                <div className="text-sm text-gray-600">
                  {t.hero.omnichain.stats.transaction}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text mb-2">
                  ~15s
                </div>
                <div className="text-sm text-gray-600">
                  {t.hero.omnichain.stats.bridgeTime}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text mb-2">
                  99.9%
                </div>
                <div className="text-sm text-gray-600">
                  {t.hero.omnichain.stats.successRate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
