import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, DollarSign, UserCheck, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  validateName, 
  validatePhone, 
  validateCPF,
  validatePassword,
  validateEmail,
  sanitizeName,
  sanitizePhoneNumber,
  sanitizeCPF,
  formatCPF,
  validateAppointmentDate, 
  validateAppointmentTime 
} from "@/utils/validation";

const Booking = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLogin, setIsLogin] = useState(true); // true = login, false = cadastro
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Estado expandido com autenticação
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cpf: "",
    email: "",
    password: "",
    service: "",
    barber: "",
    time: "",
  });

  console.log('🚀 Booking component rendered with formData:', formData);
  console.log('👤 User auth state:', { isAuthenticated: !!user, userEmail: user?.email });

  // Buscar serviços ativos
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('📊 Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching services:', error);
        toast.error('Erro ao carregar serviços');
        return [];
      }
      
      console.log('✅ Services loaded:', data);
      return data;
    }
  });

  // Buscar barbeiros ativos
  const { data: barbers = [], isLoading: barbersLoading, error: barbersError } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      console.log('💇 Fetching barbers...');
      
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching barbers:', error);
        toast.error('Erro ao carregar barbeiros');
        return [];
      }
      
      console.log('✅ Barbers loaded:', data);
      
      return data;
    }
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔄 Input change - ${field}:`, value);
    
    let processedValue = value;
    
    if (field === 'name') {
      // ✅ Para nome: apenas manter o valor original, permitir espaços
      processedValue = value; // Sem sanitização em tempo real
    } else if (field === 'phone') {
      processedValue = sanitizePhoneNumber(value);
    } else if (field === 'cpf') {
      // ✅ CPF: sanitizar entrada e formatar para exibição
      const cleanCPF = sanitizeCPF(value);
      processedValue = formatCPF(cleanCPF);
    } else if (field === 'email') {
      // ✅ Email: manter original, validar depois
      processedValue = value.toLowerCase().trim();
    } else if (field === 'password') {
      // ✅ Senha: manter original
      processedValue = value;
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: processedValue };
      console.log('📝 Updated formData:', newData);
      return newData;
    });
  };

  const validateForm = (): boolean => {
    // Validações básicas do agendamento
    if (!selectedDate) {
      toast.error("Por favor, selecione uma data");
      return false;
    }

    if (!validateAppointmentDate(selectedDate)) {
      toast.error("Não é possível agendar para datas passadas");
      return false;
    }

    if (!formData.service) {
      toast.error("Por favor, selecione um serviço");
      return false;
    }

    if (!formData.time) {
      toast.error("Por favor, selecione um horário");
      return false;
    }

    if (!validateAppointmentTime(formData.time, selectedDate)) {
      toast.error("Não é possível agendar para horários passados");
      return false;
    }

    // ✅ Se usuário NÃO está logado, validar dados pessoais
    if (!user) {
      if (!formData.name.trim()) {
        toast.error("Por favor, digite seu nome");
        return false;
      }

      const sanitizedName = sanitizeName(formData.name);
      if (!validateName(sanitizedName)) {
        toast.error("Nome deve conter apenas letras e espaços, com 2-100 caracteres");
        return false;
      }

      if (!formData.phone) {
        toast.error("Por favor, digite seu telefone");
        return false;
      }

      if (!validatePhone(formData.phone)) {
        toast.error("Telefone deve ter 10 ou 11 dígitos");
        return false;
      }

      // ✅ CPF é opcional - validar só se informado
      if (formData.cpf && formData.cpf.trim()) {
        const cleanCPF = sanitizeCPF(formData.cpf);
        if (!validateCPF(cleanCPF)) {
          toast.error("Por favor, digite um CPF válido");
          return false;
        }
      }

      if (!formData.email) {
        toast.error("Por favor, digite seu email");
        return false;
      }

      if (!validateEmail(formData.email)) {
        toast.error("Por favor, digite um email válido");
        return false;
      }

      if (!formData.password) {
        toast.error("Por favor, digite uma senha");
        return false;
      }

      if (!validatePassword(formData.password)) {
        toast.error("Senha deve ter pelo menos 6 caracteres");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('🚀 Starting appointment booking process...');
    console.log('📋 Form data:', formData);
    console.log('📅 Selected date:', selectedDate);
    console.log('👤 User authenticated:', !!user);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let currentUser = user;
      
      // ✅ Se usuário NÃO está logado, fazer login/cadastro primeiro
      if (!currentUser) {
        console.log('🔐 User not authenticated, attempting auth...');
        
        try {
          if (isLogin) {
            // ✅ Tentativa de LOGIN
            console.log('📧 Attempting login...');
            const { data, error } = await signIn(formData.email, formData.password);
            
            if (error) {
              console.error('❌ Login failed:', error);
              toast.error("Email ou senha incorretos. Verifique suas credenciais ou crie uma conta.");
              return;
            }
            
            currentUser = data?.user;
            console.log('✅ Login successful:', currentUser?.email);
            toast.success("Login realizado com sucesso!");
            
          } else {
            // ✅ Tentativa de CADASTRO
            console.log('👤 Attempting signup...');
            const { data, error } = await signUp(formData.email, formData.password, formData.name, formData.phone);
            
            if (error) {
              console.error('❌ Signup failed:', error);
              toast.error("Erro ao criar conta: " + error.message);
              return;
            }
            
            currentUser = data?.user;
            console.log('✅ Signup successful:', currentUser?.email);
            toast.success("Conta criada com sucesso!");
          }
        } catch (authError) {
          console.error('💥 Auth error:', authError);
          toast.error("Erro de autenticação. Tente novamente.");
          return;
        }
      }

      // ✅ Continuar com criação do agendamento
      console.log('📅 Proceeding with appointment creation...');
      
      // Buscar preço do serviço selecionado
      const selectedService = services.find(s => s.id === formData.service);
      const servicePrice = selectedService?.price || 0;
      
      console.log('💰 Service details:', {
        selectedServiceId: formData.service,
        selectedService,
        servicePrice
      });

      // ✅ Buscar ou criar cliente na tabela CLIENTS
      let clientId = null;
      
      if (currentUser) {
        console.log('👤 User authenticated, finding client record...');
        
        // Buscar dados do perfil do usuário
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', currentUser.id)
          .single();
        
        if (userProfile) {
          // Buscar cliente existente pelo nome ou telefone do perfil
          const { data: existingClient, error: searchError } = await supabase
            .from('clients')
            .select('id, cpf')
            .or(`name.eq."${userProfile.name.replace(/"/g, '\\"')}",phone.eq."${userProfile.phone.replace(/"/g, '\\"')}"`)
            .maybeSingle();
          
          if (searchError && searchError.code !== 'PGRST116') {
            console.error('❌ Error searching client:', searchError);
          }
          
          if (existingClient) {
            clientId = existingClient.id;
            console.log('✅ Found existing client:', clientId);
            
            // Se não tem CPF e agora foi fornecido, atualizar
            if (!existingClient.cpf && formData.cpf && formData.cpf.trim()) {
              await supabase
                .from('clients')
                .update({ cpf: sanitizeCPF(formData.cpf) })
                .eq('id', clientId);
            }
          } else {
            console.log('⚠️ Cliente não encontrado, criando novo...');
            // Criar cliente para usuário autenticado
            const { data: newClient, error: clientError } = await supabase
              .from('clients')
              .insert([
                {
                  name: userProfile.name,
                  phone: userProfile.phone,
                  cpf: formData.cpf && formData.cpf.trim() ? sanitizeCPF(formData.cpf) : '',
                  accepts_whatsapp: true,
                  status: 'active'
                },
              ])
              .select()
              .single();

            if (clientError) {
              console.error('❌ Error creating client for authenticated user:', clientError);
              toast.error("Erro ao criar registro do cliente");
              return;
            }

            clientId = newClient.id;
            console.log('✅ New client created for authenticated user:', clientId);
          }
        }
      } else {
        // ✅ Para usuários não logados, criar novo cliente
        console.log('👤 Creating new client...');
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([
            {
              name: sanitizeName(formData.name),
              phone: formData.phone,
              cpf: formData.cpf ? sanitizeCPF(formData.cpf) : '',
              accepts_whatsapp: true,
              status: 'active'
            },
          ])
          .select()
          .single();

        if (clientError) {
          console.error('❌ Error creating client:', clientError);
          toast.error("Erro ao cadastrar cliente");
          return;
        }

        clientId = newClient.id;
        console.log('✅ New client created:', clientId);
      }

      if (!clientId) {
        console.error('❌ No client ID available');
        toast.error("Erro: não foi possível identificar o cliente");
        return;
      }

      // ✅ Criar agendamento vinculando ao CLIENT_ID
      const appointmentData = {
        client_id: clientId, // ✅ Vincular ao cliente
        service_id: formData.service,
        barber_id: formData.barber || null,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: formData.time,
        price: servicePrice,
        status: 'scheduled',
        notes: `Agendamento realizado via sistema web`
      };

      console.log('📅 Creating appointment with data:', appointmentData);

      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (appointmentError) {
        console.error('❌ Error creating appointment:', appointmentError);
        toast.error("Erro ao criar agendamento. Tente novamente.");
        return;
      }

      if (!newAppointment) {
        console.error('❌ No appointment data returned after insert');
        toast.error("Erro ao criar agendamento. Tente novamente.");
        return;
      }

      console.log('✅ Appointment created successfully:', newAppointment);
      toast.success("Agendamento criado com sucesso! Entraremos em contato para confirmar.");
      
      // Resetar formulário
      console.log('🔄 Resetting form...');
      if (!user) {
        setFormData({
          name: "",
          phone: "",
          cpf: "",
          email: "",
          password: "",
          service: "",
          barber: "",
          time: "",
        });
      } else {
        // Se usuário está logado, resetar apenas campos do agendamento
        setFormData(prev => ({
          ...prev,
          service: "",
          barber: "",
          time: "",
        }));
      }
      setSelectedDate(new Date());
      
      // Redirecionar baseado no estado de autenticação
      console.log('🔄 Redirecting...');
      setTimeout(() => {
        if (currentUser) {
          navigate("/user-dashboard");
        } else {
          navigate("/");
        }
      }, 2000);

    } catch (error) {
      console.error('💥 Unexpected error in booking process:', error);
      toast.error("Erro interno. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.service);

  // Log de erros de carregamento
  if (servicesError) {
    console.error('❌ Services loading error:', servicesError);
  }
  if (barbersError) {
    console.error('❌ Barbers loading error:', barbersError);
  }

  // Log de estados de carregamento
  console.log('📊 Loading states:', {
    servicesLoading,
    barbersLoading,
    servicesCount: services.length,
    barbersCount: barbers.length
  });

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
              {/* Estado de autenticação */}
              {user ? (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Logado como: {user.email}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">Seus dados serão preenchidos automaticamente</p>
                </div>
              ) : (
                <>
                  {/* Toggle Login/Cadastro */}
                  <div className="flex items-center justify-center space-x-4 p-4 bg-slate-700/50 rounded-lg">
                    <Button
                      type="button"
                      variant={isLogin ? "default" : "outline"}
                      onClick={() => setIsLogin(true)}
                      className={isLogin ? "bg-amber-500 text-black" : "border-amber-500 text-amber-400"}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Já sou cliente
                    </Button>
                    <Button
                      type="button"
                      variant={!isLogin ? "default" : "outline"}
                      onClick={() => setIsLogin(false)}
                      className={!isLogin ? "bg-amber-500 text-black" : "border-amber-500 text-amber-400"}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sou novo cliente
                    </Button>
                  </div>

                  {/* Dados pessoais */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => {
                            console.log('📝 Direct name input:', e.target.value);
                            setFormData(prev => ({ ...prev, name: e.target.value }));
                          }}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Ex: João Silva Santos"
                          required={!isLogin}
                          maxLength={100}
                        />
                      </div>
                    )}
                    
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="11999999999 (apenas números)"
                          required={!isLogin}
                          maxLength={11}
                        />
                        <p className="text-xs text-gray-400">Digite apenas números (10-11 dígitos)</p>
                      </div>
                    )}

                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-white">CPF (opcional)</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="000.000.000-00"
                          required={false}
                          maxLength={14}
                        />
                        <p className="text-xs text-gray-400">Digite apenas números (11 dígitos) - Campo opcional</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="seu@email.com"
                        required
                      />
                      {isLogin && <p className="text-xs text-gray-400">Email usado no seu cadastro</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-400">
                        {isLogin ? "Digite sua senha de acesso" : "Mínimo 6 caracteres (letras, números, símbolos)"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Serviço */}
              <div className="space-y-2">
                <Label className="text-white">Serviço *</Label>
                {servicesLoading ? (
                  <div className="text-gray-400">Carregando serviços...</div>
                ) : (
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
                )}
              </div>

              {/* Barbeiro */}
              <div className="space-y-2">
                <Label className="text-white">Barbeiro (opcional)</Label>
                {barbersLoading ? (
                  <div className="text-gray-400">Carregando barbeiros...</div>
                ) : barbersError ? (
                  <div className="text-red-400">Erro ao carregar barbeiros</div>
                ) : !barbers || barbers.length === 0 ? (
                  <div className="text-yellow-400">Nenhum barbeiro disponível</div>
                ) : (
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
                )}
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
                disabled={servicesLoading || barbersLoading || isSubmitting}
              >
                <DollarSign className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Processando...' : 
                 servicesLoading || barbersLoading ? 'Carregando...' : 
                 user ? 'Confirmar Agendamento' :
                 isLogin ? 'Entrar e Agendar' : 'Cadastrar e Agendar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
