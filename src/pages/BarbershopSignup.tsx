import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowLeft, Crown, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 49,90',
    period: '/mês',
    features: [
      'Até 2 barbeiros',
      'Agenda online',
      'Relatórios básicos',
      'Suporte por email'
    ],
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 99,90',
    period: '/mês',
    features: [
      'Barbeiros ilimitados',
      'Agenda online avançada',
      'Relatórios completos',
      'Integração WhatsApp',
      'Gestão financeira',
      'Suporte prioritário'
    ],
    color: 'amber',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 199,90',
    period: '/mês',
    features: [
      'Múltiplas filiais',
      'API personalizada',
      'Relatórios avançados',
      'Suporte 24/7',
      'Treinamento incluído',
      'Customizações'
    ],
    color: 'purple'
  }
];

const BarbershopSignup = () => {
  const navigate = useNavigate();
  const { signUpBarbershop } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Barbershop Info
    barbershopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Account Info
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const { barbershopName, ownerName, email, phone } = formData;
    if (!barbershopName || !ownerName || !email || !phone) {
      setError("Preencha todos os campos obrigatórios");
      return false;
    }
    if (!email.includes('@')) {
      setError("Email inválido");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { password, confirmPassword, acceptTerms } = formData;
    if (!password || !confirmPassword) {
      setError("Preencha a senha e confirmação");
      return false;
    }
    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Senhas não coincidem");
      return false;
    }
    if (!acceptTerms) {
      setError("Você deve aceitar os termos de uso");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      // Create the barbershop data object
      const barbershopData = {
        barbershopName: formData.barbershopName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        selectedPlan
      };

      const { data, error } = await signUpBarbershop(
        formData.email,
        formData.password,
        barbershopData
      );
      
      if (error) {
        setError(error.message || "Erro ao criar conta");
        toast.error(error.message || "Erro ao criar conta");
        return;
      }

      if (data?.user) {
        toast.success("Barbearia criada com sucesso! Bem-vindo!");
        navigate("/barbershop-dashboard");
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError("Erro inesperado. Tente novamente.");
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-full w-fit mb-4">
            <Store className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Registre sua Barbearia
          </h1>
          <p className="text-gray-400">
            Escolha seu plano e comece a gerenciar sua barbearia hoje mesmo
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= 1 ? 'bg-amber-500 border-amber-500 text-black' : 'border-gray-500 text-gray-500'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-amber-500' : 'bg-gray-500'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= 2 ? 'bg-amber-500 border-amber-500 text-black' : 'border-gray-500 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Plan Selection and Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Plan Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Escolha seu Plano</CardTitle>
                <CardDescription className="text-gray-400">
                  Selecione o plano que melhor atende sua barbearia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? `border-${plan.color}-500 bg-${plan.color}-500/10`
                          : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-amber-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                            Mais Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-white">{plan.price}</span>
                          <span className="text-gray-400">{plan.period}</span>
                        </div>
                        
                        <ul className="space-y-2 text-sm text-gray-300">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações da Barbearia</CardTitle>
                <CardDescription className="text-gray-400">
                  Dados básicos para criar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/50 mb-6">
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="barbershopName" className="text-white">
                      Nome da Barbearia *
                    </Label>
                    <Input
                      id="barbershopName"
                      placeholder="Ex: Elite Barber"
                      value={formData.barbershopName}
                      onChange={(e) => handleInputChange('barbershopName', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-white">
                      Nome do Proprietário *
                    </Label>
                    <Input
                      id="ownerName"
                      placeholder="Seu nome completo"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@suabarbearia.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Telefone *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      placeholder="Rua, número"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">
                      Cidade
                    </Label>
                    <Input
                      id="city"
                      placeholder="Sua cidade"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                  >
                    Próximo Passo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Account Creation */}
        {currentStep === 2 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Criar Conta</CardTitle>
              <CardDescription className="text-gray-400">
                Defina sua senha e finalize o cadastro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="bg-red-500/10 border-red-500/50 mb-6">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Senha *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirmar Senha *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-gray-300">
                      Eu aceito os{" "}
                      <Link to="/terms" className="text-amber-400 hover:text-amber-300 underline">
                        Termos de Uso
                      </Link>{" "}
                      e a{" "}
                      <Link to="/privacy" className="text-amber-400 hover:text-amber-300 underline">
                        Política de Privacidade
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      checked={formData.acceptMarketing}
                      onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="acceptMarketing" className="text-sm text-gray-300">
                      Quero receber novidades e promoções por email
                    </Label>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Resumo do Pedido</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">
                      Plano {plans.find(p => p.id === selectedPlan)?.name}
                    </span>
                    <span className="text-amber-400 font-semibold">
                      {plans.find(p => p.id === selectedPlan)?.price}/mês
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    7 dias grátis • Cancele a qualquer momento
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-slate-600 text-gray-400 hover:bg-slate-700"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Já tem uma conta?{" "}
            <Link 
              to="/barbershop-login" 
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarbershopSignup;