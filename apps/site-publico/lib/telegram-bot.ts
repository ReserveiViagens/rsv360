import { Telegraf, Markup, Context } from 'telegraf';
import { Pool } from 'pg';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN não configurado. Bot Telegram desabilitado.');
} else {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // Buscar ou criar usuário por Telegram ID
  async function getUserByTelegramId(telegramId: number) {
    try {
      const query = `
        SELECT id, name, email, phone
        FROM users
        WHERE telegram_id = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [telegramId.toString()]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  // Criar usuário se não existir
  async function createUserIfNotExists(telegramId: number, telegramUser: any) {
    let user = await getUserByTelegramId(telegramId);
    
    if (!user) {
      try {
        const insertQuery = `
          INSERT INTO users (name, email, telegram_id, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          RETURNING id, name, email
        `;
        const result = await pool.query(insertQuery, [
          `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
          `telegram_${telegramId}@rsv360.com`,
          telegramId.toString(),
        ]);
        user = result.rows[0];
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
      }
    }
    
    return user;
  }

  // Buscar reservas do usuário
  async function getBookingsByUserId(userId: number) {
    try {
      const query = `
        SELECT 
          b.id,
          b.booking_code,
          b.check_in,
          b.check_out,
          b.status,
          b.total,
          p.title as property_title,
          p.images
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE b.user_id = $1
        ORDER BY b.check_in DESC
        LIMIT 10
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }
  }

  // Mensagem inicial
  bot.start(async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await createUserIfNotExists(telegramId, ctx.from);

    await ctx.reply(
      `Olá ${ctx.from.first_name}! Bem-vindo ao RSV 360°\n\nVocê está conectado com seu Telegram.\nUse os comandos abaixo:`,
      Markup.keyboard([
        ['📅 Minhas Reservas', '💬 Falar com Suporte'],
        ['❓ Ajuda', '🔌 Cancelar conexão'],
      ]).resize()
    );
  });

  // Minhas reservas
  bot.hears('📅 Minhas Reservas', async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      return ctx.reply('Usuário não encontrado. Use /start para começar.');
    }

    const bookings = await getBookingsByUserId(user.id);

    if (bookings.length === 0) {
      return ctx.reply('Você ainda não tem reservas.');
    }

    for (const booking of bookings) {
      const checkin = format(new Date(booking.check_in), "dd 'de' MMMM", { locale: ptBR });
      const checkout = format(new Date(booking.check_out), "dd 'de' MMMM", { locale: ptBR });
      const statusEmoji = booking.status === 'confirmed' ? '✅' : '⏳';
      const statusText = booking.status === 'confirmed' ? 'Confirmada' : 'Pendente';

      const message = `🏠 *${booking.property_title}*
📅 Check-in: ${checkin}
📅 Check-out: ${checkout}
💰 Total: R$ ${parseFloat(booking.total).toFixed(2)}
${statusEmoji} Status: ${statusText}
🔖 Código: ${booking.booking_code}`;

      if (booking.images && booking.images.length > 0) {
        await ctx.replyWithPhoto(booking.images[0], {
          caption: message,
          parse_mode: 'Markdown',
        });
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown' });
      }
    }
  });

  // Falar com suporte
  bot.hears('💬 Falar com Suporte', async (ctx: Context) => {
    await ctx.reply(
      '💬 *Suporte RSV 360°*\n\n' +
      'Nossa equipe está pronta para ajudar!\n\n' +
      '📧 Email: suporte@rsv360.com\n' +
      '📱 WhatsApp: (64) 99999-9999\n' +
      '🌐 Site: https://rsv360.com\n\n' +
      'Horário de atendimento:\n' +
      'Segunda a Sexta: 8h às 18h\n' +
      'Sábado: 9h às 13h',
      { parse_mode: 'Markdown' }
    );
  });

  // Ajuda
  bot.hears('❓ Ajuda', async (ctx: Context) => {
    await ctx.reply(
      '❓ *Ajuda RSV 360°*\n\n' +
      'Comandos disponíveis:\n\n' +
      '📅 Minhas Reservas - Ver suas reservas\n' +
      '💬 Falar com Suporte - Contatar suporte\n' +
      '❓ Ajuda - Ver esta mensagem\n' +
      '🔌 Cancelar conexão - Desconectar Telegram\n\n' +
      'Para mais informações, visite nosso site: https://rsv360.com',
      { parse_mode: 'Markdown' }
    );
  });

  // Cancelar conexão
  bot.hears('🔌 Cancelar conexão', async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    try {
      await pool.query('UPDATE users SET telegram_id = NULL WHERE telegram_id = $1', [
        telegramId.toString(),
      ]);
      await ctx.reply('✅ Conexão com Telegram cancelada com sucesso!');
    } catch (error) {
      await ctx.reply('❌ Erro ao cancelar conexão. Tente novamente mais tarde.');
    }
  });

  // Comando /help
  bot.command('help', async (ctx: Context) => {
    await ctx.reply(
      '❓ *Ajuda RSV 360°*\n\n' +
      'Comandos disponíveis:\n\n' +
      '/start - Iniciar bot\n' +
      '/help - Ver ajuda\n\n' +
      'Use os botões do teclado para navegar.',
      { parse_mode: 'Markdown' }
    );
  });

  // Tratamento de erros
  bot.catch((err, ctx) => {
    console.error('Erro no bot Telegram:', err);
    ctx.reply('❌ Ocorreu um erro. Tente novamente mais tarde.');
  });

  // Iniciar bot
  if (process.env.TELEGRAM_BOT_TOKEN) {
    bot.launch().then(() => {
      console.log('✅ Bot Telegram iniciado com sucesso!');
    }).catch((error) => {
      console.error('❌ Erro ao iniciar bot Telegram:', error);
    });

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
}

export default bot;

