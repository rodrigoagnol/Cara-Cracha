import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Users, Shield, BarChart3, LogOut, LogIn } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center text-white">
          <div className="mb-8">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Sistema de Identificação Facial</h1>
            <p className="text-blue-100">Controle de saída de crianças com reconhecimento facial</p>
          </div>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">Faça login para acessar o sistema</p>
              <Button asChild size="lg" className="w-full">
                <a href={getLoginUrl()}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Fazer Login
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Identificação Facial</h1>
            <p className="text-gray-600">Bem-vindo, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cadastro de Crianças */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Cadastro de Crianças
              </CardTitle>
              <CardDescription>Registre novas crianças com captura facial</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Adicione crianças ao sistema com dados básicos e reconhecimento facial.
              </p>
              <Button asChild className="w-full">
                <Link href="/child-registration">
                  Cadastrar Criança
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Cadastro de Responsáveis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Cadastro de Responsáveis
              </CardTitle>
              <CardDescription>Registre responsáveis autorizados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Adicione responsáveis autorizados com captura facial e dados de contato.
              </p>
              <Button asChild className="w-full">
                <Link href="/guardian-registration">
                  Cadastrar Responsável
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Painel de Portaria */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Portaria
              </CardTitle>
              <CardDescription>Interface de saída com reconhecimento facial</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Acesse a interface de portaria para validação de saídas em tempo real.
              </p>
              <Button asChild className="w-full">
                <Link href="/portaria">
                  Acessar Portaria
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Painel Administrativo */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Painel Administrativo
              </CardTitle>
              <CardDescription>Gestão de crianças e responsáveis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gerencie cadastros, autorizações e visualize estatísticas.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin">
                  Acessar Painel
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Histórico de Saídas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                Histórico de Saídas
              </CardTitle>
              <CardDescription>Consulte registros de saídas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Visualize histórico completo de saídas com filtros e estatísticas.
              </p>
              <Button asChild className="w-full">
                <Link href="/history">
                  Ver Histórico
                </Link>
              </Button>
            </CardContent>
          </Card>


        </div>
      </main>
    </div>
  );
}
