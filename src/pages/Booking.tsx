
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Clock, User, Scissors, ArrowLeft, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(location.state?.selectedService || null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Fetch services from Supabase
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

  // Fetch barbers from Supabase
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

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
  };

  const handleBarberSelect = (barberId: string | null) => {
    setSelectedBarber(barberId);
    setStep(3);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) setStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(5);
  };

  const handleBookingSubmit = async () => {
    if (!clientName || !clientPhone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // First, create or get client
      let clientId;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', clientPhone)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([{
            name: clientName,
            phone: clientPhone,
            cpf: 'N/A', // You might want to collect this
            accepts_whatsapp: true
          }])
          .select('id')
          .single();

        if (clientError) {
          console.error('Error creating client:', clientError);
          toast.error("Erro ao criar cliente");
          return;
        }
        clientId = newClient.id;
      }

      // Create appointment
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert([{
          client_id: clientId,
          service_id: selectedService,
          barber_id: selectedBarber,
          appointment_date: selectedDate?.toISOString().split('T')[0],
          appointment_time: selectedTime,
          price: selectedServiceData?.price,
          status: 'scheduled'
        }]);

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        toast.error("Erro ao criar agendamento");
        return;
      }

      toast.success("Agendamento realizado com sucesso! Entraremos em contato via WhatsApp para confirmar.");
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error in booking:', error);
      toast.error("Erro inesperado ao criar agendamento");
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedBarberData = barbers.find(b => b.id === selectedBarber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-amber-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
                <Scissors className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-xl font-bold text-white">Agendamento</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step >= stepNum 
                    ? 'bg-amber-500 text-black' 
                    : 'bg-slate-700 text-gray-400'
                  }
                `}>
                  {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 5 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${step > stepNum ? 'bg-amber-500' : 'bg-slate-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Serviço</span>
            <span>Barbeiro</span>
            <span>Data</span>
            <span>Horário</span>
            <span>Dados</span>
          </div>
        </div>

        {/* Step 1: Selecionar Serviço */}
        {step === 1 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Escolha o Serviço</CardTitle>
              <CardDescription className="text-gray-400">
                Selecione o serviço desejado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className={`
                      cursor-pointer transition-all duration-200 border-2
                      ${selectedService === service.id 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-slate-600 bg-slate-700/50 hover:border-amber-500/50'
                      }
                    `}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-white font-semibold text-lg mb-2">{service.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{service.description || "Serviço profissional"}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {service.duration}min
                        </Badge>
                        <span className="text-green-400 font-semibold">R$ {service.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Selecionar Barbeiro */}
        {step === 2 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Escolha o Barbeiro</CardTitle>
              <CardDescription className="text-gray-400">
                Selecione seu barbeiro preferido ou deixe-nos escolher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Opção "Qualquer Barbeiro" */}
                <Card 
                  className={`
                    cursor-pointer transition-all duration-200 border-2
                    ${selectedBarber === null 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-slate-600 bg-slate-700/50 hover:border-amber-500/50'
                    }
                  `}
                  onClick={() => handleBarberSelect(null)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">⚡</div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Primeiro Disponível</h3>
                        <p className="text-gray-400">Atendimento com o próximo barbeiro livre</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Barbeiros específicos */}
                {barbers.map((barber) => (
                  <Card 
                    key={barber.id}
                    className={`
                      cursor-pointer transition-all duration-200 border-2
                      ${selectedBarber === barber.id 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-slate-600 bg-slate-700/50 hover:border-amber-500/50'
                      }
                    `}
                    onClick={() => handleBarberSelect(barber.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">👨‍🦲</div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{barber.name}</h3>
                          <p className="text-gray-400">Barbeiro profissional</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Selecionar Data */}
        {step === 3 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Escolha a Data</CardTitle>
              <CardDescription className="text-gray-400">
                Selecione o dia desejado para seu atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border border-slate-600 bg-slate-700/50 text-white"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Selecionar Horário */}
        {step === 4 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Escolha o Horário</CardTitle>
              <CardDescription className="text-gray-400">
                Selecione o horário disponível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={`
                      ${selectedTime === time 
                        ? 'bg-amber-500 text-black hover:bg-amber-600' 
                        : 'border-slate-600 text-gray-300 hover:border-amber-500 hover:text-amber-400'
                      }
                    `}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Dados do Cliente */}
        {step === 5 && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Seus Dados</CardTitle>
                <CardDescription className="text-gray-400">
                  Preencha suas informações para finalizar o agendamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumo do Agendamento */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Serviço:</span>
                  <span className="text-white">{selectedServiceData?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Barbeiro:</span>
                  <span className="text-white">{selectedBarberData?.name || "Primeiro disponível"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Data:</span>
                  <span className="text-white">{selectedDate?.toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Horário:</span>
                  <span className="text-white">{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duração:</span>
                  <span className="text-white">{selectedServiceData?.duration} minutos</span>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400">R$ {selectedServiceData?.price}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleBookingSubmit}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-4 text-lg"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Confirmar Agendamento
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        {step > 1 && step < 5 && (
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="border-slate-600 text-gray-300 hover:border-amber-500 hover:text-amber-400"
            >
              Voltar
            </Button>
            {step < 4 && (
              <Button 
                onClick={() => setStep(step + 1)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 2 && selectedBarber === undefined) ||
                  (step === 3 && !selectedDate)
                }
              >
                Continuar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
