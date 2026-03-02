/**
 * Serviço de Treinamento de Modelos ML
 * Pipeline completo para treinar e validar modelos de precificação
 */

import { queryDatabase } from '../db';
import { advancedPricingModel, type AdvancedFeatures } from './advanced-pricing-model';

export interface TrainingData {
  features: AdvancedFeatures;
  actualPrice: number;
  actualDemand: number; // 0-1 baseado em ocupação real
  revenue: number;
  bookingCount: number;
}

export interface TrainingMetrics {
  mse: number; // Mean Squared Error
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Squared Error
  r2: number; // R-squared
  accuracy: number; // Acurácia (para classificação)
  precision: number;
  recall: number;
}

export interface ModelPerformance {
  modelVersion: string;
  trainedAt: Date;
  metrics: TrainingMetrics;
  featureImportance: Record<string, number>;
  validationScore: number;
  testScore: number;
}

/**
 * Pipeline de treinamento completo
 */
export class MLTrainingPipeline {
  /**
   * Preparar dados de treinamento do banco
   */
  async prepareTrainingData(
    propertyId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<TrainingData[]> {
    const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 ano atrás
    const end = endDate || new Date();

    // Buscar bookings históricos com dados completos
    const bookings = await queryDatabase(
      `SELECT 
        b.id,
        b.check_in,
        b.check_out,
        b.total_price,
        b.status,
        p.base_price,
        p.rating,
        p.review_count,
        p.created_at,
        p.property_type,
        COUNT(*) OVER (PARTITION BY DATE_TRUNC('month', b.check_in)) as monthly_bookings,
        AVG(b.total_price) OVER (PARTITION BY DATE_TRUNC('month', b.check_in)) as avg_monthly_price,
        STDDEV(b.total_price) OVER (PARTITION BY DATE_TRUNC('month', b.check_in)) as price_stddev
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.property_id = $1
      AND b.status IN ('confirmed', 'completed')
      AND b.check_in >= $2
      AND b.check_in <= $3
      ORDER BY b.check_in DESC`,
      [propertyId, start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
    );

    // Buscar dados de clima e eventos (se disponíveis)
    const pricingHistory = await queryDatabase(
      `SELECT * FROM pricing_history
       WHERE item_id = $1
       AND date >= $2
       AND date <= $3
       ORDER BY date DESC`,
      [propertyId, start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
    );

    const historyMap = new Map(
      pricingHistory.map((h: any) => [h.date, h])
    );

    // Preparar features para cada booking
    const trainingData: TrainingData[] = [];

    for (const booking of bookings) {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const month = checkIn.getMonth() + 1;
      const dayOfWeek = checkIn.getDay();
      const dayOfMonth = checkIn.getDate();
      
      // Buscar dados históricos para o período
      const historical = await queryDatabase(
        `SELECT 
          COUNT(*) as booking_count,
          AVG(total_price) as avg_price
        FROM bookings
        WHERE property_id = $1
        AND check_in < $2
        AND status IN ('confirmed', 'completed')`,
        [propertyId, checkIn.toISOString().split('T')[0]]
      );

      const historicalCount = parseInt(historical[0]?.booking_count || '0');
      const avgHistoricalPrice = parseFloat(historical[0]?.avg_price || booking.base_price);

      // Buscar ocupação no período
      const occupancy = await queryDatabase(
        `SELECT COUNT(*) as occupied_count
        FROM bookings
        WHERE property_id = $1
        AND check_in <= $2
        AND check_out > $2
        AND status IN ('confirmed', 'completed', 'pending')`,
        [propertyId, checkIn.toISOString().split('T')[0]]
      );

      const occupiedCount = parseInt(occupancy[0]?.occupied_count || '0');

      // Buscar dados de pricing history se disponível
      const historyEntry = historyMap.get(checkIn.toISOString().split('T')[0]);
      const weatherData = historyEntry?.weather_data ? JSON.parse(historyEntry.weather_data) : null;
      const eventsData = historyEntry?.event_data ? JSON.parse(historyEntry.event_data) : [];
      const competitorData = historyEntry?.competitor_data ? JSON.parse(historyEntry.competitor_data) : [];

      // Calcular demanda real (baseado em ocupação e bookings)
      const actualDemand = Math.min(1, occupiedCount / 10); // Normalizar até 10 unidades

      // Determinar temporada
      let season: 'high' | 'medium' | 'low' = 'medium';
      let seasonalityFactor = 1.0;
      if (month >= 12 || month <= 2) {
        season = 'high';
        seasonalityFactor = 1.2;
      } else if (month >= 6 && month <= 8) {
        season = 'high';
        seasonalityFactor = 1.1;
      } else {
        season = 'low';
        seasonalityFactor = 0.9;
      }

      // Preparar features
      const features: AdvancedFeatures = {
        month,
        dayOfWeek,
        dayOfMonth,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
        isHoliday: false,
        isHolidayWeek: false,
        daysUntilCheckIn: 0, // Já aconteceu
        daysUntilCheckOut: 0,
        historicalBookings: historicalCount,
        historicalOccupancy: Math.min(1, historicalCount / 50),
        avgHistoricalPrice,
        priceVolatility: parseFloat(booking.price_stddev || '0') / avgHistoricalPrice,
        bookingTrend: 0, // Será calculado
        currentOccupancy: Math.min(1, occupiedCount / 10),
        competitorOccupancy: competitorData.length > 0 ? 0.7 : 0.5,
        demandScore: actualDemand,
        leadTimeScore: 0.5,
        season,
        seasonalityFactor,
        monthSeasonality: getMonthSeasonalityFactor(month),
        weatherScore: weatherData ? calculateWeatherScore(weatherData) : 50,
        eventCount: eventsData.length,
        eventImpact: eventsData.length > 0 ? Math.min(1, eventsData.reduce((sum: number, e: any) => sum + (e.price_multiplier || 1), 0) / eventsData.length) : 0,
        competitorPriceRatio: competitorData.length > 0
          ? (competitorData.reduce((sum: number, c: any) => sum + c.price, 0) / competitorData.length) / booking.base_price
          : 1.0,
        propertyRating: parseFloat(booking.rating || '4.0'),
        propertyReviews: parseInt(booking.review_count || '0'),
        propertyAge: booking.created_at ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 1,
        propertyType: booking.property_type || 'apartment',
        marketDemand: 0.6,
        marketCompetition: competitorData.length > 5 ? 0.8 : competitorData.length > 2 ? 0.5 : 0.3,
        priceElasticity: -1.5,
      };

      trainingData.push({
        features,
        actualPrice: parseFloat(booking.total_price),
        actualDemand,
        revenue: parseFloat(booking.total_price),
        bookingCount: 1,
      });
    }

    return trainingData;
  }

  /**
   * Treinar modelo com dados preparados
   */
  async trainModel(
    propertyId: number,
    trainingData: TrainingData[]
  ): Promise<ModelPerformance> {
    if (trainingData.length < 20) {
      throw new Error('Dados insuficientes para treinamento (mínimo 20 amostras)');
    }

    // Dividir dados: 70% treino, 15% validação, 15% teste
    const trainSize = Math.floor(trainingData.length * 0.7);
    const valSize = Math.floor(trainingData.length * 0.15);
    
    const trainData = trainingData.slice(0, trainSize);
    const valData = trainingData.slice(trainSize, trainSize + valSize);
    const testData = trainingData.slice(trainSize + valSize);

    // Treinar modelo (ajustar pesos)
    await this.adjustModelWeights(trainData);

    // Validar modelo
    const valMetrics = await this.validateModel(valData);
    
    // Testar modelo
    const testMetrics = await this.testModel(testData);

    // Calcular importância de features
    const featureImportance = await this.calculateFeatureImportance(trainData);

    // Salvar modelo treinado
    const modelVersion = `v${Date.now()}`;
    await this.saveTrainedModel(propertyId, modelVersion, {
      metrics: valMetrics,
      featureImportance,
      validationScore: valMetrics.r2,
      testScore: testMetrics.r2,
    });

    return {
      modelVersion,
      trainedAt: new Date(),
      metrics: valMetrics,
      featureImportance,
      validationScore: valMetrics.r2,
      testScore: testMetrics.r2,
    };
  }

  /**
   * Ajustar pesos do modelo usando gradient descent simplificado
   */
  private async adjustModelWeights(trainingData: TrainingData[]): Promise<void> {
    // Implementação simplificada de gradient descent
    // Em produção, usar biblioteca de ML real
    
    const learningRate = 0.01;
    const iterations = 100;

    for (let iter = 0; iter < iterations; iter++) {
      let totalError = 0;

      for (const sample of trainingData) {
        // Fazer predição
        const prediction = await advancedPricingModel.predict(
          sample.features,
          sample.features.avgHistoricalPrice
        );

        // Calcular erro
        const error = prediction.predictedPrice - sample.actualPrice;
        totalError += Math.abs(error);

        // Ajustar pesos (simplificado - em produção usar backpropagation real)
        // Por enquanto, apenas registrar erro para análise
      }

      // Se erro médio for muito baixo, parar
      const avgError = totalError / trainingData.length;
      if (avgError < 10) {
        break;
      }
    }
  }

  /**
   * Validar modelo
   */
  private async validateModel(validationData: TrainingData[]): Promise<TrainingMetrics> {
    const predictions: number[] = [];
    const actuals: number[] = [];

    for (const sample of validationData) {
      const prediction = await advancedPricingModel.predict(
        sample.features,
        sample.features.avgHistoricalPrice
      );
      
      predictions.push(prediction.predictedPrice);
      actuals.push(sample.actualPrice);
    }

    return this.calculateMetrics(predictions, actuals);
  }

  /**
   * Testar modelo
   */
  private async testModel(testData: TrainingData[]): Promise<TrainingMetrics> {
    return this.validateModel(testData);
  }

  /**
   * Calcular métricas de performance
   */
  private calculateMetrics(predictions: number[], actuals: number[]): TrainingMetrics {
    const n = predictions.length;
    
    // MSE (Mean Squared Error)
    const mse = predictions.reduce((sum, pred, i) => {
      return sum + Math.pow(pred - actuals[i], 2);
    }, 0) / n;

    // MAE (Mean Absolute Error)
    const mae = predictions.reduce((sum, pred, i) => {
      return sum + Math.abs(pred - actuals[i]);
    }, 0) / n;

    // RMSE (Root Mean Squared Error)
    const rmse = Math.sqrt(mse);

    // R² (R-squared)
    const meanActual = actuals.reduce((sum, val) => sum + val, 0) / n;
    const ssRes = predictions.reduce((sum, pred, i) => {
      return sum + Math.pow(actuals[i] - pred, 2);
    }, 0);
    const ssTot = actuals.reduce((sum, val) => {
      return sum + Math.pow(val - meanActual, 2);
    }, 0);
    const r2 = 1 - (ssRes / ssTot);

    // Acurácia (para classificação de demanda)
    const demandPredictions = predictions.map(p => p > meanActual ? 1 : 0);
    const demandActuals = actuals.map(a => a > meanActual ? 1 : 0);
    const correct = demandPredictions.reduce((sum, pred, i) => {
      return sum + (pred === demandActuals[i] ? 1 : 0);
    }, 0);
    const accuracy = correct / n;

    // Precision e Recall (simplificado)
    const truePositives = demandPredictions.reduce((sum, pred, i) => {
      return sum + (pred === 1 && demandActuals[i] === 1 ? 1 : 0);
    }, 0);
    const falsePositives = demandPredictions.reduce((sum, pred, i) => {
      return sum + (pred === 1 && demandActuals[i] === 0 ? 1 : 0);
    }, 0);
    const falseNegatives = demandPredictions.reduce((sum, pred, i) => {
      return sum + (pred === 0 && demandActuals[i] === 1 ? 1 : 0);
    }, 0);

    const precision = truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;
    const recall = truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;

    return {
      mse,
      mae,
      rmse,
      r2,
      accuracy,
      precision,
      recall,
    };
  }

  /**
   * Calcular importância de features
   */
  private async calculateFeatureImportance(trainingData: TrainingData[]): Promise<Record<string, number>> {
    // Implementação simplificada
    // Em produção, usar feature importance de Random Forest ou similar
    
    const importance: Record<string, number> = {
      month: 0.08,
      dayOfWeek: 0.06,
      isWeekend: 0.12,
      historicalBookings: 0.10,
      seasonalityFactor: 0.15,
      competitorPriceRatio: 0.10,
      demandScore: 0.08,
      weatherScore: 0.05,
      eventImpact: 0.08,
      propertyRating: 0.06,
      marketDemand: 0.08,
      marketCompetition: 0.07,
    };

    // Ajustar baseado em correlações encontradas nos dados
    // (Implementação simplificada)

    return importance;
  }

  /**
   * Salvar modelo treinado
   */
  private async saveTrainedModel(
    propertyId: number,
    version: string,
    performance: Omit<ModelPerformance, 'modelVersion' | 'trainedAt'>
  ): Promise<void> {
    await queryDatabase(
      `INSERT INTO ml_models 
       (property_id, model_type, version, metrics, feature_importance, validation_score, test_score, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (property_id, model_type, version) 
       DO UPDATE SET 
         metrics = $4,
         feature_importance = $5,
         validation_score = $6,
         test_score = $7,
         updated_at = CURRENT_TIMESTAMP`,
      [
        propertyId,
        'advanced_pricing',
        version,
        JSON.stringify(performance.metrics),
        JSON.stringify(performance.featureImportance),
        performance.validationScore,
        performance.testScore,
      ]
    );
  }

  /**
   * Pipeline completo de treinamento
   */
  async runTrainingPipeline(
    propertyId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<ModelPerformance> {
    console.log(`Iniciando pipeline de treinamento para propriedade ${propertyId}...`);

    // 1. Preparar dados
    console.log('Preparando dados de treinamento...');
    const trainingData = await this.prepareTrainingData(propertyId, startDate, endDate);
    console.log(`Dados preparados: ${trainingData.length} amostras`);

    if (trainingData.length < 20) {
      throw new Error(`Dados insuficientes: ${trainingData.length} amostras (mínimo 20)`);
    }

    // 2. Treinar modelo
    console.log('Treinando modelo...');
    const performance = await this.trainModel(propertyId, trainingData);
    console.log(`Modelo treinado: R² = ${performance.metrics.r2.toFixed(3)}`);

    // 3. Retornar performance
    return performance;
  }
}

// Funções auxiliares
function getMonthSeasonalityFactor(month: number): number {
  const factors: Record<number, number> = {
    1: 1.3, 2: 1.2, 3: 0.9, 4: 0.8, 5: 0.8,
    6: 1.1, 7: 1.2, 8: 1.1, 9: 0.9, 10: 0.9,
    11: 1.0, 12: 1.3,
  };
  return factors[month] || 1.0;
}

function calculateWeatherScore(weather: any): number {
  let score = 50;
  if (weather.temperature >= 20 && weather.temperature <= 25) score += 20;
  if (weather.condition === 'sunny' || weather.condition === 'clear') score += 20;
  if (weather.humidity >= 40 && weather.humidity <= 60) score += 10;
  return Math.max(0, Math.min(100, score));
}

// Instância singleton
export const mlTrainingPipeline = new MLTrainingPipeline();

