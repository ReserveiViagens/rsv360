import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { sendBookingConfirmation } from '@/lib/email';
import { checkAvailability, isPeriodBlocked, blockPeriod } from '@/lib/availability-service';
import { calculatePricing, validateStayRules } from '@/lib/pricing-service';
import { triggerWebhook, WEBHOOK_EVENTS } from '@/lib/webhook-service';
import { createCheckinRequest } from '@/lib/checkin-service';
import { sendCheckinCreatedNotification } from '@/lib/checkin-notifications';

// POST /api/bookings - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica (total não é mais obrigatório, será calculado automaticamente)
    const requiredFields = ['booking_type', 'item_id', 'item_name', 'check_in', 'check_out', 'adults', 'customer'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Campo obrigatório faltando: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validar datas
    const checkIn = new Date(body.check_in);
    const checkOut = new Date(body.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { success: false, error: 'Data de check-in não pode ser no passado' },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: 'Data de check-out deve ser posterior ao check-in' },
        { status: 400 }
      );
    }

    // Validar hóspedes
    if (body.adults < 1) {
      return NextResponse.json(
        { success: false, error: 'Deve haver pelo menos 1 adulto' },
        { status: 400 }
      );
    }

    const totalGuests = (body.adults || 1) + (body.children || 0) + (body.infants || 0);

    // ✅ ITEM 1: VALIDAÇÃO DE DISPONIBILIDADE
    // Verificar conflitos de datas e capacidade máxima
    const availability = await checkAvailability(
      body.item_id,
      body.check_in,
      body.check_out,
      totalGuests
    );

    if (!availability.available) {
      return NextResponse.json(
        { 
          success: false, 
          error: availability.reason || 'Item não disponível para as datas selecionadas',
          details: {
            conflictingBookings: availability.conflictingBookings,
            conflictingBookingIds: availability.conflictingBookingIds,
            capacityAvailable: availability.capacityAvailable,
            maxCapacity: availability.maxCapacity,
            requestedGuests: availability.requestedGuests,
          }
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ✅ ITEM 2: VERIFICAR BLOQUEIO TEMPORÁRIO
    // Verificar se período está temporariamente bloqueado por outra reserva em processo
    const blockStatus = await isPeriodBlocked(
      body.item_id,
      body.check_in,
      body.check_out
    );

    if (blockStatus.blocked) {
      return NextResponse.json(
        { 
          success: false, 
          error: blockStatus.reason || 'Período temporariamente bloqueado. Tente novamente em alguns instantes.',
          details: {
            blockedBy: blockStatus.bookingId,
          }
        },
        { status: 423 } // 423 Locked
      );
    }

    // Validar cliente
    if (!body.customer.name || !body.customer.email) {
      return NextResponse.json(
        { success: false, error: 'Nome e e-mail do cliente são obrigatórios' },
        { status: 400 }
      );
    }

    // ✅ ITEM 3: CÁLCULO AUTOMÁTICO DE PREÇOS
    // Validar regras de estadia mínima/máxima
    const stayValidation = await validateStayRules(
      body.item_id,
      body.check_in,
      body.check_out
    );

    if (!stayValidation.valid) {
      return NextResponse.json(
        { success: false, error: stayValidation.error },
        { status: 400 }
      );
    }

    // Calcular preços automaticamente se não fornecidos
    let pricing;
    if (body.prices && body.total) {
      // Usar preços fornecidos (já calculados no frontend)
      pricing = {
        subtotal: body.prices.subtotal || body.total,
        discount: body.prices.discount || 0,
        taxes: body.prices.taxes || 0,
        serviceFee: body.prices.service_fee || 0,
        total: body.total,
      };
    } else {
      // Calcular preços automaticamente
      try {
        const calculatedPricing = await calculatePricing(
          body.item_id,
          body.check_in,
          body.check_out,
          body.payment_method || 'pix'
        );
        
        pricing = {
          subtotal: calculatedPricing.subtotal,
          discount: calculatedPricing.discount,
          taxes: calculatedPricing.taxes,
          serviceFee: calculatedPricing.serviceFee,
          total: calculatedPricing.total,
        };
      } catch (pricingError: any) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Erro ao calcular preços: ${pricingError.message}` 
          },
          { status: 500 }
        );
      }
    }

    // Validar total calculado
    if (pricing.total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total calculado deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Gerar código de reserva
    let bookingCode = `RSV-${Date.now()}`;
    try {
      // Tentar usar a função do banco se existir
      const bookingCodeResult = await queryDatabase(
        `SELECT generate_booking_code() as code`
      );
      if (bookingCodeResult[0]?.code) {
        bookingCode = bookingCodeResult[0].code;
      }
    } catch (error: any) {
      // Se a função não existir, usar código gerado localmente
      console.log('Função generate_booking_code não encontrada, usando código local:', error.message);
      bookingCode = `RSV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }

    // Usar preços calculados automaticamente
    const subtotal = pricing.subtotal;
    const discount = pricing.discount;
    const taxes = pricing.taxes;
    const serviceFee = pricing.serviceFee;
    const total = pricing.total;

    // Verificar se usuário existe ou criar (opcional - apenas se a tabela users existir)
    let userId = null;
    if (body.customer.email) {
      try {
        // Verificar se a tabela users existe
        const tableExists = await queryDatabase(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          ) as exists`
        );

        if (tableExists[0]?.exists) {
          const existingUser = await queryDatabase(
            'SELECT id FROM users WHERE email = $1',
            [body.customer.email]
          );

          if (existingUser.length > 0) {
            userId = existingUser[0].id;
          } else {
            // Criar usuário se não existir
            const newUser = await queryDatabase(
              `INSERT INTO users (name, email, phone, document, role, status)
               VALUES ($1, $2, $3, $4, 'customer', 'active')
               RETURNING id`,
              [
                body.customer.name,
                body.customer.email,
                body.customer.phone || null,
                body.customer.document || null
              ]
            );
            userId = newUser[0]?.id;
          }
        }
      } catch (error: any) {
        // Se a tabela users não existir, continuar sem criar usuário
        console.log('Tabela users não encontrada, continuando sem criar usuário:', error.message);
        userId = null;
      }
    }

    // Criar ou buscar customer na tabela customers (necessário para foreign key)
    let customerId = null;
    if (body.customer.email) {
      try {
        // Verificar se a tabela customers existe
        const customersTableExists = await queryDatabase(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'customers'
          ) as exists`
        );

        if (customersTableExists[0]?.exists) {
          // Verificar se a foreign key permite NULL
          const fkConstraint = await queryDatabase(
            `SELECT 
              tc.constraint_name,
              cc.is_nullable
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
              ON tc.constraint_name = ccu.constraint_name
            JOIN information_schema.columns cc 
              ON ccu.table_name = cc.table_name 
              AND ccu.column_name = cc.column_name
            WHERE tc.table_name = 'bookings'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND ccu.column_name = 'customer_id'`
          );

          const allowsNull = fkConstraint.length === 0 || fkConstraint[0]?.is_nullable === 'YES';

          // Buscar customer existente por email
          const existingCustomer = await queryDatabase(
            'SELECT id FROM customers WHERE email = $1',
            [body.customer.email]
          );

          if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
          } else {
            // Criar novo customer se não existir
            try {
              const newCustomer = await queryDatabase(
                `INSERT INTO customers (name, email, phone, document_number, user_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [
                  body.customer.name,
                  body.customer.email,
                  body.customer.phone || null,
                  body.customer.document || null,
                  userId || null  // Link com user se existir
                ]
              );
              customerId = newCustomer[0]?.id;
            } catch (insertError: any) {
              console.log('Erro ao criar customer:', insertError.message);
              // Se não conseguir criar e foreign key não permite NULL, tentar usar um customer padrão
              if (!allowsNull) {
                // Buscar qualquer customer existente como fallback
                const fallbackCustomer = await queryDatabase(
                  'SELECT id FROM customers LIMIT 1'
                );
                if (fallbackCustomer.length > 0) {
                  customerId = fallbackCustomer[0].id;
                  console.log('Usando customer fallback:', customerId);
                } else {
                  throw new Error('Não foi possível criar customer e não há customers existentes');
                }
              }
            }
          }
        } else {
          // Se tabela customers não existir, verificar se foreign key permite NULL
          const fkConstraint = await queryDatabase(
            `SELECT 
              tc.constraint_name,
              cc.is_nullable
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
              ON tc.constraint_name = ccu.constraint_name
            JOIN information_schema.columns cc 
              ON ccu.table_name = cc.table_name 
              AND ccu.column_name = cc.column_name
            WHERE tc.table_name = 'bookings'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND ccu.column_name = 'customer_id'`
          );

          if (fkConstraint.length > 0 && fkConstraint[0]?.is_nullable === 'NO') {
            throw new Error('Tabela customers não existe mas foreign key não permite NULL');
          }
        }
      } catch (error: any) {
        // Se a tabela customers não existir ou houver erro, continuar sem customer_id
        console.log('Erro ao criar/buscar customer:', error.message);
        // Se o erro for crítico (FK não permite NULL), relançar
        if (error.message.includes('não permite NULL')) {
          throw error;
        }
        customerId = null;
      }
    }

    // Preparar metadata com dados dos hóspedes e endereço
    const metadata: any = body.metadata || {};
    
    // Adicionar dados dos hóspedes
    if (body.guests && Array.isArray(body.guests)) {
      metadata.guests = body.guests.map((guest: any) => ({
        name: guest.name,
        age: guest.age,
        document: guest.document || null,
        isResponsible: guest.isResponsible || false,
      }));
    }
    
    // Adicionar endereço do responsável
    if (body.address) {
      metadata.responsible_address = {
        street: body.address.street,
        number: body.address.number,
        complement: body.address.complement || null,
        neighborhood: body.address.neighborhood,
        city: body.address.city,
        state: body.address.state,
        zipCode: body.address.zipCode,
        country: body.address.country || 'Brasil',
      };
    }

    // Inserir reserva
    const booking = await queryDatabase(
      `INSERT INTO bookings (
        booking_code, booking_type, item_id, item_name,
        check_in, check_out,
        adults, children, infants, total_guests,
        customer_name, customer_email, customer_phone, customer_document, customer_id,
        subtotal, discount, taxes, service_fee, total,
        payment_method, payment_status, status,
        special_requests, metadata
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, 'pending', 'pending',
        $22, $23
      ) RETURNING *`,
      [
        bookingCode,
        body.booking_type || 'hotel',
        body.item_id,
        body.item_name,
        body.check_in,
        body.check_out,
        body.adults || 1,
        body.children || 0,
        body.infants || 0,
        totalGuests,
        body.customer.name,
        body.customer.email,
        body.customer.phone || null,
        body.customer.document || null,
        customerId,  // Usar customerId da tabela customers, não userId
        subtotal,
        discount,
        taxes,
        serviceFee,
        total,
        body.payment_method || 'pix',
        body.special_requests || null,
        JSON.stringify(metadata)
      ]
    );

    const newBooking = booking[0];

    // ✅ ITEM 4 & 5: REGISTRAR MUDANÇA DE STATUS NO HISTÓRICO
    // Registrar criação da reserva (status: pending)
    try {
      await logStatusChange(
        newBooking.id,
        'pending' as any, // Status inicial
        'pending' as any, // Status inicial (criação)
        userId || undefined,
        body.customer.email,
        'Reserva criada'
      );
    } catch (historyError) {
      // Não falhar a criação se não conseguir registrar histórico
      console.error('Erro ao registrar histórico de criação:', historyError);
    }

    // Preparar resposta com informações de pagamento
    const response: any = {
      success: true,
      message: 'Reserva criada com sucesso',
      data: {
        id: newBooking.id,
        booking_code: newBooking.booking_code,
        status: newBooking.status,
        payment_status: newBooking.payment_status,
        total: parseFloat(newBooking.total),
        check_in: newBooking.check_in,
        check_out: newBooking.check_out,
        guests: newBooking.total_guests,
      }
    };

    // Se for PIX, gerar QR Code (simulado - em produção usar gateway real)
    if (body.payment_method === 'pix') {
      response.data.payment_info = {
        method: 'pix',
        qr_code: `00020126580014br.gov.bcb.pix0136${bookingCode}5204000053039865802BR5925RESERVEI VIAGENS LTDA6009CALDAS NOVAS62070503***6304${Math.random().toString(36).substring(7)}`,
        qr_code_image: null, // Será gerado pelo gateway
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        instructions: 'Escaneie o QR Code com o app do seu banco para pagar via PIX'
      };
    }

    // Criar registro de pagamento (se a tabela payments existir)
    try {
      // Verificar se a tabela payments existe
      const paymentsTableExists = await queryDatabase(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'payments'
        ) as exists`
      );

      if (paymentsTableExists[0]?.exists) {
        // Verificar estrutura da tabela para usar colunas corretas
        const columnsResult = await queryDatabase(
          `SELECT column_name 
           FROM information_schema.columns 
           WHERE table_schema = 'public' 
           AND table_name = 'payments'`
        );
        
        const columns = columnsResult.map((row: any) => row.column_name);
        const hasStatus = columns.includes('status');
        const hasPaymentStatus = columns.includes('payment_status');
        const hasGatewayProvider = columns.includes('gateway_provider');
        const hasGateway = columns.includes('gateway');
        const hasUserId = columns.includes('user_id');
        const hasTransactionId = columns.includes('transaction_id');

        // Construir query dinamicamente baseado nas colunas disponíveis
        const paymentFields: string[] = ['booking_id', 'amount', 'payment_method'];
        const paymentValues: any[] = [newBooking.id, total, body.payment_method || 'pix'];
        let paramIndex = 4;

        if (hasStatus) {
          paymentFields.push('status');
          paymentValues.push('pending');
          paramIndex++;
        } else if (hasPaymentStatus) {
          paymentFields.push('payment_status');
          paymentValues.push('pending');
          paramIndex++;
        }

        if (hasGatewayProvider) {
          paymentFields.push('gateway_provider');
          paymentValues.push('mercadopago');
          paramIndex++;
        } else if (hasGateway) {
          paymentFields.push('gateway');
          paymentValues.push('mercadopago');
          paramIndex++;
        }

        if (hasTransactionId) {
          paymentFields.push('transaction_id');
          paymentValues.push(`TXN-${bookingCode}-${Date.now()}`);
          paramIndex++;
        }

        if (hasUserId && userId) {
          paymentFields.push('user_id');
          paymentValues.push(userId);
          paramIndex++;
        }

        if (columns.includes('metadata')) {
          paymentFields.push('metadata');
          paymentValues.push(JSON.stringify({
            booking_code: bookingCode,
            customer_email: body.customer.email
          }));
        }

        const placeholders = paymentValues.map((_, i) => `$${i + 1}`).join(', ');
        await queryDatabase(
          `INSERT INTO payments (${paymentFields.join(', ')}) 
           VALUES (${placeholders})`,
          paymentValues
        );
      }
    } catch (paymentError: any) {
      // Não falhar a requisição se o pagamento falhar
      console.log('Erro ao criar registro de pagamento (não crítico):', paymentError.message);
    }

    // Enviar email de confirmação de reserva
    try {
      await sendBookingConfirmation({
        code: bookingCode,
        guestName: body.customer.name,
        guestEmail: body.customer.email,
        propertyName: body.item_name,
        checkIn: body.check_in,
        checkOut: body.check_out,
        guests: totalGuests,
        total: total,
        paymentMethod: body.payment_method || 'pix',
      });
    } catch (emailError) {
      // Não falhar a requisição se o email falhar
      console.error('Erro ao enviar email de confirmação:', emailError);
    }

    // ✅ Trigger webhook para reserva criada
    try {
      await triggerWebhook(WEBHOOK_EVENTS.BOOKING_CREATED, {
        booking_id: newBooking.id,
        booking_code: bookingCode,
        property_id: body.item_id,
        property_name: body.item_name,
        customer_email: body.customer.email,
        check_in: body.check_in,
        check_out: body.check_out,
        guests: totalGuests,
        total: total,
        status: newBooking.status,
        payment_status: newBooking.payment_status
      });
    } catch (webhookError) {
      // Não falhar a requisição se o webhook falhar
      console.error('Erro ao enviar webhook:', webhookError);
    }

    // ✅ Integração com Check-in Digital (opcional - criar automaticamente)
    // Se habilitado, cria check-in digital automaticamente após reserva confirmada
    if (process.env.AUTO_CREATE_CHECKIN === 'true' && userId && newBooking.payment_status === 'paid') {
      try {
        const checkin = await createCheckinRequest({
          booking_id: newBooking.id,
          property_id: body.item_id,
          user_id: userId
        });

        // Enviar notificação de check-in criado
        await sendCheckinCreatedNotification({
          checkinId: checkin.id,
          bookingId: newBooking.id,
          userId: userId,
          propertyId: body.item_id,
          checkInCode: checkin.check_in_code,
          status: checkin.status,
          qrCodeUrl: checkin.qr_code_url || undefined
        });

        // Adicionar link do check-in na resposta
        response.data.checkin = {
          id: checkin.id,
          code: checkin.check_in_code,
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkin/${checkin.id}`
        };
      } catch (checkinError) {
        // Não falhar a requisição se o check-in falhar
        console.error('Erro ao criar check-in digital:', checkinError);
      }
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao criar reserva',
      },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Listar reservas (por e-mail ou código)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const code = searchParams.get('code');
    const booking_id = searchParams.get('booking_id');
    const id = searchParams.get('id');

    if (!email && !code && !booking_id && !id) {
      return NextResponse.json(
        { success: false, error: 'É necessário fornecer email, código, booking_id ou id da reserva' },
        { status: 400 }
      );
    }

    let bookings;
    if (id || booking_id) {
      // Buscar por ID
      const bookingId = id || booking_id;
      bookings = await queryDatabase(
        `SELECT 
          b.*,
          p.id as payment_id,
          p.gateway_transaction_id,
          p.pix_qr_code,
          p.pix_expires_at
        FROM bookings b
        LEFT JOIN payments p ON p.booking_id = b.id
        WHERE b.id = $1
        ORDER BY b.created_at DESC`,
        [parseInt(bookingId as string)]
      );
    } else if (code) {
      // Buscar por código
      bookings = await queryDatabase(
        `SELECT 
          b.*,
          p.id as payment_id,
          p.gateway_transaction_id,
          p.pix_qr_code,
          p.pix_expires_at
        FROM bookings b
        LEFT JOIN payments p ON p.booking_id = b.id
        WHERE b.booking_code = $1
        ORDER BY b.created_at DESC`,
        [code]
      );
    } else {
      // Buscar por e-mail
      bookings = await queryDatabase(
        `SELECT 
          b.*,
          p.id as payment_id,
          p.gateway_transaction_id,
          p.pix_qr_code,
          p.pix_expires_at
        FROM bookings b
        LEFT JOIN payments p ON p.booking_id = b.id
        WHERE b.customer_email = $1
        ORDER BY b.created_at DESC
        LIMIT 50`,
        [email]
      );
    }

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma reserva encontrada' },
        { status: 404 }
      );
    }

    // Formatar resposta
    const formattedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      booking_code: booking.booking_code,
      booking_type: booking.booking_type,
      item_id: booking.item_id,
      item_name: booking.item_name,
      check_in: booking.check_in,
      check_out: booking.check_out,
      adults: booking.adults,
      children: booking.children,
      infants: booking.infants,
      total_guests: booking.total_guests,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      subtotal: parseFloat(booking.subtotal),
      discount: parseFloat(booking.discount),
      taxes: parseFloat(booking.taxes),
      service_fee: parseFloat(booking.service_fee),
      total: parseFloat(booking.total),
      payment_method: booking.payment_method,
      payment_status: booking.payment_status,
      status: booking.status,
      special_requests: booking.special_requests,
      created_at: booking.created_at,
      confirmed_at: booking.confirmed_at,
      payment_info: booking.pix_qr_code ? {
        qr_code: booking.pix_qr_code,
        expires_at: booking.pix_expires_at
      } : null
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      data: (id || booking_id || code) && formattedBookings.length > 0 ? formattedBookings[0] : formattedBookings,
      count: formattedBookings.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao buscar reservas',
      },
      { status: 500 }
    );
  }
}

