import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const BarbershopLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setError(
          error.message || "Erro ao fazer login. Verifique suas credenciais."
        );
        toast.error(error.message || "Erro ao fazer login");
        return;
      }

      if (data?.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/barbershop-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro inesperado. Tente novamente.");
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-full w-fit">
              <Store className="h-8 w-8 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Painel da Barbearia
              </CardTitle>
              <CardDescription className="text-gray-400">
                Acesse o painel de gestão da sua barbearia
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/50">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email da Barbearia
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@suabarbearia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar no Painel"}
              </Button>
            </form>

            <Separator className="bg-slate-600" />

            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm">
                Ainda não tem uma barbearia registrada?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/barbershop-signup")}
                className="w-full border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
              >
                Registrar Barbearia
              </Button>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-xs">
                Problemas para acessar?{" "}
                <Link
                  to="/contact"
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Entre em contato
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-500/10 border-blue-500/50">
          <CardContent className="p-4">
            <h3 className="text-blue-400 font-semibold mb-2">
              🧪 Credenciais de Demonstração
            </h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p>
                <strong>Email:</strong> barbershop@demo.com
              </p>
              <p>
                <strong>Senha:</strong> demo123
              </p>
            </div>
            <p className="text-blue-400 text-xs mt-2">
              Use estas credenciais para explorar o painel da barbearia
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarbershopLogin;
