
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Scissors, Settings, Plus, Phone, CheckCircle, XCircle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import FinancialDashboard from "@/components/FinancialDashboard";

const Admin = () => {
  const navigate = useNavigate();
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: "", phone: "" });
  const [newService, setNewService] = useState({ name: "", duration: "", price: "" });

  // Fetch appointments with related data
  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (name, phone),
          services (name),
          barbers (name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
      return data;
    }
  });

  // Fetch barbers
  const { data: barbers = [], refetch: refetchBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching barbers:', error);
        return [];
      }
      return data;
    }
  });

  // Fetch services
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }
      return data;
    }
  });

  // Fetch financial transactions for revenue calculation
  const { data: transactions = [] } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'income');
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data;
    }
  });

  // Calculate stats
  const todayAppointments = appointments.filter(a => 
    a.appointment_date === new Date().toISOString().split('T')[0]
  ).length;

  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date);
      const currentDate = new Date();
      return transactionDate.getMonth() === currentDate.getMonth() && 
             transactionDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const activeBarbers = barbers.filter(b => b.active).length;
  const activeServices = services.filter(s => s.active).length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Agendado", className: "bg-blue-500/20 text-blue-400" },
      confirmed: { label: "Confirmado", className: "bg-green-500/20 text-green-400" },
      completed: { label: "Concluído", className: "bg-gray-500/20 text-gray-400" },
      cancelled: { label: "Cancelado", className: "bg-red-500/20 text-red-400" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment:', error);
      toast.error("Erro ao atualizar status");
      return;
    }

    toast.success("Status atualizado com sucesso!");
    refetchAppointments();
  };

  const sendWhatsApp = (phone: string, clientName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${clientName}! Este é um lembrete do seu agendamento na Elite Barber.`;
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddBarber = async () => {
    if (!newBarber.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    const { error } = await supabase
      .from('barbers')
      .insert([{
        name: newBarber.name,
        phone: newBarber.phone.replace(/\D/g, '') || null
      }]);

    if (error) {
      console.error('Error adding barber:', error);
      toast.error("Erro ao adicionar barbeiro");
      return;
    }

    toast.success("Barbeiro adicionado com sucesso!");
    setNewBarber({ name: "", phone: "" });
    setIsAddBarberOpen(false);
    refetchBarbers();
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.duration || !newService.price) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    const { error } = await supabase
      .from('services')
      .insert([{
        name: newService.name,
        duration: parseInt(newService.duration),
        price: parseFloat(newService.price)
      }]);

    if (error) {
      console.error('Error adding service:', error);
      toast.error("Erro ao adicionar serviço");
      return;
    }

    toast.success("Serviço adicionado com sucesso!");
    setNewService({ name: "", duration: "", price: "" });
    setIsAddServiceOpen(false);
    refetchServices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
            >
              Voltar ao Site
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{todayAppointments}</div>
              <p className="text-xs text-gray-400">Para hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Receita do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {monthlyRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-400">Serviços concluídos</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Barbeiros Ativos</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeBarbers}</div>
              <p className="text-xs text-gray-400">De {barbers.length} cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Serviços Ativos</CardTitle>
              <Scissors className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeServices}</div>
              <p className="text-xs text-gray-400">De {services.length} cadastrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="agenda" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Calendar className="mr-2 h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <TrendingUp className="mr-2 h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="barbeiros" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Users className="mr-2 h-4 w-4" />
              Barbeiros
            </TabsTrigger>
            <TabsTrigger value="servicos" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Scissors className="mr-2 h-4 w-4" />
              Serviços
            </TabsTrigger>
          </TabsList>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Agendamentos</CardTitle>
                <CardDescription className="text-gray-400">
                  Gerencie todos os agendamentos da barbearia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-gray-400">Cliente</TableHead>
                      <TableHead className="text-gray-400">Serviço</TableHead>
                      <TableHead className="text-gray-400">Barbeiro</TableHead>
                      <TableHead className="text-gray-400">Data/Hora</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Valor</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id} className="border-slate-700">
                        <TableCell>
                          <div className="text-white font-medium">{appointment.clients?.name || 'N/A'}</div>
                          <div className="text-gray-400 text-sm">{appointment.clients?.phone || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-gray-300">{appointment.services?.name || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">{appointment.barbers?.name || 'Qualquer'}</TableCell>
                        <TableCell>
                          <div className="text-gray-300">{new Date(appointment.appointment_date).toLocaleDateString("pt-BR")}</div>
                          <div className="text-gray-400 text-sm">{appointment.appointment_time}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-green-400">R$ {appointment.price || '0'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {appointment.status === 'scheduled' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {appointment.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                            )}
                            {appointment.clients?.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendWhatsApp(appointment.clients.phone, appointment.clients.name)}
                                className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financeiro Tab */}
          <TabsContent value="financeiro">
            <FinancialDashboard />
          </TabsContent>

          {/* Barbeiros Tab */}
          <TabsContent value="barbeiros">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Barbeiros</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie a equipe de barbeiros
                  </CardDescription>
                </div>
                <Dialog open={isAddBarberOpen} onOpenChange={setIsAddBarberOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Barbeiro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Novo Barbeiro</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Adicione um novo barbeiro à equipe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="barber-name" className="text-white">Nome Completo</Label>
                        <Input 
                          id="barber-name" 
                          value={newBarber.name}
                          onChange={(e) => setNewBarber(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="barber-phone" className="text-white">Telefone</Label>
                        <Input 
                          id="barber-phone"
                          value={newBarber.phone}
                          onChange={(e) => setNewBarber(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                          className="bg-slate-700 border-slate-600 text-white" 
                          placeholder="11999999999 (apenas números)"
                        />
                      </div>
                      <Button 
                        onClick={handleAddBarber}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {barbers.map((barber) => (
                    <Card key={barber.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">👨‍🦲</div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{barber.name}</h3>
                              <p className="text-gray-400">{barber.phone || 'Sem telefone'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={barber.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                              {barber.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Serviços Tab */}
          <TabsContent value="servicos">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Serviços</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie os serviços oferecidos
                  </CardDescription>
                </div>
                <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Novo Serviço</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Adicione um novo serviço ao catálogo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="service-name" className="text-white">Nome do Serviço</Label>
                        <Input 
                          id="service-name"
                          value={newService.name}
                          onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="service-duration" className="text-white">Duração (min)</Label>
                          <Input 
                            id="service-duration" 
                            type="number"
                            value={newService.duration}
                            onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-white" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-price" className="text-white">Preço (R$)</Label>
                          <Input 
                            id="service-price" 
                            type="number" 
                            step="0.01"
                            value={newService.price}
                            onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-white" 
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleAddService}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{service.name}</h3>
                            {service.description && (
                              <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                                <Clock className="mr-1 h-3 w-3" />
                                {service.duration}min
                              </Badge>
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                R$ {service.price}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={service.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                              {service.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
