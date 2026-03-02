const { asyncHandler } = require('../../../middleware/errorHandler');
const { logAuditEvent } = require('../../../utils/auditLogger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller de Documentos
 * Gerencia upload, organização e gestão de documentos
 */

// Configuração do Multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|mp4|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
}).single('file');

/**
 * Listar todos os documentos
 */
exports.list = asyncHandler(async (req, res) => {
  const { category, status, search, page = 1, limit = 10, sortBy = 'uploaded_at', sortOrder = 'desc' } = req.query;

  // TODO: Implementar busca no banco de dados
  const documents = [
    // CONTRATOS
    {
      id: 1,
      name: 'Contrato de Viagem - Rio de Janeiro',
      description: 'Contrato detalhado para pacote de viagem ao Rio de Janeiro',
      type: 'pdf',
      size: 2048576, // 1.95 MB
      category: 'Contratos',
      tags: ['viagem', 'rio de janeiro', 'contrato'],
      uploaded_by: 'João Silva',
      uploaded_at: '2024-01-15T10:30:00Z',
      last_modified: '2024-01-15T10:30:00Z',
      status: 'active',
      url: '/api/v1/documents/1/download',
      thumbnail: null
    },
    {
      id: 5,
      name: 'Contrato de Prestação de Serviços - Hotel Maravilha',
      description: 'Contrato de hospedagem para grupo de 30 pessoas',
      type: 'pdf',
      size: 1536000, // 1.46 MB
      category: 'Contratos',
      tags: ['hotel', 'hospedagem', 'grupo'],
      uploaded_by: 'Carlos Lima',
      uploaded_at: '2024-01-20T09:15:00Z',
      last_modified: '2024-01-20T09:15:00Z',
      status: 'active',
      url: '/api/v1/documents/5/download',
      thumbnail: null
    },
    {
      id: 6,
      name: 'Contrato de Transporte Aéreo - São Paulo',
      description: 'Contrato de passagens aéreas para excursão',
      type: 'pdf',
      size: 1024000, // 1 MB
      category: 'Contratos',
      tags: ['transporte', 'aéreo', 'passagens'],
      uploaded_by: 'Fernanda Santos',
      uploaded_at: '2024-01-18T14:20:00Z',
      last_modified: '2024-01-18T14:20:00Z',
      status: 'active',
      url: '/api/v1/documents/6/download',
      thumbnail: null
    },
    {
      id: 7,
      name: 'Contrato de Aluguel de Veículo - Fiat',
      description: 'Contrato de locação de veículo para turismo',
      type: 'pdf',
      size: 896000, // 875 KB
      category: 'Contratos',
      tags: ['veículo', 'aluguel', 'locação'],
      uploaded_by: 'Roberto Silva',
      uploaded_at: '2024-01-12T11:30:00Z',
      last_modified: '2024-01-12T11:30:00Z',
      status: 'active',
      url: '/api/v1/documents/7/download',
      thumbnail: null
    },
    {
      id: 8,
      name: 'Contrato de Guia Turístico - Fernando',
      description: 'Contrato de serviços de guia turístico para excursão',
      type: 'pdf',
      size: 768000, // 750 KB
      category: 'Contratos',
      tags: ['guia', 'turístico', 'excursão'],
      uploaded_by: 'Ana Oliveira',
      uploaded_at: '2024-01-10T16:45:00Z',
      last_modified: '2024-01-10T16:45:00Z',
      status: 'active',
      url: '/api/v1/documents/8/download',
      thumbnail: null
    },
    // RELATÓRIOS
    {
      id: 2,
      name: 'Relatório Financeiro Q4 2024',
      description: 'Relatório financeiro do quarto trimestre de 2024',
      type: 'xlsx',
      size: 1048576, // 1 MB
      category: 'Relatórios',
      tags: ['financeiro', 'relatório', 'q4'],
      uploaded_by: 'Maria Santos',
      uploaded_at: '2024-01-10T14:20:00Z',
      last_modified: '2024-01-12T09:15:00Z',
      status: 'active',
      url: '/api/v1/documents/2/download',
      thumbnail: null
    },
    {
      id: 9,
      name: 'Relatório de Vendas - Janeiro 2024',
      description: 'Relatório mensal de vendas e receitas',
      type: 'xlsx',
      size: 1536000, // 1.46 MB
      category: 'Relatórios',
      tags: ['vendas', 'receitas', 'mensal'],
      uploaded_by: 'Pedro Costa',
      uploaded_at: '2024-02-01T08:00:00Z',
      last_modified: '2024-02-01T08:00:00Z',
      status: 'active',
      url: '/api/v1/documents/9/download',
      thumbnail: null
    },
    {
      id: 10,
      name: 'Relatório de Satisfação do Cliente',
      description: 'Análise de satisfação e feedback dos clientes',
      type: 'pdf',
      size: 2048000, // 2 MB
      category: 'Relatórios',
      tags: ['satisfação', 'cliente', 'feedback'],
      uploaded_by: 'Lucia Mendes',
      uploaded_at: '2024-01-25T10:30:00Z',
      last_modified: '2024-01-25T10:30:00Z',
      status: 'active',
      url: '/api/v1/documents/10/download',
      thumbnail: null
    },
    {
      id: 11,
      name: 'Relatório Operacional - Dezembro 2023',
      description: 'Relatório de operações e atividades do mês',
      type: 'xlsx',
      size: 1280000, // 1.22 MB
      category: 'Relatórios',
      tags: ['operacional', 'atividades', 'mensal'],
      uploaded_by: 'Ricardo Alves',
      uploaded_at: '2024-01-05T09:00:00Z',
      last_modified: '2024-01-05T09:00:00Z',
      status: 'active',
      url: '/api/v1/documents/11/download',
      thumbnail: null
    },
    {
      id: 12,
      name: 'Relatório de Marketing Digital',
      description: 'Análise de campanhas e resultados de marketing',
      type: 'pdf',
      size: 2560000, // 2.44 MB
      category: 'Relatórios',
      tags: ['marketing', 'campanhas', 'digital'],
      uploaded_by: 'Claudia Helena',
      uploaded_at: '2024-01-22T15:20:00Z',
      last_modified: '2024-01-22T15:20:00Z',
      status: 'active',
      url: '/api/v1/documents/12/download',
      thumbnail: null
    },
    // FOTOS
    {
      id: 3,
      name: 'Fotos da Viagem - Paris',
      description: 'Galeria de fotos da viagem a Paris',
      type: 'jpg',
      size: 5242880, // 5 MB
      category: 'Fotos',
      tags: ['paris', 'fotos', 'viagem'],
      uploaded_by: 'Pedro Costa',
      uploaded_at: '2024-01-08T16:45:00Z',
      last_modified: '2024-01-08T16:45:00Z',
      status: 'active',
      url: '/api/v1/documents/3/download',
      thumbnail: '/api/v1/documents/3/thumbnail'
    },
    {
      id: 13,
      name: 'Fotos - Praia de Copacabana',
      description: 'Fotos da excursão à praia de Copacabana',
      type: 'jpg',
      size: 4194304, // 4 MB
      category: 'Fotos',
      tags: ['praia', 'copacabana', 'rio'],
      uploaded_by: 'Ivonika Maria Silva',
      uploaded_at: '2024-01-19T11:00:00Z',
      last_modified: '2024-01-19T11:00:00Z',
      status: 'active',
      url: '/api/v1/documents/13/download',
      thumbnail: '/api/v1/documents/13/thumbnail'
    },
    {
      id: 14,
      name: 'Fotos - Cristo Redentor',
      description: 'Fotos do grupo no Cristo Redentor',
      type: 'jpg',
      size: 3145728, // 3 MB
      category: 'Fotos',
      tags: ['cristo', 'redentor', 'monumento'],
      uploaded_by: 'João Silva',
      uploaded_at: '2024-01-16T14:30:00Z',
      last_modified: '2024-01-16T14:30:00Z',
      status: 'active',
      url: '/api/v1/documents/14/download',
      thumbnail: '/api/v1/documents/14/thumbnail'
    },
    {
      id: 15,
      name: 'Fotos - Evento de Lançamento',
      description: 'Fotos do evento de lançamento de novos pacotes',
      type: 'jpg',
      size: 6291456, // 6 MB
      category: 'Fotos',
      tags: ['evento', 'lançamento', 'marketing'],
      uploaded_by: 'Maria Santos',
      uploaded_at: '2024-01-14T18:00:00Z',
      last_modified: '2024-01-14T18:00:00Z',
      status: 'active',
      url: '/api/v1/documents/15/download',
      thumbnail: '/api/v1/documents/15/thumbnail'
    },
    {
      id: 16,
      name: 'Fotos - Hotel Resort',
      description: 'Fotos das instalações do hotel resort',
      type: 'jpg',
      size: 4718592, // 4.5 MB
      category: 'Fotos',
      tags: ['hotel', 'resort', 'instalações'],
      uploaded_by: 'Carlos Lima',
      uploaded_at: '2024-01-11T10:15:00Z',
      last_modified: '2024-01-11T10:15:00Z',
      status: 'active',
      url: '/api/v1/documents/16/download',
      thumbnail: '/api/v1/documents/16/thumbnail'
    },
    // MANUAIS
    {
      id: 4,
      name: 'Manual de Procedimentos',
      description: 'Manual completo de procedimentos da empresa',
      type: 'docx',
      size: 3145728, // 3 MB
      category: 'Manuais',
      tags: ['manual', 'procedimentos', 'empresa'],
      uploaded_by: 'Ana Oliveira',
      uploaded_at: '2024-01-05T11:00:00Z',
      last_modified: '2024-01-07T15:30:00Z',
      status: 'active',
      url: '/api/v1/documents/4/download',
      thumbnail: null
    },
    {
      id: 17,
      name: 'Manual de Atendimento ao Cliente',
      description: 'Manual de boas práticas de atendimento',
      type: 'docx',
      size: 2560000, // 2.44 MB
      category: 'Manuais',
      tags: ['atendimento', 'cliente', 'práticas'],
      uploaded_by: 'Fernanda Santos',
      uploaded_at: '2024-01-17T13:20:00Z',
      last_modified: '2024-01-17T13:20:00Z',
      status: 'active',
      url: '/api/v1/documents/17/download',
      thumbnail: null
    },
    {
      id: 18,
      name: 'Manual de Segurança',
      description: 'Manual de segurança e protocolos de emergência',
      type: 'pdf',
      size: 2048000, // 2 MB
      category: 'Manuais',
      tags: ['segurança', 'protocolos', 'emergência'],
      uploaded_by: 'Roberto Silva',
      uploaded_at: '2024-01-13T09:45:00Z',
      last_modified: '2024-01-13T09:45:00Z',
      status: 'active',
      url: '/api/v1/documents/18/download',
      thumbnail: null
    },
    {
      id: 19,
      name: 'Manual de Operações de Viagem',
      description: 'Manual operacional para organização de viagens',
      type: 'docx',
      size: 3840000, // 3.66 MB
      category: 'Manuais',
      tags: ['operações', 'viagem', 'organização'],
      uploaded_by: 'Pedro Costa',
      uploaded_at: '2024-01-09T08:30:00Z',
      last_modified: '2024-01-09T08:30:00Z',
      status: 'active',
      url: '/api/v1/documents/19/download',
      thumbnail: null
    },
    {
      id: 20,
      name: 'Manual de Sistema - RSV360',
      description: 'Manual de uso do sistema RSV360',
      type: 'pdf',
      size: 5120000, // 4.88 MB
      category: 'Manuais',
      tags: ['sistema', 'rsv360', 'uso'],
      uploaded_by: 'Lucia Mendes',
      uploaded_at: '2024-01-06T14:00:00Z',
      last_modified: '2024-01-06T14:00:00Z',
      status: 'active',
      url: '/api/v1/documents/20/download',
      thumbnail: null
    },
    // VÍDEOS
    {
      id: 21,
      name: 'Vídeo Promocional - Destinos Brasileiros',
      description: 'Vídeo promocional dos principais destinos brasileiros',
      type: 'mp4',
      size: 52428800, // 50 MB
      category: 'Vídeos',
      tags: ['promocional', 'destinos', 'brasil'],
      uploaded_by: 'Claudia Helena',
      uploaded_at: '2024-01-21T16:00:00Z',
      last_modified: '2024-01-21T16:00:00Z',
      status: 'active',
      url: '/api/v1/documents/21/download',
      thumbnail: '/api/v1/documents/21/thumbnail'
    },
    {
      id: 22,
      name: 'Vídeo Tutorial - Sistema de Reservas',
      description: 'Tutorial em vídeo sobre como usar o sistema de reservas',
      type: 'mp4',
      size: 31457280, // 30 MB
      category: 'Vídeos',
      tags: ['tutorial', 'reservas', 'sistema'],
      uploaded_by: 'Ricardo Alves',
      uploaded_at: '2024-01-23T10:15:00Z',
      last_modified: '2024-01-23T10:15:00Z',
      status: 'active',
      url: '/api/v1/documents/22/download',
      thumbnail: '/api/v1/documents/22/thumbnail'
    },
    {
      id: 23,
      name: 'Vídeo - Depoimento de Clientes',
      description: 'Vídeo com depoimentos de clientes satisfeitos',
      type: 'mp4',
      size: 41943040, // 40 MB
      category: 'Vídeos',
      tags: ['depoimento', 'clientes', 'satisfação'],
      uploaded_by: 'Ivonika Maria Silva',
      uploaded_at: '2024-01-24T12:30:00Z',
      last_modified: '2024-01-24T12:30:00Z',
      status: 'active',
      url: '/api/v1/documents/23/download',
      thumbnail: '/api/v1/documents/23/thumbnail'
    },
    {
      id: 24,
      name: 'Vídeo - Treinamento de Equipe',
      description: 'Vídeo de treinamento para nova equipe de vendas',
      type: 'mp4',
      size: 47185920, // 45 MB
      category: 'Vídeos',
      tags: ['treinamento', 'equipe', 'vendas'],
      uploaded_by: 'João Silva',
      uploaded_at: '2024-01-26T09:00:00Z',
      last_modified: '2024-01-26T09:00:00Z',
      status: 'active',
      url: '/api/v1/documents/24/download',
      thumbnail: '/api/v1/documents/24/thumbnail'
    },
    {
      id: 25,
      name: 'Vídeo - Apresentação da Empresa',
      description: 'Vídeo institucional apresentando a empresa',
      type: 'mp4',
      size: 36700160, // 35 MB
      category: 'Vídeos',
      tags: ['institucional', 'empresa', 'apresentação'],
      uploaded_by: 'Maria Santos',
      uploaded_at: '2024-01-27T11:45:00Z',
      last_modified: '2024-01-27T11:45:00Z',
      status: 'active',
      url: '/api/v1/documents/25/download',
      thumbnail: '/api/v1/documents/25/thumbnail'
    }
  ];

  // Filtrar por categoria se fornecido
  let filtered = documents;
  if (category && category !== 'all') {
    filtered = filtered.filter(d => d.category === category);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(d => d.status === status);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(searchLower) ||
      d.description.toLowerCase().includes(searchLower) ||
      d.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Ordenar
  filtered.sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'uploaded_at':
        aValue = new Date(a.uploaded_at);
        bValue = new Date(b.uploaded_at);
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  logAuditEvent({
    action: 'documents_list',
    userId: req.user?.id || 'system',
    details: { count: filtered.length, filters: { category, status, search } }
  });

  res.json({
    success: true,
    data: filtered,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / parseInt(limit))
    }
  });
});

