const { asyncHandler } = require('../../../middleware/errorHandler');
const { logAuditEvent } = require('../../../utils/auditLogger');

/**
 * Controller de Seguros
 * Gerencia apólices e sinistros
 */

/**
 * Listar todas as apólices
 */
exports.listPolicies = asyncHandler(async (req, res) => {
  const { type, status, search, page = 1, limit = 10 } = req.query;

  // TODO: Implementar busca no banco de dados
  const policies = [
    {
      id: 1,
      policy_number: 'POL-2024-001',
      client_name: 'João Silva',
      client_email: 'joao.silva@email.com',
      type: 'travel',
      type_label: 'Viagem',
      coverage: 50000,
      premium: 250,
      agent: 'Maria Santos',
      status: 'active',
      valid_until: '2024-12-14',
      claims_count: 0,
      description: 'Seguro de viagem para Europa',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      policy_number: 'POL-2024-002',
      client_name: 'Ana Oliveira',
      client_email: 'ana.oliveira@email.com',
      type: 'health',
      type_label: 'Saúde',
      coverage: 100000,
      premium: 180,
      agent: 'Pedro Costa',
      status: 'active',
      valid_until: '2024-12-30',
      claims_count: 1,
      description: 'Plano de saúde empresarial',
      created_at: '2024-01-10T14:00:00Z',
      updated_at: '2024-01-12T09:00:00Z'
    },
    {
      id: 3,
      policy_number: 'POL-2024-003',
      client_name: 'Carlos Ferreira',
      client_email: 'carlos.ferreira@email.com',
      type: 'auto',
      type_label: 'Automóvel',
      coverage: 75000,
      premium: 320,
      agent: 'João Silva',
      status: 'active',
      valid_until: '2024-12-30',
      claims_count: 2,
      description: 'Seguro auto completo',
      created_at: '2024-01-08T11:00:00Z',
      updated_at: '2024-01-10T15:00:00Z'
    },
    {
      id: 4,
      policy_number: 'POL-2024-004',
      client_name: 'Maria Santos',
      client_email: 'maria.santos@email.com',
      type: 'life',
      type_label: 'Vida',
      coverage: 200000,
      premium: 450,
      agent: 'Ana Oliveira',
      status: 'active',
      valid_until: '2025-01-15',
      claims_count: 0,
      description: 'Seguro de vida individual',
      created_at: '2024-01-20T09:00:00Z',
      updated_at: '2024-01-20T09:00:00Z'
    },
    {
      id: 5,
      policy_number: 'POL-2024-005',
      client_name: 'Pedro Costa',
      client_email: 'pedro.costa@email.com',
      type: 'travel',
      type_label: 'Viagem',
      coverage: 30000,
      premium: 150,
      agent: 'Carlos Ferreira',
      status: 'expired',
      valid_until: '2024-01-05',
      claims_count: 0,
      description: 'Seguro de viagem nacional',
      created_at: '2023-12-15T10:00:00Z',
      updated_at: '2024-01-05T10:00:00Z'
    }
  ];

  let filtered = policies;
  
  if (type && type !== 'all') {
    filtered = filtered.filter(p => p.type === type);
  }
  
  if (status && status !== 'all') {
    filtered = filtered.filter(p => p.status === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.client_name.toLowerCase().includes(searchLower) ||
      p.policy_number.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  logAuditEvent({
    action: 'insurance_policies_list',
    userId: req.user?.id || 'system',
    details: { count: filtered.length, filters: { type, status, search } }
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
 * Listar sinistros
 */
exports.listClaims = asyncHandler(async (req, res) => {
  const { status, policy_id, page = 1, limit = 10 } = req.query;

  // TODO: Implementar busca no banco de dados
  const claims = [
    {
      id: 1,
      claim_number: 'CLM-2024-001',
      policy_id: 2,
      policy_number: 'POL-2024-002',
      client_name: 'Ana Oliveira',
      type: 'medical',
      amount: 5000,
      status: 'approved',
      submitted_at: '2024-01-12T10:00:00Z',
      processed_at: '2024-01-15T14:00:00Z',
      description: 'Consulta médica de emergência'
    },
    {
      id: 2,
      claim_number: 'CLM-2024-002',
      policy_id: 3,
      policy_number: 'POL-2024-003',
      client_name: 'Carlos Ferreira',
      type: 'accident',
      amount: 15000,
      status: 'pending',
      submitted_at: '2024-01-18T09:00:00Z',
      processed_at: null,
      description: 'Acidente de trânsito'
    },
    {
      id: 3,
      claim_number: 'CLM-2024-003',
      policy_id: 3,
      policy_number: 'POL-2024-003',
      client_name: 'Carlos Ferreira',
      type: 'repair',
      amount: 8000,
      status: 'processing',
      submitted_at: '2024-01-20T11:00:00Z',
      processed_at: null,
      description: 'Reparo de veículo'
    }
  ];

  let filtered = claims;
  
  if (status && status !== 'all') {
    filtered = filtered.filter(c => c.status === status);
  }
  
  if (policy_id) {
    filtered = filtered.filter(c => c.policy_id === parseInt(policy_id));
  }

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
 * Obter estatísticas
 */
exports.getStats = asyncHandler(async (req, res) => {
  // TODO: Implementar estatísticas reais
  const stats = {
    total_policies: 234,
    active_policies: 198,
    total_premiums: 45600,
    pending_claims: 12,
    total_claims: 45,
    total_paid: 125000,
    average_processing_time: 8.5,
    satisfaction_rating: 4.7
  };

  res.json({
    success: true,
    data: stats
  });
});

/**
 * Obter tipos de seguro
 */
exports.getTypes = asyncHandler(async (req, res) => {
  const types = [
    { id: 'travel', name: 'Viagem', description: 'Seguro para viagens nacionais e internacionais', count: 85 },
    { id: 'health', name: 'Saúde', description: 'Planos de saúde e seguro médico', count: 65 },
    { id: 'auto', name: 'Automóvel', description: 'Seguro para veículos', count: 45 },
    { id: 'life', name: 'Vida', description: 'Seguro de vida', count: 25 },
    { id: 'home', name: 'Residencial', description: 'Seguro residencial', count: 14 }
  ];

  res.json({
    success: true,
    data: types
  });
});

/**
 * Criar nova apólice
 */
exports.createPolicy = asyncHandler(async (req, res) => {
  const policyData = req.body;

  // TODO: Implementar criação no banco de dados
  const newPolicy = {
    id: Date.now(),
    policy_number: `POL-2024-${String(Date.now()).slice(-3)}`,
    ...policyData,
    status: 'active',
    claims_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  logAuditEvent({
    action: 'insurance_policy_create',
    userId: req.user?.id || 'system',
    details: { policy_number: newPolicy.policy_number }
  });

  res.json({
    success: true,
    data: newPolicy,
    message: 'Apólice criada com sucesso'
  });
});

/**
 * Atualizar apólice
 */
exports.updatePolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // TODO: Implementar atualização no banco de dados
  logAuditEvent({
    action: 'insurance_policy_update',
    userId: req.user?.id || 'system',
    details: { id, updates: updateData }
  });

  res.json({
    success: true,
    message: 'Apólice atualizada com sucesso'
  });
});

/**
 * Deletar apólice
 */
exports.deletePolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // TODO: Implementar exclusão no banco de dados
  logAuditEvent({
    action: 'insurance_policy_delete',
    userId: req.user?.id || 'system',
    details: { id }
  });

  res.json({
    success: true,
    message: 'Apólice excluída com sucesso'
  });
});

/**
 * Exportar apólices
 */
exports.exportPolicies = asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  // TODO: Implementar exportação real
  logAuditEvent({
    action: 'insurance_policies_export',
    userId: req.user?.id || 'system',
    details: { format }
  });

  res.json({
    success: true,
    data: [],
    message: 'Exportação em desenvolvimento'
  });
});
