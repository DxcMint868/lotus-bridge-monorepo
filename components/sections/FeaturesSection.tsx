import { Globe, Zap, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: t.features.items.omnichain.title,
      subtitle: t.features.items.omnichain.subtitle,
      description: t.features.items.omnichain.description,
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t.features.items.vietnamese.title,
      subtitle: t.features.items.vietnamese.subtitle,
      description: t.features.items.vietnamese.description,
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t.features.items.oneClick.title,
      subtitle: t.features.items.oneClick.subtitle,
      description: t.features.items.oneClick.description,
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t.features.items.security.title,
      subtitle: t.features.items.security.subtitle,
      description: t.features.items.security.description,
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              {t.features.title}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-md bg-white/40 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-sm text-pink-600 font-medium mb-3">
                  {feature.subtitle}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
