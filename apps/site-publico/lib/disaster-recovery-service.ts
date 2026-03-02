/**
 * Serviço de Disaster Recovery
 * Gerencia planos de recuperação e failover
 */

import { queryDatabase } from './db';
import { backupService } from './backup-service';

export interface RecoveryPlan {
  id?: number;
  name: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rto: number; // Recovery Time Objective (minutos)
  rpo: number; // Recovery Point Objective (minutos)
  steps: RecoveryStep[];
  enabled: boolean;
  lastTested?: Date;
  lastExecuted?: Date;
}

export interface RecoveryStep {
  id: string;
  name: string;
  description?: string;
  type: 'backup_restore' | 'service_restart' | 'database_failover' | 'cache_clear' | 'custom';
  order: number;
  timeout: number; // segundos
  retryCount: number;
  script?: string; // script customizado
  dependencies?: string[]; // IDs de steps que devem executar antes
}

export interface RecoveryExecution {
  id?: number;
  planId: number;
  triggeredBy: 'manual' | 'automatic' | 'scheduled';
  triggeredByUserId?: number;
  reason?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  currentStep?: string;
  stepsCompleted: number;
  totalSteps: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  cache: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  overall: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  issues: HealthIssue[];
}

export interface HealthIssue {
  component: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  detectedAt: Date;
}

/**
 * Serviço de disaster recovery
 */
export class DisasterRecoveryService {
  /**
   * Criar plano de recuperação
   */
  async createRecoveryPlan(plan: RecoveryPlan): Promise<RecoveryPlan> {
    const result = await queryDatabase(
      `INSERT INTO recovery_plans 
       (name, description, priority, rto, rpo, steps, enabled, last_tested)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
       RETURNING *`,
      [
        plan.name,
        plan.description || null,
        plan.priority,
        plan.rto,
        plan.rpo,
        JSON.stringify(plan.steps),
        plan.enabled,
      ]
    );

    return this.mapDbToPlan(result[0]);
  }

