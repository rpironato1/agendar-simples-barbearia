
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Star, Scissors, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white">Elite Barber</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#servicos" className="text-gray-300 hover:text-amber-400 transition-colors">Serviços</a>
              <a href="#sobre" className="text-gray-300 hover:text-amber-400 transition-colors">Sobre</a>
              <a href="#contato" className="text-gray-300 hover:text-amber-400 transition-colors">Contato</a>
            </nav>
            <Button 
              onClick={() => navigate('/booking')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
            >
              Agendar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23F59E0B' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Estilo que <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Define</span> Você
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Experimente o melhor em cortes masculinos e cuidados com a barba. 
                Profissionais qualificados, ambiente premium e atendimento personalizado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => navigate('/booking')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-8 py-4 text-lg h-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Horário
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black px-8 py-4 text-lg h-auto"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-3xl p-8 backdrop-blur-sm border border-amber-500/30">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">500+</div>
                    <div className="text-gray-300">Clientes Satisfeitos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">5★</div>
                    <div className="text-gray-300">Avaliação Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">3</div>
                    <div className="text-gray-300">Barbeiros Expert</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">5+</div>
                    <div className="text-gray-300">Anos de Tradição</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nossos Serviços</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços para o homem moderno
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedService(service.id)}
              >
                <CardHeader className="text-center">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scissors className="h-8 w-8 text-black" />
                  </div>
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
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">O Que Dizem Nossos Clientes</h2>
            <p className="text-xl text-gray-300">Experiências reais de quem confia no nosso trabalho</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">&quot;{testimonial.comment}&quot;</p>
                  <p className="text-white font-semibold">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Entre em Contato</h2>
            <p className="text-xl text-gray-300">Estamos prontos para atendê-lo</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Endereço</h3>
                  <p className="text-gray-300">
                    Rua das Flores, 123 - Centro<br />
                    São Paulo, SP - 01234-567
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Telefone</h3>
                  <p className="text-gray-300">(11) 99999-9999</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Horário de Funcionamento</h3>
                  <p className="text-gray-300">
                    Segunda a Sexta: 9h às 19h<br />
                    Sábado: 8h às 17h<br />
                    Domingo: Fechado
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Agende Seu Horário</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Reserve já o seu horário e garanta o melhor atendimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-amber-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-white">Elite Barber</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 Elite Barber. Todos os direitos reservados.<br />
              Desenvolvido com ❤️ para o homem moderno.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
