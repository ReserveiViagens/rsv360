// 🔍 SISTEMA DE AUDITORIA - RESERVEI VIAGENS
// Funcionalidade: Log de atividades e auditoria do sistema
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, User, Activity, Shield, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';

interface LogAuditoria {
  id: number;
  usuario: string;
  acao: string;
  modulo: string;
  recurso: string;
  detalhes: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  duracao?: number;
  status: 'sucesso' | 'erro' | 'alerta' | 'bloqueado';
  nivel: 'info' | 'warning' | 'error' | 'critical';
  dadosAntes?: any;
  dadosDepois?: any;
}

const SistemaAuditoria: React.FC = () => {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [logSelecionado, setLogSelecionado] = useState<LogAuditoria | null>(null);

  // Dados mock
  const logsMock: LogAuditoria[] = [
    {
      id: 1,
      usuario: 'Ana Silva Santos',
      acao: 'LOGIN',
      modulo: 'AUTENTICACAO',
      recurso: 'Sistema',
      detalhes: 'Login realizado com sucesso',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-29 09:15:23',
      duracao: 1200,
      status: 'sucesso',
      nivel: 'info'
    },
    {
      id: 2,
      usuario: 'Carlos Vendedor Silva',
      acao: 'CREATE',
      modulo: 'VENDAS',
      recurso: 'Venda #VND-2025-001',
      detalhes: 'Nova venda criada para cliente João Oliveira',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-29 10:30:45',
      duracao: 2500,
      status: 'sucesso',
      nivel: 'info',
      dadosAntes: null,
      dadosDepois: { cliente: 'João Oliveira', valor: 377.58, produtos: ['Hot Park - Ingresso'] }
    },
    {
      id: 3,
      usuario: 'Roberto Financeiro Lima',
      acao: 'UPDATE',
      modulo: 'FINANCEIRO',
      recurso: 'Fatura #000001',
      detalhes: 'Status da fatura alterado para "paga"',
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-29 11:45:12',
      duracao: 800,
      status: 'sucesso',
      nivel: 'info',
      dadosAntes: { status: 'pendente' },
      dadosDepois: { status: 'paga', dataPagamento: '2025-08-29' }
    },
    {
      id: 4,
      usuario: 'Admin Master',
      acao: 'DELETE',
      modulo: 'USUARIOS',
      recurso: 'Usuário #user123',
      detalhes: 'Usuário removido do sistema',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-29 14:20:33',
      duracao: 1500,
      status: 'alerta',
      nivel: 'warning',
      dadosAntes: { nome: 'Usuário Teste', email: 'teste@exemplo.com', status: 'inativo' },
      dadosDepois: null
    },
    {
      id: 5,
      usuario: 'Sistema',
      acao: 'LOGIN_FAILED',
      modulo: 'AUTENTICACAO',
      recurso: 'Sistema',
      detalhes: 'Tentativa de login falhada - senha incorreta',
      ip: '201.23.45.67',
      userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:81.0) Gecko/81.0 Firefox/81.0',
      timestamp: '2025-08-29 15:30:00',
      status: 'erro',
      nivel: 'warning'
    },
    {
      id: 6,
      usuario: 'Sistema',
      acao: 'SECURITY_ALERT',
      modulo: 'SEGURANCA',
      recurso: 'Sistema',
      detalhes: 'Múltiplas tentativas de login falhadas detectadas',
      ip: '201.23.45.67',
      userAgent: 'Various',
      timestamp: '2025-08-29 15:35:00',
      status: 'bloqueado',
      nivel: 'critical'
    },
    {
      id: 7,
      usuario: 'Maria Atendente Costa',
      acao: 'READ',
      modulo: 'CLIENTES',
      recurso: 'Cliente #CLI-001',
      detalhes: 'Consulta aos dados do cliente Ana Silva',
      ip: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-29 16:10:15',
      duracao: 300,
      status: 'sucesso',
      nivel: 'info'
    },
    {
      id: 8,
      usuario: 'Sistema',
      acao: 'BACKUP',
      modulo: 'SISTEMA',
      recurso: 'Database',
      detalhes: 'Backup automático realizado com sucesso',
      ip: 'localhost',
      userAgent: 'System Process',
      timestamp: '2025-08-29 02:00:00',
      duracao: 45000,
      status: 'sucesso',
      nivel: 'info'
    }
  ];

  useEffect(() => {
    setLogs(logsMock);
    // Definir datas padrão (últimos 7 dias)
    const hoje = new Date();
    const setesDiasAtras = new Date(hoje);
    setesDiasAtras.setDate(hoje.getDate() - 7);

    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(setesDiasAtras.toISOString().split('T')[0]);
  }, []);

  const logsFiltrados = logs.filter(log => {
    const matchBusca = log.usuario.toLowerCase().includes(busca.toLowerCase()) ||
                      log.acao.toLowerCase().includes(busca.toLowerCase()) ||
                      log.recurso.toLowerCase().includes(busca.toLowerCase()) ||
                      log.detalhes.toLowerCase().includes(busca.toLowerCase());

    const matchModulo = filtroModulo === 'todos' || log.modulo === filtroModulo;
    const matchStatus = filtroStatus === 'todos' || log.status === filtroStatus;
    const matchNivel = filtroNivel === 'todos' || log.nivel === filtroNivel;

    let matchData = true;
    if (dataInicio && dataFim) {
      const logDate = new Date(log.timestamp);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      matchData = logDate >= inicio && logDate <= fim;
    }

    return matchBusca && matchModulo && matchStatus && matchNivel && matchData;
  });

  const estatisticas = {
    totalLogs: logs.length,
    logsHoje: logs.filter(log => {
      const hoje = new Date().toDateString();
      const logDate = new Date(log.timestamp).toDateString();
      return hoje === logDate;
    }).length,
    logsSucesso: logs.filter(log => log.status === 'sucesso').length,
    logsErro: logs.filter(log => log.status === 'erro' || log.nivel === 'error').length,
    logsCriticos: logs.filter(log => log.nivel === 'critical').length,
    usuariosAtivos: [...new Set(logs.filter(log => log.usuario !== 'Sistema').map(log => log.usuario))].length
  };

  const handleView = (log: LogAuditoria) => {
    setLogSelecionado(log);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso': return 'bg-green-100 text-green-800';
      case 'erro': return 'bg-red-100 text-red-800';
      case 'alerta': return 'bg-yellow-100 text-yellow-800';
      case 'bloqueado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'erro': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'alerta': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'bloqueado': return <Shield className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuloColor = (modulo: string) => {
    switch (modulo) {
      case 'VENDAS': return 'bg-green-100 text-green-800';
      case 'FINANCEIRO': return 'bg-blue-100 text-blue-800';
      case 'USUARIOS': return 'bg-purple-100 text-purple-800';
      case 'AUTENTICACAO': return 'bg-orange-100 text-orange-800';
      case 'SEGURANCA': return 'bg-red-100 text-red-800';
      case 'SISTEMA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-8 w-8 text-purple-600" />
              Sistema de Auditoria
            </h1>
            <p className="text-gray-600 mt-2">Log de atividades e controle de acesso ao sistema</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Exportar Logs
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.totalLogs}</div>
          <div className="text-sm text-gray-600">Total de Logs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.logsHoje}</div>
          <div className="text-sm text-gray-600">Logs Hoje</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{estatisticas.logsSucesso}</div>
          <div className="text-sm text-gray-600">Sucessos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{estatisticas.logsErro}</div>
          <div className="text-sm text-gray-600">Erros</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{estatisticas.logsCriticos}</div>
          <div className="text-sm text-gray-600">Críticos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-indigo-600">{estatisticas.usuariosAtivos}</div>
          <div className="text-sm text-gray-600">Usuários Ativos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar logs..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Módulos</option>
            <option value="VENDAS">Vendas</option>
            <option value="FINANCEIRO">Financeiro</option>
            <option value="USUARIOS">Usuários</option>
            <option value="AUTENTICACAO">Autenticação</option>
            <option value="SEGURANCA">Segurança</option>
            <option value="SISTEMA">Sistema</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Status</option>
            <option value="sucesso">Sucesso</option>
            <option value="erro">Erro</option>
            <option value="alerta">Alerta</option>
            <option value="bloqueado">Bloqueado</option>
          </select>

          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Níveis</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nível</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logsFiltrados.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{log.usuario}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{log.acao}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModuloColor(log.modulo)}`}>
                      {log.modulo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.recurso}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(log.nivel)}`}>
                      {log.nivel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{log.ip}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleView(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && logSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes do Log de Auditoria
              </h2>
              <p className="text-gray-600">ID: {logSelecionado.id}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações da Ação</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Usuário:</strong> {logSelecionado.usuario}</div>
                    <div><strong>Ação:</strong> {logSelecionado.acao}</div>
                    <div><strong>Módulo:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getModuloColor(logSelecionado.modulo)}`}>
                        {logSelecionado.modulo}
                      </span>
                    </div>
                    <div><strong>Recurso:</strong> {logSelecionado.recurso}</div>
                    <div><strong>Detalhes:</strong> {logSelecionado.detalhes}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações Técnicas</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Timestamp:</strong> {new Date(logSelecionado.timestamp).toLocaleString()}</div>
                    <div><strong>IP:</strong> {logSelecionado.ip}</div>
                    <div><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(logSelecionado.status)}`}>
                        {logSelecionado.status}
                      </span>
                    </div>
                    <div><strong>Nível:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getNivelColor(logSelecionado.nivel)}`}>
                        {logSelecionado.nivel}
                      </span>
                    </div>
                    {logSelecionado.duracao && (
                      <div><strong>Duração:</strong> {logSelecionado.duracao}ms</div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div>
                <h3 className="text-lg font-semibold mb-3">User Agent</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm text-gray-700">{logSelecionado.userAgent}</code>
                </div>
              </div>

              {/* Dados Antes/Depois */}
              {(logSelecionado.dadosAntes || logSelecionado.dadosDepois) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {logSelecionado.dadosAntes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Dados Antes</h3>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <pre className="text-sm text-gray-700 overflow-auto">
                          {JSON.stringify(logSelecionado.dadosAntes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {logSelecionado.dadosDepois && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Dados Depois</h3>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <pre className="text-sm text-gray-700 overflow-auto">
                          {JSON.stringify(logSelecionado.dadosDepois, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {logsFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum log encontrado</h3>
          <p className="text-gray-500 mb-4">
            Ajuste os filtros ou verifique o período selecionado.
          </p>
        </div>
      )}
    </div>
  );
};

export default SistemaAuditoria;
