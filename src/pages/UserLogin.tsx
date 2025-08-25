
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Phone, User, Mail, AtSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const UserLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, loading, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
    name: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/user-dashboard");
    }
  }, [user, navigate]);

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Clean up existing state
      cleanupAuthState();
      
      if (isLogin) {
        // For login, use the actual email or create a virtual one for phone
        const loginEmail = loginMethod === 'phone' 
          ? `phone-${credentials.phone.replace(/\D/g, '')}@barbershop.internal` 
          : credentials.email;
        
        const { data, error } = await signIn(loginEmail, credentials.password);
        
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message === "Invalid login credentials" 
              ? "Credenciais inválidas. Verifique seu email/telefone e senha."
              : error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo!`,
          });
          // Force page reload for clean state
          window.location.href = "/user-dashboard";
        }
      } else {
        // For signup, use real email or create virtual one
        const signupEmail = loginMethod === 'phone' 
          ? `phone-${credentials.phone.replace(/\D/g, '')}@barbershop.internal`
          : credentials.email;
        
        const phoneOrEmail = loginMethod === 'phone' ? credentials.phone : credentials.email;
        const { data, error } = await signUp(signupEmail, credentials.password, credentials.name, phoneOrEmail);
        
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Você pode fazer login agora.",
          });
          setIsLogin(true);
          setCredentials(prev => ({ ...prev, name: "" }));
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const formatPhone = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply mask (11) 99999-9999
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setCredentials(prev => ({ ...prev, phone: formatted }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <main role="main" aria-label={isLogin ? 'Login de usuário' : 'Cadastro de usuário'}>
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-2xl text-white font-bold">{isLogin ? 'Login' : 'Cadastrar'}</h1>
            <CardTitle className="text-xl text-white">Elite Barber</CardTitle>
            <p className="text-gray-400">{isLogin ? 'Acesse sua área pessoal' : 'Crie sua conta'}</p>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Method Toggle */}
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={loginMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('email')}
                className="flex-1 text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={loginMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('phone')}
                className="flex-1 text-sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                Telefone
              </Button>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={credentials.name}
                    onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {loginMethod === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={credentials.phone}
                    onChange={handlePhoneChange}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
            >
              {loading ? "Processando..." : (isLogin ? "Entrar" : "Cadastrar")}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-400 hover:text-amber-300"
            >
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-amber-400 hover:text-amber-300"
            >
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
};

export default UserLogin;
