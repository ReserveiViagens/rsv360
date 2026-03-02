// ===================================================================
// HEALTH CHECK API - ENDPOINT PARA VERIFICAR STATUS DO SERVIDOR
// ===================================================================

export default function handler(req, res) {
  // Verificar método
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Retornar status de saúde
    res.status(200).json({
      status: 'ok',
      message: 'RSV 360 Frontend está funcionando',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
