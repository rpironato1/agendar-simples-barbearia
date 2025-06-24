
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, History, Phone, MapPin, Star, LogOut, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  // Mock data - em produção viria do backend
  const appointments = [
    { id: 1, service: "Corte Clássico", date: "2024-01-15", time: "14:30", status: "Concluído", price: 35, barber: "João Silva" },
    { id: 2, service: "Barba Completa", date: "2024-01-20", time: "16:00", status: "Concluído", price: 25, barber: "Pedro Santos" },
    { id: 3, service: "Combo Premium", date: "2024-01-25", time: "15:00", status: "Agendado", price: 55, barber: "João Silva" },
  ];

  const promotions = [
    { id: 1, title: "Desconto de 20% na primeira visita", description: "Válido até 31/01/2024", discount: "20%" },
    { id: 2, title: "Combo Especial - Corte + Barba", description: "Por apenas R$ 45,00", discount: "R$ 10 OFF" },
    { id: 3, title: "Indique um amigo e ganhe 15% de desconto", description: "Válido por 30 dias", discount: "15%" },
  ];

  const totalSpent = appointments.filter(a => a.status === "Concluído").reduce((sum, a) => sum + a.price, 0);

  useEffect(() => {
    const userData = localStorage.getItem("userAuth");
    if (!userData) {
      navigate("/user-login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    toast({
      title: "Logout realizado",
      description: "Até a próxima!",
    });
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">Minha Área - Elite Barber</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Olá, {user.name.split(' ')[0]}!</span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-amber-400" />
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Agendamentos</p>
                  <p className="text-2xl font-bold text-white">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Total Gasto</p>
                  <p className="text-2xl font-bold text-white">R$ {totalSpent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <History className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Concluídos</p>
                  <p className="text-2xl font-bold text-white">{appointments.filter(a => a.status === "Concluído").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Promoções</p>
                  <p className="text-2xl font-bold text-white">{promotions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="appointments">Meus Agendamentos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="promotions">Promoções</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="schedule">Horários</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Meus Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{appointment.service}</h3>
                        <p className="text-gray-400">Barbeiro: {appointment.barber}</p>
                        <p className="text-gray-400">{appointment.date} às {appointment.time}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={appointment.status === "Concluído" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                          {appointment.status}
                        </Badge>
                        <p className="text-white font-bold mt-1">R$ {appointment.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate("/booking")}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                  >
                    Novo Agendamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.filter(a => a.status === "Concluído").map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{appointment.service}</h3>
                        <p className="text-gray-400">Barbeiro: {appointment.barber}</p>
                        <p className="text-gray-400">{appointment.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-amber-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-white font-bold">R$ {appointment.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-500/10 rounded-lg">
                  <p className="text-amber-400 font-semibold">Total investido em cuidados: R$ {totalSpent}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Promoções Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-4 bg-gradient-to-r from-purple-500/20 to-amber-500/20 rounded-lg border border-amber-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{promo.title}</h3>
                          <p className="text-gray-300">{promo.description}</p>
                        </div>
                        <Badge className="bg-amber-500 text-black font-bold">
                          {promo.discount}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Entre em Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-500 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">WhatsApp</h3>
                      <p className="text-gray-300">(11) 99999-9999</p>
                      <Button className="mt-2 bg-green-600 hover:bg-green-700">
                        Conversar no WhatsApp
                      </Button>
                    </div>
                  </div>
                  
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Horários de Funcionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Segunda a Sexta</span>
                    <span className="text-white font-semibold">9h às 19h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Sábado</span>
                    <span className="text-white font-semibold">8h às 17h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Domingo</span>
                    <span className="text-red-400 font-semibold">Fechado</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-blue-400">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Dica: Agendamentos podem ser feitos até 30 minutos antes do fechamento.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
