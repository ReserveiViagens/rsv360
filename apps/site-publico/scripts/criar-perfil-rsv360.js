// Script para criar perfil "User Rsv 360"
// Sistema RSV 360 - Criação de Perfil Completo

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

async function criarPerfilRSV360() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('========================================');
    console.log('CRIAR PERFIL: User Rsv 360');
    console.log('========================================');
    console.log('');

    const email = 'user@rsv360.com';
    const name = 'User Rsv 360';

    // 1. Verificar se usuário já existe
    console.log('1. Verificando se usuário já existe...');
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    let userId;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log(`Usuário já existe com ID: ${userId}`);
      console.log('Atualizando dados do usuário...');
      
      await pool.query(
        `UPDATE users 
         SET name = $1, phone = $2, document = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [name, '(64) 99999-8888', '123.456.789-00', userId]
      );
    } else {
      console.log('Criando novo usuário...');
      const newUser = await pool.query(
        `INSERT INTO users (name, email, phone, document, role, status, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          name,
          email,
          '(64) 99999-8888',
          '123.456.789-00',
          'customer',
          'active',
          '$2b$10$placeholder_hash_for_rsv360_user' // Hash placeholder
        ]
      );
      userId = newUser.rows[0].id;
      console.log(`Usuário criado com ID: ${userId}`);
    }
    console.log('');

    // 2. Verificar/criar perfil completo
    console.log('2. Verificando perfil completo...');
    const existingProfile = await pool.query('SELECT user_id FROM user_profiles WHERE user_id = $1', [userId]);
    
    const profileData = {
      username: 'user_rsv360',
      bio: 'Perfil oficial do sistema RSV 360° - Plataforma completa de gestão de reservas e aluguel por temporada.',
      description: `O RSV 360° é um ecossistema completo para gestão de reservas de hotéis, pousadas e aluguéis por temporada. 
      
Oferecemos soluções integradas que incluem:
- Sistema de reservas online
- Gestão de propriedades
- Processamento de pagamentos
- CRM completo
- Dashboard analítico
- Integração com múltiplos canais

Nossa plataforma foi desenvolvida para atender desde pequenas pousadas até grandes redes hoteleiras, oferecendo flexibilidade, escalabilidade e uma experiência de usuário excepcional.`,
      short_description: 'Plataforma completa de gestão de reservas e aluguel por temporada para hotéis, pousadas e propriedades.',
      tagline: 'Sua solução completa para gestão de reservas',
      website_url: 'https://rsv360.com',
      booking_url: 'https://reservas.rsv360.com',
      whatsapp: '(64) 99999-8888',
      location: 'Caldas Novas, GO',
      address: 'Av. Principal, 123',
      city: 'Caldas Novas',
      state: 'GO',
      zip_code: '75690-000',
      country: 'Brasil',
      latitude: -17.7444,
      longitude: -48.6278,
      business_name: 'RSV 360° Sistemas',
      business_type: 'Plataforma de Gestão de Reservas',
      tax_id: '12.345.678/0001-90',
      verified: true,
      categories: JSON.stringify([
        'Hotéis',
        'Pousadas',
        'Resorts',
        'Aluguel por Temporada',
        'Apartamentos',
        'Cabanas',
        'Chalés'
      ]),
      services: JSON.stringify([
        'Sistema de Reservas Online',
        'Gestão de Propriedades',
        'Processamento de Pagamentos',
        'CRM Integrado',
        'Dashboard Analítico',
        'Integração Multi-canal',
        'Suporte 24/7',
        'Relatórios Personalizados',
        'API para Integrações',
        'App Mobile'
      ]),
      amenities: JSON.stringify([
        'Sistema em Nuvem',
        'Backup Automático',
        'Segurança Avançada',
        'Interface Responsiva',
        'Multi-idioma',
        'Integração com Gateways de Pagamento',
        'Notificações Automáticas',
        'Gestão de Inventário'
      ]),
      social_media: JSON.stringify({
        facebook: 'https://facebook.com/rsv360',
        instagram: 'https://instagram.com/rsv360',
        linkedin: 'https://linkedin.com/company/rsv360',
        youtube: 'https://youtube.com/@rsv360',
        twitter: 'https://twitter.com/rsv360'
      }),
      rating: 4.9,
      review_count: 150,
      total_bookings: 5000,
      response_rate: 98.5,
      response_time: 15
    };

    if (existingProfile.rows.length > 0) {
      console.log('Perfil já existe. Atualizando dados...');
      
      const updates = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(profileData).forEach(key => {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(profileData[key]);
      });

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      await pool.query(
        `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
        values
      );
      console.log('Perfil atualizado com sucesso!');
    } else {
      console.log('Criando novo perfil completo...');
      await pool.query(
        `INSERT INTO user_profiles (
          user_id, username, bio, description, short_description, tagline,
          website_url, booking_url, whatsapp, location, address, city, state, 
          zip_code, country, latitude, longitude, business_name, business_type, 
          tax_id, verified, categories, services, amenities, social_media,
          rating, review_count, total_bookings, response_rate, response_time
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
        )`,
        [
          userId,
          profileData.username,
          profileData.bio,
          profileData.description,
          profileData.short_description,
          profileData.tagline,
          profileData.website_url,
          profileData.booking_url,
          profileData.whatsapp,
          profileData.location,
          profileData.address,
          profileData.city,
          profileData.state,
          profileData.zip_code,
          profileData.country,
          profileData.latitude,
          profileData.longitude,
          profileData.business_name,
          profileData.business_type,
          profileData.tax_id,
          profileData.verified,
          profileData.categories,
          profileData.services,
          profileData.amenities,
          profileData.social_media,
          profileData.rating,
          profileData.review_count,
          profileData.total_bookings,
          profileData.response_rate,
          profileData.response_time
        ]
      );
      console.log('Perfil criado com sucesso!');
    }
    console.log('');

    // 3. Verificar dados criados
    console.log('3. Verificando dados criados...');
    const userData = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status,
        up.username, up.bio, up.location, up.business_name, up.verified,
        up.categories, up.services, up.amenities, up.social_media,
        up.rating, up.review_count, up.total_bookings
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1`,
      [userId]
    );

    if (userData.rows.length > 0) {
      const data = userData.rows[0];
      console.log('Dados do perfil criado:');
      console.log(`  - ID: ${data.id}`);
      console.log(`  - Nome: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Username: ${data.username}`);
      console.log(`  - Localização: ${data.location}`);
      console.log(`  - Empresa: ${data.business_name}`);
      console.log(`  - Verificado: ${data.verified ? 'Sim' : 'Não'}`);
      console.log(`  - Rating: ${data.rating}/5.0 (${data.review_count} avaliações)`);
      console.log(`  - Total de Reservas: ${data.total_bookings}`);
      
      const categories = data.categories ? (typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories) : [];
      const services = data.services ? (typeof data.services === 'string' ? JSON.parse(data.services) : data.services) : [];
      console.log(`  - Categorias: ${categories.length} definidas`);
      console.log(`  - Serviços: ${services.length} definidos`);
    }
    console.log('');

    console.log('========================================');
    console.log('PERFIL CRIADO COM SUCESSO!');
    console.log('========================================');
    console.log('');
    console.log('Credenciais:');
    console.log(`  Email: ${email}`);
    console.log(`  Nome: ${name}`);
    console.log(`  Username: user_rsv360`);
    console.log('');
    console.log('Para acessar:');
    console.log('  1. Acesse: http://localhost:3000/perfil');
    console.log('  2. Faça login com o email acima');
    console.log('  3. Visualize o perfil completo nas 5 abas');
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('ERRO ao criar perfil:');
    console.error(error.message);
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

criarPerfilRSV360();

