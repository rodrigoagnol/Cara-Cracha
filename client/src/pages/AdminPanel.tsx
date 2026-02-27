import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminPanel() {
  const [searchChild, setSearchChild] = useState("");
  const [searchGuardian, setSearchGuardian] = useState("");

  const childrenQuery = trpc.children.list.useQuery();
  const guardiansQuery = trpc.guardians.list.useQuery();
  const authorizationsQuery = trpc.authorizations.list.useQuery();

  const filteredChildren = (childrenQuery.data || []).filter((child) =>
    child.name.toLowerCase().includes(searchChild.toLowerCase())
  );

  const filteredGuardians = (guardiansQuery.data || []).filter((guardian) =>
    guardian.name.toLowerCase().includes(searchGuardian.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie crianças, responsáveis e autorizações</p>
        </div>

        <Tabs defaultValue="children" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="children">Crianças</TabsTrigger>
            <TabsTrigger value="guardians">Responsáveis</TabsTrigger>
            <TabsTrigger value="authorizations">Autorizações</TabsTrigger>
          </TabsList>

          {/* Aba de Crianças */}
          <TabsContent value="children" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestão de Crianças</CardTitle>
                    <CardDescription>Visualize e gerencie todas as crianças cadastradas</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/child-registration">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Criança
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome..."
                      value={searchChild}
                      onChange={(e) => setSearchChild(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {childrenQuery.isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredChildren.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhuma criança cadastrada</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Idade</TableHead>
                          <TableHead>Turma</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredChildren.map((child) => (
                          <TableRow key={child.id}>
                            <TableCell className="font-medium">{child.name}</TableCell>
                            <TableCell>{child.age}</TableCell>
                            <TableCell>{child.classroom}</TableCell>
                            <TableCell>{child.parentName}</TableCell>
                            <TableCell>{child.parentPhone}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Responsáveis */}
          <TabsContent value="guardians" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestão de Responsáveis</CardTitle>
                    <CardDescription>Visualize e gerencie responsáveis autorizados</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/guardian-registration">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Responsável
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome..."
                      value={searchGuardian}
                      onChange={(e) => setSearchGuardian(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {guardiansQuery.isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredGuardians.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum responsável cadastrado</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Parentesco</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGuardians.map((guardian) => (
                          <TableRow key={guardian.id}>
                            <TableCell className="font-medium">{guardian.name}</TableCell>
                            <TableCell>{guardian.cpf}</TableCell>
                            <TableCell>{guardian.relationship}</TableCell>
                            <TableCell>{guardian.phone}</TableCell>
                            <TableCell>{guardian.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                guardian.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {guardian.isActive ? "Ativo" : "Inativo"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Autorizações */}
          <TabsContent value="authorizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Autorizações</CardTitle>
                <CardDescription>Defina quais responsáveis podem buscar cada criança</CardDescription>
              </CardHeader>
              <CardContent>
                {authorizationsQuery.isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : (authorizationsQuery.data || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhuma autorização cadastrada</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Criança</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Autorizado</TableHead>
                          <TableHead>Data de Criação</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(authorizationsQuery.data || []).map((auth) => {
                          const child = (childrenQuery.data || []).find((c) => c.id === auth.childId);
                          const guardian = (guardiansQuery.data || []).find((g) => g.id === auth.guardianId);

                          return (
                            <TableRow key={auth.id}>
                              <TableCell className="font-medium">{child?.name}</TableCell>
                              <TableCell>{guardian?.name}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  auth.isAuthorized
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {auth.isAuthorized ? "Sim" : "Não"}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(auth.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