/**
 * Obter documento por ID
 */
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Implementar busca no banco de dados
  const document = {
    id: parseInt(id),
    name: 'Documento Exemplo',
    description: 'Descrição do documento',
    type: 'pdf',
    size: 1024000,
    category: 'Geral',
    tags: [],
    uploaded_by: 'Sistema',
    uploaded_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    status: 'active',
    url: `/api/v1/documents/${id}/download`,
    thumbnail: null
  };

  res.json({
    success: true,
    data: document
  });
});

/**
 * Upload de documento
 */
exports.upload = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo fornecido'
      });
    }

    const { name, description, category, tags } = req.body;

    // TODO: Implementar salvamento no banco de dados
    const document = {
      id: Date.now(),
      name: name || req.file.originalname,
      description: description || '',
      type: path.extname(req.file.originalname).slice(1).toLowerCase(),
      size: req.file.size,
      category: category || 'Geral',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      uploaded_by: req.user?.name || 'Sistema',
      uploaded_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      status: 'active',
      url: `/api/v1/documents/${Date.now()}/download`,
      thumbnail: null
    };

    logAuditEvent({
      action: 'document_upload',
      userId: req.user?.id || 'system',
      details: { id: document.id, name: document.name, size: document.size }
    });

    res.json({
      success: true,
      data: document,
      message: 'Documento enviado com sucesso'
    });
  });
});

