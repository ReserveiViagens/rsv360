import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

// GET /api/users/profile - Obter perfil do usuário
export async function GET(request: NextRequest) {
  try {
    // Obter token do header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id;

    // Buscar usuário
    const users = await queryDatabase(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Buscar perfil completo
    const profiles = await queryDatabase(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const profile = profiles.length > 0 ? profiles[0] : null;

    // Combinar dados
    const response = {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        document: user.document,
        role: user.role,
        status: user.status,
        ...(profile && {
          // Dados do perfil
          username: profile.username,
          avatar_url: profile.avatar_url,
          profile_picture: profile.profile_picture,
          company_logo: profile.company_logo,
          bio: profile.bio,
          description: profile.description,
          short_description: profile.short_description,
          tagline: profile.tagline,
          website_url: profile.website_url,
          booking_url: profile.booking_url,
          whatsapp: profile.whatsapp,
          location: profile.location,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          country: profile.country,
          latitude: profile.latitude,
          longitude: profile.longitude,
          business_name: profile.business_name,
          business_type: profile.business_type,
          tax_id: profile.tax_id,
          verified: profile.verified,
          categories: typeof profile.categories === 'string' 
            ? JSON.parse(profile.categories || '[]') 
            : (profile.categories || []),
          services: typeof profile.services === 'string' 
            ? JSON.parse(profile.services || '[]') 
            : (profile.services || []),
          amenities: typeof profile.amenities === 'string' 
            ? JSON.parse(profile.amenities || '[]') 
            : (profile.amenities || []),
          social_media: typeof profile.social_media === 'string' 
            ? JSON.parse(profile.social_media || '{}') 
            : (profile.social_media || {}),
          rating: parseFloat(profile.rating || 0),
          review_count: parseInt(profile.review_count || 0),
          total_bookings: parseInt(profile.total_bookings || 0),
        }),
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar perfil do usuário' },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
  try {
    // Obter token do header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id;
    const body = await request.json();

    // Atualizar dados básicos do usuário
    if (body.name || body.phone || body.document) {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (body.name) {
        updates.push(`name = $${paramIndex++}`);
        values.push(body.name);
      }
      if (body.phone) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(body.phone);
      }
      if (body.document) {
        updates.push(`document = $${paramIndex++}`);
        values.push(body.document);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);
        await queryDatabase(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
      }
    }

    // Preparar dados do perfil
    const profileData: any = {};
    const profileFields = [
      'username', 'avatar_url', 'profile_picture', 'company_logo',
      'bio', 'description', 'short_description', 'tagline',
      'website_url', 'booking_url', 'whatsapp',
      'location', 'address', 'city', 'state', 'zip_code', 'country',
      'latitude', 'longitude',
      'business_name', 'business_type', 'tax_id',
      'categories', 'services', 'amenities', 'social_media'
    ];

    profileFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['categories', 'services', 'amenities', 'social_media'].includes(field)) {
          profileData[field] = JSON.stringify(body[field]);
        } else {
          profileData[field] = body[field];
        }
      }
    });

    // Verificar se perfil existe
    const existingProfiles = await queryDatabase(
      'SELECT user_id FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfiles.length > 0) {
      // Atualizar perfil existente
      if (Object.keys(profileData).length > 0) {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.keys(profileData).forEach(key => {
          updates.push(`${key} = $${paramIndex++}`);
          values.push(profileData[key]);
        });

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);

        await queryDatabase(
          `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
          values
        );
      }
    } else {
      // Criar novo perfil
      if (Object.keys(profileData).length > 0) {
        const fields = ['user_id', ...Object.keys(profileData)];
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const values = [userId, ...Object.values(profileData)];

        await queryDatabase(
          `INSERT INTO user_profiles (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}

