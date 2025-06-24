
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Phone, User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const UserLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        const { data, error } = await signIn(credentials.email, credentials.password);
        
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo!`,
          });
          navigate("/user-dashboard");
        }
      } else {
        const { data, error } = await signUp(credentials.email, credentials.password, credentials.name, credentials.phone);
        
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
            description: "Verifique seu email para confirmar a conta.",
          });
          setIsLogin(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="h-8 w-8 text-black" />
          </div>
          <CardTitle className="text-2xl text-white">Elite Barber</CardTitle>
          <p className="text-gray-400">{isLogin ? 'Acesse sua área pessoal' : 'Crie sua conta'}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

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
                  required
                />
              </div>
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={credentials.phone}
                    onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

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
    </div>
  );
};

export default UserLogin;
