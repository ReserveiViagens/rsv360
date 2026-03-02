// Exportações dos componentes de gestão de projetos
export { default as ProjectManager } from './ProjectManager';
export { default as TaskManager } from './TaskManager';
export { default as TeamManager } from './TeamManager';
export { default as ProjectTimeline } from './ProjectTimeline';
export { default as ProjectCollaboration } from './ProjectCollaboration';

// Tipos e interfaces
export type {
  Project,
  TeamMember,
  Task,
  Milestone,
  ProjectPhase,
  Comment,
  Attachment,
  ProjectUpdate,
  TeamChat
} from './ProjectManager';
