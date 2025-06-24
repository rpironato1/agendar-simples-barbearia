
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Scissors, Settings, Plus, Edit, Trash2, Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock data
const mockBookings = [
  { id: 1, clientName: "Carlos Silva", clientPhone: "(11) 99999-1111", service: "Corte Clássico", barber: "João Santos", date: "2024-01-15", time: "10:00", status: "scheduled", price: 35 },
  { id: 2, clientName: "Roberto Lima", clientPhone: "(11) 99999-2222", service: "Combo Premium", barber: "Carlos Silva", date: "2024-01-15", time: "14:30", status: "confirmed", price: 55 },
  { id: 3, clientName: "Pedro Costa", clientPhone: "(11) 99999-3333", service: "Barba Completa", barber: "Roberto Lima", date: "2024-01-16", time: "09:00", status: "done", price: 25 },
];

const mockBarbers = [
  { id: 1, name: "Carlos Silva", specialty: "Cortes clássicos", active: true, totalServices: 124 },
  { id: 2, name: "João Santos", specialty: "Barbas e bigodes", active: true, totalServices: 98 },
  { id: 3, name: "Roberto Lima", specialty: "Cortes modernos", active: false, totalServices: 87 },
];

const mockServices = [
  { id: 1, name: "Corte Clássico", duration: 30, price: 35, active: true },
  { id: 2, name: "Barba Completa", duration: 25, price: 25, active: true },
  { id: 3, name: "Combo Premium", duration: 50, price: 55, active: true },
  { id: 4, name: "Sobrancelha", duration: 15, price: 15, active: true },
];

const Admin = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(mockBookings);
  const [barbers, setBarbers] = useState(mockBarbers);
  const [services, setServices] = useState(mockServices);
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Agendado", className: "bg-blue-500/20 text-blue-400" },
      confirmed: { label: "Confirmado", className: "bg-green-500/20 text-green-400" },
      done: { label: "Concluído", className: "bg-gray-500/20 text-gray-400" },
      canceled: { label: "Cancelado", className: "bg-red-500/20 text-red-400" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const updateBookingStatus = (bookingId: number, newStatus: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
    toast.success("Status atualizado com sucesso!");
  };

  const sendWhatsApp = (phone: string, clientName: string) => {
    const message = `Olá ${clientName}! Este é um lembrete do seu agendamento na Elite Barber.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
              <div className="text-2xl font-bold text-white">8</div>
              <p className="text-xs text-gray-400">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Receita do Mês</CardTitle>
              <div className="text-green-400">R$</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ 4.200</div>
              <p className="text-xs text-gray-400">+15% desde o mês passado</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Barbeiros Ativos</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3</div>
              <p className="text-xs text-gray-400">Todos disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Serviços Ativos</CardTitle>
              <Scissors className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">4</div>
              <p className="text-xs text-gray-400">Todos disponíveis</p>
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
            <TabsTrigger value="barbeiros" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Users className="mr-2 h-4 w-4" />
              Barbeiros
            </TabsTrigger>
            <TabsTrigger value="servicos" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Scissors className="mr-2 h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Phone className="mr-2 h-4 w-4" />
              WhatsApp
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
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="border-slate-700">
                        <TableCell>
                          <div className="text-white font-medium">{booking.clientName}</div>
                          <div className="text-gray-400 text-sm">{booking.clientPhone}</div>
                        </TableCell>
                        <TableCell className="text-gray-300">{booking.service}</TableCell>
                        <TableCell className="text-gray-300">{booking.barber}</TableCell>
                        <TableCell>
                          <div className="text-gray-300">{new Date(booking.date).toLocaleDateString("pt-BR")}</div>
                          <div className="text-gray-400 text-sm">{booking.time}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-green-400">R$ {booking.price}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {booking.status === 'scheduled' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'done')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendWhatsApp(booking.clientPhone, booking.clientName)}
                              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'canceled')}
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
                        <Input id="barber-name" className="bg-slate-700 border-slate-600 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="barber-specialty" className="text-white">Especialidade</Label>
                        <Input id="barber-specialty" className="bg-slate-700 border-slate-600 text-white" />
                      </div>
                      <Button 
                        onClick={() => {
                          toast.success("Barbeiro adicionado com sucesso!");
                          setIsAddBarberOpen(false);
                        }}
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
                              <p className="text-gray-400">{barber.specialty}</p>
                              <p className="text-gray-500 text-sm">{barber.totalServices} serviços realizados</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={barber.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                              {barber.active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button size="sm" variant="outline" className="border-slate-600 text-gray-300">
                              <Edit className="h-3 w-3" />
                            </Button>
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
                        <Input id="service-name" className="bg-slate-700 border-slate-600 text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="service-duration" className="text-white">Duração (min)</Label>
                          <Input id="service-duration" type="number" className="bg-slate-700 border-slate-600 text-white" />
                        </div>
                        <div>
                          <Label htmlFor="service-price" className="text-white">Preço (R$)</Label>
                          <Input id="service-price" type="number" className="bg-slate-700 border-slate-600 text-white" />
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          toast.success("Serviço adicionado com sucesso!");
                          setIsAddServiceOpen(false);
                        }}
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
                            <Button size="sm" variant="outline" className="border-slate-600 text-gray-300">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configurações WhatsApp</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure as mensagens automáticas do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="confirm-msg" className="text-white">Mensagem de Confirmação</Label>
                  <textarea 
                    id="confirm-msg"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white mt-2"
                    rows={3}
                    placeholder="Olá {cliente}! Seu agendamento foi confirmado para {data} às {hora}."
                  />
                </div>
                
                <div>
                  <Label htmlFor="reminder-msg" className="text-white">Mensagem de Lembrete</Label>
                  <textarea 
                    id="reminder-msg"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white mt-2"
                    rows={3}
                    placeholder="Olá {cliente}! Lembrando que você tem um agendamento amanhã às {hora}."
                  />
                </div>
                
                <div>
                  <Label htmlFor="followup-msg" className="text-white">Mensagem de Follow-up</Label>
                  <textarea 
                    id="followup-msg"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white mt-2"
                    rows={3}
                    placeholder="Olá {cliente}! Como foi sua experiência na Elite Barber? Aguardamos sua avaliação!"
                  />
                </div>
                
                <Button 
                  onClick={() => toast.success("Configurações salvas com sucesso!")}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                >
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
