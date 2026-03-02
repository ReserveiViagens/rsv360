// Componentes de Documentação e Treinamento - FASE 11
export { DocumentationSystem } from './DocumentationSystem';
export { TrainingSystem } from './TrainingSystem';
export { HelpSystem } from './HelpSystem';
export { TutorialSystem } from './TutorialSystem';
export { FAQSystem } from './FAQSystem';

// Tipos e interfaces
export type {
  DocumentationItem,
  DocumentationCategory,
  DocumentationSystemProps
} from './DocumentationSystem';

export type {
  TrainingCourse,
  TrainingModule,
  TrainingProgress,
  TrainingSystemProps
} from './TrainingSystem';

export type {
  HelpArticle,
  HelpCategory,
  SupportTicket,
  HelpSystemProps
} from './HelpSystem';

export type {
  Tutorial,
  TutorialStep,
  TutorialProgress,
  TutorialSystemProps
} from './TutorialSystem';

export type {
  FAQItem,
  FAQCategory,
  FAQSystemProps
} from './FAQSystem';