/**
 * Atualizar documento
 */
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // TODO: Implementar atualização no banco de dados
  const document = {
    id: parseInt(id),
    ...updateData,
    last_modified: new Date().toISOString()
  };

  logAuditEvent({
    action: 'document_update',
    userId: req.user?.id || 'system',
    details: { id, updates: updateData }
  });

  res.json({
    success: true,
    data: document,
    message: 'Documento atualizado com sucesso'
  });
});

/**
 * Deletar documento
 */
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Implementar exclusão no banco de dados
  logAuditEvent({
    action: 'document_delete',
    userId: req.user?.id || 'system',
    details: { id }
  });

  res.json({
    success: true,
    message: 'Documento excluído com sucesso'
  });
});

/**
 * Download de documento
 */
exports.download = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Implementar download real do arquivo
  res.json({
    success: true,
    message: 'Download iniciado',
    url: `/api/v1/documents/${id}/file`
  });
});

/**
 * Obter categorias de documentos
 */
exports.getCategories = asyncHandler(async (req, res) => {
  // TODO: Implementar busca no banco de dados
  const categories = [
    { id: 1, name: 'Contratos', description: 'Documentos contratuais', document_count: 5 },
    { id: 2, name: 'Relatórios', description: 'Relatórios financeiros e operacionais', document_count: 5 },
    { id: 3, name: 'Fotos', description: 'Imagens e fotografias', document_count: 5 },
    { id: 4, name: 'Manuais', description: 'Manuais e procedimentos', document_count: 5 },
    { id: 5, name: 'Vídeos', description: 'Vídeos promocionais e treinamentos', document_count: 5 }
  ];

  res.json({
    success: true,
    data: categories
  });
});