  /**
   * Executar plano de recuperação
   */
  async executeRecoveryPlan(
    planId: number,
    triggeredBy: RecoveryExecution['triggeredBy'] = 'manual',
    triggeredByUserId?: number,
    reason?: string
  ): Promise<RecoveryExecution> {
    const plan = await this.getRecoveryPlan(planId);
    if (!plan) {
      throw new Error('Plano de recuperação não encontrado');
    }

    // Criar registro de execução
    const execution = await this.createRecoveryExecution({
      planId,
      triggeredBy,
      triggeredByUserId,
      reason,
      status: 'running',
      startedAt: new Date(),
      stepsCompleted: 0,
      totalSteps: plan.steps.length,
    });

    try {
      // Ordenar steps por ordem e dependências
      const sortedSteps = this.sortSteps(plan.steps);

      // Executar cada step
      for (let i = 0; i < sortedSteps.length; i++) {
        const step = sortedSteps[i];
        
        // Atualizar step atual
        await this.updateRecoveryExecution(execution.id!, {
          currentStep: step.id,
        });

        try {
          await this.executeStep(step, execution.id!);
          
          // Atualizar progresso
          await this.updateRecoveryExecution(execution.id!, {
            stepsCompleted: i + 1,
          });
        } catch (error: any) {
          // Tentar novamente se houver retries
          let retried = false;
          for (let retry = 0; retry < step.retryCount; retry++) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1))); // Backoff
              await this.executeStep(step, execution.id!);
              retried = true;
              break;
            } catch (retryError) {
              // Continuar tentando
            }
          }

          if (!retried) {
            throw new Error(`Erro ao executar step ${step.name}: ${error.message}`);
          }
        }
      }

      // Marcar como completo
      await this.updateRecoveryExecution(execution.id!, {
        status: 'completed',
        completedAt: new Date(),
        currentStep: undefined,
      });

      // Atualizar última execução do plano
      await this.updateRecoveryPlan(planId, {
        lastExecuted: new Date(),
      });

      return await this.getRecoveryExecution(execution.id!);
    } catch (error: any) {
      // Marcar como falha
      await this.updateRecoveryExecution(execution.id!, {
        status: 'failed',
        completedAt: new Date(),
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Executar step de recuperação
   */
  private async executeStep(step: RecoveryStep, executionId: number): Promise<void> {
    switch (step.type) {
      case 'backup_restore':
        // Restaurar último backup
        const backups = await queryDatabase(
          `SELECT id FROM backup_records 
           WHERE status = 'completed' 
           ORDER BY completed_at DESC LIMIT 1`
        );
        if (backups.length > 0) {
          await backupService.restoreBackup(backups[0].id);
        }
        break;

      case 'service_restart':
        // Reiniciar serviço (simulado - em produção usaria systemd/docker/etc)
        console.log(`Reiniciando serviço: ${step.name}`);
        break;

      case 'database_failover':
        // Failover de banco de dados (simulado)
        console.log(`Executando failover de banco: ${step.name}`);
        break;

      case 'cache_clear':
        // Limpar cache
        console.log(`Limpando cache: ${step.name}`);
        // Em produção, limparia Redis/cache
        break;

      case 'custom':
        if (step.script) {
          // Executar script customizado
          // Em produção, executaria o script de forma segura
          console.log(`Executando script customizado: ${step.name}`);
        }
        break;
    }

    // Registrar execução do step
    await queryDatabase(
      `INSERT INTO recovery_step_executions 
       (execution_id, step_id, status, started_at, completed_at)
       VALUES ($1, $2, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [executionId, step.id]
    );
  }

  /**
   * Ordenar steps por ordem e dependências
   */
  private sortSteps(steps: RecoveryStep[]): RecoveryStep[] {
    const sorted: RecoveryStep[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (step: RecoveryStep) => {
      if (visiting.has(step.id)) {
        throw new Error(`Dependência circular detectada no step: ${step.id}`);
      }
      if (visited.has(step.id)) {
        return;
      }

      visiting.add(step.id);

      // Visitar dependências primeiro
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          const dep = steps.find(s => s.id === depId);
          if (dep) {
            visit(dep);
          }
        }
      }

      visiting.delete(step.id);
      visited.add(step.id);
      sorted.push(step);
    };

    // Ordenar por ordem primeiro
    const sortedByOrder = [...steps].sort((a, b) => a.order - b.order);

    // Visitar cada step
    for (const step of sortedByOrder) {
      if (!visited.has(step.id)) {
        visit(step);
      }
    }

    return sorted;
  }

  /**
   * Verificar saúde do sistema
   */
  async checkSystemHealth(): Promise<SystemHealth> {
    const issues: HealthIssue[] = [];
    const health: SystemHealth = {
      database: 'healthy',
      cache: 'healthy',
      storage: 'healthy',
      api: 'healthy',
      overall: 'healthy',
      lastChecked: new Date(),
      issues,
    };

    // Verificar banco de dados
    try {
      await queryDatabase('SELECT 1');
      health.database = 'healthy';
    } catch (error) {
      health.database = 'down';
      issues.push({
        component: 'database',
        severity: 'critical',
        message: 'Banco de dados não está respondendo',
        detectedAt: new Date(),
      });
    }

    // Verificar cache (simulado)
    try {
      // Em produção, verificaria Redis
      health.cache = 'healthy';
    } catch (error) {
      health.cache = 'degraded';
      issues.push({
        component: 'cache',
        severity: 'warning',
        message: 'Cache pode estar com problemas',
        detectedAt: new Date(),
      });
    }

    // Verificar storage (simulado)
    try {
      // Em produção, verificaria sistema de arquivos ou S3
      health.storage = 'healthy';
    } catch (error) {
      health.storage = 'degraded';
      issues.push({
        component: 'storage',
        severity: 'warning',
        message: 'Storage pode estar com problemas',
        detectedAt: new Date(),
      });
    }

    // Verificar API (simulado)
    try {
      // Em produção, verificaria endpoints críticos
      health.api = 'healthy';
    } catch (error) {
      health.api = 'degraded';
      issues.push({
        component: 'api',
        severity: 'warning',
        message: 'API pode estar com problemas',
        detectedAt: new Date(),
      });
    }

    // Determinar saúde geral
    if (health.database === 'down' || health.cache === 'down' || health.storage === 'down' || health.api === 'down') {
      health.overall = 'down';
    } else if (health.database === 'degraded' || health.cache === 'degraded' || health.storage === 'degraded' || health.api === 'degraded') {
      health.overall = 'degraded';
    }

    // Salvar verificação
    await this.saveHealthCheck(health);

    return health;
  }

  /**
   * Salvar verificação de saúde
   */
  private async saveHealthCheck(health: SystemHealth): Promise<void> {
    await queryDatabase(
      `INSERT INTO system_health_checks 
       (database_status, cache_status, storage_status, api_status, overall_status, issues, checked_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [
        health.database,
        health.cache,
        health.storage,
        health.api,
        health.overall,
        JSON.stringify(health.issues),
      ]
    );
  }

  /**
   * Testar plano de recuperação
   */
  async testRecoveryPlan(planId: number): Promise<RecoveryExecution> {
    // Executar em modo de teste (não executa ações reais)
    const plan = await this.getRecoveryPlan(planId);
    if (!plan) {
      throw new Error('Plano de recuperação não encontrado');
    }

    // Criar execução de teste
    const execution = await this.createRecoveryExecution({
      planId,
      triggeredBy: 'manual',
      reason: 'Teste de plano de recuperação',
      status: 'running',
      startedAt: new Date(),
      stepsCompleted: 0,
      totalSteps: plan.steps.length,
      metadata: { test: true },
    });

    try {
      const sortedSteps = this.sortSteps(plan.steps);

      for (let i = 0; i < sortedSteps.length; i++) {
        const step = sortedSteps[i];
        
        await this.updateRecoveryExecution(execution.id!, {
          currentStep: step.id,
        });

        // Simular execução (não executa ações reais)
        console.log(`[TESTE] Executando step: ${step.name}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

        await this.updateRecoveryExecution(execution.id!, {
          stepsCompleted: i + 1,
        });
      }

      await this.updateRecoveryExecution(execution.id!, {
        status: 'completed',
        completedAt: new Date(),
      });

      // Atualizar última execução de teste
      await this.updateRecoveryPlan(planId, {
        lastTested: new Date(),
      });

      return await this.getRecoveryExecution(execution.id!);
    } catch (error: any) {
      await this.updateRecoveryExecution(execution.id!, {
        status: 'failed',
        completedAt: new Date(),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Obter plano de recuperação
   */
  async getRecoveryPlan(id: number): Promise<RecoveryPlan | null> {
    const result = await queryDatabase(
      `SELECT * FROM recovery_plans WHERE id = $1`,
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapDbToPlan(result[0]);
  }

  /**
   * Criar execução de recuperação
   */
  private async createRecoveryExecution(execution: Partial<RecoveryExecution>): Promise<RecoveryExecution> {
    const result = await queryDatabase(
      `INSERT INTO recovery_executions 
       (plan_id, triggered_by, triggered_by_user_id, reason, status, started_at, 
        current_step, steps_completed, total_steps, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        execution.planId,
        execution.triggeredBy,
        execution.triggeredByUserId || null,
        execution.reason || null,
        execution.status,
        execution.startedAt,
        execution.currentStep || null,
        execution.stepsCompleted || 0,
        execution.totalSteps || 0,
        execution.metadata ? JSON.stringify(execution.metadata) : null,
      ]
    );

    return this.mapDbToExecution(result[0]);
  }

  /**
   * Atualizar execução de recuperação
   */
  private async updateRecoveryExecution(
    id: number,
    updates: Partial<RecoveryExecution>
  ): Promise<void> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.completedAt !== undefined) {
      setClause.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }
    if (updates.currentStep !== undefined) {
      setClause.push(`current_step = $${paramIndex++}`);
      values.push(updates.currentStep);
    }
    if (updates.stepsCompleted !== undefined) {
      setClause.push(`steps_completed = $${paramIndex++}`);
      values.push(updates.stepsCompleted);
    }
    if (updates.error !== undefined) {
      setClause.push(`error = $${paramIndex++}`);
      values.push(updates.error);
    }

    if (setClause.length === 0) {
      return;
    }

    values.push(id);
    await queryDatabase(
      `UPDATE recovery_executions SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  /**
   * Atualizar plano de recuperação
   */
  private async updateRecoveryPlan(
    id: number,
    updates: Partial<RecoveryPlan>
  ): Promise<void> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.lastTested !== undefined) {
      setClause.push(`last_tested = $${paramIndex++}`);
      values.push(updates.lastTested);
    }
    if (updates.lastExecuted !== undefined) {
      setClause.push(`last_executed = $${paramIndex++}`);
      values.push(updates.lastExecuted);
    }

    if (setClause.length === 0) {
      return;
    }

    values.push(id);
    await queryDatabase(
      `UPDATE recovery_plans SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  /**
   * Obter execução de recuperação
   */
  async getRecoveryExecution(id: number): Promise<RecoveryExecution | null> {
    const result = await queryDatabase(
      `SELECT * FROM recovery_executions WHERE id = $1`,
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapDbToExecution(result[0]);
  }

  /**
   * Mapear dados do banco para RecoveryPlan
   */
  private mapDbToPlan(row: any): RecoveryPlan {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      priority: row.priority,
      rto: row.rto,
      rpo: row.rpo,
      steps: row.steps ? JSON.parse(row.steps) : [],
      enabled: row.enabled,
      lastTested: row.last_tested ? new Date(row.last_tested) : undefined,
      lastExecuted: row.last_executed ? new Date(row.last_executed) : undefined,
    };
  }

  /**
   * Mapear dados do banco para RecoveryExecution
   */
  private mapDbToExecution(row: any): RecoveryExecution {
    return {
      id: row.id,
      planId: row.plan_id,
      triggeredBy: row.triggered_by,
      triggeredByUserId: row.triggered_by_user_id,
      reason: row.reason,
      status: row.status,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      currentStep: row.current_step,
      stepsCompleted: row.steps_completed,
      totalSteps: row.total_steps,
      error: row.error,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}

// Instância singleton
export const disasterRecoveryService = new DisasterRecoveryService();

