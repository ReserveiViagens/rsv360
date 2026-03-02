// Script para criar todas as tabelas necessárias
// Sistema RSV 360 - Tabelas Completas

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

async function createAllTables() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('========================================');
    console.log('CRIAR TODAS AS TABELAS');
    console.log('========================================');
    console.log('');

    // 1. Tabela de Reviews (Avaliações)
    console.log('1. Criando tabela reviews...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        response TEXT,
        response_at TIMESTAMP,
        helpful_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'deleted')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_host_id ON reviews(host_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
    `);
    console.log('✅ Tabela reviews criada');

    // 2. Tabela de Notificações
    console.log('2. Criando tabela notifications...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(500),
        icon VARCHAR(50),
        read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `);
    console.log('✅ Tabela notifications criada');

    // 3. Tabela de Mensagens
    console.log('3. Criando tabela messages...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        attachments JSONB DEFAULT '[]',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
      CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
    `);
    console.log('✅ Tabela messages criada');

    // 4. Tabela de Verificações
    console.log('4. Criando tabela verifications...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verification_type VARCHAR(50) NOT NULL,
        document_type VARCHAR(50),
        document_url TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        rejection_reason TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
      CREATE INDEX IF NOT EXISTS idx_verifications_type ON verifications(verification_type);
    `);
    console.log('✅ Tabela verifications criada');

    // 5. Tabela de Arquivos (para uploads)
    console.log('5. Criando tabela files...');
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          file_type VARCHAR(50) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          original_name VARCHAR(255),
          file_path TEXT NOT NULL,
          file_url TEXT,
          mime_type VARCHAR(100),
          file_size BIGINT,
          width INTEGER,
          height INTEGER,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id)
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type)
      `);
      
      console.log('✅ Tabela files criada');
    } catch (error) {
      console.log('⚠️  Erro ao criar tabela files (pode já existir):', error.message);
    }
    console.log('✅ Tabela files criada');

    // 6. Tabela de Analytics
    console.log('6. Criando tabela analytics...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        event_name VARCHAR(255),
        properties JSONB,
        session_id VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
    `);
    console.log('✅ Tabela analytics criada');

    console.log('');
    console.log('========================================');
    console.log('TODAS AS TABELAS CRIADAS COM SUCESSO!');
    console.log('========================================');
    console.log('');
    console.log('Tabelas criadas:');
    console.log('  ✅ reviews - Sistema de avaliações');
    console.log('  ✅ notifications - Notificações de perfil');
    console.log('  ✅ messages - Sistema de mensagens');
    console.log('  ✅ verifications - Verificação de conta');
    console.log('  ✅ files - Upload de arquivos');
    console.log('  ✅ analytics - Analytics e relatórios');
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('ERRO ao criar tabelas:');
    console.error(error.message);
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

createAllTables();

