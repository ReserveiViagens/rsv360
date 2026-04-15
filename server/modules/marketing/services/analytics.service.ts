import { eq, and, desc, sql, count, sum, avg, between, gte, lte } from 'drizzle-orm';

import { db } from '../../../../backend/src/db/drizzle';

import {
  marketingCampaigns,
  marketingPixelEvents,
  marketingCreatives,
  mktAttribution,
  mktBroadcasts,
  mktBroadcastRecipients,
  mktFunnels,
  mktFunnelEntries,
} from '../db/schema';

export type DateRange = { startDate: string; endDate: string }; // ISO dates
export type MetricPoint = { date: string; value: number };
export type ChannelMetrics = { channel: string; leads: number; conversions: number; revenue: number; cost: number; roi: number };

function getDefaultDateRange(): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

export async function getDashboardOverview(opts?: DateRange) {
  const { startDate, endDate } = opts || getDefaultDateRange();

  const dateFilter = between(marketingPixelEvents.createdAt, new Date(startDate), new Date(endDate));
  const campaignDateFilter = between(marketingCampaigns.createdAt, new Date(startDate), new Date(endDate));

  const [campaignResult, leadResult, broadcastResult, conversionResult, budgetResult] = await Promise.all([
    db.select({ count: count() }).from(marketingCampaigns).where(campaignDateFilter),
    db.select({ count: count() }).from(marketingPixelEvents).where(dateFilter),
    db.select({ count: count() }).from(mktBroadcasts).where(between(mktBroadcasts.createdAt, new Date(startDate), new Date(endDate))),
    db.select({ count: count() }).from(marketingPixelEvents).where(and(dateFilter, eq(marketingPixelEvents.event, 'conversion'))),
    db.select({ totalBudget: sql<number>`sum(${marketingCampaigns.budget})` }).from(marketingCampaigns).where(campaignDateFilter),
  ]);

  const totalCampaigns = campaignResult[0].count;
  const totalLeads = leadResult[0].count;
  const totalBroadcasts = broadcastResult[0].count;
  const totalConversions = conversionResult[0].count;
  const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
  const totalBudget = budgetResult[0].totalBudget || 0;

  return { totalCampaigns, totalLeads, totalBroadcasts, totalConversions, conversionRate, totalBudget };
}

export async function getCampaignPerformance(campaignId: string) {
  const campaign = await db
    .select()
    .from(marketingCampaigns)
    .where(eq(marketingCampaigns.id, campaignId))
    .limit(1);

  if (!campaign[0]) throw new Error('Campaign not found');

  // Email metrics from broadcasts
  const [broadcastMetrics] = await db
    .select({
      sent: sql<number>`sum(${mktBroadcasts.totalRecipients})`,
      delivered: sql<number>`sum(${mktBroadcasts.delivered})`,
      opened: sql<number>`sum(${mktBroadcasts.opened})`,
      clicked: sql<number>`sum(${mktBroadcasts.clicked})`,
    })
    .from(mktBroadcasts)
    .where(eq(mktBroadcasts.campaignId, campaignId));

  const sent = broadcastMetrics.sent || 0;
  const delivered = broadcastMetrics.delivered || 0;
  const opened = broadcastMetrics.opened || 0;
  const clicked = broadcastMetrics.clicked || 0;
  const openRate = sent > 0 ? (opened / sent) * 100 : 0;
  const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;

  // Event metrics from pixel events
  const eventMetricsResult = await db
    .select({
      event: marketingPixelEvents.event,
      count: count(),
    })
    .from(marketingPixelEvents)
    .where(sql`${marketingPixelEvents.metadata}->>'campaignId' = ${campaignId}`)
    .groupBy(marketingPixelEvents.event);

  const eventMetrics = eventMetricsResult.reduce((acc, row) => {
    acc[row.event] = row.count;
    return acc;
  }, {} as Record<string, number>);

  return {
    campaign: campaign[0],
    emailMetrics: { sent, delivered, opened, clicked, openRate, clickRate },
    eventMetrics,
  };
}

export async function getChannelBreakdown(opts?: DateRange) {
  const { startDate, endDate } = opts || getDefaultDateRange();

  const dateFilter = between(mktAttribution.occurredAt, new Date(startDate), new Date(endDate));

  const channelStats = await db
    .select({
      channel: mktAttribution.channel,
      leads: count(),
      revenue: sql<number>`sum(${mktAttribution.revenue})`,
      weightedValue: sql<number>`sum(${mktAttribution.attributionWeight})`,
    })
    .from(mktAttribution)
    .where(dateFilter)
    .groupBy(mktAttribution.channel);

  const channels: ChannelMetrics[] = channelStats.map(stat => ({
    channel: stat.channel,
    leads: stat.leads,
    conversions: 0, // Would need to join with conversions
    revenue: stat.revenue || 0,
    cost: 0, // Would need campaign cost data
    roi: 0, // revenue / cost
  }));

  return { channels };
}

