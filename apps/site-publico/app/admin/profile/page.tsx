"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  LogOut, 
  Clock, 
  Activity, 
  Trash2, 
  Download,
  Filter,
  Search,
  Calendar,
  FileText,
  Settings
} from "lucide-react";
import { useActivityLog, ActivityLog } from "@/hooks/useActivityLog";
import { logout } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { logs, clearLogs, getRecentLogs, totalLogs } = useActivityLog();
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");

  useEffect(() => {
    // Verificar autenticação do admin (cookie) ao invés de JWT
    if (typeof window !== "undefined") {
      const hasAdminToken = document.cookie.includes("admin_token=");
      if (!hasAdminToken) {
        router.push("/admin/login?from=/admin/profile");
      }
    }
  }, [router]);

  useEffect(() => {
    let filtered = [...logs];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por ação
    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // Filtrar por entidade
    if (filterEntity !== "all") {
      filtered = filtered.filter((log) => log.entity === filterEntity);
    }

    // Ordenar por timestamp (mais recente primeiro)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterAction, filterEntity]);

  const handleLogout = () => {
    logout();
  };

  const handleClearLogs = () => {
    if (confirm("Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.")) {
      clearLogs();
    }
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
      case "criar":
        return "bg-green-100 text-green-800";
      case "update":
      case "atualizar":
        return "bg-blue-100 text-blue-800";
      case "delete":
      case "deletar":
        return "bg-red-100 text-red-800";
      case "view":
      case "visualizar":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity.toLowerCase()) {
      case "hotel":
      case "hotéis":
        return "🏨";
      case "promotion":
      case "promoção":
        return "🎯";
      case "attraction":
      case "atração":
        return "📍";
      case "ticket":
      case "ingresso":
        return "🎟️";
      default:
        return "📄";
    }
  };

  // Estatísticas
  const stats = {
    total: totalLogs,
    today: logs.filter(
      (log) =>
        new Date(log.timestamp).toDateString() === new Date().toDateString()
    ).length,
    thisWeek: logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length,
    creates: logs.filter((log) =>
      log.action.toLowerCase().includes("create") ||
      log.action.toLowerCase().includes("criar")
    ).length,
    updates: logs.filter((log) =>
      log.action.toLowerCase().includes("update") ||
      log.action.toLowerCase().includes("atualizar")
    ).length,
    deletes: logs.filter((log) =>
      log.action.toLowerCase().includes("delete") ||
      log.action.toLowerCase().includes("deletar")
    ).length,
  };

  // Obter ações únicas
  const uniqueActions = Array.from(
    new Set(logs.map((log) => log.action))
  ).sort();

  // Obter entidades únicas
  const uniqueEntities = Array.from(
    new Set(logs.map((log) => log.entity))
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="w-8 h-8" />
              Perfil do Usuário
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize e gerencie suas ações e histórico de atividades
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportLogs}
              className="flex items-center gap-2"
              suppressHydrationWarning
            >
              <Download className="w-4 h-4" />
              Exportar Logs
            </Button>
            <Button
              variant="outline"
              onClick={handleClearLogs}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
              suppressHydrationWarning
            >
              <Trash2 className="w-4 h-4" />
              Limpar Logs
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/cms")}
              className="flex items-center gap-2"
              suppressHydrationWarning
            >
              <Settings className="w-4 h-4" />
              Voltar ao CMS
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
              suppressHydrationWarning
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">Todas as ações registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-gray-500">Ações realizadas hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Esta Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
              <p className="text-xs text-gray-500">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Operações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Criar:</span>
                  <span className="font-bold">{stats.creates}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Atualizar:</span>
                  <span className="font-bold">{stats.updates}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Deletar:</span>
                  <span className="font-bold">{stats.deletes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por ação, entidade ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  suppressHydrationWarning
                />
              </div>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                <option value="all">Todas as ações</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>

              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                <option value="all">Todas as entidades</option>
                {uniqueEntities.map((entity) => (
                  <option key={entity} value={entity}>
                    {entity}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Histórico de Atividades
            </CardTitle>
            <CardDescription>
              {filteredLogs.length} de {totalLogs} ações encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma ação encontrada</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl">{getEntityIcon(log.entity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">
                          {log.entity}
                        </span>
                        {log.entityName && (
                          <span className="text-sm text-gray-600">
                            - {log.entityName}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-sm text-gray-600 mb-2">
                          {log.details}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.timestamp)}
                        </div>
                        {log.user && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

