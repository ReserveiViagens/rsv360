import { db } from '../../../../backend/src/db/drizzle';
import { pricingRules, pricingSeasons, pricingCompetitors, pricingAlerts } from '../db/schema';

export const seedPricingData = async () => {
  console.log('🌱 Seeding pricing module data...');

  try {
    // Seed pricing seasons
    console.log('Creating pricing seasons...');
    const seasons = await db.insert(pricingSeasons).values([
      {
        name: 'Alta Temporada Verão',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2025-02-28'),
        multiplier: 1.3,
        isActive: true,
        metadata: {
          description: 'Alta temporada de verão no Brasil',
          peakSeason: true
        }
      },
      {
        name: 'Carnaval',
        startDate: new Date('2025-02-28'),
        endDate: new Date('2025-03-05'),
        multiplier: 1.5,
        isActive: true,
        metadata: {
          description: 'Período de Carnaval',
          holiday: true,
          highDemand: true
        }
      },
      {
        name: 'Baixa Temporada',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-06-30'),
        multiplier: 0.8,
        isActive: true,
        metadata: {
          description: 'Baixa temporada após carnaval',
          lowDemand: true
        }
      },
      {
        name: 'Feriado Corpus Christi',
        startDate: new Date('2025-05-29'),
        endDate: new Date('2025-06-02'),
        multiplier: 1.2,
        isActive: true,
        metadata: {
          description: 'Feriado de Corpus Christi',
          holiday: true
        }
      }
    ]).returning();

    console.log(`✅ Created ${seasons.length} pricing seasons`);

    // Seed pricing rules
    console.log('Creating pricing rules...');
    const rules = await db.insert(pricingRules).values([
      {
        name: 'Desconto Longa Estadia',
        type: 'promotional',
        priority: 10,
        conditions: {
          minStay: 7,
          maxStay: 30
        },
        adjustments: {
          percentage: -10
        },
        isActive: true,
        metadata: {
          description: 'Desconto de 10% para estadias de 7+ noites'
        }
      },
      {
        name: 'Aumento Último Minuto',
        type: 'demand',
        priority: 20,
        conditions: {
          dateRange: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          }
        },
        adjustments: {
          percentage: 15
        },
        isActive: true,
        metadata: {
          description: 'Aumento de 15% para reservas de última hora'
        }
      },
      {
        name: 'Desconto Família',
        type: 'loyalty',
        priority: 5,
        conditions: {
          guestCount: 4
        },
        adjustments: {
          percentage: -5,
          minPrice: 200
        },
        isActive: true,
        metadata: {
          description: 'Desconto de 5% para famílias (4+ pessoas)'
        }
      },
      {
        name: 'Aumento Alta Demanda',
        type: 'demand',
        priority: 25,
        conditions: {
          dateRange: {
            start: '2024-12-20T00:00:00.000Z',
            end: '2025-01-05T00:00:00.000Z'
          }
        },
        adjustments: {
          percentage: 25,
          maxPrice: 800
        },
        isActive: true,
        metadata: {
          description: 'Aumento de 25% durante período de alta demanda'
        }
      }
    ]).returning();

    console.log(`✅ Created ${rules.length} pricing rules`);

    // Seed competitors
    console.log('Creating competitors...');
    const competitors = await db.insert(pricingCompetitors).values([
      {
        name: 'Hotel Atlântico Business',
        location: 'Rio de Janeiro, RJ',
        starRating: 4.5,
        amenities: ['WiFi', 'Piscina', 'Academia', 'Restaurante', 'Bar', 'Estacionamento'],
        contactInfo: {
          phone: '+55 21 99999-0001',
          email: 'reservas@atlanticobusiness.com.br',
          website: 'https://atlanticobusiness.com.br'
        },
        isActive: true,
        metadata: {
          category: 'business',
          proximity: '2km from beach',
          targetMarket: 'corporate travelers'
        }
      },
      {
        name: 'Pousada Solar das Dunas',
        location: 'Natal, RN',
        starRating: 3.8,
        amenities: ['WiFi', 'Piscina', 'Café da Manhã', 'Estacionamento'],
        contactInfo: {
          phone: '+55 84 99999-0002',
          email: 'contato@solardasdnas.com.br',
          website: 'https://solardasdunas.com.br'
        },
        isActive: true,
        metadata: {
          category: 'boutique',
          proximity: '100m from beach',
          targetMarket: 'families and couples'
        }
      },
      {
        name: 'Resort Costa Verde',
        location: 'Florianópolis, SC',
        starRating: 4.2,
        amenities: ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Bar', 'Praia Privativa', 'Kids Club'],
        contactInfo: {
          phone: '+55 48 99999-0003',
          email: 'reservas@costaverde.com.br',
          website: 'https://costaverde.com.br'
        },
        isActive: true,
        metadata: {
          category: 'resort',
          proximity: 'beachfront',
          targetMarket: 'families and luxury travelers'
        }
      },
      {
        name: 'Hotel Centro Histórico',
        location: 'Salvador, BA',
        starRating: 4.0,
        amenities: ['WiFi', 'Ar Condicionado', 'TV', 'Café da Manhã'],
        contactInfo: {
          phone: '+55 71 99999-0004',
          email: 'info@centrohistorico.com.br',
          website: 'https://centrohistorico.com.br'
        },
        isActive: true,
        metadata: {
          category: 'budget',
          proximity: '500m from historic center',
          targetMarket: 'budget travelers'
        }
      },
      {
        name: 'Luxury Palace Hotel',
        location: 'São Paulo, SP',
        starRating: 5.0,
        amenities: ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Bar', 'Concierge', 'Room Service', 'Business Center'],
        contactInfo: {
          phone: '+55 11 99999-0005',
          email: 'concierge@luxurypalace.com.br',
          website: 'https://luxurypalace.com.br'
        },
        isActive: true,
        metadata: {
          category: 'luxury',
          proximity: 'city center',
          targetMarket: 'business and luxury travelers'
        }
      }
    ]).returning();

    console.log(`✅ Created ${competitors.length} competitors`);

    // Seed alerts
    console.log('Creating pricing alerts...');
    const alerts = await db.insert(pricingAlerts).values([
      {
        competitorId: competitors[0].id, // Hotel Atlântico Business
        alertType: 'price_drop',
        threshold: 250,
        condition: 'below',
        isActive: true,
        notificationChannels: ['email', 'dashboard'],
        metadata: {
          description: 'Alert when Atlântico Business drops below R$ 250'
        }
      },
      {
        competitorId: competitors[1].id, // Pousada Solar das Dunas
        alertType: 'price_increase',
        threshold: 15,
        condition: 'percentage_change',
        isActive: true,
        notificationChannels: ['email'],
        metadata: {
          description: 'Alert when Solar das Dunas increases price by 15% or more'
        }
      },
      {
        competitorId: competitors[2].id, // Resort Costa Verde
        alertType: 'rate_parity_threshold',
        threshold: 10,
        condition: 'percentage_change',
        isActive: true,
        notificationChannels: ['email', 'sms'],
        metadata: {
          description: 'Alert when Costa Verde is 10% cheaper than our rates'
        }
      },
      {
        competitorId: competitors[3].id, // Hotel Centro Histórico
        alertType: 'availability_change',
        threshold: 0,
        condition: 'equals',
        isActive: true,
        notificationChannels: ['dashboard'],
        metadata: {
          description: 'Alert when Centro Histórico becomes unavailable'
        }
      }
    ]).returning();

    console.log(`✅ Created ${alerts.length} pricing alerts`);

    console.log('🎉 Pricing module seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${seasons.length} seasons created`);
    console.log(`   - ${rules.length} pricing rules created`);
    console.log(`   - ${competitors.length} competitors created`);
    console.log(`   - ${alerts.length} alerts created`);

    return {
      seasons: seasons.length,
      rules: rules.length,
      competitors: competitors.length,
      alerts: alerts.length
    };

  } catch (error) {
    console.error('❌ Error seeding pricing data:', error);
    throw error;
  }
};

export const clearPricingData = async () => {
  console.log('🧹 Clearing pricing module data...');

  try {
    await db.delete(pricingAlerts);
    await db.delete(pricingCompetitors);
    await db.delete(pricingRules);
    await db.delete(pricingSeasons);

    console.log('✅ All pricing data cleared');
  } catch (error) {
    console.error('❌ Error clearing pricing data:', error);
    throw error;
  }
};