import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  Scissors,
  Settings,
  Plus,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  LogOut,
  UserCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Store,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const BarbershopDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: "", phone: "" });
  const [newService, setNewService] = useState({
    name: "",
    duration: "",
    price: "",
  });

  // Fetch barbershop info (for now, we'll use a single barbershop)
  const { data: barbershopInfo } = useQuery({
    queryKey: ["barbershop-info"],
    queryFn: async () => {
      // For now, return mock data. In a real SaaS, this would come from a barbershops table
      return {
        id: "1",
        name: "Elite Barber",
        plan: "Premium",
        subscription_status: "active",
        created_at: "2024-01-01",
        total_clients: 150,
        total_revenue: 15000,
        active_barbers: 3,
      };
    },
  });

  // Fetch appointments for this barbershop
  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ["barbershop-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          clients (name, phone, cpf, total_spent, last_visit),
          services (name),
          barbers (name)
        `
        )
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }
      return data;
    },
  });

  // Fetch barbershop's barbers
  const { data: barbers = [], refetch: refetchBarbers } = useQuery({
    queryKey: ["barbershop-barbers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching barbers:", error);
        return [];
      }
      return data;
    },
  });

  // Fetch barbershop's services
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ["barbershop-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching services:", error);
        return [];
      }
      return data;
    },
  });

  // Fetch financial transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["barbershop-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("type", "income");

      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
      return data;
    },
  });

  // Calculate stats
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === new Date().toISOString().split("T")[0]
  ).length;

  const monthlyRevenue = transactions
    .filter((t) => {
      const transactionDate = new Date(t.transaction_date);
      const currentDate = new Date();
      return (
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const activeBarbers = barbers.filter((b) => b.active).length;
  const activeServices = services.filter((s) => s.active).length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        label: "Agendado",
        className: "bg-blue-500/20 text-blue-400",
      },
      confirmed: {
        label: "Confirmado",
        className: "bg-green-500/20 text-green-400",
      },
      completed: {
        label: "Finalizado",
        className: "bg-green-500/20 text-green-400",
      },
      cancelled: {
        label: "Cancelado",
        className: "bg-red-500/20 text-red-400",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.scheduled;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout");
      navigate("/");
    }
  };

  const handleAddBarber = async () => {
    if (!newBarber.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    const { error } = await supabase.from("barbers").insert([
      {
        name: newBarber.name,
        phone: newBarber.phone.replace(/\D/g, "") || null,
      },
    ]);

    if (error) {
      console.error("Error adding barber:", error);
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

    const { error } = await supabase.from("services").insert([
      {
        name: newService.name,
        duration: parseInt(newService.duration),
        price: parseFloat(newService.price),
      },
    ]);

    if (error) {
      console.error("Error adding service:", error);
      toast.error("Erro ao adicionar serviço");
      return;
    }

    toast.success("Serviço adicionado com sucesso!");
    setNewService({ name: "", duration: "", price: "" });
    setIsAddServiceOpen(false);
    refetchServices();
  };

  if (!user) {
    navigate("/user-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Store className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Painel da Barbearia
                </h1>
                <p className="text-gray-400 text-sm">
                  {barbershopInfo?.name || "Elite Barber"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Subscription Badge */}
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400">
                  Plano {barbershopInfo?.plan || "Premium"}
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
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

      <main role="main" aria-label="Dashboard da barbearia">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Agendamentos Hoje
                </CardTitle>
                <Calendar className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {todayAppointments}
                </div>
                <p className="text-xs text-gray-400">Para hoje</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Receita do Mês
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  R$ {monthlyRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-gray-400">Serviços concluídos</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Barbeiros Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {activeBarbers}
                </div>
                <p className="text-xs text-gray-400">
                  De {barbers.length} cadastrados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Serviços Ativos
                </CardTitle>
                <Scissors className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {activeServices}
                </div>
                <p className="text-xs text-gray-400">
                  De {services.length} cadastrados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="agenda" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger
                value="agenda"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agenda
              </TabsTrigger>
              <TabsTrigger
                value="barbeiros"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                <Users className="mr-2 h-4 w-4" />
                Barbeiros
              </TabsTrigger>
              <TabsTrigger
                value="servicos"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                <Scissors className="mr-2 h-4 w-4" />
                Serviços
              </TabsTrigger>
              <TabsTrigger
                value="financeiro"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger
                value="configuracoes"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            {/* Agenda Tab */}
            <TabsContent value="agenda">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Agendamentos da Barbearia
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Visualize e gerencie todos os agendamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-gray-400">Cliente</TableHead>
                        <TableHead className="text-gray-400">Serviço</TableHead>
                        <TableHead className="text-gray-400">
                          Barbeiro
                        </TableHead>
                        <TableHead className="text-gray-400">
                          Data/Hora
                        </TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.slice(0, 10).map((appointment) => (
                        <TableRow
                          key={appointment.id}
                          className="border-slate-700"
                        >
                          <TableCell>
                            <div className="text-white font-medium">
                              {appointment.clients?.name || "Cliente"}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {appointment.clients?.phone || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {appointment.services?.name || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {appointment.barbers?.name || "Qualquer"}
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-300">
                              {new Date(
                                appointment.appointment_date
                              ).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {appointment.appointment_time}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell className="text-green-400">
                            R$ {appointment.price || "0"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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
                  <Dialog
                    open={isAddBarberOpen}
                    onOpenChange={setIsAddBarberOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Barbeiro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Novo Barbeiro
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Adicione um novo barbeiro à equipe
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="barber-name" className="text-white">
                            Nome Completo
                          </Label>
                          <Input
                            id="barber-name"
                            value={newBarber.name}
                            onChange={(e) =>
                              setNewBarber((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="barber-phone" className="text-white">
                            Telefone
                          </Label>
                          <Input
                            id="barber-phone"
                            value={newBarber.phone}
                            onChange={(e) =>
                              setNewBarber((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="(11) 99999-9999"
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
                      <Card
                        key={barber.id}
                        className="bg-slate-700/50 border-slate-600"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-4xl">👨‍🦲</div>
                              <div>
                                <h3 className="text-white font-semibold text-lg">
                                  {barber.name}
                                </h3>
                                <p className="text-gray-400">
                                  {barber.phone || "Sem telefone"}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                barber.active
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {barber.active ? "Ativo" : "Inativo"}
                            </Badge>
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
                  <Dialog
                    open={isAddServiceOpen}
                    onOpenChange={setIsAddServiceOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Serviço
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Novo Serviço
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Adicione um novo serviço ao catálogo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="service-name" className="text-white">
                            Nome do Serviço
                          </Label>
                          <Input
                            id="service-name"
                            value={newService.name}
                            onChange={(e) =>
                              setNewService((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="service-duration"
                              className="text-white"
                            >
                              Duração (min)
                            </Label>
                            <Input
                              id="service-duration"
                              type="number"
                              value={newService.duration}
                              onChange={(e) =>
                                setNewService((prev) => ({
                                  ...prev,
                                  duration: e.target.value,
                                }))
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="service-price"
                              className="text-white"
                            >
                              Preço (R$)
                            </Label>
                            <Input
                              id="service-price"
                              type="number"
                              step="0.01"
                              value={newService.price}
                              onChange={(e) =>
                                setNewService((prev) => ({
                                  ...prev,
                                  price: e.target.value,
                                }))
                              }
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
                      <Card
                        key={service.id}
                        className="bg-slate-700/50 border-slate-600"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-semibold text-lg">
                                {service.name}
                              </h3>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-500/20 text-amber-400"
                                >
                                  <Clock className="mr-1 h-3 w-3" />
                                  {service.duration}min
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-green-500/20 text-green-400"
                                >
                                  R$ {service.price}
                                </Badge>
                              </div>
                            </div>
                            <Badge
                              className={
                                service.active
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {service.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financeiro Tab */}
            <TabsContent value="financeiro">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Relatório Financeiro
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Acompanhe o desempenho financeiro da barbearia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">
                              Receita Mensal
                            </p>
                            <p className="text-white text-2xl font-bold">
                              R$ {monthlyRevenue.toFixed(2)}
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
                            <p className="text-gray-400 text-sm">
                              Agendamentos do Mês
                            </p>
                            <p className="text-white text-2xl font-bold">
                              {appointments.length}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">
                              Ticket Médio
                            </p>
                            <p className="text-white text-2xl font-bold">
                              R${" "}
                              {appointments.length > 0
                                ? (
                                    monthlyRevenue / appointments.length
                                  ).toFixed(2)
                                : "0.00"}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      Relatórios detalhados em desenvolvimento...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações Tab */}
            <TabsContent value="configuracoes">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Configurações da Barbearia
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie as configurações e informações da sua barbearia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Subscription Info */}
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-amber-400 font-semibold">
                            Plano Atual: {barbershopInfo?.plan || "Premium"}
                          </h3>
                          <p className="text-gray-400 text-sm">Status: Ativo</p>
                          <p className="text-gray-400 text-sm">
                            Próxima cobrança: 15/02/2024
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Gerenciar Plano
                        </Button>
                      </div>
                    </div>

                    {/* Barbershop Info */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">
                        Informações da Barbearia
                      </h3>
                      <div className="grid gap-4">
                        <div>
                          <Label className="text-gray-400">
                            Nome da Barbearia
                          </Label>
                          <Input
                            value={barbershopInfo?.name || "Elite Barber"}
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label className="text-gray-400">Telefone</Label>
                          <Input
                            value="(11) 99999-9999"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-400">Endereço</Label>
                          <Input
                            value="Rua das Flores, 123 - Centro"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-600">
                      <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BarbershopDashboard;
