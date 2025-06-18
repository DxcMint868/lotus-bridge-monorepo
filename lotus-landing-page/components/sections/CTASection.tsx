import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { AlternativeLogo } from "../decoration/AlternativeLogo";
import { useLanguage } from "@/contexts/LanguageContext";

export const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <Card className="backdrop-blur-md bg-gradient-to-br from-pink-400/20 to-pink-500/20 border-white/30 shadow-2xl">
          <CardContent className="p-12">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-8">
              <AlternativeLogo className={"w-full h-full"} />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                {t.cta.title}
              </span>
            </h2>

            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t.cta.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-lg px-8 py-4"
              >
                {t.cta.tradeNow}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-300 text-pink-600 hover:bg-pink-50 text-lg px-8 py-4"
              >
                {t.cta.joinCommunity}
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
