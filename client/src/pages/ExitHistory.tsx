import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Search, CheckCircle2, XCircle } from "lucide-react";

export default function ExitHistory() {
  const [searchChild, setSearchChild] = useState("");
  const [searchGuardian, setSearchGuardian] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const exitLogsQuery = trpc.exitLogs.list.useQuery({ limit: 500 });
  const childrenQuery = trpc.children.list.useQuery();
  const guardiansQuery = trpc.guardians.list.useQuery();

  const filteredLogs = (exitLogsQuery.data || []).filter((log) => {
    const child = childrenQuery.data?.find((c) => c.id === log.childId);
    const guardian = guardiansQuery.data?.find((g) => g.id === log.guardianId);

    const matchesChild = !searchChild || child?.name.toLowerCase().includes(searchChild.toLowerCase());
    const matchesGuardian = !searchGuardian || guardian?.name.toLowerCase().includes(searchGuardian.toLowerCase());
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    return matchesChild && matchesGuardian && matchesStatus;
  });

  const stats = {
    total: exitLogsQuery.data?.length || 0,
    approved: (exitLogsQuery.data || []).filter((log) => log.status === "approved").length,
    denied: (exitLogsQuery.data || []).filter((log) => log.status === "denied").length,
    pending: (exitLogsQuery.data || []).filter((log) => log.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Histórico de Saídas</h1>
          <p className="text-gray-600">Acompanhe todas as saídas de crianças registradas no sistema</p>
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Saídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Autorizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Negadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.denied}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busque e filtre o histórico de saídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search-child">Buscar Criança</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="search-child"
                    placeholder="Nome da criança..."
                    value={searchChild}
                    onChange={(e) => setSearchChild(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="search-guardian">Buscar Responsável</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="search-guardian"
                    placeholder="Nome do responsável..."
                    value={searchGuardian}
                    onChange={(e) => setSearchGuardian(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filter-status">Status</Label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="approved">Aprovado</option>
                  <option value="denied">Negado</option>
                  <option value="pending">Pendente</option>
                  <option value="manual_review">Revisão Manual</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Saída</CardTitle>
            <CardDescription>Total: {filteredLogs.length} registros</CardDescription>
          </CardHeader>
          <CardContent>
            {exitLogsQuery.isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum registro encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Criança</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Confiança</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const child = childrenQuery.data?.find((c) => c.id === log.childId);
                      const guardian = guardiansQuery.data?.find((g) => g.id === log.guardianId);

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.exitTime).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{child?.name}</TableCell>
                          <TableCell>{guardian?.name || "N/A"}</TableCell>
                          <TableCell>
                            {log.matchConfidence ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      log.matchConfidence > 0.7 ? "bg-green-500" : "bg-yellow-500"
                                    }`}
                                    style={{ width: `${log.matchConfidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">
                                  {(log.matchConfidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.status === "approved" && (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-600">Aprovado</span>
                                </>
                              )}
                              {log.status === "denied" && (
                                <>
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-xs font-medium text-red-600">Negado</span>
                                </>
                              )}
                              {log.status === "pending" && (
                                <span className="text-xs font-medium text-yellow-600">Pendente</span>
                              )}
                              {log.status === "manual_review" && (
                                <span className="text-xs font-medium text-blue-600">Revisão Manual</span>
                              )}
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
      </div>
    </div>
  );
}
