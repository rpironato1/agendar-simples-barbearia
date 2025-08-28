import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassSurface, ShinyText, CountUp } from "@/components/reactbits";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  showStats?: boolean;
  stats?: {
    clients: number;
    rating: number;
    barbers: number;
    years: number;
  };
  className?: string;
}

export const Hero = ({
  title = "Estilo que Define Você",
  subtitle = "Define",
  description = "Experimente o melhor em cortes masculinos e cuidados com a barba. Profissionais qualificados, ambiente premium e atendimento personalizado.",
  primaryButtonText = "Agendar Horário",
  secondaryButtonText = "WhatsApp",
  onPrimaryClick,
  onSecondaryClick,
  showStats = true,
  stats = {
    clients: 500,
    rating: 5,
    barbers: 3,
    years: 5,
  },
  className = "",
}: HeroProps) => {
  const navigate = useNavigate();

  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      navigate("/booking");
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      window.open("https://wa.me/5511999999999", "_blank");
    }
  };

  return (
    <section className={`relative py-20 lg:py-32 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23F59E0B' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.h1
              className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {title.split(subtitle)[0]}
              <ShinyText text={subtitle} className="inline-block" speed={3} />
              {title.split(subtitle)[1]}
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {description}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={handlePrimaryClick}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-8 py-4 text-lg h-auto"
              >
                <Calendar className="mr-2 h-5 w-5" />
                {primaryButtonText}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleSecondaryClick}
                className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black px-8 py-4 text-lg h-auto"
              >
                <Phone className="mr-2 h-5 w-5" />
                {secondaryButtonText}
              </Button>
            </motion.div>
          </div>

          {showStats && (
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <GlassSurface
                borderRadius={24}
                backgroundOpacity={0.1}
                className="p-8"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      <CountUp to={stats.clients} suffix="+" />
                    </div>
                    <div className="text-gray-300">Clientes Satisfeitos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      <CountUp to={stats.rating} suffix="★" />
                    </div>
                    <div className="text-gray-300">Avaliação Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      <CountUp to={stats.barbers} />
                    </div>
                    <div className="text-gray-300">Barbeiros Expert</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      <CountUp to={stats.years} suffix="+" />
                    </div>
                    <div className="text-gray-300">Anos de Tradição</div>
                  </div>
                </div>
              </GlassSurface>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
