import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, DollarSign, History, Phone, MapPin, Star, LogOut, Gift, X, User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ✅ Helper function para extrair dados do cliente do campo notes  
const extractClientFromNotes = (notes: string) => {
  if (!notes) return { name: null, phone: null };
  
  // Formato: "Cliente: Nome | Telefone: 11999999999 | CPF: xxx | Email: email@domain.com"
  const nameMatch = notes.match(/Cliente:\s*([^|]+)/);
  const phoneMatch = notes.match(/Telefone:\s*([^|]+)/);
  
  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    phone: phoneMatch ? phoneMatch[1].trim() : null
  };
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user appointments from clients table only
  const { data: appointments = [] } = useQuery({
    queryKey: ['user-appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('🔍 Fetching appointments for user:', user.email);
      
      try {
        // Buscar dados do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', user.id)
          .single();

        let clientId = null;
        
        // Buscar cliente pelo nome e/ou telefone do perfil usando OR
        if (profile?.name && profile?.phone) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('id')
            .or(`name.eq."${profile.name.replace(/"/g, '\\"')}",phone.eq."${profile.phone.replace(/"/g, '\\"')}"`)
            .maybeSingle();
          
          if (clientData) clientId = clientData.id;
        } else if (profile?.name) {
          // Buscar apenas por nome se não tem telefone
          const { data: clientByName } = await supabase
            .from('clients')
            .select('id')
            .eq('name', profile.name)
            .maybeSingle();
          
          if (clientByName) clientId = clientByName.id;
        } else if (profile?.phone) {
          // Buscar apenas por telefone se não tem nome
          const { data: clientByPhone } = await supabase
            .from('clients')
            .select('id')
            .eq('phone', profile.phone)
            .maybeSingle();
          
          if (clientByPhone) clientId = clientByPhone.id;
        }

        if (clientId) {
          const { data, error } = await supabase
            .from('appointments')
            .select(`
              *,
              clients (name, phone, cpf),
              services (name, price, duration),
              barbers (name)
            `)
            .eq('client_id', clientId)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false });
          
          if (!error && data) {
            console.log('✅ Found appointments:', data.length);
            return data;
          }
        }
        
        console.log('⚠️ No client found for user');
        return [];
      } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        return [];
      }
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
    .filter(a => a.status === "completed" && (a.services?.price || a.price))
    .reduce((sum, a) => sum + Number(a.services?.price || a.price || 0), 0);

  const completedAppointments = appointments.filter(a => a.status === "completed");

  console.log('📊 UserDashboard stats:', {
    totalAppointments: appointments.length,
    completedAppointments: completedAppointments.length,
    totalSpent: totalSpent
  });

  // ✅ Buscar dados do perfil do usuário
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // ✅ Função para cancelar agendamento
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error cancelling appointment:', error);
        toast.error("Erro ao cancelar agendamento. Tente novamente.");
        return;
      }

      toast.success("Agendamento cancelado com sucesso!");
      
      // Atualizar lista de agendamentos
      queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
      
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    }
  };

  // ✅ Função para enviar WhatsApp
  const sendWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/");
    }
  };

  // ✅ Buscar dados da barbearia (contato, horários, etc)
  const barbershopInfo = {
    name: "Elite Barber",
    phone: "(11) 99999-9999",
    whatsapp: "11999999999",
    address: {
      street: "Rua das Flores, 123 - Centro",
      city: "São Paulo, SP",
      zipCode: "01234-567"
    },
    schedule: {
      weekdays: "9h às 19h",
      saturday: "8h às 17h", 
      sunday: "Fechado"
    },
    email: "contato@elitebarber.com.br",
    instagram: "@elitebarber"
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
              {/* ✅ Dados do usuário melhorados */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="text-gray-300">
                    {userProfile?.name || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                </div>
                {userProfile?.name && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-500 text-sm">{user.email}</span>
                  </div>
                )}
              </div>
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
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
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
                    appointments.map((appointment) => {
                      // ✅ Dados do cliente vêm da tabela clients
                      const clientData = appointment.clients;
                      
                      // ✅ Verificar se pode cancelar (apenas agendamentos futuros e não cancelados)
                      const appointmentDate = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
                      const canCancel = appointment.status !== 'cancelled' && 
                                       appointment.status !== 'completed' && 
                                       appointmentDate > new Date();
                      
                      return (
                        <div key={appointment.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-white font-semibold">{appointment.services?.name || 'Serviço'}</h3>
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
                              </div>
                              
                              <div className="space-y-1 text-gray-400">
                                <p className="flex items-center space-x-2">
                                  <User className="h-4 w-4" />
                                  <span>Barbeiro: {appointment.barbers?.name || 'Qualquer barbeiro'}</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(appointment.appointment_date).toLocaleDateString("pt-BR")}</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{appointment.appointment_time}</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="text-green-400 font-semibold">
                                    R$ {appointment.services?.price || appointment.price || '0'}
                                  </span>
                                </p>
                              </div>
                              
                              {/* ✅ Mostrar dados do cliente se disponível */}
                              {clientData?.name && (
                                <p className="text-gray-500 text-sm mt-2">
                                  Cliente: {clientData.name} | Telefone: {clientData.phone}
                                </p>
                              )}
                            </div>
                            
                            {/* ✅ Ações */}
                            <div className="flex flex-col space-y-2 ml-4">
                              {canCancel && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancelar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-800 border-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">Cancelar Agendamento</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-400">
                                        Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
                                        Manter Agendamento
                                      </AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Sim, Cancelar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              
                              {/* ✅ Botão WhatsApp para contato */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendWhatsApp('11999999999', 
                                  `Olá! Tenho um agendamento para ${new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às ${appointment.appointment_time}. Gostaria de mais informações.`
                                )}
                                className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Contato
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
                    completedAppointments.map((appointment) => {
                      // ✅ Dados do cliente vêm da tabela clients
                      const clientData = appointment.clients;
                      
                      return (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{appointment.services?.name || 'Serviço'}</h3>
                            <p className="text-gray-400">Barbeiro: {appointment.barbers?.name || 'Barbeiro'}</p>
                            <p className="text-gray-400">
                              {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")}
                            </p>
                            {/* ✅ Mostrar dados do cliente se disponível */}
                            {clientData?.name && (
                              <p className="text-gray-500 text-sm">
                                Cliente: {clientData.name}
                              </p>
                            )}
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
                      );
                    })
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

          <TabsContent value="profile">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Meu Perfil</CardTitle>
                <CardDescription className="text-gray-400">
                  Gerencie seus dados pessoais e preferências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Informações da Conta */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Informações da Conta</h3>
                    
                    <div className="grid gap-4">
                      {/* Email */}
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <label className="text-sm text-gray-400 mb-2 block">Email</label>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-blue-400" />
                          <span className="text-white">{user.email}</span>
                          <Badge className="bg-green-500/20 text-green-400">Verificado</Badge>
                        </div>
                      </div>

                      {/* Nome */}
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <label className="text-sm text-gray-400 mb-2 block">Nome Completo</label>
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-amber-400" />
                          <span className="text-white">
                            {userProfile?.name || 'Nome não informado'}
                          </span>
                        </div>
                      </div>

                      {/* Telefone */}
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <label className="text-sm text-gray-400 mb-2 block">Telefone</label>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-green-400" />
                          <span className="text-white">
                            {userProfile?.phone || 'Telefone não informado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Minhas Estatísticas</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-400 text-sm">Cliente desde</p>
                            <p className="text-white font-semibold">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : 'Data não disponível'}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-400" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-400 text-sm">Total investido</p>
                            <p className="text-white font-semibold">R$ {totalSpent.toFixed(2)}</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-400" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-400 text-sm">Serviços concluídos</p>
                            <p className="text-white font-semibold">{completedAppointments.length}</p>
                          </div>
                          <Star className="h-8 w-8 text-purple-400" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-lg border border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-400 text-sm">Próximo agendamento</p>
                            <p className="text-white font-semibold text-sm">
                                                             {(() => {
                                 const nextAppointment = appointments
                                   .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
                                   .sort((a, b) => {
                                     const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
                                     const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
                                     return dateA.getTime() - dateB.getTime();
                                   })[0];
                                 
                                 return nextAppointment 
                                   ? new Date(nextAppointment.appointment_date).toLocaleDateString("pt-BR")
                                   : 'Nenhum agendado';
                               })()}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferências */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Preferências</h3>
                    
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Barbeiro Favorito</h4>
                      <p className="text-gray-400 text-sm">
                        {(() => {
                          // Encontrar barbeiro mais frequente
                          const barberCounts = completedAppointments.reduce((acc, appointment) => {
                            const barberName = appointment.barbers?.name || 'Qualquer barbeiro';
                            acc[barberName] = (acc[barberName] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                                                     const favoriteBarber = Object.entries(barberCounts)
                             .sort(([,a], [,b]) => Number(b) - Number(a))[0];
                          
                          return favoriteBarber 
                            ? `${favoriteBarber[0]} (${favoriteBarber[1]} serviços)`
                            : 'Ainda não definido';
                        })()}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Serviço Favorito</h4>
                      <p className="text-gray-400 text-sm">
                        {(() => {
                          // Encontrar serviço mais frequente
                          const serviceCounts = completedAppointments.reduce((acc, appointment) => {
                            const serviceName = appointment.services?.name || 'Serviço';
                            acc[serviceName] = (acc[serviceName] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                                                     const favoriteService = Object.entries(serviceCounts)
                             .sort(([,a], [,b]) => Number(b) - Number(a))[0];
                          
                          return favoriteService 
                            ? `${favoriteService[0]} (${favoriteService[1]}x)`
                            : 'Ainda não definido';
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-3 pt-4 border-t border-slate-600">
                    <Button 
                      onClick={() => navigate("/booking")}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Novo Agendamento
                    </Button>
                    
                    <Button 
                      onClick={() => sendWhatsApp(barbershopInfo.whatsapp, 
                        `Olá! Sou ${userProfile?.name || user.email} e gostaria de atualizar meus dados cadastrais.`
                      )}
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Atualizar Dados
                    </Button>
                  </div>
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
                <CardDescription className="text-gray-400">
                  Fale conosco através dos canais abaixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* WhatsApp */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">WhatsApp</h3>
                      <p className="text-gray-300 mb-3">{barbershopInfo.phone}</p>
                      <Button 
                        onClick={() => sendWhatsApp(barbershopInfo.whatsapp, 
                          `Olá! Sou cliente da ${barbershopInfo.name} e gostaria de mais informações sobre os serviços.`
                        )}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Conversar no WhatsApp
                      </Button>
                    </div>
                  </div>
                  
                  {/* Endereço */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-500 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">Endereço</h3>
                      <p className="text-gray-300">
                        {barbershopInfo.address.street}<br />
                        {barbershopInfo.address.city} - {barbershopInfo.address.zipCode}
                      </p>
                      <Button 
                        onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(barbershopInfo.address.street + ' ' + barbershopInfo.address.city)}`, '_blank')}
                        variant="outline"
                        className="mt-3 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Ver no Mapa
                      </Button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">Email</h3>
                      <p className="text-gray-300 mb-3">{barbershopInfo.email}</p>
                      <Button 
                        onClick={() => window.open(`mailto:${barbershopInfo.email}?subject=Contato através do site`, '_blank')}
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Email
                      </Button>
                    </div>
                  </div>

                  {/* Horário de Atendimento */}
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">Horário de Atendimento</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Segunda a Sexta</span>
                        <span className="text-white">{barbershopInfo.schedule.weekdays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sábado</span>
                        <span className="text-white">{barbershopInfo.schedule.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Domingo</span>
                        <span className="text-red-400">{barbershopInfo.schedule.sunday}</span>
                      </div>
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
                <CardDescription className="text-gray-400">
                  Confira nossos horários e políticas de agendamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Horários */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Funcionamento</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-amber-400" />
                          <span className="text-gray-300 font-medium">Segunda a Sexta</span>
                        </div>
                        <span className="text-white font-semibold">{barbershopInfo.schedule.weekdays}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-amber-400" />
                          <span className="text-gray-300 font-medium">Sábado</span>
                        </div>
                        <span className="text-white font-semibold">{barbershopInfo.schedule.saturday}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-red-400" />
                          <span className="text-gray-300 font-medium">Domingo</span>
                        </div>
                        <span className="text-red-400 font-semibold">{barbershopInfo.schedule.sunday}</span>
                      </div>
                    </div>
                  </div>

                  {/* Políticas e Informações */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Políticas de Agendamento</h3>
                    
                    {/* Informações importantes */}
                    <div className="grid gap-4">
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-start space-x-3">
                          <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="text-blue-400 font-medium mb-1">Agendamento Online</h4>
                            <p className="text-gray-300 text-sm">
                              Agendamentos podem ser feitos até 30 minutos antes do fechamento.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <div className="flex items-start space-x-3">
                          <X className="h-5 w-5 text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="text-amber-400 font-medium mb-1">Cancelamento</h4>
                            <p className="text-gray-300 text-sm">
                              Cancelamentos podem ser feitos até 2 horas antes do horário agendado.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                        <div className="flex items-start space-x-3">
                          <Phone className="h-5 w-5 text-green-400 mt-0.5" />
                          <div>
                            <h4 className="text-green-400 font-medium mb-1">Confirmação</h4>
                            <p className="text-gray-300 text-sm">
                              Entraremos em contato via WhatsApp para confirmar seu agendamento.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="flex items-start space-x-3">
                          <Star className="h-5 w-5 text-purple-400 mt-0.5" />
                          <div>
                            <h4 className="text-purple-400 font-medium mb-1">Chegada</h4>
                            <p className="text-gray-300 text-sm">
                              Recomendamos chegar 5 minutos antes do horário agendado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão para novo agendamento */}
                  <div className="pt-4 border-t border-slate-600">
                    <Button 
                      onClick={() => navigate("/booking")}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Novo Horário
                    </Button>
                  </div>
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
