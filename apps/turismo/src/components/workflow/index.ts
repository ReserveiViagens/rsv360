// Exportações dos componentes de workflow
export { default as WorkflowEngine } from './WorkflowEngine';
export { default as TaskAutomation } from './TaskAutomation';
export { default as ApprovalSystem } from './ApprovalSystem';
export { default as ProcessMonitoring } from './ProcessMonitoring';
export { default as WorkflowTemplates } from './WorkflowTemplates';

// Tipos e interfaces
export type {
  WorkflowStep,
  WorkflowProcess,
  AutomatedTask,
  ApprovalRequest,
  ApprovalWorkflow,
  ProcessInstance,
  ProcessMetric,
  ProcessAlert,
  WorkflowTemplate
} from './WorkflowEngine';
