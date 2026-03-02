// Exportações dos componentes de chat
export { default as ChatSystem } from './ChatSystem';
export { default as ChatAgents } from './ChatAgents';
export { default as ChatConversations } from './ChatConversations';
export { default as ChatAnalytics } from './ChatAnalytics';

// Tipos e interfaces
export type {
  ChatMessage,
  ChatRoom,
  ChatAgent,
  ChatConversation,
  ChatMetric,
  TimeSeriesData,
  AgentPerformance
} from './ChatSystem';
