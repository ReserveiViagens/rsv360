// Database connection utility for Next.js API routes
import { Pool, PoolConfig, QueryResult } from 'pg';

// Create a connection pool
let pool: Pool | null = null;

// Função para injetar pool mockado (apenas para testes)
let mockPoolInstance: Pool | null = null;

/**
 * Função para injetar pool mockado (apenas para testes)
 * Esta função permite que os testes injetem um pool mockado
 * antes que o código de produção tente criar uma conexão real.
 * 
 * @param mockPool - Pool mockado para usar nos testes
 */
export function __setMockPool(mockPool: Pool | null) {
  if (process.env.NODE_ENV === 'test') {
    mockPoolInstance = mockPool;
  }
}

export function getDbPool(): Pool {
  // Priorizar mock se existir (apenas em ambiente de teste)
  if (mockPoolInstance) {
    return mockPoolInstance;
  }

  if (!pool) {
    // Use same database config as backend
    const dbConfig: PoolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'rsv360',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 5, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
    
    console.log('🔌 Conectando ao banco:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });
    
    pool = new Pool(dbConfig);
    
    // Handle connection errors
    pool.on('error', (err) => {
      console.error('❌ Erro no pool de conexões:', err);
    });
  }
  return pool;
}

/**
 * Função para limpar conexões (útil para testes)
 * Fecha o pool real e limpa o mock
 */
export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  mockPoolInstance = null;
}

// Helper function to query the database
export async function queryDatabase<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getDbPool();
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Alias para compatibilidade com guia Novas Att RSV 360
// Retorna QueryResult completo (não apenas rows)
export async function queryDb(
  text: string,
  params?: any[]
): Promise<QueryResult> {
  const pool = getDbPool();
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper to get website content by type
export async function getWebsiteContent(pageType: string) {
  const rows = await queryDatabase(
    `SELECT 
      id,
      page_type,
      content_id,
      title,
      description,
      images,
      metadata,
      seo_data,
      status,
      order_index,
      created_at,
      updated_at
    FROM website_content 
    WHERE page_type = $1 
    ORDER BY order_index ASC, created_at DESC`,
    [pageType]
  );

  return rows.map((row: any) => ({
    id: row.id,
    content_id: row.content_id,
    title: row.title,
    description: row.description || '',
    images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : (row.metadata || {}),
    seo_data: typeof row.seo_data === 'string' ? JSON.parse(row.seo_data || '{}') : (row.seo_data || {}),
    status: row.status || 'active',
    order_index: row.order_index || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

