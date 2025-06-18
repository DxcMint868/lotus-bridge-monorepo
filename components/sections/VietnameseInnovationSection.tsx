import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { AlternativeLogo } from "../decoration/AlternativeLogo";
import { useLanguage } from "@/contexts/LanguageContext";

export const VietnameseInnovationSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-50 to-pink-100"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                {t.innovation.title}
              </span>
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {t.innovation.description1}
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {t.innovation.description2}
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 mb-2">1M+</div>
                <div className="text-sm text-gray-600">{t.innovation.stats.transactions}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 mb-2">15+</div>
                <div className="text-sm text-gray-600">{t.innovation.stats.networks}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 mb-2">
                  50K+
                </div>
                <div className="text-sm text-gray-600">
                  {t.innovation.stats.users}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-pink-300 rounded-3xl transform rotate-6"></div>
            <Card className="relative backdrop-blur-md bg-white/60 border-white/40 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {/* <span className="text-3xl">🪷</span> */}
                    <AlternativeLogo className={"w-full h-full"} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Lotus Bridge
                  </h3>
                  <p className="text-pink-600">Made in Vietnam 🇻🇳</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Hỗ trợ VNST, VNDC, đa dạng các loại tài sản số
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Giao diện tiếng Việt</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Hỗ trợ 24/7 bằng tiếng Việt
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Phí giao dịch cạnh tranh trên thị trường
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
