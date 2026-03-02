// Componentes de Deploy e Go-Live - FASE 12
export { FinalDeploySystem } from './FinalDeploySystem';
export { GoLiveSystem } from './GoLiveSystem';
export { ProductionMonitoring } from './ProductionMonitoring';
export { BackupRecoverySystem } from './BackupRecoverySystem';

// Tipos e interfaces
export type {
  DeployEnvironment,
  DeployConfig,
  DeployStatus,
  DeploySystemProps
} from './FinalDeploySystem';

export type {
  GoLiveChecklist,
  GoLivePhase,
  GoLiveMetrics,
  GoLiveSystemProps
} from './GoLiveSystem';

export type {
  SystemMetric,
  ServiceStatus,
  Alert,
  MonitoringConfig,
  ProductionMonitoringProps
} from './ProductionMonitoring';

export type {
  BackupJob,
  RecoveryPoint,
  BackupRecoverySystemProps
} from './BackupRecoverySystem';
