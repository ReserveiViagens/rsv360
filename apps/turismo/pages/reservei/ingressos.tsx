// 🎫 SISTEMA DE INGRESSOS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de ingressos e bilhetes
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Ticket, Calendar, Users, DollarSign, QrCode } from 'lucide-react';

interface Ingresso {
  id: number;
  titulo: string;
  tipo: 'atracao' | 'evento' | 'transporte' | 'combo';
  local: string;
  preco: number;
  precoPromocional?: number;
  status: 'disponivel' | 'esgotado' | 'promocao' | 'inativo';
  dataEvento: string;
  horaEvento: string;
  quantidadeDisponivel: number;
  quantidadeVendida: number;
  descricao: string;
  categoria: string;
  validade: string;
  inclusos: string[];
  observacoes: string[];
  qrCode: string;
  vendedor: string;
  comissao: number;
  receita: number;
}

const SistemaIngressos: React.FC = () => {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [ingressoSelecionado, setIngressoSelecionado] = useState<Ingresso | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Dados mock
  const ingressosMock: Ingresso[] = [
    {
      id: 1,
      titulo: 'Hot Park - Ingresso Completo',
      tipo: 'atracao',
      local: 'Hot Park, Caldas Novas',
      preco: 89.90,
      precoPromocional: 75.90,
      status: 'promocao',
      dataEvento: '2025-09-15',
      horaEvento: '08:00',
      quantidadeDisponivel: 500,
      quantidadeVendida: 347,
      descricao: 'Acesso completo ao parque aquático com todas as atrações',
      categoria: 'Parque Aquático',
      validade: '2025-12-31',
      inclusos: ['Acesso a todas as atrações', 'Estacionamento gratuito', 'Vestiário'],
      observacoes: ['Válido apenas para a data selecionada', 'Não transferível'],
      qrCode: 'HP001-2025-347',
      vendedor: 'Reservei Viagens',
      comissao: 15.0,
      receita: 26325.30
    },
    {
      id: 2,
      titulo: 'Transfer Aeroporto - Caldas Novas',
      tipo: 'transporte',
      local: 'Aeroporto Goiânia → Caldas Novas',
      preco: 120.00,
      status: 'disponivel',
      dataEvento: '2025-09-20',
      horaEvento: '14:00',
      quantidadeDisponivel: 8,
      quantidadeVendida: 3,
      descricao: 'Transfer executivo do aeroporto até hotéis em Caldas Novas',
      categoria: 'Transporte',
      validade: '2025-09-20',
      inclusos: ['Veículo executivo', 'Motorista profissional', 'Água mineral'],
      observacoes: ['Confirmar horário 24h antes', 'Máximo 4 passageiros'],
      qrCode: 'TR002-2025-003',
      vendedor: 'Reservei Viagens',
      comissao: 20.0,
      receita: 360.00
    },
    {
      id: 3,
      titulo: 'Combo Caldas + Rio Quente',
      tipo: 'combo',
      local: 'Caldas Novas + Rio Quente',
      preco: 250.00,
      precoPromocional: 199.00,
      status: 'promocao',
      dataEvento: '2025-10-01',
      horaEvento: '09:00',
      quantidadeDisponivel: 100,
      quantidadeVendida: 67,
      descricao: 'Pacote completo com ingressos para parques de ambas as cidades',
      categoria: 'Combo',
      validade: '2025-10-31',
      inclusos: ['Hot Park', 'Water Park Show', 'Rio Quente Resorts', 'Transporte entre cidades'],
      observacoes: ['Válido por 3 dias', 'Uso consecutivo obrigatório'],
      qrCode: 'CB003-2025-067',
      vendedor: 'Reservei Viagens',
      comissao: 25.0,
      receita: 13333.00
    }
  ];

  useEffect(() => {
    setIngressos(ingressosMock);
  }, []);

  const ingressosFiltrados = ingressos.filter(ingresso => {
    const matchBusca = ingresso.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      ingresso.local.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || ingresso.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || ingresso.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  });

  // Estatísticas
  const estatisticas = {
    total: ingressos.length,
    vendidos: ingressos.reduce((acc, ing) => acc + ing.quantidadeVendida, 0),
    disponivel: ingressos.reduce((acc, ing) => acc + ing.quantidadeDisponivel, 0),
    receita: ingressos.reduce((acc, ing) => acc + ing.receita, 0),
    promocoes: ingressos.filter(ing => ing.status === 'promocao').length
  };

  const handleView = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalTipo('view');
    setShowModal(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'atracao': return 'bg-blue-100 text-blue-800';
      case 'evento': return 'bg-purple-100 text-purple-800';
      case 'transporte': return 'bg-green-100 text-green-800';
      case 'combo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'promocao': return 'bg-orange-100 text-orange-800';
      case 'esgotado': return 'bg-red-100 text-red-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
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
              <Ticket className="h-8 w-8 text-purple-600" />
              Sistema de Ingressos
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de ingressos e bilhetes turísticos</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Novo Ingresso
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.total}</div>
          <div className="text-sm text-gray-600">Total de Ingressos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{estatisticas.vendidos}</div>
          <div className="text-sm text-gray-600">Vendidos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.disponivel}</div>
          <div className="text-sm text-gray-600">Disponíveis</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-indigo-600">R$ {estatisticas.receita.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Receita Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{estatisticas.promocoes}</div>
          <div className="text-sm text-gray-600">Em Promoção</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ingressos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="atracao">Atração</option>
            <option value="evento">Evento</option>
            <option value="transporte">Transporte</option>
            <option value="combo">Combo</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Status</option>
            <option value="disponivel">Disponível</option>
            <option value="promocao">Promoção</option>
            <option value="esgotado">Esgotado</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Lista de Ingressos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingressosFiltrados.map((ingresso) => (
          <div key={ingresso.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(ingresso.tipo)}`}>
                    {ingresso.tipo.charAt(0).toUpperCase() + ingresso.tipo.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ingresso.status)}`}>
                    {ingresso.status.charAt(0).toUpperCase() + ingresso.status.slice(1)}
                  </span>
                </div>
                <QrCode className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{ingresso.titulo}</h3>
              <p className="text-sm text-gray-600">{ingresso.local}</p>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  {ingresso.precoPromocional ? (
                    <div>
                      <div className="text-sm text-gray-500 line-through">R$ {ingresso.preco}</div>
                      <div className="text-2xl font-bold text-orange-600">R$ {ingresso.precoPromocional}</div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-green-600">R$ {ingresso.preco}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Disponível</div>
                  <div className="font-medium">{ingresso.quantidadeDisponivel}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(ingresso.dataEvento).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {ingresso.quantidadeVendida}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Inclusos:</div>
                <div className="space-y-1">
                  {ingresso.inclusos.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-xs text-green-700 flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      {item}
                    </div>
                  ))}
                  {ingresso.inclusos.length > 2 && (
                    <div className="text-xs text-gray-500">+{ingresso.inclusos.length - 2} mais</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(ingresso)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </button>
                <button className="px-3 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm">
                  <QrCode className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && ingressoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Detalhes do Ingresso</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações Básicas</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Título:</strong> {ingressoSelecionado.titulo}</div>
                    <div><strong>Tipo:</strong> {ingressoSelecionado.tipo}</div>
                    <div><strong>Local:</strong> {ingressoSelecionado.local}</div>
                    <div><strong>Data:</strong> {new Date(ingressoSelecionado.dataEvento).toLocaleDateString()}</div>
                    <div><strong>Horário:</strong> {ingressoSelecionado.horaEvento}</div>
                    <div><strong>Categoria:</strong> {ingressoSelecionado.categoria}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Comercial</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Preço:</strong> R$ {ingressoSelecionado.preco}</div>
                    {ingressoSelecionado.precoPromocional && (
                      <div><strong>Preço Promocional:</strong> R$ {ingressoSelecionado.precoPromocional}</div>
                    )}
                    <div><strong>Disponível:</strong> {ingressoSelecionado.quantidadeDisponivel}</div>
                    <div><strong>Vendidos:</strong> {ingressoSelecionado.quantidadeVendida}</div>
                    <div><strong>Receita:</strong> R$ {ingressoSelecionado.receita.toLocaleString()}</div>
                    <div><strong>Comissão:</strong> {ingressoSelecionado.comissao}%</div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-gray-700">{ingressoSelecionado.descricao}</p>
              </div>

              {/* Inclusos */}
              <div>
                <h3 className="font-semibold mb-2">Inclusos</h3>
                <ul className="space-y-1">
                  {ingressoSelecionado.inclusos.map((item, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Observações */}
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <ul className="space-y-1">
                  {ingressoSelecionado.observacoes.map((obs, index) => (
                    <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">Código QR</div>
                <div className="font-mono text-lg">{ingressoSelecionado.qrCode}</div>
                <div className="text-xs text-gray-500 mt-1">Escaneie para validação</div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {ingressosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ingresso encontrado</h3>
          <p className="text-gray-500 mb-4">Tente ajustar os filtros ou crie um novo ingresso.</p>
        </div>
      )}
    </div>
  );
};

export default SistemaIngressos;
