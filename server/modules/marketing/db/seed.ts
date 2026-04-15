import { db } from '../../../../backend/src/db/drizzle';
import {
  marketingCampaigns,
  marketingCreatives,
  marketingPixelEvents,
  mktBroadcasts,
  mktFunnels,
  mktAbTests,
  mktWhatsappTemplates,
} from '../db/schema';

export async function seedMarketing() {
  console.log('🌱 Seeding Marketing module...');

  // 1. Campaigns (3)
  const campaigns = await db.insert(marketingCampaigns).values([
    {
      name: 'Black Friday 2025',
      type: 'paid_ads',
      platform: 'meta',
      status: 'active',
      channel: 'email',
      budget: 5000,
      targetAudience: JSON.stringify({ segment: 'all', minPurchases: 1 }),
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
    {
      name: 'Welcome Series',
      type: 'email',
      platform: 'email',
      status: 'active',
      channel: 'email',
      budget: 1000,
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
    {
      name: 'Reativação Q1 2026',
      type: 'whatsapp',
      platform: 'whatsapp',
      status: 'draft',
      channel: 'whatsapp',
      budget: 2000,
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
  ]).returning();

  // 2. Funnels (1 com 4 stages)
  await db.insert(mktFunnels).values([{
    name: 'Funil de Vendas Principal',
    description: 'Lead → Qualificado → Proposta → Fechamento',
    stages: JSON.stringify([
      { id: 'lead', name: 'Lead', order: 1, type: 'entry' },
      { id: 'qualified', name: 'Qualificado', order: 2, type: 'middle' },
      { id: 'proposal', name: 'Proposta', order: 3, type: 'middle' },
      { id: 'closed', name: 'Fechamento', order: 4, type: 'exit' },
    ]),
    isActive: true,
    totalLeads: 0,
    conversionRate: 0,
    enterpriseId: '00000000-0000-0000-0000-000000000000',
  }]);

  // 3. Broadcasts (2)
  await db.insert(mktBroadcasts).values([
    {
      name: 'Newsletter Março 2026',
      channel: 'email',
      status: 'sent',
      content: '<h1>Novidades de Março</h1><p>Confira nossas ofertas!</p>',
      subject: 'Novidades de Março - RSV360',
      totalRecipients: 500,
      delivered: 480,
      opened: 200,
      clicked: 50,
      campaignId: campaigns[0].id,
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
    {
      name: 'WhatsApp Promocional',
      channel: 'whatsapp',
      status: 'draft',
      content: 'Olá! Aproveite 20% de desconto em hospedagens. Use o código RSV20.',
      totalRecipients: 0,
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
  ]);

  // 4. Ab Tests (1)
  await db.insert(mktAbTests).values([{
    name: 'Subject Line Test - Black Friday',
    campaignId: campaigns[0].id,
    status: 'draft',
    variantA: JSON.stringify({ subject: '🔥 Black Friday: até 50% OFF', content: 'Versão A' }),
    variantB: JSON.stringify({ subject: 'Ofertas imperdíveis de Black Friday', content: 'Versão B' }),
    splitPercentage: 50,
    winnerMetric: 'open_rate',
    enterpriseId: '00000000-0000-0000-0000-000000000000',
  }]);

  // 5. WhatsApp Templates (2)
  await db.insert(mktWhatsappTemplates).values([
    {
      name: 'welcome_message',
      body: 'Olá! Bem-vindo ao RSV360. Como podemos ajudar?',
      language: 'pt_BR',
      category: 'marketing',
      status: 'approved',
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
    {
      name: 'booking_confirmation',
      body: 'Sua reserva foi confirmada. Obrigado!',
      language: 'pt_BR',
      category: 'utility',
      status: 'approved',
      enterpriseId: '00000000-0000-0000-0000-000000000000',
    },
  ]);

  console.log('✅ Marketing seed complete!');
  console.log(`   - ${campaigns.length} campaigns`);
  console.log('   - 1 funnel');
  console.log('   - 2 broadcasts');
  console.log('   - 1 ab test');
  console.log('   - 2 whatsapp templates');
}