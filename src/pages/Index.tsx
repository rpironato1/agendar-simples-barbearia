import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Star, Scissors, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Beams, 
  PillNav, 
  SpotlightCard, 
  GlassSurface, 
  ShinyText, 
  CountUp, 
  Stepper, 
  Step 
} from "@/components/reactbits";
import { Hero, Footer } from "@/components/layout";

// Mock data para demonstração
const services = [
  { id: 1, name: "Corte Clássico", duration: 30, price: 35, description: "Corte tradicional com acabamento perfeito" },
  { id: 2, name: "Barba Completa", duration: 25, price: 25, description: "Barba aparada e finalizada com toalha quente" },
  { id: 3, name: "Combo Premium", duration: 50, price: 55, description: "Corte + Barba com tratamento completo" },
  { id: 4, name: "Sobrancelha", duration: 15, price: 15, description: "Design e aparação de sobrancelhas" }
];

const testimonials = [
  { name: "Carlos Silva", rating: 5, comment: "Excelente atendimento! Sempre saio satisfeito." },
  { name: "João Santos", rating: 5, comment: "Profissionais top, ambiente acolhedor." },
  { name: "Roberto Lima", rating: 5, comment: "A melhor barbearia da região!" }
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const navItems = [
    { label: "Serviços", href: "#servicos" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
    { label: "Área do Cliente", href: "#", onClick: () => navigate('/user-login') },
    { label: "Admin", href: "#", onClick: () => navigate('/admin-login') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Animated Background */}
      <Beams color1="#FFD700" color2="#1E3A8A" opacity={0.2} />
      
      {/* Header with PillNav */}
      <motion.header 
        className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white">Elite Barber</h1>
            </motion.div>
            
            <div className="hidden md:block">
              <PillNav 
                items={navItems}
                baseColor="#1E3A8A"
                pillColor="#FFD700"
              />
            </div>
            
            <Button 
              onClick={() => navigate('/booking')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
            >
              <ShinyText text="Agendar Agora" speed={2} className="text-sm" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with ReactBits */}
      <Hero />

      {/* Serviços com SpotlightCards */}
      <section id="servicos" className="py-20 bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              <ShinyText text="Nossos Serviços" speed={4} />
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços para o homem moderno
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <SpotlightCard 
                key={service.id}
                spotlightColor="rgba(255, 215, 0, 0.3)"
                className="cursor-pointer transform transition-all duration-300"
                onClick={() => setSelectedService(service.id)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CardHeader className="text-center">
                    <motion.div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Scissors className="h-8 w-8 text-black" />
                    </motion.div>
                    <CardTitle className="text-white text-xl">{service.name}</CardTitle>
                    <CardDescription className="text-gray-400">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex justify-center items-center space-x-4 mb-4">
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {service.duration}min
                      </Badge>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        R$ {service.price}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/booking', { state: { selectedService: service.id } });
                      }}
                    >
                      Escolher Serviço
                    </Button>
                  </CardContent>
                </motion.div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Processo de Agendamento com Stepper */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              <ShinyText text="Como Agendar" speed={3} />
            </h2>
            <p className="text-xl text-gray-300">Simples em apenas 4 passos</p>
          </motion.div>
          
          <GlassSurface borderRadius={20} backgroundOpacity={0.1} className="p-8">
            <Stepper initialStep={1} stepIndicatorColor="#FFD700" activeStepColor="#1E3A8A">
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Escolha o Serviço</h3>
                  <p className="text-gray-400">Selecione o serviço que deseja</p>
                </div>
              </Step>
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Selecione o Barbeiro</h3>
                  <p className="text-gray-400">Escolha seu barbeiro preferido</p>
                </div>
              </Step>
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Escolha o Horário</h3>
                  <p className="text-gray-400">Selecione data e hora disponível</p>
                </div>
              </Step>
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Confirmação</h3>
                  <p className="text-gray-400">Confirme os dados e finalize</p>
                </div>
              </Step>
            </Stepper>
          </GlassSurface>
        </div>
      </section>

      {/* Depoimentos com GlassSurface */}
      <section className="py-20 bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              <ShinyText text="Clientes Satisfeitos" speed={5} />
            </h2>
            <p className="text-xl text-gray-300">Experiências reais de quem confia no nosso trabalho</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <GlassSurface 
                key={index} 
                borderRadius={16} 
                backgroundOpacity={0.1}
                className="transform transition-all duration-300 hover:scale-105"
              >
                <motion.div
                  className="p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <Star className="h-5 w-5 text-amber-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">&quot;{testimonial.comment}&quot;</p>
                  <p className="text-white font-semibold">- {testimonial.name}</p>
                </motion.div>
              </GlassSurface>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              <ShinyText text="Entre em Contato" speed={4} />
            </h2>
            <p className="text-xl text-gray-300">Estamos prontos para atendê-lo</p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <motion.div 
                  className="bg-amber-500 p-3 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="h-6 w-6 text-black" />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Endereço</h3>
                  <p className="text-gray-300">
                    Rua das Flores, 123 - Centro<br />
                    São Paulo, SP - 01234-567
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <motion.div 
                  className="bg-amber-500 p-3 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone className="h-6 w-6 text-black" />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Telefone</h3>
                  <p className="text-gray-300">(11) 99999-9999</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <motion.div 
                  className="bg-amber-500 p-3 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="h-6 w-6 text-black" />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Horário de Funcionamento</h3>
                  <p className="text-gray-300">
                    Segunda a Sexta: 9h às 19h<br />
                    Sábado: 8h às 17h<br />
                    Domingo: Fechado
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassSurface borderRadius={16} backgroundOpacity={0.1}>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-white text-xl font-semibold">Agende Seu Horário</h3>
                    <p className="text-gray-400 mt-2">
                      Reserve já o seu horário e garanta o melhor atendimento
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-4 text-lg"
                      onClick={() => navigate('/booking')}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Agendar Online
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black py-4 text-lg"
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </GlassSurface>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Modular */}
      <Footer 
        brandName="Elite Barber"
        description="Desenvolvido com ❤️ para o homem moderno."
      />
    </div>
  );
};

export default Index;
