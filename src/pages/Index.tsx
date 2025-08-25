import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Star, Scissors, MapPin, Phone, Menu, X } from "lucide-react";
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
import { 
  ResponsiveLayout, 
  Container, 
  ResponsiveGrid, 
  Stack, 
  Section,
  TouchButton,
  TouchCard,
  useIsMobile,
  useScreenSize 
} from "@/components/mobile-first";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { width } = useScreenSize();

  const navItems = [
    { label: "Serviços", href: "#servicos" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
    { label: "Área do Cliente", href: "#", onClick: () => navigate('/user-login') },
    { label: "Admin", href: "#", onClick: () => navigate('/admin-login') }
  ];

  return (
    <ResponsiveLayout className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Animated Background */}
      <Beams color1="#FFD700" color2="#1E3A8A" opacity={0.2} />
      
      {/* Mobile-First Header */}
      <motion.header 
        className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Container>
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Elite Barber</h1>
            </motion.div>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:block">
                <PillNav 
                  items={navItems}
                  baseColor="#1E3A8A"
                  pillColor="#FFD700"
                />
              </div>
            )}
            
            {/* Mobile Menu Button & CTA */}
            <div className="flex items-center gap-3">
              <TouchButton 
                variant="primary"
                size="md"
                onClick={() => navigate('/booking')}
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-500 hover:to-amber-700"
              >
                {isMobile ? "Agendar" : "Agendar Agora"}
              </TouchButton>
              
              {isMobile && (
                <TouchButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </TouchButton>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-amber-500/20 py-4"
            >
              <Stack spacing="sm">
                {navItems.map((item, index) => (
                  <TouchButton
                    key={index}
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => {
                      item.onClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white justify-start"
                  >
                    {item.label}
                  </TouchButton>
                ))}
              </Stack>
            </motion.div>
          )}
        </Container>
      </motion.header>

      {/* Hero Section - Mobile-First */}
      <Section fullHeight className="flex items-center">
        <Container>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Estilo que{" "}
                <ShinyText className="text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                  Define
                </ShinyText>{" "}
                Você
              </h1>
              <p className="text-lg md:text-xl text-overlay-accessible mb-8 leading-relaxed">
                Experimente o melhor em cortes masculinos e cuidados com a barba. 
                Profissionais qualificados, ambiente premium e atendimento personalizado.
              </p>
              <Stack direction={isMobile ? "vertical" : "horizontal"} spacing="md" className="items-center lg:items-start">
                <TouchButton
                  size="lg"
                  onClick={() => navigate('/booking')}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-500 hover:to-amber-700 min-w-[200px]"
                  fullWidth={isMobile}
                >
                  <Calendar className="h-5 w-5" />
                  Agendar Horário
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="lg"
                  onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                  className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black min-w-[200px]"
                  fullWidth={isMobile}
                >
                  <Phone className="h-5 w-5" />
                  WhatsApp
                </TouchButton>
              </Stack>
            </motion.div>

            {/* Stats Section - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              <GlassSurface className="text-center p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">
                  <CountUp end={1200} duration={2} />+
                </div>
                <div className="text-sm md:text-base text-gray-300">Clientes Satisfeitos</div>
              </GlassSurface>
              
              <GlassSurface className="text-center p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-2 flex items-center justify-center">
                  <CountUp end={4.9} duration={2} decimals={1} />★
                </div>
                <div className="text-sm md:text-base text-gray-300">Avaliação Média</div>
              </GlassSurface>
              
              <GlassSurface className="text-center p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">
                  <CountUp end={8} duration={2} />
                </div>
                <div className="text-sm md:text-base text-gray-300">Barbeiros Expert</div>
              </GlassSurface>
              
              <GlassSurface className="text-center p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">
                  <CountUp end={15} duration={2} />+
                </div>
                <div className="text-sm md:text-base text-gray-300">Anos de Tradição</div>
              </GlassSurface>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Services Section - Mobile-First */}
      <Section id="servicos" background="muted" className="section-accessible">
        <Container>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-accessible mb-4">
              <ShinyText text="Nossos Serviços" speed={4} />
            </h2>
            <p className="text-lg md:text-xl text-enhanced-contrast max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços para o homem moderno
            </p>
          </motion.div>
          
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 4 }}
            gap="lg"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TouchCard 
                  hover
                  className="bg-black/30 border-amber-500/20 backdrop-blur-sm h-full"
                  onClick={() => setSelectedService(service.id)}
                >
                  <Stack spacing="md" align="center" className="text-center">
                    <motion.div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Scissors className="h-8 w-8 text-black" />
                    </motion.div>
                    
                    <div>
                      <h3 className="text-white text-xl font-bold mb-2">{service.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 w-full">
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {service.duration}min
                      </Badge>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        R$ {service.price}
                      </Badge>
                    </div>
                    
                    <TouchButton 
                      fullWidth
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                      onClick={(e) => {
                        e?.stopPropagation();
                        navigate('/booking', { state: { selectedService: service.id } });
                      }}
                    >
                      Escolher Serviço
                    </TouchButton>
                  </Stack>
                </TouchCard>
              </motion.div>
            ))}
          </ResponsiveGrid>
        </Container>
      </Section>

      {/* How to Book Section - Mobile-First */}
      <Section>
        <Container className="max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <ShinyText text="Como Agendar" speed={3} />
            </h2>
            <p className="text-lg md:text-xl text-gray-300">Simples em apenas 4 passos</p>
          </motion.div>
          
          <GlassSurface borderRadius={20} backgroundOpacity={0.1} className="p-6 md:p-8">
            <Stepper initialStep={1} stepIndicatorColor="#FFD700" activeStepColor="#1E3A8A">
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Escolha o Serviço</h3>
                  <p className="text-gray-400">Selecione o serviço que deseja</p>
                </div>
              </Step>
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Selecione o Barbeiro</h3>
                  <p className="text-gray-400">Escolha seu barbeiro preferido</p>
                </div>
              </Step>
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Escolha o Horário</h3>
                  <p className="text-gray-400">Selecione data e hora disponível</p>
                </div>
              </Step>
              <Step>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Confirmação</h3>
                  <p className="text-gray-400">Confirme os dados e finalize</p>
                </div>
              </Step>
            </Stepper>
          </GlassSurface>
        </Container>
      </Section>

      {/* Testimonials Section - Mobile-First */}
      <Section background="muted">
        <Container>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <ShinyText text="Clientes Satisfeitos" speed={5} />
            </h2>
            <p className="text-lg md:text-xl text-gray-300">Experiências reais de quem confia no nosso trabalho</p>
          </motion.div>
          
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="lg"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <TouchCard 
                  className="bg-black/30 border-amber-500/20 backdrop-blur-sm h-full"
                  hover
                >
                  <Stack spacing="md">
                    <div className="flex items-center justify-center">
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
                    <p className="text-gray-300 text-center italic">&quot;{testimonial.comment}&quot;</p>
                    <p className="text-white font-semibold text-center">- {testimonial.name}</p>
                  </Stack>
                </TouchCard>
              </motion.div>
            ))}
          </ResponsiveGrid>
        </Container>
      </Section>

      {/* Contact Section - Mobile-First */}
      <Section id="contato">
        <Container>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <ShinyText text="Entre em Contato" speed={4} />
            </h2>
            <p className="text-lg md:text-xl text-gray-300">Estamos prontos para atendê-lo</p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <TouchCard className="bg-black/30 border-amber-500/20 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-amber-500 p-3 rounded-lg flex-shrink-0"
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
              </TouchCard>
              
              <TouchCard className="bg-black/30 border-amber-500/20 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-amber-500 p-3 rounded-lg flex-shrink-0"
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
              </TouchCard>
              
              <TouchCard className="bg-black/30 border-amber-500/20 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-amber-500 p-3 rounded-lg flex-shrink-0"
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
              </TouchCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <TouchCard className="bg-black/30 border-amber-500/20 backdrop-blur-sm h-full">
                <Stack spacing="lg" align="center" className="text-center">
                  <div>
                    <h3 className="text-white font-semibold text-xl mb-4">Agende Seu Horário</h3>
                    <p className="text-gray-300 mb-6">Reserve já o seu horário e garanta o melhor atendimento</p>
                  </div>
                  
                  <Stack 
                    direction={isMobile ? "vertical" : "horizontal"} 
                    spacing="md" 
                    className="w-full"
                  >
                    <TouchButton
                      size="lg"
                      onClick={() => navigate('/booking')}
                      className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-500 hover:to-amber-700"
                      fullWidth={isMobile}
                    >
                      <Calendar className="h-5 w-5" />
                      Agendar Online
                    </TouchButton>
                    <TouchButton
                      variant="outline"
                      size="lg"
                      onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                      className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                      fullWidth={isMobile}
                    >
                      <Phone className="h-5 w-5" />
                      WhatsApp
                    </TouchButton>
                  </Stack>
                </Stack>
              </TouchCard>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <Footer />
    </ResponsiveLayout>
  );
};

export default Index;
