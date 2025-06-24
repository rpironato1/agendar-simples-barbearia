
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const Booking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    barber: "",
    time: "",
  });

  // Buscar serviços ativos
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }
      return data;
    }
  });

  // Buscar barbeiros ativos
  const { data: barbers = [] } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching barbers:', error);
        return [];
      }
      return data;
    }
  });

  // Função para limpar telefone (apenas números)
  const cleanPhone = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      value = cleanPhone(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!selectedDate) {
      toast.error("Por favor, selecione uma data");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    if (!formData.phone) {
      toast.error("Por favor, digite seu telefone");
      return;
    }

    if (formData.phone.length < 10) {
      toast.error("Telefone deve ter pelo menos 10 dígitos");
      return;
    }

    if (!formData.service) {
      toast.error("Por favor, selecione um serviço");
      return;
    }

    if (!formData.time) {
      toast.error("Por favor, selecione um horário");
      return;
    }

    try {
      console.log('Iniciando processo de agendamento...');
      console.log('Dados do formulário:', formData);

      // Primeiro, verificar se o cliente já existe pelo telefone
      let clientId = null;
      
      const { data: existingClient, error: clientSearchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', formData.phone)
        .maybeSingle();

      if (clientSearchError) {
        console.error('Erro ao buscar cliente:', clientSearchError);
      }

      if (existingClient) {
        console.log('Cliente existente encontrado:', existingClient.id);
        clientId = existingClient.id;
        
        // Atualizar nome do cliente se necessário
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            name: formData.name.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (updateError) {
          console.error('Erro ao atualizar cliente:', updateError);
        } else {
          console.log('Cliente atualizado com sucesso');
        }
      } else {
        console.log('Criando novo cliente...');
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([{
            name: formData.name.trim(),
            phone: formData.phone,
            cpf: '',
            accepts_whatsapp: true,
            status: 'active'
          }])
          .select('id')
          .single();

        if (clientError) {
          console.error('Erro ao criar cliente:', clientError);
          toast.error("Erro ao cadastrar cliente. Tente novamente.");
          return;
        }

        clientId = newClient.id;
        console.log('Novo cliente criado:', clientId);
      }

      // Buscar preço do serviço selecionado
      const selectedService = services.find(s => s.id === formData.service);
      const servicePrice = selectedService?.price || 0;

      console.log('Criando agendamento...');
      console.log('Cliente ID:', clientId);
      console.log('Serviço:', formData.service);
      console.log('Preço:', servicePrice);

      // Criar agendamento
      const appointmentData = {
        client_id: clientId,
        service_id: formData.service,
        barber_id: formData.barber || null,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: formData.time,
        price: servicePrice,
        status: 'scheduled'
      };

      console.log('Dados do agendamento:', appointmentData);

      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (appointmentError) {
        console.error('Erro ao criar agendamento:', appointmentError);
        toast.error("Erro ao criar agendamento. Tente novamente.");
        return;
      }

      console.log('Agendamento criado com sucesso:', newAppointment);
      toast.success("Agendamento criado com sucesso!");
      
      // Resetar formulário
      setFormData({
        name: "",
        phone: "",
        service: "",
        barber: "",
        time: "",
      });
      setSelectedDate(new Date());
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error('Erro no processo de agendamento:', error);
      toast.error("Erro interno. Tente novamente.");
    }
  };

  const selectedService = services.find(s => s.id === formData.service);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Agendar Horário</h1>
          <p className="text-gray-300 text-lg">Escolha o melhor horário para cuidar do seu visual</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Dados do Agendamento</CardTitle>
            <CardDescription className="text-gray-400">
              Preencha as informações abaixo para confirmar seu agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados pessoais */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="11999999999 (apenas números)"
                    required
                  />
                  <p className="text-xs text-gray-400">Digite apenas números (mínimo 10 dígitos)</p>
                </div>
              </div>

              {/* Serviço */}
              <div className="space-y-2">
                <Label className="text-white">Serviço *</Label>
                <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Escolha o serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="text-white">
                        <div className="flex justify-between items-center w-full">
                          <span>{service.name}</span>
                          <span className="text-green-400 ml-4">R$ {service.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Barbeiro */}
              <div className="space-y-2">
                <Label className="text-white">Barbeiro (opcional)</Label>
                <Select value={formData.barber} onValueChange={(value) => handleInputChange('barber', value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Qualquer barbeiro disponível" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id} className="text-white">
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Hora */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Escolha a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Horário *</Label>
                  <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Escolha o horário" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="text-white">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumo do agendamento */}
              {selectedService && (
                <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
                  <h3 className="text-amber-400 font-semibold mb-2">Resumo do Agendamento</h3>
                  <div className="space-y-1 text-gray-300">
                    <p><strong>Serviço:</strong> {selectedService.name}</p>
                    <p><strong>Duração:</strong> {selectedService.duration} minutos</p>
                    <p><strong>Valor:</strong> R$ {selectedService.price}</p>
                    {selectedDate && formData.time && (
                      <p><strong>Data/Hora:</strong> {format(selectedDate, "dd/MM/yyyy")} às {formData.time}</p>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-3 text-lg"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Confirmar Agendamento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