/**
 * Obter estatísticas de documentos
 */
exports.getStats = asyncHandler(async (req, res) => {
  // TODO: Implementar estatísticas reais
  const stats = {
    total_documents: 25, // Total de documentos mockados
    categories_count: 5, // Contratos, Relatórios, Fotos, Manuais, Vídeos
    recent_uploads: 15,
    storage_used: 256000000, // 244.14 MB em bytes
    storage_limit: 500000000, // 476.84 MB em bytes
    storage_percentage: 75.5,
    active_documents: 25,
    archived_documents: 0
  };

  res.json({
    success: true,
    data: stats
  });
});

/**
 * Exportar documentos
 */
exports.export = asyncHandler(async (req, res) => {
  const { format = 'json', category, status } = req.query;

  // TODO: Implementar exportação real
  const documents = [];

  logAuditEvent({
    action: 'documents_export',
    userId: req.user?.id || 'system',
    details: { format, count: documents.length }
  });

  if (format === 'json') {
    res.json({
      success: true,
      data: documents
    });
  } else {
    res.json({
      success: true,
      data: documents,
      message: 'Exportação em desenvolvimento'
    });
  }
});

/**
 * Arquivar documento
 */
exports.archive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Implementar arquivamento no banco de dados
  logAuditEvent({
    action: 'document_archive',
    userId: req.user?.id || 'system',
    details: { id }
  });

  res.json({
    success: true,
    message: 'Documento arquivado com sucesso'
  });
});

/**
 * Restaurar documento arquivado
 */
exports.restore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Implementar restauração no banco de dados
  logAuditEvent({
    action: 'document_restore',
    userId: req.user?.id || 'system',
    details: { id }
  });

  res.json({
    success: true,
    message: 'Documento restaurado com sucesso'
  });
});
