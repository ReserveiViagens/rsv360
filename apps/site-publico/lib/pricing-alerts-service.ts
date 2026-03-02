/**
 * Serviço de Alertas de Precificação
 * Gera e envia notificações de oportunidades e recomendações de preço
 */

import { queryDatabase } from './db';
import { calculateSmartPriceAdvanced } from './smart-pricing-service';
import { getProcessedCompetitorData } from './competitor-data-service';
import { analyzePropertySentiment } from './sentiment-analysis-service';
import { sendNotification } from './notification-service';

export interface PricingAlert {
  id?: number;
  propertyId: number;
  type: 'opportunity' | 'warning' | 'info' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  readAt?: Date;
  sentAt?: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  generateAlert: (data: any) => PricingAlert;
  enabled: boolean;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
}

/**
 * Verificar e gerar alertas para uma propriedade
 */
export async function checkAndGenerateAlerts(
  propertyId: number,
  date?: Date
): Promise<PricingAlert[]> {
  const alerts: PricingAlert[] = [];
  const checkDate = date || new Date();

  // Buscar propriedade
  const property = await queryDatabase(
    `SELECT * FROM properties WHERE id = $1`,
    [propertyId]
  );

  if (property.length === 0) {
    return alerts;
  }

  const basePrice = parseFloat(property[0].base_price || '0');
  const checkIn = checkDate;
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  // 1. Verificar oportunidade de aumento de preço
  try {
    const pricingFactors = await calculateSmartPriceAdvanced(
      propertyId,
      basePrice,
      checkIn,
      checkOut,
      property[0].location,
      property[0].latitude,
      property[0].longitude
    );

    if (pricingFactors.mlPrediction) {
      const prediction = pricingFactors.mlPrediction;
      
      // Alta demanda prevista
      if (prediction.predictedDemand > 0.8 && prediction.recommendations.action === 'increase') {
        alerts.push({
          propertyId,
          type: 'opportunity',
          severity: 'high',
          title: 'Oportunidade de Aumento de Preço',
          message: `Alta demanda prevista (${(prediction.predictedDemand * 100).toFixed(0)}%). ${prediction.recommendations.reason}`,
          action: 'Aplicar Aumento',
          actionUrl: `/admin/pricing/${propertyId}?action=increase`,
          metadata: {
            predictedDemand: prediction.predictedDemand,
            recommendedPrice: prediction.priceRange.optimal,
            confidence: prediction.confidence,
          },
        });
      }

      // Baixa demanda prevista
      if (prediction.predictedDemand < 0.3 && prediction.recommendations.action === 'decrease') {
        alerts.push({
          propertyId,
          type: 'warning',
          severity: 'medium',
          title: 'Baixa Demanda Prevista',
          message: `Demanda prevista muito baixa (${(prediction.predictedDemand * 100).toFixed(0)}%). ${prediction.recommendations.reason}`,
          action: 'Criar Promoção',
          actionUrl: `/admin/pricing/${propertyId}?action=promotion`,
          metadata: {
            predictedDemand: prediction.predictedDemand,
            recommendedPrice: prediction.priceRange.optimal,
          },
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar precificação:', error);
  }

  // 2. Verificar posição no mercado (competidores)
  try {
    const competitorData = await getProcessedCompetitorData(propertyId, checkDate);

    if (competitorData) {
      // Preço muito acima da concorrência
      if (competitorData.priceGap > 25) {
        alerts.push({
          propertyId,
          type: 'warning',
          severity: 'high',
          title: 'Preço Muito Acima da Concorrência',
          message: `Seu preço está ${competitorData.priceGap.toFixed(1)}% acima da média do mercado. Isso pode reduzir bookings significativamente.`,
          action: 'Revisar Preço',
          actionUrl: `/admin/pricing/${propertyId}?action=review`,
          metadata: {
            priceGap: competitorData.priceGap,
            averageCompetitorPrice: competitorData.averagePrice,
            recommendation: competitorData.recommendations,
          },
        });
      }

      // Preço muito abaixo da concorrência (oportunidade)
      if (competitorData.priceGap < -20 && competitorData.marketPosition === 'below') {
        alerts.push({
          propertyId,
          type: 'opportunity',
          severity: 'medium',
          title: 'Oportunidade de Aumento de Preço',
          message: `Seu preço está ${Math.abs(competitorData.priceGap).toFixed(1)}% abaixo da média. Oportunidade de aumentar receita sem perder competitividade.`,
          action: 'Ajustar Preço',
          actionUrl: `/admin/pricing/${propertyId}?action=increase`,
          metadata: {
            priceGap: competitorData.priceGap,
            averageCompetitorPrice: competitorData.averagePrice,
            suggestedPrice: competitorData.recommendations.suggestedPrice,
          },
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar competidores:', error);
  }

  // 3. Verificar sentimento dos reviews
  try {
    const sentiment = await analyzePropertySentiment(propertyId);

    if (sentiment.recommendations.pricingImpact < -0.1) {
      alerts.push({
        propertyId,
        type: 'warning',
        severity: 'medium',
        title: 'Reviews Negativos Afetando Percepção de Valor',
        message: sentiment.recommendations.reason,
        action: 'Ver Reviews',
        actionUrl: `/admin/reviews/${propertyId}`,
        metadata: {
          sentimentScore: sentiment.score,
          reviewCount: sentiment.reviewCount,
          recentTrend: sentiment.recentTrend,
        },
      });
    }

    if (sentiment.recommendations.pricingImpact > 0.1 && sentiment.recentTrend === 'improving') {
      alerts.push({
        propertyId,
        type: 'opportunity',
        severity: 'low',
        title: 'Reviews Melhorando - Oportunidade de Aumento',
        message: `Reviews recentes estão melhorando. ${sentiment.recommendations.reason}`,
        action: 'Ver Análise',
        actionUrl: `/admin/reviews/${propertyId}?tab=sentiment`,
        metadata: {
          sentimentScore: sentiment.score,
          recentTrend: sentiment.recentTrend,
        },
      });
    }
  } catch (error) {
    console.error('Erro ao verificar sentimento:', error);
  }

  // 4. Verificar eventos locais
  try {
    const pricingFactors = await calculateSmartPriceAdvanced(
      propertyId,
      basePrice,
      checkIn,
      checkOut,
      property[0].location,
      property[0].latitude,
      property[0].longitude
    );

    if (pricingFactors.events && Array.isArray(pricingFactors.events) && pricingFactors.events.length > 2) {
      alerts.push({
        propertyId,
        type: 'opportunity',
        severity: 'medium',
        title: 'Eventos Locais Detectados',
        message: `${pricingFactors.events.length} eventos locais podem aumentar demanda. Considere ajustar preço.`,
        action: 'Ver Eventos',
        actionUrl: `/admin/pricing/${propertyId}?tab=events`,
        metadata: {
          eventCount: pricingFactors.events.length,
          events: pricingFactors.events,
        },
      });
    }
  } catch (error) {
    console.error('Erro ao verificar eventos:', error);
  }

  // 5. Verificar preço não atualizado há muito tempo
  try {
    const lastUpdate = await queryDatabase(
      `SELECT updated_at FROM pricing_history 
       WHERE item_id = $1 
       ORDER BY date DESC LIMIT 1`,
      [propertyId]
    );

    if (lastUpdate.length > 0) {
      const lastUpdateDate = new Date(lastUpdate[0].updated_at);
      const daysSinceUpdate = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate > 7) {
        alerts.push({
          propertyId,
          type: 'info',
          severity: 'low',
          title: 'Preço Não Atualizado',
          message: `O preço não foi atualizado há ${Math.floor(daysSinceUpdate)} dias. Considere revisar.`,
          action: 'Atualizar Preço',
          actionUrl: `/admin/pricing/${propertyId}?action=update`,
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar última atualização:', error);
  }

  // Salvar alertas no banco
  for (const alert of alerts) {
    await saveAlert(alert);
  }

  return alerts;
}

/**
 * Salvar alerta no banco
 */
async function saveAlert(alert: PricingAlert): Promise<void> {
  await queryDatabase(
    `INSERT INTO pricing_alerts 
     (property_id, type, severity, title, message, action, action_url, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
     ON CONFLICT DO NOTHING`,
    [
      alert.propertyId,
      alert.type,
      alert.severity,
      alert.title,
      alert.message,
      alert.action || null,
      alert.actionUrl || null,
      alert.metadata ? JSON.stringify(alert.metadata) : null,
    ]
  );
}

/**
 * Enviar notificações de alertas
 */
export async function sendAlertNotifications(
  alerts: PricingAlert[],
  userId: number,
  channels: ('email' | 'sms' | 'push' | 'in-app')[] = ['in-app']
): Promise<void> {
  for (const alert of alerts) {
    // Enviar notificação in-app
    if (channels.includes('in-app')) {
      await sendNotification({
        userId,
        type: 'pricing_alert',
        title: alert.title,
        message: alert.message,
        data: {
          alertId: alert.id,
          propertyId: alert.propertyId,
          actionUrl: alert.actionUrl,
        },
      });
    }

    // Enviar email (se configurado)
    if (channels.includes('email') && alert.severity === 'high' || alert.severity === 'critical') {
      // TODO: Implementar envio de email
      console.log(`Email enviado para alerta: ${alert.title}`);
    }

    // Marcar como enviado
    if (alert.id) {
      await queryDatabase(
        `UPDATE pricing_alerts SET sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [alert.id]
      );
    }
  }
}

/**
 * Obter alertas não lidos de uma propriedade
 */
export async function getUnreadAlerts(
  propertyId: number,
  userId: number
): Promise<PricingAlert[]> {
  const alerts = await queryDatabase(
    `SELECT * FROM pricing_alerts 
     WHERE property_id = $1 
     AND read_at IS NULL
     ORDER BY created_at DESC`,
    [propertyId]
  );

  return alerts.map((a: any) => ({
    id: a.id,
    propertyId: a.property_id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    action: a.action,
    actionUrl: a.action_url,
    metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
    createdAt: new Date(a.created_at),
    readAt: a.read_at ? new Date(a.read_at) : undefined,
    sentAt: a.sent_at ? new Date(a.sent_at) : undefined,
  }));
}

/**
 * Marcar alerta como lido
 */
export async function markAlertAsRead(alertId: number): Promise<void> {
  await queryDatabase(
    `UPDATE pricing_alerts SET read_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [alertId]
  );
}

/**
 * Verificar e gerar alertas para todas as propriedades ativas
 */
export async function checkAllPropertiesAlerts(): Promise<void> {
  const properties = await queryDatabase(
    `SELECT id FROM properties WHERE is_active = true`
  );

  for (const property of properties) {
    try {
      const alerts = await checkAndGenerateAlerts(property.id);
      
      // Enviar notificações para proprietários
      if (alerts.length > 0) {
        const owners = await queryDatabase(
          `SELECT user_id FROM property_owners WHERE property_id = $1`,
          [property.id]
        );

        for (const owner of owners) {
          await sendAlertNotifications(alerts, owner.user_id, ['in-app']);
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar alertas para propriedade ${property.id}:`, error);
    }
  }
}

