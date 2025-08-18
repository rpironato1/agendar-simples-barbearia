import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Scissors, Settings, Plus, Phone, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, LogOut, UserCheck, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import FinancialDashboard from "@/components/FinancialDashboard";
import { AppointmentWithRelations } from "@/types/mcp";

// ✅ Helper function para extrair dados do cliente do campo notes
// ✅ Helper function para obter dados do cliente da tabela CLIENTS
const getClientData = (appointment: AppointmentWithRelations) => {
  // Buscar dados da tabela clients (único lugar onde ficam os dados)
  if (appointment.clients?.name) {
    return {
      name: appointment.clients.name,
      phone: appointment.clients.phone || 'N/A',
      cpf: appointment.clients.cpf || 'N/A',
      totalSpent: appointment.clients.total_spent || 0,
      lastVisit: appointment.clients.last_visit
    };
  }
  
  // Se não tem dados, cliente precisa completar cadastro
  return {
    name: 'Cliente não identificado',
    phone: 'N/A',
    cpf: 'N/A',
    totalSpent: 0,
    lastVisit: null
  };
};

const Admin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: "", phone: "" });
  const [newService, setNewService] = useState({ name: "", duration: "", price: "" });
  
  // ✅ Estados para modal de pagamento
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [paymentData, setPaymentData] = useState({
    type: 'single', // 'single' ou 'mixed'
    method: '', // para pagamento único
    mixedPayments: {
      pix: 0,
      cartao: 0,
      dinheiro: 0
    }
  });

  // Fetch appointments with related data from clients table
  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (name, phone, cpf, total_spent, last_visit),
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
    },
    staleTime: 0, // ✅ Sempre buscar dados frescos
    gcTime: 0 // ✅ Não manter cache antigo
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

  // ✅ Log para debug do estado atual (removido para performance)
  // console.log('📊 Estado atual dos agendamentos:', appointments.map(...));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Agendado", className: "bg-blue-500/20 text-blue-400" },
      confirmed: { label: "Confirmado", className: "bg-green-500/20 text-green-400" },
      completed: { label: "Finalizado", className: "bg-green-500/20 text-green-400" },
      cancelled: { label: "Cancelado", className: "bg-red-500/20 text-red-400" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // ✅ Função para mostrar status de pagamento
  const getPaymentStatus = (appointment: AppointmentWithRelations) => {
    // Se o agendamento foi cancelado, mostrar cancelado
    if (appointment.status === 'cancelled') {
      return <Badge className="bg-red-500/20 text-red-400">Cancelado</Badge>;
    }
    
    // Se o pagamento foi confirmado, mostrar pago com detalhes
    if (appointment.payment_confirmed) {
      return (
        <div className="space-y-1">
          <Badge className="bg-green-500/20 text-green-400">Pago</Badge>
          {appointment.payment_method && (
            <div className="space-y-1">
              {appointment.payment_method.startsWith('misto') ? (
                <div className="text-xs text-gray-400">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-amber-400">🔀</span>
                    <span>Misto</span>
                  </div>
                  <div className="text-xs">{appointment.payment_method.replace('misto ', '')}</div>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  {appointment.payment_method === 'pix' && <Smartphone className="h-3 w-3 text-purple-400" />}
                  {appointment.payment_method === 'cartao' && <CreditCard className="h-3 w-3 text-blue-400" />}
                  {appointment.payment_method === 'dinheiro' && <Banknote className="h-3 w-3 text-green-400" />}
                  <span className="text-gray-400 text-xs">
                    {appointment.payment_method === 'pix' ? 'PIX' :
                     appointment.payment_method === 'cartao' ? 'Cartão' : 
                     appointment.payment_method === 'dinheiro' ? 'Dinheiro' : appointment.payment_method}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Caso contrário, mostrar pendente
    return <Badge className="bg-yellow-500/20 text-yellow-400">Pendente</Badge>;
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    console.log('🔄 Atualizando status do agendamento:', appointmentId, 'para:', newStatus);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        console.error('❌ Error updating appointment:', error);
        toast.error(`Erro ao atualizar status: ${error.message}`);
        return;
      }

      console.log('✅ Status atualizado com sucesso!');
      toast.success(`Status atualizado para: ${newStatus === 'confirmed' ? 'Confirmado' : newStatus}!`);
      refetchAppointments();
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error("Erro inesperado ao atualizar status");
    }
  };

  // ✅ Função para abrir modal de pagamento
  const openPaymentModal = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setPaymentData({
      type: 'single',
      method: '',
      mixedPayments: {
        pix: 0,
        cartao: 0,
        dinheiro: 0
      }
    });
    setIsPaymentModalOpen(true);
  };

  // ✅ Função para confirmar pagamento via modal
  const handleConfirmPayment = async () => {
    if (!selectedAppointment) return;

    // ✅ Verificar se o pagamento já foi confirmado (proteção contra dupla execução)
    if (selectedAppointment.payment_confirmed) {
      toast.warning("Pagamento já foi confirmado!");
      setIsPaymentModalOpen(false);
      return;
    }

    console.log('🔄 Iniciando confirmação de pagamento para:', selectedAppointment.id);
    console.log('📋 Dados do agendamento:', selectedAppointment);
    console.log('💰 Dados do pagamento:', paymentData);

    try {
      let paymentMethodString = '';
      const totalAmount = Number(selectedAppointment.price || 0);
      
      if (paymentData.type === 'single') {
        if (!paymentData.method) {
          toast.error("Selecione um método de pagamento");
          return;
        }
        paymentMethodString = paymentData.method;
        console.log('💳 Pagamento único:', paymentMethodString);
      } else {
        // Pagamento misto
        const { pix, cartao, dinheiro } = paymentData.mixedPayments;
        const totalPaid = pix + cartao + dinheiro;
        
        if (Math.abs(totalPaid - totalAmount) > 0.01) {
          toast.error(`Valor total deve ser R$ ${totalAmount.toFixed(2)}`);
          return;
        }

        // Criar string com detalhes do pagamento misto
        const methods = [];
        if (pix > 0) methods.push(`PIX: R$ ${pix.toFixed(2)}`);
        if (cartao > 0) methods.push(`Cartão: R$ ${cartao.toFixed(2)}`);
        if (dinheiro > 0) methods.push(`Dinheiro: R$ ${dinheiro.toFixed(2)}`);
        
        paymentMethodString = `misto (${methods.join(', ')})`;
        console.log('🔀 Pagamento misto:', paymentMethodString);
      }

      console.log('🔄 Atualizando agendamento no banco...');
      
      // ✅ PRIMEIRA VERIFICAÇÃO: Status do agendamento
      const { data: currentAppointment } = await supabase
        .from('appointments')
        .select('status, payment_confirmed')
        .eq('id', selectedAppointment.id)
        .single();
      
      if (currentAppointment?.payment_confirmed) {
        console.log('⚠️ Pagamento já confirmado no banco');
        toast.warning("Pagamento já foi confirmado!");
        setIsPaymentModalOpen(false);
        await refetchAppointments();
        return;
      }
      
      // ✅ SEGUNDA VERIFICAÇÃO: Transações existentes
      const { data: existingTransactions } = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('appointment_id', selectedAppointment.id);
      
      if (existingTransactions && existingTransactions.length > 0) {
        console.log('⚠️ Transação já existe para este agendamento');
        toast.warning("Pagamento já foi processado!");
        setIsPaymentModalOpen(false);
        await refetchAppointments();
        return;
      }
      
      // ✅ Atualizar agendamento PRIMEIRO
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          payment_method: paymentMethodString,
          payment_confirmed: true,
          payment_date: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id)
        .eq('payment_confirmed', false); // Só atualizar se ainda não foi confirmado

      if (appointmentError) {
        console.error('❌ Error updating appointment payment:', appointmentError);
        toast.error(`Erro ao confirmar pagamento: ${appointmentError.message}`);
        return;
      }

      console.log('✅ Agendamento atualizado com sucesso!');

      // ✅ TERCEIRA VERIFICAÇÃO: Após atualização, verificar novamente se transação já existe
      const { data: finalCheck } = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('appointment_id', selectedAppointment.id);
      
      if (finalCheck && finalCheck.length > 0) {
        console.log('⚠️ Transação já criada em processo paralelo, pulando criação');
        toast.success("Atendimento finalizado com sucesso!");
        setIsPaymentModalOpen(false);
        setSelectedAppointment(null);
        await refetchAppointments();
        return;
      }

      // Criar transações financeiras
      if (paymentData.type === 'single') {
        console.log('💰 Criando transação única...');
        // Transação única
        const { error: transactionError } = await supabase
          .from('financial_transactions')
          .insert([{
            type: 'income',
            amount: totalAmount,
            description: `Pagamento - ${selectedAppointment.services?.name || 'Serviço'}`,
            payment_method: paymentData.method,
            appointment_id: selectedAppointment.id,
            transaction_date: new Date().toISOString().split('T')[0]
          }]);

        if (transactionError) {
          console.error('⚠️ Error creating financial transaction:', transactionError);
          // Se erro, reverter status do agendamento
          await supabase
            .from('appointments')
            .update({ 
              status: 'scheduled',
              payment_method: null,
              payment_confirmed: false,
              payment_date: null
            })
            .eq('id', selectedAppointment.id);
          toast.error("Erro ao criar transação financeira");
          return;
        } else {
          console.log('✅ Transação financeira criada com sucesso!');
        }
      } else {
        console.log('💰 Criando transações múltiplas...');
        // Múltiplas transações para pagamento misto
        const transactions = [];
        const { pix, cartao, dinheiro } = paymentData.mixedPayments;
        
        if (pix > 0) {
          transactions.push({
            type: 'income',
            amount: pix,
            description: `Pagamento PIX - ${selectedAppointment.services?.name || 'Serviço'}`,
            payment_method: 'pix',
            appointment_id: selectedAppointment.id,
            transaction_date: new Date().toISOString().split('T')[0]
          });
        }
        
        if (cartao > 0) {
          transactions.push({
            type: 'income',
            amount: cartao,
            description: `Pagamento Cartão - ${selectedAppointment.services?.name || 'Serviço'}`,
            payment_method: 'cartao',
            appointment_id: selectedAppointment.id,
            transaction_date: new Date().toISOString().split('T')[0]
          });
        }
        
        if (dinheiro > 0) {
          transactions.push({
            type: 'income',
            amount: dinheiro,
            description: `Pagamento Dinheiro - ${selectedAppointment.services?.name || 'Serviço'}`,
            payment_method: 'dinheiro',
            appointment_id: selectedAppointment.id,
            transaction_date: new Date().toISOString().split('T')[0]
          });
        }

        if (transactions.length > 0) {
          const { error: transactionError } = await supabase
            .from('financial_transactions')
            .insert(transactions);

          if (transactionError) {
            console.error('⚠️ Error creating financial transactions:', transactionError);
            // Se erro, reverter status do agendamento
            await supabase
              .from('appointments')
              .update({ 
                status: 'scheduled',
                payment_method: null,
                payment_confirmed: false,
                payment_date: null
              })
              .eq('id', selectedAppointment.id);
            toast.error("Erro ao criar transações financeiras");
            return;
          } else {
            console.log('✅ Transações financeiras criadas com sucesso!');
          }
        }
      }

      console.log('🔄 Atualizando dados na interface...');
      
      toast.success("Atendimento finalizado com sucesso!");
      setIsPaymentModalOpen(false);
      setSelectedAppointment(null);
      
      // ✅ Atualizar manualmente o cache local ANTES de invalidar
      queryClient.setQueryData(['appointments'], (oldData: AppointmentWithRelations[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(appointment => {
          if (appointment.id === selectedAppointment.id) {
            return {
              ...appointment,
              status: 'completed',
              payment_method: paymentMethodString,
              payment_confirmed: true,
              payment_date: new Date().toISOString()
            };
          }
          return appointment;
        });
      });
      
      // ✅ Invalidar cache e refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      
      // ✅ Refetch com delay para garantir atualização
      setTimeout(async () => {
        await refetchAppointments();
        console.log('✅ Interface atualizada com sucesso!');
      }, 200);
      
    } catch (error) {
      console.error('❌ Erro inesperado na confirmação de pagamento:', error);
      toast.error("Erro inesperado ao confirmar pagamento");
    }
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

  // ✅ Função de logout para admin
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Erro ao fazer logout");
      navigate("/");
    }
  };

  // ✅ Função para agregar dados dos clientes
  const getClientStats = () => {
    const clientMap = new Map();
    
    appointments.forEach(appointment => {
      const clientData = getClientData(appointment);
      const clientKey = clientData.name || clientData.phone || 'Cliente Anônimo';
      
      if (!clientMap.has(clientKey)) {
        clientMap.set(clientKey, {
          name: clientData.name || 'Nome não informado',
          phone: clientData.phone || 'Telefone não informado',
          totalSpent: 0,
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          lastVisit: null,
          appointments: []
        });
      }
      
      const client = clientMap.get(clientKey);
      client.totalAppointments++;
      client.appointments.push(appointment);
      
      if (appointment.status === 'completed') {
        client.completedAppointments++;
        client.totalSpent += Number(appointment.price || 0);
        
        // Atualizar última visita
        const appointmentDate = new Date(appointment.appointment_date);
        if (!client.lastVisit || appointmentDate > client.lastVisit) {
          client.lastVisit = appointmentDate;
        }
      }
      
      if (appointment.status === 'cancelled') {
        client.cancelledAppointments++;
      }
    });
    
    // Calcular percentual de cancelamento e classificação
    return Array.from(clientMap.values()).map(client => {
      const cancellationRate = client.totalAppointments > 0 
        ? (client.cancelledAppointments / client.totalAppointments) * 100 
        : 0;
      
      let cancellationLevel = 'Baixo';
      if (cancellationRate > 30) cancellationLevel = 'Alto';
      else if (cancellationRate > 15) cancellationLevel = 'Médio';
      
      return {
        ...client,
        cancellationRate: cancellationRate.toFixed(1),
        cancellationLevel
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
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
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-slate-500 text-slate-400 hover:bg-slate-500 hover:text-white"
              >
                Voltar ao Site
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
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
            <TabsTrigger value="clientes" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <UserCheck className="mr-2 h-4 w-4" />
              Clientes
            </TabsTrigger>
          </TabsList>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Agendamentos</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie todos os agendamentos da barbearia
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    console.log('🔄 Atualizando dados manualmente...');
                    toast.info("Atualizando dados...");
                    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
                    await refetchAppointments();
                    toast.success("Dados atualizados!");
                  }}
                  className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Atualizar Dados
                </Button>
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
                      <TableHead className="text-gray-400">Pagamento</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => {
                      // ✅ Calcular dados do cliente uma única vez
                      const clientData = getClientData(appointment);
                      
                      return (
                        <TableRow key={appointment.id} className="border-slate-700">
                          <TableCell>
                            <div className="text-white font-medium">{clientData.name || 'N/A'}</div>
                            <div className="text-gray-400 text-sm">{clientData.phone || 'N/A'}</div>
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
                            {getPaymentStatus(appointment)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {/* Botão para confirmar presença + pagamento */}
                              {appointment.status === 'scheduled' && (
                                <Button
                                  size="sm"
                                  onClick={() => openPaymentModal(appointment)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  title="Cliente chegou - Confirmar pagamento"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {/* Botão WhatsApp */}
                              {clientData.phone && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsApp(clientData.phone, clientData.name || 'Cliente')}
                                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                                >
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {/* Botão Cancelar */}
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
                      );
                    })}
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

          {/* Clientes Tab */}
          <TabsContent value="clientes">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gestão de Clientes</CardTitle>
                <CardDescription className="text-gray-400">
                  Dados consolidados dos clientes da barbearia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Estatísticas dos Clientes */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Total de Clientes</p>
                            <p className="text-white text-2xl font-bold">{getClientStats().length}</p>
                          </div>
                          <UserCheck className="h-8 w-8 text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Receita Total</p>
                            <p className="text-white text-2xl font-bold">
                              R$ {getClientStats().reduce((sum, client) => sum + client.totalSpent, 0).toFixed(2)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Ticket Médio</p>
                            <p className="text-white text-2xl font-bold">
                              R$ {getClientStats().length > 0 
                                    ? (getClientStats().reduce((sum, client) => sum + client.totalSpent, 0) / 
                                       getClientStats().reduce((sum, client) => sum + client.completedAppointments, 0) || 0).toFixed(2)
                                    : '0.00'}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela de Clientes */}
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-gray-400">Cliente</TableHead>
                        <TableHead className="text-gray-400">Total Gasto</TableHead>
                        <TableHead className="text-gray-400">Agendamentos</TableHead>
                        <TableHead className="text-gray-400">Concluídos</TableHead>
                        <TableHead className="text-gray-400">Cancelados</TableHead>
                        <TableHead className="text-gray-400">Taxa Cancelamento</TableHead>
                        <TableHead className="text-gray-400">Última Visita</TableHead>
                        <TableHead className="text-gray-400">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getClientStats().map((client, index) => (
                        <TableRow key={index} className="border-slate-700">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-white font-medium">{client.name}</div>
                              <div className="text-gray-400 text-sm">{client.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-green-400 font-semibold">R$ {client.totalSpent.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                              {client.totalAppointments}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                              {client.completedAppointments}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                              {client.cancelledAppointments}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-300">{client.cancellationRate}%</span>
                              <Badge className={
                                client.cancellationLevel === 'Alto' ? 'bg-red-500/20 text-red-400' :
                                client.cancellationLevel === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }>
                                {client.cancellationLevel}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-300">
                              {client.lastVisit 
                                ? client.lastVisit.toLocaleDateString("pt-BR")
                                : 'Nunca'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {client.phone && client.phone !== 'Telefone não informado' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsApp(client.phone, client.name)}
                                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                                >
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
                                  >
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Histórico - {client.name}</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Agendamentos do cliente
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {client.appointments.map((appointment) => (
                                      <div key={appointment.id} className="p-3 bg-slate-700/50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-white font-medium">{appointment.services?.name || 'Serviço'}</p>
                                            <p className="text-gray-400 text-sm">
                                              {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às {appointment.appointment_time}
                                            </p>
                                            <p className="text-gray-400 text-sm">Barbeiro: {appointment.barbers?.name || 'Qualquer'}</p>
                                          </div>
                                          <div className="text-right">
                                            {getStatusBadge(appointment.status)}
                                            <p className="text-green-400 font-semibold mt-1">R$ {appointment.price || '0'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {getClientStats().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nenhum cliente encontrado.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ✅ Modal de Confirmação de Pagamento */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Cliente Chegou - Confirmar Pagamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAppointment && (
                <>Serviço: {selectedAppointment.services?.name} - R$ {selectedAppointment.price}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Tipo de Pagamento */}
              <div className="space-y-3">
                <Label className="text-white font-medium">Tipo de Pagamento</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="single"
                      name="paymentType"
                      checked={paymentData.type === 'single'}
                      onChange={() => setPaymentData(prev => ({ ...prev, type: 'single', method: '' }))}
                      className="text-amber-500"
                    />
                    <Label htmlFor="single" className="text-gray-300">Pagamento Único</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mixed"
                      name="paymentType"
                      checked={paymentData.type === 'mixed'}
                      onChange={() => setPaymentData(prev => ({ 
                        ...prev, 
                        type: 'mixed', 
                        method: '',
                        mixedPayments: { pix: 0, cartao: 0, dinheiro: 0 }
                      }))}
                      className="text-amber-500"
                    />
                    <Label htmlFor="mixed" className="text-gray-300">Pagamento Misto</Label>
                  </div>
                </div>
              </div>

              {/* Pagamento Único */}
              {paymentData.type === 'single' && (
                <div className="space-y-3">
                  <Label className="text-white font-medium">Método de Pagamento</Label>
                  <Select value={paymentData.method} onValueChange={(value) => setPaymentData(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="pix" className="text-white">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-purple-400" />
                          <span>PIX</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cartao" className="text-white">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-blue-400" />
                          <span>Cartão</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dinheiro" className="text-white">
                        <div className="flex items-center space-x-2">
                          <Banknote className="h-4 w-4 text-green-400" />
                          <span>Dinheiro</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pagamento Misto */}
              {paymentData.type === 'mixed' && (
                <div className="space-y-4">
                  <Label className="text-white font-medium">Valores por Método</Label>
                  
                  <div className="space-y-3">
                    {/* PIX */}
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-purple-400" />
                      <Label className="text-gray-300 w-16">PIX</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentData.mixedPayments.pix}
                        onChange={(e) => setPaymentData(prev => ({
                          ...prev,
                          mixedPayments: { ...prev.mixedPayments, pix: Number(e.target.value) }
                        }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Cartão */}
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                      <Label className="text-gray-300 w-16">Cartão</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentData.mixedPayments.cartao}
                        onChange={(e) => setPaymentData(prev => ({
                          ...prev,
                          mixedPayments: { ...prev.mixedPayments, cartao: Number(e.target.value) }
                        }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Dinheiro */}
                    <div className="flex items-center space-x-3">
                      <Banknote className="h-5 w-5 text-green-400" />
                      <Label className="text-gray-300 w-16">Dinheiro</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentData.mixedPayments.dinheiro}
                        onChange={(e) => setPaymentData(prev => ({
                          ...prev,
                          mixedPayments: { ...prev.mixedPayments, dinheiro: Number(e.target.value) }
                        }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Pago:</span>
                      <span className="text-white font-semibold">
                        R$ {(paymentData.mixedPayments.pix + paymentData.mixedPayments.cartao + paymentData.mixedPayments.dinheiro).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Valor do Serviço:</span>
                      <span className="text-amber-400 font-semibold">R$ {selectedAppointment.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Diferença:</span>
                      <span className={`font-semibold ${
                        Math.abs((paymentData.mixedPayments.pix + paymentData.mixedPayments.cartao + paymentData.mixedPayments.dinheiro) - Number(selectedAppointment.price)) < 0.01 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        R$ {((paymentData.mixedPayments.pix + paymentData.mixedPayments.cartao + paymentData.mixedPayments.dinheiro) - Number(selectedAppointment.price)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 border-slate-600 text-gray-400 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                >
                  Finalizar Atendimento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