export async function getTimeSeriesMetrics(
  metric: string,
  opts?: DateRange & { granularity?: 'day' | 'week' | 'month' }
) {
  const { startDate, endDate, granularity = 'day' } = opts || { ...getDefaultDateRange(), granularity: 'day' as const };

  let table;
  let dateColumn;
  let metricColumn;

  switch (metric) {
    case 'leads':
      table = marketingPixelEvents;
      dateColumn = marketingPixelEvents.createdAt;
      metricColumn = count();
      break;
    case 'conversions':
      table = marketingPixelEvents;
      dateColumn = marketingPixelEvents.createdAt;
      metricColumn = count();
      // Would need to filter by event type
      break;
    case 'broadcasts':
      table = mktBroadcasts;
      dateColumn = mktBroadcasts.createdAt;
      metricColumn = count();
      break;
    case 'events':
      table = marketingPixelEvents;
      dateColumn = marketingPixelEvents.createdAt;
      metricColumn = count();
      break;
    default:
      throw new Error('Invalid metric');
  }

  const series = await db
    .select({
      date: sql<string>`date_trunc(${granularity}, ${dateColumn})::text`,
      value: metricColumn,
    })
    .from(table)
    .where(between(dateColumn, new Date(startDate), new Date(endDate)))
    .groupBy(sql`date_trunc(${granularity}, ${dateColumn})`)
    .orderBy(sql`date_trunc(${granularity}, ${dateColumn})`);

  return { series: series as MetricPoint[] };
}

export async function getPixelEventsSummary(opts?: DateRange & { eventType?: string }) {
  const { startDate, endDate } = opts || getDefaultDateRange();
  const eventType = opts?.eventType;

  const conditions = [between(marketingPixelEvents.createdAt, new Date(startDate), new Date(endDate))];
  if (eventType) conditions.push(eq(marketingPixelEvents.event, eventType));

  const [events, totalResult] = await Promise.all([
    db
      .select({
        eventType: marketingPixelEvents.event,
        count: count(),
      })
      .from(marketingPixelEvents)
      .where(and(...conditions))
      .groupBy(marketingPixelEvents.event)
      .orderBy(desc(count())),
    db
      .select({ count: count() })
      .from(marketingPixelEvents)
      .where(and(...conditions)),
  ]);

  return { events, total: totalResult[0].count };
}

export async function getAttributionReport(opts?: DateRange & { model?: string }) {
  const { startDate, endDate } = opts || getDefaultDateRange();
  const model = opts?.model;

  const conditions = [between(mktAttribution.occurredAt, new Date(startDate), new Date(endDate))];
  if (model) conditions.push(eq(mktAttribution.attributionModel, model));

  const attributions = await db
    .select({
      channel: mktAttribution.channel,
      touches: count(),
      weightedValue: sql<number>`sum(${mktAttribution.attributionWeight})`,
      revenue: sql<number>`sum(${mktAttribution.revenue})`,
    })
    .from(mktAttribution)
    .where(and(...conditions))
    .groupBy(mktAttribution.channel);

  return { attributions, model: model || 'all' };
}

export async function getFunnelAnalytics(funnelId: string) {
  const funnel = await db
    .select()
    .from(mktFunnels)
    .where(eq(mktFunnels.id, funnelId))
    .limit(1);

  if (!funnel[0]) throw new Error('Funnel not found');

  const entries = await db
    .select({
      currentStageId: mktFunnelEntries.currentStageId,
      count: count(),
    })
    .from(mktFunnelEntries)
    .where(eq(mktFunnelEntries.funnelId, funnelId))
    .groupBy(mktFunnelEntries.currentStageId);

  // Calculate conversion rates between stages
  const stages = entries.map((entry, index) => {
    const previousCount = index > 0 ? entries[index - 1].count : entry.count;
    const conversionFromPrevious = previousCount > 0 ? (entry.count / previousCount) * 100 : 0;

    return {
      stageId: entry.currentStageId,
      name: `Stage ${entry.currentStageId}`, // Would need to map from funnel.stages
      leadsCount: entry.count,
      conversionFromPrevious,
    };
  });

  return { funnel: funnel[0], stages };
}

export async function getCreativePerformance(opts?: { campaignId?: string; page?: number; limit?: number }) {
  const { campaignId, page = 1, limit = 20 } = opts || {};

  const conditions = [];
  if (campaignId) conditions.push(eq(marketingCreatives.campaignId, campaignId));

  const offset = (page - 1) * limit;

  const [creatives, totalResult] = await Promise.all([
    db
      .select()
      .from(marketingCreatives)
      .where(and(...conditions))
      .orderBy(desc(marketingCreatives.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(marketingCreatives)
      .where(and(...conditions)),
  ]);

  // Add calculated metrics (using available fields)
  const creativesWithMetrics = creatives.map(creative => ({
    ...creative,
    ctr: 0, // Would need impressions/clicks data
    conversionRate: 0, // Would need conversion data
  }));

  return { creatives: creativesWithMetrics, total: totalResult[0].count };
}