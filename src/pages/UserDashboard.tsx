
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, History, Phone, MapPin, Star, LogOut, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Fetch user appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['user-appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First try to find client by email or phone from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, email')
        .eq('id', user.id)
        .single();

      let clientId = null;
      
      // Try to find client by email
      if (user.email) {
        const { data: clientByEmail } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', user.email)
          .single();
        
        if (clientByEmail) clientId = clientByEmail.id;
      }
      
      // Try to find client by phone from profile
      if (!clientId && profile?.phone) {
        const { data: clientByPhone } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', profile.phone)
          .single();
        
        if (clientByPhone) clientId = clientByPhone.id;
      }

      if (!clientId) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price, duration),
          barbers (name)
        `)
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch promotions
  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching promotions:', error);
        return [];
      }
      return data;
    }
  });

  const totalSpent = appointments
    .filter(a => a.status === "completed" && a.services?.price)
    .reduce((sum, a) => sum + Number(a.services.price), 0);

  const completedAppointments = appointments.filter(a => a.status === "completed");

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/");
    }
  };

  if (!user) {
    navigate("/user-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">Minha Área - Elite Barber</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Olá, {user.email}!</span>
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
                  <p className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold text-white">{completedAppointments.length}</p>
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
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Você ainda não tem agendamentos.</p>
                      <Button 
                        onClick={() => navigate("/booking")}
                        className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                      >
                        Fazer Primeiro Agendamento
                      </Button>
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{appointment.services?.name || 'Serviço'}</h3>
                          <p className="text-gray-400">Barbeiro: {appointment.barbers?.name || 'Qualquer barbeiro'}</p>
                          <p className="text-gray-400">
                            {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às {appointment.appointment_time}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            appointment.status === "completed" ? "bg-green-500/20 text-green-400" : 
                            appointment.status === "confirmed" ? "bg-blue-500/20 text-blue-400" :
                            appointment.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }>
                            {appointment.status === "completed" ? "Concluído" :
                             appointment.status === "confirmed" ? "Confirmado" :
                             appointment.status === "cancelled" ? "Cancelado" :
                             "Agendado"}
                          </Badge>
                          <p className="text-white font-bold mt-1">
                            R$ {appointment.services?.price || appointment.price || '0'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {appointments.length > 0 && (
                  <div className="mt-6">
                    <Button 
                      onClick={() => navigate("/booking")}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    >
                      Novo Agendamento
                    </Button>
                  </div>
                )}
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
                  {completedAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nenhum serviço concluído ainda.</p>
                    </div>
                  ) : (
                    completedAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{appointment.services?.name || 'Serviço'}</h3>
                          <p className="text-gray-400">Barbeiro: {appointment.barbers?.name || 'Barbeiro'}</p>
                          <p className="text-gray-400">
                            {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className="h-4 w-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-white font-bold">
                            R$ {appointment.services?.price || appointment.price || '0'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {totalSpent > 0 && (
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg">
                    <p className="text-amber-400 font-semibold">Total investido em cuidados: R$ {totalSpent.toFixed(2)}</p>
                  </div>
                )}
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
                  {promotions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nenhuma promoção ativa no momento.</p>
                    </div>
                  ) : (
                    promotions.map((promo) => (
                      <div key={promo.id} className="p-4 bg-gradient-to-r from-purple-500/20 to-amber-500/20 rounded-lg border border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{promo.title}</h3>
                            <p className="text-gray-300">{promo.description}</p>
                            {promo.valid_until && (
                              <p className="text-gray-400 text-sm">
                                Válido até: {new Date(promo.valid_until).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                          <Badge className="bg-amber-500 text-black font-bold">
                            {promo.discount_percentage ? `${promo.discount_percentage}%` : 
                             promo.discount_amount ? `R$ ${promo.discount_amount}` : 'Desconto'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
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
