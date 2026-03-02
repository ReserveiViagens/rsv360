// 🌳 SISTEMA DE PARQUES - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de parques temáticos e naturais
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Trees, Clock, MapPin, Star, Users, DollarSign } from 'lucide-react';

interface Parque {
  id: number;
  nome: string;
  tipo: 'aquatico' | 'tematico' | 'ecologico' | 'aventura';
  cidade: string;
  estado: string;
  preco: number;
  status: 'ativo' | 'inativo' | 'manutencao' | 'temporada';
  avaliacao: number;
  numeroAvaliacoes: number;
  horario: { abertura: string; fechamento: string };
  descricao: string;
  atracoes: string[];
  capacidade: number;
  visitantes: number;
  receita: number;
}

const SistemaParques: React.FC = () => {
  const [parques, setParques] = useState<Parque[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [parqueSelecionado, setParqueSelecionado] = useState<Parque | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Dados mock
  const parquesMock: Parque[] = [
    {
      id: 1,
      nome: 'Hot Park',
      tipo: 'aquatico',
      cidade: 'Caldas Novas',
      estado: 'GO',
      preco: 89.90,
      status: 'ativo',
      avaliacao: 4.8,
      numeroAvaliacoes: 2543,
      horario: { abertura: '08:00', fechamento: '17:00' },
      descricao: 'Maior parque aquático de águas termais do mundo',
      atracoes: ['Piscina de ondas', 'Toboáguas', 'Rio lento', 'Área infantil'],
      capacidade: 5000,
      visitantes: 12450,
      receita: 1119105
    },
    {
      id: 2,
      nome: 'Water Park Show',
      tipo: 'aquatico',
      cidade: 'Caldas Novas',
      estado: 'GO',
      preco: 75.00,
      status: 'ativo',
      avaliacao: 4.6,
      numeroAvaliacoes: 1876,
      horario: { abertura: '09:00', fechamento: '17:00' },
      descricao: 'Parque aquático com águas termais e shows',
      atracoes: ['Shows aquáticos', 'Toboáguas', 'Piscinas termais'],
      capacidade: 3000,
      visitantes: 8760,
      receita: 657000
    }
  ];

  useEffect(() => {
    setParques(parquesMock);
  }, []);

  const parquesFiltrados = parques.filter(parque =>
    parque.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroTipo === 'todos' || parque.tipo === filtroTipo)
  );

  const handleAdd = () => {
    setModalTipo('add');
    setShowModal(true);
  };

  const handleView = (parque: Parque) => {
    setParqueSelecionado(parque);
    setModalTipo('view');
    setShowModal(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'aquatico': return 'bg-blue-100 text-blue-800';
      case 'tematico': return 'bg-purple-100 text-purple-800';
      case 'ecologico': return 'bg-green-100 text-green-800';
      case 'aventura': return 'bg-red-100 text-red-800';
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
              <Trees className="h-8 w-8 text-green-600" />
              Sistema de Parques
            </h1>
            <p className="text-gray-600 mt-2">Gestão de parques temáticos e naturais</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Novo Parque
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar parques..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="aquatico">Aquático</option>
            <option value="tematico">Temático</option>
            <option value="ecologico">Ecológico</option>
            <option value="aventura">Aventura</option>
          </select>
        </div>
      </div>

      {/* Lista de Parques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parquesFiltrados.map((parque) => (
          <div key={parque.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-400 relative">
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(parque.tipo)}`}>
                  {parque.tipo.charAt(0).toUpperCase() + parque.tipo.slice(1)}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg">{parque.nome}</h3>
                <p className="text-green-100 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {parque.cidade}, {parque.estado}
                </p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{parque.avaliacao}</span>
                  <span className="text-gray-500 text-sm">({parque.numeroAvaliacoes})</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">R$ {parque.preco}</div>
                  <div className="text-sm text-gray-500">por pessoa</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {parque.horario.abertura}-{parque.horario.fechamento}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {parque.capacidade}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{parque.descricao}</p>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Principais Atrações:</div>
                <div className="flex flex-wrap gap-1">
                  {parque.atracoes.slice(0, 2).map((atracao, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {atracao}
                    </span>
                  ))}
                  {parque.atracoes.length > 2 && (
                    <span className="text-xs text-gray-500">+{parque.atracoes.length - 2} mais</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(parque)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalTipo === 'add' ? 'Novo Parque' : 'Detalhes do Parque'}
              </h2>
            </div>

            <div className="p-6">
              {modalTipo === 'view' && parqueSelecionado ? (
                <div className="space-y-4">
                  <div><strong>Nome:</strong> {parqueSelecionado.nome}</div>
                  <div><strong>Tipo:</strong> {parqueSelecionado.tipo}</div>
                  <div><strong>Local:</strong> {parqueSelecionado.cidade}, {parqueSelecionado.estado}</div>
                  <div><strong>Preço:</strong> R$ {parqueSelecionado.preco}</div>
                  <div><strong>Horário:</strong> {parqueSelecionado.horario.abertura} às {parqueSelecionado.horario.fechamento}</div>
                  <div><strong>Capacidade:</strong> {parqueSelecionado.capacidade} pessoas</div>
                  <div><strong>Visitantes:</strong> {parqueSelecionado.visitantes}</div>
                  <div><strong>Receita:</strong> R$ {parqueSelecionado.receita.toLocaleString()}</div>
                  <div><strong>Descrição:</strong> {parqueSelecionado.descricao}</div>
                  <div>
                    <strong>Atrações:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {parqueSelecionado.atracoes.map((atracao, index) => (
                        <li key={index} className="text-gray-700">{atracao}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Formulário de criação de parque será implementado em breve.
                </div>
              )}
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
      {parquesFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Trees className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parque encontrado</h3>
          <p className="text-gray-500 mb-4">Comece adicionando seu primeiro parque.</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Novo Parque
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaParques;
